import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/lid/app-shell";
import { PersonAvatar, ScoreBar, ScoreRing } from "@/components/lid/score-ring";
import { EntityAvatar } from "@/components/lid/score-ring";
import { orgById, personById, relationshipsFor } from "@/lib/mock-data";
import { people as allPeople } from "@/lib/mock-data";
import { Mail, Phone, Linkedin, MapPin, Building2 } from "lucide-react";

export const Route = createFileRoute("/people/$id")({
  loader: ({ params }) => {
    const person = personById(params.id);
    if (!person) throw notFound();
    return { person };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          {
            title: `${loaderData.person.firstName} ${loaderData.person.lastName} · LID`,
          },
        ]
      : [{ title: "Person · LID" }],
  }),
  component: PersonDetail,
  notFoundComponent: () => (
    <div className="p-16 text-center text-muted-foreground">Person not found.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-16 text-center text-muted-foreground">{error.message}</div>
  ),
});

function PersonDetail() {
  const { person } = Route.useLoaderData();
  const org = orgById(person.orgId);
  const rels = relationshipsFor(person.id);
  const colleagues = allPeople.filter(
    (p) => p.orgId === person.orgId && p.id !== person.id,
  );

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(600px 300px at 10% 0%, hsl(${person.photoHue} 90% 55% / 0.35), transparent 60%)`,
          }}
        />
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="relative px-8 pb-8 pt-10">
          <div className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Link to="/people" className="hover:text-cyan">
              People
            </Link>
            <span>/</span>
            <span className="text-foreground">
              {person.firstName} {person.lastName}
            </span>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <PersonAvatar
              first={person.firstName}
              last={person.lastName}
              hue={person.photoHue}
              size={96}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-[30px] font-semibold tracking-tight">
                {person.firstName} {person.lastName}
              </h1>
              <div className="mt-1 text-[14px] text-muted-foreground">{person.title}</div>
              {org && (
                <Link
                  to="/organizations/$id"
                  params={{ id: org.id }}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-elevated/60 px-2.5 py-1.5 text-[12px] hover:border-cyan/40"
                >
                  <EntityAvatar logo={org.logo} size={22} />
                  {org.name}
                </Link>
              )}

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                <Meta icon={Mail}>{person.email}</Meta>
                {person.phone && <Meta icon={Phone}>{person.phone}</Meta>}
                <Meta icon={Linkedin}>{person.linkedin}</Meta>
                <Meta icon={MapPin}>
                  {person.city}, {person.country}
                </Meta>
                <Meta icon={Building2}>{person.department}</Meta>
              </div>
            </div>
            <div className="glass grid grid-cols-2 gap-3 rounded-2xl p-4">
              <ScoreRing value={person.influence} label="Influence" hue={195} />
              <ScoreRing value={person.relationship} label="Relationship" hue={155} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Career Timeline</h2>
            <div className="relative space-y-4 pl-6">
              <div className="absolute bottom-0 left-2 top-1 w-px bg-border/60" />
              <TimelineItem
                date="Current"
                title={person.title}
                subtitle={org?.name ?? ""}
                active
              />
              <TimelineItem
                date="2019 — 2022"
                title="VP, Strategic Programs"
                subtitle="Emirates Group"
              />
              <TimelineItem
                date="2015 — 2019"
                title="Senior Manager, Innovation"
                subtitle="Etihad Aviation Group"
              />
              <TimelineItem
                date="MBA"
                title="INSEAD"
                subtitle="Strategic Marketing"
              />
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <h2 className="mb-4 text-[15px] font-semibold">Relationships</h2>
            <div className="space-y-2">
              {rels.map((r) => {
                const otherId = r.from === person.id ? r.to : r.from;
                const other =
                  r.fromType === "org" || r.toType === "org"
                    ? orgById(otherId)
                    : undefined;
                if (!other) return null;
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-elevated/40 p-3"
                  >
                    <EntityAvatar logo={other.logo} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">
                        {other.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.type.replace("_", " ")} · since {r.since ?? "—"}
                      </div>
                    </div>
                    <div className="w-32">
                      <ScoreBar value={r.strength} label="Strength" hue={195} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {colleagues.length > 0 && (
            <section className="glass rounded-2xl p-5">
              <h2 className="mb-4 text-[15px] font-semibold">Colleagues at {org?.name}</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {colleagues.map((c) => (
                  <Link
                    key={c.id}
                    to="/people/$id"
                    params={{ id: c.id }}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-elevated/40 p-3 hover:border-cyan/40"
                  >
                    <PersonAvatar
                      first={c.firstName}
                      last={c.lastName}
                      hue={c.photoHue}
                      size={36}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-medium">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {c.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Classification
            </h3>
            <dl className="space-y-2 text-[12.5px]">
              <Row k="Seniority" v={person.seniority} />
              <Row k="Decision Maker" v={person.decisionMaker} />
              <Row k="Department" v={person.department} />
              <Row k="Last Interaction" v={person.lastInteraction} />
            </dl>
          </section>
          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Signals
            </h3>
            <div className="space-y-3">
              <ScoreBar value={person.influence} label="Influence" hue={195} />
              <ScoreBar value={person.relationship} label="Relationship" hue={155} />
              <ScoreBar
                value={Math.min(
                  100,
                  Math.round((person.influence + person.relationship) / 2),
                )}
                label="Strategic Fit"
                hue={280}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function TimelineItem({
  date,
  title,
  subtitle,
  active,
}: {
  date: string;
  title: string;
  subtitle: string;
  active?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${
          active
            ? "border-cyan bg-cyan shadow-[0_0_10px_var(--cyan)]"
            : "border-border bg-background"
        }`}
      />
      <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
        {date}
      </div>
      <div className="text-[13px] font-medium">{title}</div>
      <div className="text-[11.5px] text-muted-foreground">{subtitle}</div>
    </div>
  );
}
