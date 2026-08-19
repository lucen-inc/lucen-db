import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { diffFields, type AuditAction, type AuditChange } from "./audit";
import {
  organizationInputSchema,
  normalizeOrgName,
  type OrganizationInput,
} from "./organizations.schema";

async function recordAudit(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  actor: { id: string; email?: string | null },
  entry: {
    action: AuditAction;
    entityId: string | null;
    entityName: string | null;
    changes: AuditChange[];
  },
) {
  await supabase.from("audit_log").insert({
    actor_id: actor.id,
    actor_email: actor.email ?? null,
    action: entry.action,
    entity_type: "organization",
    entity_id: entry.entityId,
    entity_name: entry.entityName,
    changes: entry.changes,
  });
}

export type OrganizationRow = {
  id: string;
  name: string;
  normalized_name: string;
  legal_name: string | null;
  industry: string;
  sub_industry: string;
  hq: string;
  country: string;
  countries: string[];
  employees: number;
  revenue: string | null;
  founded: number | null;
  website: string | null;
  description: string | null;
  logo: string | null;
  tags: string[];
  parent_id: string | null;
  score_lead: number;
  score_innovation: number;
  score_luxury: number;
  score_tech: number;
  score_priority: number;
  client_status: string;
  stage: string;
  owner: string | null;
  locations: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const listOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("organizations" as never)
      .select("*")
      .order("score_priority", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as OrganizationRow[];
  });

export const getOrganization = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("organizations" as never)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as OrganizationRow | null;
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getRole(supabase: any, userId: string): Promise<"admin" | "editor" | "viewer"> {
  const [{ data: isAdmin }, { data: isEditor }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "editor" }),
  ]);
  if (isAdmin) return "admin";
  if (isEditor) return "editor";
  return "viewer";
}

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return await getRole(context.supabase, context.userId);
  });

export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: OrganizationInput) => organizationInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const role = await getRole(context.supabase, context.userId);
    if (role !== "admin" && role !== "editor") {
      throw new Error("You don't have permission to create organizations.");
    }

    const normalized = normalizeOrgName(data.name);
    if (!normalized) throw new Error("Name must contain letters or numbers.");

    const { data: existing } = await context.supabase
      .from("organizations" as never)
      .select("id, name")
      .eq("normalized_name", normalized)
      .maybeSingle();
    if (existing) {
      const row = existing as unknown as { name: string };
      throw new Error(`An organization already exists with a similar name: "${row.name}".`);
    }

    const { data: inserted, error } = await context.supabase
      .from("organizations" as never)
      .insert({
        ...data,
        created_by: context.userId,
      } as never)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const row = inserted as unknown as OrganizationRow;
    await recordAudit(
      context.supabase,
      { id: context.userId, email: context.claims?.email as string | undefined },
      {
        action: "created",
        entityId: row.id,
        entityName: row.name,
        changes: diffFields(null, data as unknown as Record<string, unknown>),
      },
    );
    return row;
  });

export const updateOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; patch: OrganizationInput }) =>
    z
      .object({ id: z.string().uuid(), patch: organizationInputSchema })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const role = await getRole(context.supabase, context.userId);
    if (role !== "admin" && role !== "editor") {
      throw new Error("You don't have permission to edit organizations.");
    }

    const normalized = normalizeOrgName(data.patch.name);
    const { data: dup } = await context.supabase
      .from("organizations" as never)
      .select("id, name")
      .eq("normalized_name", normalized)
      .neq("id", data.id)
      .maybeSingle();
    if (dup) {
      const row = dup as unknown as { name: string };
      throw new Error(`Another organization already uses that name: "${row.name}".`);
    }

    const { data: updated, error } = await context.supabase
      .from("organizations" as never)
      .update(data.patch as never)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return updated as unknown as OrganizationRow;
  });

export const deleteOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const role = await getRole(context.supabase, context.userId);
    if (role !== "admin") {
      throw new Error("Only admins can delete organizations.");
    }
    const { error } = await context.supabase
      .from("organizations" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
