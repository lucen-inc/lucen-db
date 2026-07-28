import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/lid/app-shell";
import { EntityAvatar } from "@/components/lid/score-ring";
import {
  industries,
  organizations,
  pipelineStages,
  type OrgIndustry,
  type PipelineStage,
} from "@/lib/mock-data";
import { Search, SlidersHorizontal, Download, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/organizations/")({
  head: () => ({
    meta: [{ title: "Organizations · LID" }],
  }),
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<OrgIndustry | "All">("All");
  const [stage, setStage] = useState<PipelineStage | "All">("All");

  const filtered = useMemo(() => {
    return organizations.filter((o) => {
      if (industry !== "All" && o.industry !== industry) return false;
      if (stage !== "All" && o.stage !== stage) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !o.name.toLowerCase().includes(s) &&
          !o.country.toLowerCase().includes(s) &&
          !o.hq.toLowerCase().includes(s) &&
          !o.industry.toLowerCase().includes(s) &&
          !o.tags.some((t) => t.toLowerCase().includes(s))
        )
          return false;
      }
      return true;
    });
  }, [q, industry, stage]);

  return (
    <div>
      <PageHeader
        eyebrow="Entities"
        title="Organizations"
        description="Every company, brand, authority, developer and institution Lucen tracks."
        actions={
          <>
            <button className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-elevated px-3 py-1.5 text-[12px] hover:border-cyan/40">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> New organization
            </button>
          </>
        }
      />

      <div className="px-8 py-6">
        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, country, industry, tag…"
              className="w-full rounded-lg border border-border/60 bg-elevated/60 py-2 pl-9 pr-3 text-[13px] outline-none transition placeholder:text-muted-foreground/60 focus:border-cyan/50"
            />
          </div>
          <FilterPill
            label="Industry"
            value={industry}
            options={["All", ...industries] as const}
            onChange={(v) => setIndustry(v as OrgIndustry | "All")}
          />
          <FilterPill
            label="Stage"
            value={stage}
            options={["All", ...pipelineStages] as const}
            onChange={(v) => setStage(v as PipelineStage | "All")}
          />
          <button className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-elevated/60 px-3 py-2 text-[12px] hover:border-cyan/40">
            <SlidersHorizontal className="h-3.5 w-3.5" /> More filters
          </button>
          <div className="ml-auto text-[11.5px] text-muted-foreground">
            {filtered.length} of {organizations.length}
          </div>
        </div>

        {/* Table */}
        <div className="glass overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border/60 bg-white/[0.02] text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  <th className="sticky left-0 z-10 bg-panel/70 px-4 py-3 text-left font-medium backdrop-blur">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Industry</th>
                  <th className="px-4 py-3 text-left font-medium">HQ</th>
                  <th className="px-4 py-3 text-right font-medium">Employees</th>
                  <th className="px-4 py-3 text-right font-medium">Revenue</th>
                  <th className="px-4 py-3 text-left font-medium">Stage</th>
                  <th className="px-4 py-3 text-right font-medium">Lead</th>
                  <th className="px-4 py-3 text-right font-medium">Innovation</th>
                  <th className="px-4 py-3 text-right font-medium">Luxury</th>
                  <th className="px-4 py-3 text-right font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Owner</th>
                  <th className="px-4 py-3 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className={cn(
                      "group transition hover:bg-white/[0.025]",
                      i % 2 === 0 ? "" : "bg-white/[0.008]",
                    )}
                  >
                    <td className="sticky left-0 z-10 bg-panel/80 px-4 py-3 backdrop-blur">
                      <Link
                        to="/organizations/$id"
                        params={{ id: o.id }}
                        className="flex items-center gap-3"
                      >
                        <EntityAvatar
                          logo={o.logo}
                          size={32}
                          hue={195 + (o.name.length % 60)}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium group-hover:text-cyan">
                            {o.name}
                          </div>
                          <div className="truncate text-[11px] text-muted-foreground">
                            {o.subIndustry}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md border border-border/60 bg-white/[0.03] px-1.5 py-0.5 text-[10.5px] uppercase tracking-wide text-muted-foreground">
                        {o.industry}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.hq}, {o.country}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {o.employees.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {o.revenue}
                    </td>
                    <td className="px-4 py-3">
                      <StageDot stage={o.stage} />
                    </td>
                    <ScoreCell v={o.scores.lead} hue={210} />
                    <ScoreCell v={o.scores.innovation} hue={155} />
                    <ScoreCell v={o.scores.luxury} hue={40} />
                    <ScoreCell v={o.scores.priority} hue={195} strong />
                    <td className="px-4 py-3 text-muted-foreground">{o.owner}</td>
                    <td className="px-4 py-3 text-right text-[11.5px] text-muted-foreground">
                      {o.updatedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-[13px] text-muted-foreground">
              No organizations match these filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreCell({ v, hue, strong }: { v: number; hue: number; strong?: boolean }) {
  return (
    <td className="px-4 py-3 text-right">
      <div className="inline-flex items-center gap-2">
        <div className="h-1 w-12 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${v}%`,
              background: `hsl(${hue} 90% 60%)`,
              boxShadow: strong ? `0 0 8px hsl(${hue} 90% 60% / 0.6)` : "none",
            }}
          />
        </div>
        <span
          className={cn(
            "font-mono text-[11.5px] tabular-nums",
            strong ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {v}
        </span>
      </div>
    </td>
  );
}

function StageDot({ stage }: { stage: string }) {
  const hue = {
    Prospect: 210,
    Qualified: 240,
    Meeting: 270,
    Proposal: 40,
    Negotiation: 20,
    Won: 155,
    Lost: 0,
  }[stage] ?? 210;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10.5px]"
      style={{
        borderColor: `hsl(${hue} 90% 55% / 0.3)`,
        background: `hsl(${hue} 90% 55% / 0.08)`,
        color: `hsl(${hue} 90% 78%)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `hsl(${hue} 90% 60%)` }}
      />
      {stage}
    </span>
  );
}

function FilterPill<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border/60 bg-elevated/60 px-3 py-2 text-[12px] hover:border-cyan/40"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{value}</span>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="glass-strong absolute left-0 top-full z-30 mt-1 max-h-72 w-48 overflow-y-auto rounded-lg p-1 shadow-2xl">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12.5px] hover:bg-white/[0.06]"
              >
                {opt}
                {opt === value && <Check className="h-3.5 w-3.5 text-cyan" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
