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

    const { data: before } = await context.supabase
      .from("organizations" as never)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { data: updated, error } = await context.supabase
      .from("organizations" as never)
      .update(data.patch as never)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const row = updated as unknown as OrganizationRow;

    const beforeRow = (before ?? null) as unknown as Record<string, unknown> | null;
    const changes = diffFields(
      beforeRow
        ? Object.fromEntries(
            Object.keys(data.patch).map((k) => [k, beforeRow[k]]),
          )
        : null,
      data.patch as unknown as Record<string, unknown>,
    );
    if (changes.length) {
      await recordAudit(
        context.supabase,
        { id: context.userId, email: context.claims?.email as string | undefined },
        { action: "updated", entityId: row.id, entityName: row.name, changes },
      );
    }
    return row;
  });

export const deleteOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const role = await getRole(context.supabase, context.userId);
    if (role !== "admin") {
      throw new Error("Only admins can delete organizations.");
    }
    const { data: before } = await context.supabase
      .from("organizations" as never)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await context.supabase
      .from("organizations" as never)
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    const beforeRow = (before ?? null) as unknown as OrganizationRow | null;
    await recordAudit(
      context.supabase,
      { id: context.userId, email: context.claims?.email as string | undefined },
      {
        action: "deleted",
        entityId: data.id,
        entityName: beforeRow?.name ?? null,
        changes: diffFields(beforeRow as unknown as Record<string, unknown> | null, null),
      },
    );
    return { ok: true };
  });

export const mergeOrganizations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { keepId: string; mergeId: string }) =>
    z.object({ keepId: z.string().uuid(), mergeId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const role = await getRole(context.supabase, context.userId);
    if (role !== "admin") throw new Error("Only admins can merge organizations.");
    if (data.keepId === data.mergeId) throw new Error("Pick two different organizations.");

    const { data: rows, error: readErr } = await context.supabase
      .from("organizations" as never)
      .select("*")
      .in("id", [data.keepId, data.mergeId]);
    if (readErr) throw new Error(readErr.message);
    const list = (rows ?? []) as unknown as OrganizationRow[];
    const keep = list.find((r) => r.id === data.keepId);
    const merge = list.find((r) => r.id === data.mergeId);
    if (!keep || !merge) throw new Error("Organization not found.");

    const patch = {
      countries: Array.from(new Set([...keep.countries, ...merge.countries])),
      tags: Array.from(new Set([...keep.tags, ...merge.tags])),
      employees: Math.max(keep.employees, merge.employees),
      locations: Math.max(keep.locations, merge.locations),
      description: keep.description ?? merge.description,
      website: keep.website ?? merge.website,
      revenue: keep.revenue ?? merge.revenue,
      founded: keep.founded ?? merge.founded,
    };

    const { error: updErr } = await context.supabase
      .from("organizations" as never)
      .update(patch as never)
      .eq("id", data.keepId);
    if (updErr) throw new Error(updErr.message);

    await context.supabase
      .from("organizations" as never)
      .update({ parent_id: null } as never)
      .eq("parent_id", data.mergeId);

    const { error: delErr } = await context.supabase
      .from("organizations" as never)
      .delete()
      .eq("id", data.mergeId);
    if (delErr) throw new Error(delErr.message);

    await recordAudit(
      context.supabase,
      { id: context.userId, email: context.claims?.email as string | undefined },
      {
        action: "merged",
        entityId: keep.id,
        entityName: keep.name,
        changes: [
          { field: "merged_from", from: merge.name, to: keep.name },
          ...diffFields(
            Object.fromEntries(
              Object.keys(patch).map((k) => [k, (keep as unknown as Record<string, unknown>)[k]]),
            ),
            patch as unknown as Record<string, unknown>,
          ),
        ],
      },
    );

    return { ok: true };
  });
