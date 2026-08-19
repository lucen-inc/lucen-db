export type AuditChange = { field: string; from: unknown; to: unknown };

export type AuditAction = "created" | "updated" | "merged" | "deleted";

const IGNORED = new Set([
  "id",
  "created_at",
  "updated_at",
  "created_by",
  "normalized_name",
]);

function same(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  if (a == null && b == null) return true;
  return a === b;
}

export function diffFields(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
): AuditChange[] {
  const changes: AuditChange[] = [];
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const key of keys) {
    if (IGNORED.has(key)) continue;
    const from = before ? before[key] : undefined;
    const to = after ? after[key] : undefined;
    if (!same(from, to)) changes.push({ field: key, from: from ?? null, to: to ?? null });
  }
  return changes;
}

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}
