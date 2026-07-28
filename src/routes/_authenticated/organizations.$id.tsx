import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader } from "@/components/lid/app-shell";
import { EntityAvatar, ScoreBar, ScoreRing } from "@/components/lid/score-ring";
import { OrgFormDialog } from "@/components/lid/org-form-dialog";
import {
  getOrganization,
  getMyRole,
  updateOrganization,
  deleteOrganization,
  type OrganizationRow,
} from "@/lib/organizations.functions";
import type { OrganizationInput } from "@/lib/organizations.schema";
import {
  Globe,
  MapPin,
  Users2,
  Calendar,
  DollarSign,
  Building2,
  Sparkles,
  Pencil,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/organizations/$id")({
  loader: async ({ context, params }) => {
    const org = await context.queryClient.ensureQueryData({
      queryKey: ["organization", params.id],
      queryFn: () => getOrganization({ data: { id: params.id } }),
    });
    if (!org) throw notFound();
    await context.queryClient.ensureQueryData({
      queryKey: ["my-role"],
      queryFn: () => getMyRole(),
    });
    return { org };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.org.name} · LID` },
          { name: "description", content: loaderData.org.description ?? loaderData.org.name },
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
  const { id } = Route.useParams();
  const router = useRouter();
  const getFn = useServerFn(getOrganization);
  const roleFn = useServerFn(getMyRole);
  const updateFn = useServerFn(updateOrganization);
  const deleteFn = useServerFn(deleteOrganization);

  const { data: org } = useSuspenseQuery({
    queryKey: ["organization", id],
    queryFn: () => getFn({ data: { id } }),
  });
  const { data: role } = useQuery({ queryKey: ["my-role"], queryFn: () => roleFn() });

  const [editing, setEditing] = useState(false);
  const canEdit = role === "admin" || role === "editor";
  const canDelete = role === "admin";

  const updateMutation = useMutation({
    mutationFn: async (patch: OrganizationInput) => updateFn({ data: { id, patch } }),
    onSuccess: () => {
      toast.success("Organization updated.");
      setEditing(false);
      router.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Organization deleted.");
      router.navigate({ to: "/organizations" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (!org) return null;
  const o: OrganizationRow = org;
  const hue = 195 + (o.name.length % 60);

  return (
    <div>
      <PageHeader
        eyebrow="Organization"
        title={o.name}
        description={o.legal_name ?? undefined}
        actions={
          <>
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-elevated px-3 py-1.5 text-[12px] hover:border-cyan/40"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${o.name}? This cannot be undone.`)) deleteMutation.mutate();
                }}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </>
        }
      />

      <div className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(600px 300px at 10% 0%, hsl(${hue} 90% 55% / 0.35), transparent 60%)`,
          }}
        />
        <div className="relative px-8 pb-8 pt-6">
          <div className="mb-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Link to="/organizations" className="hover:text-cyan">Organizations</Link>
            <span>/</span>
            <span className="text-foreground">{o.name}</span>
          </div>
          <div className="flex flex-wrap items-start gap-6">
            <EntityAvatar logo={o.logo ?? o.name.slice(0, 2).toUpperCase()} size={88} hue={hue} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-cyan/30 bg-cyan/10 px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-cyan">
                  {o.client_status}
                </span>
                <span className="rounded-md border border-border/60 bg-white/[0.03] px-2 py-0.5 text-[10.5px] uppercase tracking-wider text-muted-foreground">
                  {o.stage}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">{o.sub_industry} · {o.industry}</div>
              {o.description && (
                <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-foreground/80">{o.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
                <Meta icon={MapPin}>{o.hq}, {o.country}</Meta>
                {o.website && <Meta icon={Globe}>{o.website}</Meta>}
                <Meta icon={Users2}>{o.employees.toLocaleString()} employees</Meta>
                {o.revenue && <Meta icon={DollarSign}>{o.revenue}</Meta>}
                {o.founded && <Meta icon={Calendar}>Founded {o.founded}</Meta>}
                <Meta icon={Building2}>{o.locations} locations</Meta>
              </div>
              {o.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {o.tags.map((t) => (
                    <span key={t} className="rounded-full border border-border/60 bg-elevated/60 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="glass grid grid-cols-3 gap-3 rounded-2xl p-4">
              <ScoreRing value={o.score_priority} label="Priority" hue={195} />
              <ScoreRing value={o.score_lead} label="Lead" hue={210} />
              <ScoreRing value={o.score_innovation} label="Innovation" hue={155} />
              <ScoreRing value={o.score_luxury} label="Luxury" hue={40} />
              <ScoreRing value={o.score_tech} label="Tech" hue={245} />
              <ScoreRing
                value={Math.round((o.score_priority + o.score_innovation + o.score_luxury) / 3)}
                label="Fit"
                hue={280}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="glass-strong relative overflow-hidden rounded-2xl p-5">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cyan" /> Copilot Brief
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/90">
                {o.name} spans {o.countries.length} markets with a {o.score_innovation > 80 ? "high" : "steady"} innovation posture.
                Recommended next step: brief <span className="text-cyan">{o.owner ?? "the account owner"}</span> and initiate outreach within 7 days.
              </p>
            </div>
          </section>

          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Markets</h3>
            <div className="flex flex-wrap gap-1.5">
              {o.countries.length ? o.countries.map((c) => (
                <span key={c} className="rounded-md border border-border/60 bg-elevated/60 px-2 py-0.5 text-[11.5px]">{c}</span>
              )) : <span className="text-[12px] text-muted-foreground">No markets tracked.</span>}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">Intelligence Scores</h3>
            <div className="space-y-3">
              <ScoreBar value={o.score_lead} label="Lead" hue={210} />
              <ScoreBar value={o.score_innovation} label="Innovation" hue={155} />
              <ScoreBar value={o.score_luxury} label="Luxury" hue={40} />
              <ScoreBar value={o.score_tech} label="Technology" hue={245} />
              <ScoreBar value={o.score_priority} label="Priority" hue={195} />
            </div>
          </section>

          <section className="glass rounded-2xl p-5 text-[12px] text-muted-foreground">
            <div>Created {new Date(o.created_at).toLocaleDateString()}</div>
            <div>Updated {new Date(o.updated_at).toLocaleDateString()}</div>
          </section>
        </div>
      </div>

      {editing && (
        <OrgFormDialog
          title={`Edit ${o.name}`}
          submitLabel={updateMutation.isPending ? "Saving…" : "Save changes"}
          disabled={updateMutation.isPending}
          initial={{
            name: o.name,
            legal_name: o.legal_name,
            industry: o.industry as OrganizationInput["industry"],
            sub_industry: o.sub_industry,
            hq: o.hq,
            country: o.country,
            countries: o.countries,
            employees: o.employees,
            revenue: o.revenue,
            founded: o.founded,
            website: o.website,
            description: o.description,
            logo: o.logo,
            tags: o.tags,
            score_lead: o.score_lead,
            score_innovation: o.score_innovation,
            score_luxury: o.score_luxury,
            score_tech: o.score_tech,
            score_priority: o.score_priority,
            client_status: o.client_status as OrganizationInput["client_status"],
            stage: o.stage as OrganizationInput["stage"],
            owner: o.owner,
            locations: o.locations,
          }}
          onCancel={() => setEditing(false)}
          onSubmit={(values) => updateMutation.mutate(values)}
        />
      )}
    </div>
  );
}

function Meta({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
