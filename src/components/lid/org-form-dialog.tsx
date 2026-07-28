import { useEffect, useState } from "react";
import {
  organizationInputSchema,
  industries,
  pipelineStages,
  clientStatuses,
  type OrganizationInput,
} from "@/lib/organizations.schema";

type Props = {
  title: string;
  submitLabel: string;
  disabled?: boolean;
  initial?: Partial<OrganizationInput>;
  onCancel: () => void;
  onSubmit: (values: OrganizationInput) => void;
};

const defaults: OrganizationInput = {
  name: "",
  legal_name: null,
  industry: "Retail",
  sub_industry: "",
  hq: "",
  country: "",
  countries: [],
  employees: 0,
  revenue: null,
  founded: null,
  website: null,
  description: null,
  logo: null,
  tags: [],
  score_lead: 50,
  score_innovation: 50,
  score_luxury: 50,
  score_tech: 50,
  score_priority: 50,
  client_status: "Prospect",
  stage: "Prospect",
  owner: null,
  locations: 0,
};

export function OrgFormDialog({ title, submitLabel, disabled, initial, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<OrganizationInput>({ ...defaults, ...(initial ?? {}) });
  const [countriesText, setCountriesText] = useState(values.countries.join(", "));
  const [tagsText, setTagsText] = useState(values.tags.join(", "));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  function set<K extends keyof OrganizationInput>(k: K, v: OrganizationInput[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = organizationInputSchema.safeParse({
      ...values,
      countries: countriesText.split(",").map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(",").map((s) => s.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    onSubmit(parsed.data);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-strong relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name *">
              <input required value={values.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Legal name">
              <input value={values.legal_name ?? ""} onChange={(e) => set("legal_name", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Industry *">
              <select value={values.industry} onChange={(e) => set("industry", e.target.value as OrganizationInput["industry"])} className={inputCls}>
                {industries.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Sub-industry *">
              <input required value={values.sub_industry} onChange={(e) => set("sub_industry", e.target.value)} className={inputCls} />
            </Field>
            <Field label="HQ city *">
              <input required value={values.hq} onChange={(e) => set("hq", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Country *">
              <input required value={values.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Countries (comma-separated)">
              <input value={countriesText} onChange={(e) => setCountriesText(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tags (comma-separated)">
              <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Employees">
              <input type="number" min={0} value={values.employees} onChange={(e) => set("employees", Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label="Revenue">
              <input value={values.revenue ?? ""} onChange={(e) => set("revenue", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Founded">
              <input type="number" value={values.founded ?? ""} onChange={(e) => set("founded", e.target.value ? Number(e.target.value) : null)} className={inputCls} />
            </Field>
            <Field label="Website">
              <input value={values.website ?? ""} onChange={(e) => set("website", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Logo (2-4 chars)">
              <input maxLength={8} value={values.logo ?? ""} onChange={(e) => set("logo", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Owner">
              <input value={values.owner ?? ""} onChange={(e) => set("owner", e.target.value || null)} className={inputCls} />
            </Field>
            <Field label="Client status">
              <select value={values.client_status} onChange={(e) => set("client_status", e.target.value as OrganizationInput["client_status"])} className={inputCls}>
                {clientStatuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select value={values.stage} onChange={(e) => set("stage", e.target.value as OrganizationInput["stage"])} className={inputCls}>
                {pipelineStages.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Locations">
              <input type="number" min={0} value={values.locations} onChange={(e) => set("locations", Number(e.target.value))} className={inputCls} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} value={values.description ?? ""} onChange={(e) => set("description", e.target.value || null)} className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            <ScoreField label="Lead" value={values.score_lead} onChange={(v) => set("score_lead", v)} />
            <ScoreField label="Innovation" value={values.score_innovation} onChange={(v) => set("score_innovation", v)} />
            <ScoreField label="Luxury" value={values.score_luxury} onChange={(v) => set("score_luxury", v)} />
            <ScoreField label="Tech" value={values.score_tech} onChange={(v) => set("score_tech", v)} />
            <ScoreField label="Priority" value={values.score_priority} onChange={(v) => set("score_priority", v)} />
          </div>

          {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-2 text-[12px] text-red-300">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg border border-border/60 bg-elevated px-4 py-2 text-[13px]">Cancel</button>
            <button type="submit" disabled={disabled} className="rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-50">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border/60 bg-elevated/60 px-3 py-2 text-[13px] outline-none focus:border-cyan/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}

function ScoreField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono text-foreground">{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </label>
  );
}
