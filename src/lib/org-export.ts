import { organizations as mockOrgs, people as mockPeople } from "./mock-data";
import { normalizeOrgName } from "./organizations.schema";
import type { OrganizationRow } from "./organizations.functions";

// People are sourced from the relationship dataset and matched to database
// organizations by normalized name.
const peopleCountByNormalizedName: Record<string, number> = (() => {
  const nameById = new Map(mockOrgs.map((o) => [o.id, o.name]));
  const counts: Record<string, number> = {};
  for (const p of mockPeople) {
    const name = nameById.get(p.orgId);
    if (!name) continue;
    const key = normalizeOrgName(name);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
})();

export function relatedPeopleCount(org: Pick<OrganizationRow, "name">): number {
  return peopleCountByNormalizedName[normalizeOrgName(org.name)] ?? 0;
}

export type ExportField = {
  key: string;
  label: string;
  value: (o: OrganizationRow) => string | number;
};

export const exportFields: ExportField[] = [
  { key: "name", label: "Name", value: (o) => o.name },
  { key: "legal_name", label: "Legal name", value: (o) => o.legal_name ?? "" },
  { key: "industry", label: "Industry", value: (o) => o.industry },
  { key: "sub_industry", label: "Sub-industry", value: (o) => o.sub_industry },
  { key: "hq", label: "HQ", value: (o) => o.hq },
  { key: "country", label: "Country", value: (o) => o.country },
  { key: "countries", label: "Countries", value: (o) => o.countries.join("; ") },
  { key: "employees", label: "Employees", value: (o) => o.employees },
  { key: "revenue", label: "Revenue", value: (o) => o.revenue ?? "" },
  { key: "founded", label: "Founded", value: (o) => o.founded ?? "" },
  { key: "website", label: "Website", value: (o) => o.website ?? "" },
  { key: "stage", label: "Stage", value: (o) => o.stage },
  { key: "client_status", label: "Client status", value: (o) => o.client_status },
  { key: "owner", label: "Owner", value: (o) => o.owner ?? "" },
  { key: "locations", label: "Locations", value: (o) => o.locations },
  { key: "tags", label: "Tags", value: (o) => o.tags.join("; ") },
  { key: "score_lead", label: "Lead score", value: (o) => o.score_lead },
  { key: "score_innovation", label: "Innovation score", value: (o) => o.score_innovation },
  { key: "score_luxury", label: "Luxury score", value: (o) => o.score_luxury },
  { key: "score_tech", label: "Tech score", value: (o) => o.score_tech },
  { key: "score_priority", label: "Priority score", value: (o) => o.score_priority },
  { key: "people_count", label: "Related people", value: (o) => relatedPeopleCount(o) },
];

export const defaultExportKeys = [
  "name",
  "industry",
  "hq",
  "country",
  "employees",
  "revenue",
  "stage",
  "score_priority",
  "owner",
  "people_count",
];

function escapeCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildOrganizationsCsv(rows: OrganizationRow[], keys: string[]): string {
  const fields = exportFields.filter((f) => keys.includes(f.key));
  const header = fields.map((f) => escapeCell(f.label)).join(",");
  const body = rows.map((r) => fields.map((f) => escapeCell(f.value(r))).join(","));
  return [header, ...body].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
