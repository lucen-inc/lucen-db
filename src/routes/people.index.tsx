import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/lid/app-shell";
import { PersonAvatar } from "@/components/lid/score-ring";
import { orgById, people } from "@/lib/mock-data";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/people/")({
  head: () => ({ meta: [{ title: "People · LID" }] }),
  component: PeoplePage,
});

function PeoplePage() {
  const [q, setQ] = useState("");
  const [seniority, setSeniority] = useState<string>("All");

  const filtered = useMemo(() => {
    return people.filter((p) => {
      if (seniority !== "All" && p.seniority !== seniority) return false;
      if (q) {
        const s = q.toLowerCase();
        const o = orgById(p.orgId);
        if (
          !p.firstName.toLowerCase().includes(s) &&
          !p.lastName.toLowerCase().includes(s) &&
          !p.title.toLowerCase().includes(s) &&
          !p.city.toLowerCase().includes(s) &&
          !(o?.name.toLowerCase() ?? "").includes(s)
        )
          return false;
      }
      return true;
    });
  }, [q, seniority]);

  return (
    <div>
      <PageHeader
        eyebrow="Entities"
        title="People"
        description="Executives, decision makers and champions across every Lucen organization."
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Add person
          </button>
        }
      />

      <div className="px-8 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[280px] flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, title, city, company…"
              className="w-full rounded-lg border border-border/60 bg-elevated/60 py-2 pl-9 pr-3 text-[13px] outline-none placeholder:text-muted-foreground/60 focus:border-cyan/50"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-elevated/60 p-0.5">
            {["All", "C-Level", "VP", "Director", "Manager"].map((s) => (
              <button
                key={s}
                onClick={() => setSeniority(s)}
                className={`rounded-md px-3 py-1.5 text-[11.5px] transition ${
                  seniority === s
                    ? "bg-cyan/15 text-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11.5px] text-muted-foreground">
            {filtered.length} of {people.length}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const org = orgById(p.orgId);
            return (
              <Link
                key={p.id}
                to="/people/$id"
                params={{ id: p.id }}
                className="glass group relative overflow-hidden rounded-2xl p-4 transition hover:ring-1 hover:ring-cyan/40"
              >
                <div className="flex items-start gap-3">
                  <PersonAvatar
                    first={p.firstName}
                    last={p.lastName}
                    hue={p.photoHue}
                    size={48}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold group-hover:text-cyan">
                      {p.firstName} {p.lastName}
                    </div>
                    <div className="truncate text-[12px] text-muted-foreground">
                      {p.title}
                    </div>
                    <div className="mt-1 truncate text-[11.5px] text-cyan/80">
                      {org?.name}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{p.city}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  <span>{p.seniority}</span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: `hsl(${
                          p.relationship > 70 ? 155 : p.relationship > 40 ? 40 : 0
                        } 90% 60%)`,
                      }}
                    />
                    <span className="font-mono tabular-nums">{p.relationship}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
