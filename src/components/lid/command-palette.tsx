import { useNavigate } from "@tanstack/react-router";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Building2, User, Network, LayoutDashboard, KanbanSquare } from "lucide-react";
import { organizations, people } from "@/lib/mock-data";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const go = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="bg-elevated">
        <CommandInput placeholder="Search organizations, people, relationships…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => go(() => navigate({ to: "/" }))}>
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/organizations" }))}>
              <Building2 className="mr-2 h-4 w-4" /> Organizations
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/people" }))}>
              <User className="mr-2 h-4 w-4" /> People
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/graph" }))}>
              <Network className="mr-2 h-4 w-4" /> Relationship Graph
            </CommandItem>
            <CommandItem onSelect={() => go(() => navigate({ to: "/pipeline" }))}>
              <KanbanSquare className="mr-2 h-4 w-4" /> Pipeline
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Organizations">
            {organizations.slice(0, 8).map((o) => (
              <CommandItem
                key={o.id}
                value={`${o.name} ${o.industry} ${o.country}`}
                onSelect={() =>
                  go(() =>
                    navigate({ to: "/organizations/$id", params: { id: o.id } }),
                  )
                }
              >
                <div className="mr-2 flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-cyan to-holo text-[9px] font-bold text-black">
                  {o.logo}
                </div>
                <span className="flex-1">{o.name}</span>
                <span className="text-[10.5px] text-muted-foreground">
                  {o.industry} · {o.country}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="People">
            {people.slice(0, 8).map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.firstName} ${p.lastName} ${p.title}`}
                onSelect={() =>
                  go(() => navigate({ to: "/people/$id", params: { id: p.id } }))
                }
              >
                <div
                  className="mr-2 h-5 w-5 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${p.photoHue} 70% 60%), hsl(${(p.photoHue + 40) % 360} 70% 45%))`,
                  }}
                />
                <span className="flex-1">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-[10.5px] text-muted-foreground">{p.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
