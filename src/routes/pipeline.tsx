import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/lid/app-shell";
import { opportunities, orgById, pipelineStages } from "@/lib/mock-data";
import { EntityAvatar } from "@/components/lid/score-ring";

export const Route = createFileRoute("/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline · LID" }] }),
  component: PipelinePage,
});

const stageHues: Record<string, number> = {
  Prospect: 210,
  Qualified: 240,
  Meeting: 270,
  Proposal: 40,
  Negotiation: 20,
  Won: 155,
  Lost: 0,
};

function PipelinePage() {
  const total = opportunities
    .filter((o) => o.stage !== "Lost")
    .reduce((s, o) => s + o.value * (o.probability / 100), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Sales OS"
        title="Pipeline"
        description="Kanban of every live opportunity across markets and stages."
        actions={
          <div className="rounded-full border border-border/60 bg-elevated/60 px-3 py-1.5 text-[12px]">
            <span className="text-muted-foreground">Weighted </span>
            <span className="font-mono text-cyan">
              ${(total / 1_000_000).toFixed(2)}M
            </span>
          </div>
        }
      />
      <div className="overflow-x-auto px-8 py-6">
        <div className="flex min-w-max gap-3">
          {pipelineStages.map((stage) => {
            const items = opportunities.filter((o) => o.stage === stage);
            const stageTotal = items.reduce((s, o) => s + o.value, 0);
            const hue = stageHues[stage];
            return (
              <div key={stage} className="w-72 shrink-0">
                <div
                  className="mb-2 flex items-center justify-between rounded-lg border px-3 py-2"
                  style={{
                    borderColor: `hsl(${hue} 90% 55% / 0.25)`,
                    background: `hsl(${hue} 90% 55% / 0.06)`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: `hsl(${hue} 90% 60%)`,
                        boxShadow: `0 0 8px hsl(${hue} 90% 60%)`,
                      }}
                    />
                    <span className="text-[12.5px] font-medium">{stage}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ${(stageTotal / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="space-y-2">
                  {items.map((o) => {
                    const org = orgById(o.orgId);
                    return (
                      <Link
                        key={o.id}
                        to="/organizations/$id"
                        params={{ id: o.orgId }}
                        className="glass block rounded-xl p-3 transition hover:ring-1 hover:ring-cyan/40"
                      >
                        <div className="flex items-start gap-2">
                          {org && <EntityAvatar logo={org.logo} size={28} />}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12.5px] font-medium">
                              {o.name}
                            </div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {org?.name}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-mono text-[12.5px]">
                            ${(o.value / 1000).toFixed(0)}k
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {o.probability}% · {o.closeDate}
                          </span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${o.probability}%`,
                              background: `hsl(${hue} 90% 60%)`,
                            }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                  {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border/60 py-8 text-center text-[11.5px] text-muted-foreground">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
