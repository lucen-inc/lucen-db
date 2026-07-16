import { cn } from "@/lib/utils";

export function ScoreRing({
  value,
  label,
  size = 64,
  hue = 195,
}: {
  value: number;
  label?: string;
  size?: number;
  hue?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="inline-flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`hsl(${hue} 90% 62%)`}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px hsl(${hue} 90% 62% / 0.6))` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[13px] font-semibold tabular-nums">{value}</span>
        </div>
      </div>
      {label && (
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      )}
    </div>
  );
}

export function ScoreBar({
  value,
  label,
  hue = 195,
}: {
  value: number;
  label: string;
  hue?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-[11px] tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={cn("h-full rounded-full transition-all")}
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, hsl(${hue} 90% 55%), hsl(${(hue + 30) % 360} 90% 62%))`,
            boxShadow: `0 0 12px hsl(${hue} 90% 55% / 0.5)`,
          }}
        />
      </div>
    </div>
  );
}

export function EntityAvatar({
  logo,
  size = 40,
  hue = 200,
}: {
  logo: string;
  size?: number;
  hue?: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg font-mono font-bold text-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.32,
        background: `linear-gradient(135deg, hsl(${hue} 90% 65%), hsl(${(hue + 40) % 360} 90% 50%))`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent" />
      <span className="relative">{logo}</span>
    </div>
  );
}

export function PersonAvatar({
  first,
  last,
  hue = 200,
  size = 36,
}: {
  first: string;
  last: string;
  hue?: number;
  size?: number;
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, hsl(${hue} 70% 65%), hsl(${(hue + 40) % 360} 70% 45%))`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/25 via-transparent to-transparent" />
      <span className="relative">
        {first[0]}
        {last[0]}
      </span>
    </div>
  );
}
