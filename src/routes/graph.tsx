import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/lid/app-shell";
import {
  organizations,
  people,
  relationships,
  type Organization,
  type Person,
} from "@/lib/mock-data";

export const Route = createFileRoute("/graph")({
  head: () => ({ meta: [{ title: "Relationship Graph · LID" }] }),
  component: GraphPage,
});

type Node = {
  id: string;
  label: string;
  kind: "org" | "person";
  hue: number;
  size: number;
  x: number;
  y: number;
};

function GraphPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    // Radial layout: orgs on outer ring, people on inner ring near their org.
    const orgList = organizations;
    const orgCount = orgList.length;
    const orgRadius = 300;
    const centerX = 480;
    const centerY = 320;

    const orgNodes: Node[] = orgList.map((o: Organization, i) => {
      const angle = (i / orgCount) * Math.PI * 2 - Math.PI / 2;
      return {
        id: o.id,
        label: o.name,
        kind: "org",
        hue: 195 + (o.name.length * 13) % 120,
        size: 12 + Math.min(20, Math.log10(o.employees + 10) * 3),
        x: centerX + Math.cos(angle) * orgRadius,
        y: centerY + Math.sin(angle) * orgRadius,
      };
    });

    const orgMap = new Map(orgNodes.map((n) => [n.id, n]));

    const personNodes: Node[] = people.map((p: Person, i) => {
      const org = orgMap.get(p.orgId);
      if (!org) {
        return {
          id: p.id,
          label: `${p.firstName} ${p.lastName}`,
          kind: "person",
          hue: p.photoHue,
          size: 7,
          x: centerX,
          y: centerY,
        };
      }
      // place around its org
      const dx = org.x - centerX;
      const dy = org.y - centerY;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const offset = 70 + (i % 3) * 22;
      const perp = ((i % 5) - 2) * 18;
      return {
        id: p.id,
        label: `${p.firstName} ${p.lastName}`,
        kind: "person",
        hue: p.photoHue,
        size: 7,
        x: org.x - nx * offset + -ny * perp,
        y: org.y - ny * offset + nx * perp,
      };
    });

    return { nodes: [...orgNodes, ...personNodes], edges: relationships };
  }, []);

  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const isDim = (id: string) => {
    if (!hovered) return false;
    if (id === hovered) return false;
    // dim if not connected to hovered
    const connected = edges.some(
      (e) =>
        (e.from === hovered && e.to === id) ||
        (e.to === hovered && e.from === id),
    );
    return !connected;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Relationship Graph"
        description="Every person, organization and connection in one navigable knowledge graph."
      />
      <div className="px-8 py-6">
        <div className="glass grid-bg relative h-[720px] overflow-hidden rounded-2xl">
          <svg viewBox="0 0 960 640" className="absolute inset-0 h-full w-full">
            {/* Edges */}
            {edges.map((e) => {
              const a = nodeById.get(e.from);
              const b = nodeById.get(e.to);
              if (!a || !b) return null;
              const dim =
                hovered && ![e.from, e.to].includes(hovered) ? 0.08 : 0.35;
              const active = hovered && [e.from, e.to].includes(hovered);
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={active ? "hsl(195 90% 60%)" : "white"}
                  strokeOpacity={active ? 0.9 : dim}
                  strokeWidth={active ? 1.4 : 0.8}
                  style={
                    active
                      ? { filter: "drop-shadow(0 0 4px hsl(195 90% 60%))" }
                      : undefined
                  }
                />
              );
            })}
            {/* Nodes */}
            {nodes.map((n) => {
              const dim = isDim(n.id);
              const active = hovered === n.id;
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer", opacity: dim ? 0.25 : 1 }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.size + (active ? 4 : 0)}
                    fill={`hsl(${n.hue} 90% ${n.kind === "org" ? 58 : 68}%)`}
                    stroke={active ? "white" : "rgba(255,255,255,0.15)"}
                    strokeWidth={active ? 2 : 1}
                    style={{
                      filter: active
                        ? `drop-shadow(0 0 12px hsl(${n.hue} 90% 60%))`
                        : `drop-shadow(0 0 4px hsl(${n.hue} 90% 55% / 0.5))`,
                    }}
                  />
                  {(n.kind === "org" || active) && (
                    <text
                      x={n.x}
                      y={n.y + n.size + 14}
                      textAnchor="middle"
                      fill="white"
                      fillOpacity={active ? 1 : 0.75}
                      fontSize={n.kind === "org" ? 10.5 : 10}
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: active ? 600 : 500,
                        paintOrder: "stroke",
                        stroke: "rgba(6,8,13,0.9)",
                        strokeWidth: 3,
                      }}
                    >
                      {n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="glass-strong pointer-events-none absolute bottom-4 left-4 rounded-xl px-3 py-2 text-[11px] text-muted-foreground">
            <div className="mb-1 font-semibold uppercase tracking-wider text-foreground">
              Legend
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
              Organization
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-holo" />
              Person
            </div>
          </div>
          <div className="glass-strong pointer-events-none absolute bottom-4 right-4 rounded-xl px-3 py-2 text-[11px]">
            <span className="text-muted-foreground">Nodes </span>
            <span className="font-mono">{nodes.length}</span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-muted-foreground">Edges </span>
            <span className="font-mono">{edges.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
