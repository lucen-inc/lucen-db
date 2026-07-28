import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/lid/app-shell";
import {
  EntityAvatar,
  PersonAvatar,
  ScoreBar,
  ScoreRing,
} from "@/components/lid/score-ring";
import {
  newsFor,
  opportunitiesFor,
  orgById,
  peopleByOrg,
  relationships,
  organizations,
} from "@/lib/mock-data";
import {
  Globe,
  MapPin,
  Users2,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Building2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/organizations/$id")({
  loader: ({ params }) => {
    const org = orgById(params.id);
    if (!org) throw notFound();
    return { org };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.org.name} · LID` },
          { name: "description", content: loaderData.org.description },
        ]
      : [{ title: "Organization · LID" }],
  }),
  component: OrgDetail,
  notFoundComponent: () => (
    <div className="p-16 text-center text-muted-foreground">Organization not found.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-16 text-center text-muted-foreground">{error.message}</div>
  ),
});

function OrgDetail() {
  const { org } = Route.useLoaderData();
  const contacts = peopleByOrg(org.id);
  const news = newsFor(org.id);
  const opps = opportunitiesFor(org.id);

  const parent = org.parent ? orgById(org.parent) : undefined;
  const subsidiaries = organizations.filter((o) => o.parent === org.id);
  const partners = relationships
    .filter(
      (r) =>
        (r.from === org.id || r.to === org.id) &&
        (r.type === "partner" || r.type === "designed" || r.type === "owns"),
    )
    .map((r) => {
      const otherId = r.from === org.id ? r.to : r.from;
      return { rel: r, other: orgById(otherId) };
    })
    .filter((x) => x.other);

  const hue = 195 + (org.name.length % 60);

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(600px 300px at 10% 0%, hsl(${hue} 90% 55% / 0.35), transparent 60%), radial-gradient(500px 300px at 90% 0%, hsl(${(hue + 45) % 360} 90% 55% / 0.25), transparent 60%)`,
          }}
        />
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative px-8 pb-8 pt-10">
          <div className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Link to="/organizations" className="hover:text-cyan">
              Organizations
            </Link>
            <span>/</span>
            <span className="text-foreground">{org.name}</span>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <EntityAvatar logo={org.logo} size={88} hue={hue} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[30px] font-semibold leading-tight tracking-tight">
                  {org.name}
                </h1>
                <span className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-cyan">
                  {org.clientStatus}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {org.legalName ?? org.name} · {org.subIndustry}
              </div>
              <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-foreground/80">
                {org.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                <Meta icon={MapPin}>
                  {org.hq}, {org.country}
                </Meta>
                <Meta icon={Globe}>{org.website}</Meta>
                <Meta icon={Users2}>{org.employees.toLocaleString()} employees</Meta>
                <Meta icon={DollarSign}>{org.revenue}</Meta>
                <Meta icon={Calendar}>Founded {org.founded}</Meta>
                <Meta icon={Building2}>{org.locations} locations</Meta>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {org.tags.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/60 bg-elevated/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Score constellation */}
            <div className="glass grid grid-cols-3 gap-3 rounded-2xl p-4">
              <ScoreRing value={org.scores.priority} label="Priority" hue={195} />
              <ScoreRing value={org.scores.lead} label="Lead" hue={210} />
              <ScoreRing value={org.scores.innovation} label="Innovation" hue={155} />
              <ScoreRing value={org.scores.luxury} label="Luxury" hue={40} />
              <ScoreRing value={org.scores.tech} label="Tech" hue={245} />
              <ScoreRing
                value={Math.round(
                  (org.scores.priority + org.scores.innovation + org.scores.luxury) / 3,
                )}
                label="Fit"
                hue={280}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI summary */}
          <section className="glass-strong relative overflow-hidden rounded-2xl p-5">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cyan" /> Copilot Brief
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/90">
                {org.name} is expanding across {org.countries.length} markets with a{" "}
                {org.scores.innovation > 80 ? "high innovation" : "steady innovation"}{" "}
                posture. Recent signals suggest an active experiential procurement window
                aligned to Lucen&rsquo;s core offer. Recommended next step: brief{" "}
                <span className="text-cyan">{org.owner}</span> and initiate outreach to
                the innovation lead within 7 days.
              </p>
            </div>
          </section>

          {/* Key people */}
          <section className="glass rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold">Key People</h2>
              <Link
                to="/people"
                className="flex items-center gap-1 text-[12px] text-cyan hover:underline"
              >
                All people <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {contacts.map((p) => (
                  <Link
                    key={p.id}
                    to="/people/$id"
                    params={{ id: p.id }}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-elevated/40 p-3 transition hover:border-cyan/40 hover:bg-elevated"
                  >
                    <PersonAvatar
                      first={p.firstName}
                      last={p.lastName}
                      hue={p.photoHue}
                      size={40}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="truncate text-[11.5px] text-muted-foreground">
                        {p.title}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[11px] text-cyan">
                        {p.relationship}
                      </div>
                      <div className="text-[9.5px] uppercase tracking-wider text-muted-foreground">
                        rel
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-[12.5px] text-muted-foreground">
                No people linked yet.
              </div>
            )}
          </section>

          {/* Opportunities */}
          {opps.length > 0 && (
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Live Opportunities</h2>
              <div className="space-y-2">
                {opps.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center gap-4 rounded-xl border border-border/60 bg-elevated/40 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">{o.name}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {o.owner} · closes {o.closeDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[13px]">
                        ${(o.value / 1000).toFixed(0)}k
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {o.probability}% · {o.stage}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* News */}
          {news.length > 0 && (
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Signals</h2>
              <ul className="space-y-3">
                {news.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-border/40 pb-3 last:border-0"
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      <span>{n.source}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                      <span>{n.category}</span>
                      <span className="ml-auto">{n.date}</span>
                    </div>
                    <div className="text-[13px]">{n.headline}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Intelligence Scores
            </h3>
            <div className="space-y-3">
              <ScoreBar value={org.scores.lead} label="Lead" hue={210} />
              <ScoreBar value={org.scores.innovation} label="Innovation" hue={155} />
              <ScoreBar value={org.scores.luxury} label="Luxury" hue={40} />
              <ScoreBar value={org.scores.tech} label="Technology" hue={245} />
              <ScoreBar value={org.scores.priority} label="Priority" hue={195} />
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Corporate Graph
            </h3>
            {parent && (
              <div className="mb-3">
                <div className="mb-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Parent
                </div>
                <Link
                  to="/organizations/$id"
                  params={{ id: parent.id }}
                  className="flex items-center gap-2 rounded-lg border border-border/60 p-2 hover:border-cyan/40"
                >
                  <EntityAvatar logo={parent.logo} size={28} />
                  <span className="text-[12.5px]">{parent.name}</span>
                </Link>
              </div>
            )}
            {subsidiaries.length > 0 && (
              <div className="mb-3">
                <div className="mb-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Subsidiaries
                </div>
                <div className="space-y-1.5">
                  {subsidiaries.map((s) => (
                    <Link
                      key={s.id}
                      to="/organizations/$id"
                      params={{ id: s.id }}
                      className="flex items-center gap-2 rounded-lg border border-border/60 p-2 hover:border-cyan/40"
                    >
                      <EntityAvatar logo={s.logo} size={28} />
                      <span className="text-[12.5px]">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {partners.length > 0 && (
              <div>
                <div className="mb-1 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  Connections
                </div>
                <div className="space-y-1.5">
                  {partners.map(({ rel, other }) => (
                    <Link
                      key={rel.id}
                      to="/organizations/$id"
                      params={{ id: other!.id }}
                      className="flex items-center gap-2 rounded-lg border border-border/60 p-2 hover:border-cyan/40"
                    >
                      <EntityAvatar logo={other!.logo} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[12.5px]">{other!.name}</div>
                        <div className="text-[10.5px] text-muted-foreground">
                          {rel.type.replace("_", " ")}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {!parent && subsidiaries.length === 0 && partners.length === 0 && (
              <div className="py-2 text-[12px] text-muted-foreground">
                No corporate links.
              </div>
            )}
          </section>

          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Markets
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {org.countries.map((c: string) => (
                <span
                  key={c}
                  className="rounded-md border border-border/60 bg-elevated/60 px-2 py-0.5 text-[11.5px]"
                >
                  {c}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
