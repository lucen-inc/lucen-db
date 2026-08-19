import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const appRoles = ["admin", "editor", "viewer"] as const;
export type AppRole = (typeof appRoles)[number];

export type ManagedUser = {
  user_id: string;
  email: string;
  role: AppRole | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export type InviteRow = {
  id: string;
  email: string;
  role: AppRole;
  accepted_at: string | null;
  created_at: string;
};

export type AuditRow = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  changes: { field: string; from: unknown; to: unknown }[];
  created_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Admins only.");
}

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error(error.message);

    const { data: roles } = await context.supabase
      .from("user_roles" as never)
      .select("user_id, role");
    const roleMap = new Map<string, AppRole>();
    for (const r of (roles ?? []) as unknown as { user_id: string; role: AppRole }[]) {
      roleMap.set(r.user_id, r.role);
    }

    return authUsers.users.map((u) => ({
      user_id: u.id,
      email: u.email ?? "(no email)",
      role: roleMap.get(u.id) ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    })) as ManagedUser[];
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: AppRole }) =>
    z.object({ userId: z.string().uuid(), role: z.enum(appRoles) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    if (data.userId === context.userId && data.role !== "admin") {
      const { count } = await context.supabase
        .from("user_roles" as never)
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");
      if ((count ?? 0) <= 1) {
        throw new Error("You are the last admin — promote someone else first.");
      }
    }

    const { error: delErr } = await context.supabase
      .from("user_roles" as never)
      .delete()
      .eq("user_id", data.userId);
    if (delErr) throw new Error(delErr.message);

    const { error } = await context.supabase
      .from("user_roles" as never)
      .insert({ user_id: data.userId, role: data.role } as never);
    if (error) throw new Error(error.message);

    await context.supabase.from("audit_log" as never).insert({
      actor_id: context.userId,
      actor_email: context.claims?.email ?? null,
      action: "updated",
      entity_type: "user_role",
      entity_id: data.userId,
      entity_name: data.userId,
      changes: [{ field: "role", from: null, to: data.role }],
    } as never);

    return { ok: true };
  });

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("user_invites" as never)
      .select("id, email, role, accepted_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as InviteRow[];
  });

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; role: AppRole }) =>
    z
      .object({ email: z.string().trim().email().max(200), role: z.enum(appRoles) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);

    const email = data.email.toLowerCase();
    const { error } = await context.supabase
      .from("user_invites" as never)
      .upsert(
        { email, role: data.role, invited_by: context.userId } as never,
        { onConflict: "email" } as never,
      );
    if (error) {
      const { error: insertErr } = await context.supabase
        .from("user_invites" as never)
        .insert({ email, role: data.role, invited_by: context.userId } as never);
      if (insertErr) throw new Error(insertErr.message);
    }

    let emailed = false;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      emailed = !inviteErr;
    } catch {
      emailed = false;
    }

    await context.supabase.from("audit_log" as never).insert({
      actor_id: context.userId,
      actor_email: context.claims?.email ?? null,
      action: "created",
      entity_type: "invite",
      entity_name: email,
      changes: [{ field: "role", from: null, to: data.role }],
    } as never);

    return { ok: true, emailed };
  });

export const deleteInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("user_invites" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("audit_log" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as AuditRow[];
  });
