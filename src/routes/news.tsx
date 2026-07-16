import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/lid/app-shell";
import { EntityAvatar } from "@/components/lid/score-ring";
import { news, orgById } from "@/lib/mock-data";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "Intelligence Feed · LID" }] }),
  component: NewsPage,
});

const categoryHues: Record<string, number> = {
  Expansion: 155,
  Executive: 245,
  Funding: 40,
  Award: 300,
  Launch: 195,
};

function NewsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Signals"
        title="Intelligence Feed"
        description="Live company signals, executive moves, expansions and launches surfaced from public sources."
      />
      <div className="px-8 py-6">
        <div className="space-y-2">
          {news.map((n) => {
            const org = orgById(n.orgId);
            const hue = categoryHues[n.category] ?? 195;
            return (
              <div
                key={n.id}
                className="glass flex items-center gap-4 rounded-2xl p-4 transition hover:ring-1 hover:ring-cyan/30"
              >
                {org && <EntityAvatar logo={org.logo} size={40} />}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    {org && (
                      <Link
                        to="/organizations/$id"
                        params={{ id: org.id }}
                        className="hover:text-cyan"
                      >
                        {org.name}
                      </Link>
                    )}
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                    <span
                      className="rounded-md border px-1.5 py-0.5"
                      style={{
                        borderColor: `hsl(${hue} 90% 55% / 0.3)`,
                        background: `hsl(${hue} 90% 55% / 0.08)`,
                        color: `hsl(${hue} 90% 75%)`,
                      }}
                    >
                      {n.category}
                    </span>
                    <span className="text-muted-foreground">via {n.source}</span>
                    <span className="ml-auto normal-case tracking-normal">{n.date}</span>
                  </div>
                  <div className="text-[14px] leading-snug">{n.headline}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
