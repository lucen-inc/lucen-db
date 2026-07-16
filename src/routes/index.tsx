import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/lid/app-shell";
import { EntityAvatar, PersonAvatar, ScoreBar } from "@/components/lid/score-ring";
import {
  getStats,
  news,
  opportunities,
  organizations,
  orgById,
  people,
} from "@/lib/mock-data";
import {
  ArrowUpRight,
  Building2,
  Network,
  TrendingUp,
  Users,
  Sparkles,
  Newspaper,
  Radio,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Dashboard · Lucen Intelligence Database" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const stats = getStats();
  const topOrgs = [...organizations]
    .sort((a, b) => b.scores.priority - a.scores.priority)
    .slice(0, 5);
  const activeOpps = opportunities
    .filter((o) => o.stage !== "Won" && o.stage !== "Lost")
    .sort((a, b) => b.value * b.probability - a.value * a.probability)
    .slice(0, 5);
  const recentPeople = [...people].slice(0, 6);

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence Operating System"
        title="Good morning, Nadia."
        description="The Lucen graph tracks 100k+ organizations, executives and relationships in real time. Here is what changed today."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-elevated/60 px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 text-success" />
            <span className="text-[11.5px] text-muted-foreground">Signals live</span>
            <span className="h-1 w-1 rounded-full bg-success shadow-[0_0_8px_var(--success)]" />
          </div>
        }
      />

      <div className="space-y-6 px-8 py-8">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Building2}
            label="Organizations"
            value={stats.organizations.toLocaleString()}
            delta="+ 6 this week"
            hue={195}
          />
          <StatCard
            icon={Users}
            label="People"
            value={stats.people.toLocaleString()}
            delta="+ 12 this week"
            hue={245}
          />
          <StatCard
            icon={Network}
            label="Relationships"
            value={stats.relationships.toLocaleString()}
            delta="+ 24 this week"
            hue={155}
          />
          <StatCard
            icon={TrendingUp}
            label="Weighted Pipeline"
            value={
              "$" +
              (stats.weightedPipeline / 1_000_000).toFixed(1) +
              "M"
            }
            delta={stats.activeOpportunities + " active"}
            hue={40}
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Priority organizations */}
          <section className="glass col-span-1 rounded-2xl p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Priority Organizations</h2>
                <p className="text-[11.5px] text-muted-foreground">
                  Ranked by Lucen priority score
                </p>
              </div>
              <Link
                to="/organizations"
                className="flex items-center gap-1 text-[12px] text-cyan hover:underline"
              >
                Open table <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/60">
              {topOrgs.map((o) => (
                <Link
                  key={o.id}
                  to="/organizations/$id"
                  params={{ id: o.id }}
                  className="group flex items-center gap-4 py-3 transition hover:bg-white/[0.02]"
                >
                  <EntityAvatar logo={o.logo} hue={195 + (o.name.length % 60)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-medium">{o.name}</span>
                      <span className="rounded-md border border-border/60 bg-white/[0.03] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {o.industry}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                      {o.hq}, {o.country} · {o.employees.toLocaleString()} employees ·{" "}
                      {o.revenue}
                    </div>
                  </div>
                  <div className="hidden w-40 sm:block">
                    <ScoreBar value={o.scores.priority} label="Priority" hue={195} />
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    {o.updatedAt}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Copilot */}
          <section className="glass-strong relative overflow-hidden rounded-2xl p-5">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-holo/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan" />
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Copilot Signals
                </div>
              </div>
              <h2 className="mt-2 text-[15px] font-semibold leading-snug">
                3 introductions Lucen should make this week
              </h2>
              <ul className="mt-4 space-y-3 text-[12.5px]">
                {[
                  "Amina (DXB) ↔ Sophie (LV) — LV briefing on airport flagships",
                  "Tarek (NEOM) ↔ Maya (Foster + Partners) — Trojena masterplan",
                  "Hassan (PIF) ↔ Khalid (Emaar) — cross-portfolio experiential RFP",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
                    <span className="text-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-5 w-full rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-[12.5px] font-medium text-cyan transition hover:bg-cyan/20">
                Run market intelligence sweep
              </button>
            </div>
          </section>

          {/* Opportunities */}
          <section className="glass col-span-1 rounded-2xl p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Live Opportunities</h2>
                <p className="text-[11.5px] text-muted-foreground">
                  Weighted by probability
                </p>
              </div>
              <Link
                to="/pipeline"
                className="flex items-center gap-1 text-[12px] text-cyan hover:underline"
              >
                Open pipeline <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-[12.5px]">
                <thead className="bg-white/[0.02] text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Opportunity</th>
                    <th className="px-4 py-2.5 text-left font-medium">Stage</th>
                    <th className="px-4 py-2.5 text-right font-medium">Value</th>
                    <th className="px-4 py-2.5 text-right font-medium">Prob.</th>
                    <th className="px-4 py-2.5 text-right font-medium">Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeOpps.map((o) => {
                    const org = orgById(o.orgId);
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{o.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {org?.name}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <StageBadge stage={o.stage} />
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                          ${(o.value / 1000).toFixed(0)}k
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                          {o.probability}%
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {o.closeDate}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* News */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-cyan" />
              <h2 className="text-[15px] font-semibold">Market Signals</h2>
            </div>
            <ul className="space-y-4">
              {news.map((n) => {
                const org = orgById(n.orgId);
                return (
                  <li key={n.id} className="border-b border-border/40 pb-3 last:border-0">
                    <div className="mb-1 flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      <span>{org?.name}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                      <span>{n.category}</span>
                      <span className="ml-auto">{n.date}</span>
                    </div>
                    <div className="text-[12.5px] leading-snug">{n.headline}</div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Recent people */}
          <section className="glass col-span-1 rounded-2xl p-5 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold">Recent People</h2>
                <p className="text-[11.5px] text-muted-foreground">
                  Latest additions to the graph
                </p>
              </div>
              <Link
                to="/people"
                className="flex items-center gap-1 text-[12px] text-cyan hover:underline"
              >
                Browse people <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {recentPeople.map((p) => {
                const org = orgById(p.orgId);
                return (
                  <Link
                    key={p.id}
                    to="/people/$id"
                    params={{ id: p.id }}
                    className="group rounded-xl border border-border/60 bg-elevated/40 p-3 transition hover:border-cyan/40 hover:bg-elevated"
                  >
                    <PersonAvatar
                      first={p.firstName}
                      last={p.lastName}
                      hue={p.photoHue}
                      size={44}
                    />
                    <div className="mt-3 truncate text-[12.5px] font-medium">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {p.title}
                    </div>
                    <div className="mt-2 truncate text-[10.5px] text-cyan/80">
                      {org?.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  hue,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  delta: string;
  hue: number;
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: `hsl(${hue} 90% 55%)` }}
      />
      <div className="relative">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="mt-3 font-display text-[28px] font-semibold leading-none tracking-tight">
          {value}
        </div>
        <div className="mt-2 text-[11px] text-success">{delta}</div>
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { hue: number; label: string }> = {
    Prospect: { hue: 210, label: "Prospect" },
    Qualified: { hue: 240, label: "Qualified" },
    Meeting: { hue: 270, label: "Meeting" },
    Proposal: { hue: 40, label: "Proposal" },
    Negotiation: { hue: 20, label: "Negotiation" },
    Won: { hue: 155, label: "Won" },
    Lost: { hue: 0, label: "Lost" },
  };
  const c = map[stage] ?? map.Prospect;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10.5px] font-medium"
      style={{
        borderColor: `hsl(${c.hue} 90% 55% / 0.3)`,
        background: `hsl(${c.hue} 90% 55% / 0.1)`,
        color: `hsl(${c.hue} 90% 75%)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: `hsl(${c.hue} 90% 60%)` }}
      />
      {c.label}
    </span>
  );
}
