import { useState } from "react";

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  slices: Slice[];
  size?: number;
}

interface Tooltip {
  label: string;
  pct: number;
  x: number;
  y: number;
}

export function PieChart({ slices, size = 150 }: Props) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const total = slices.reduce((s, c) => s + c.value, 0);
  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 12 }}>
        Veri yok
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  const paths: { d: string; color: string; pct: number; label: string }[] = [];
  let angle = -Math.PI / 2;

  for (const slice of slices) {
    if (slice.value <= 0) continue;
    const sweep = (slice.value / total) * 2 * Math.PI;
    const startAngle = angle;
    const endAngle = angle + sweep;
    angle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweep > Math.PI ? 1 : 0;

    const d =
      Math.abs(sweep - 2 * Math.PI) < 0.001
        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    paths.push({ d, color: slice.color, pct: Math.round((slice.value / total) * 100), label: slice.label });
  }

  return (
    <>
      <svg
        width={size}
        height={size}
        style={{ display: "block" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {paths.map((p) => (
          <path
            key={p.label}
            d={p.d}
            fill={p.color}
            stroke="#fff"
            strokeWidth={tooltip?.label === p.label ? 3 : 2}
            style={{ cursor: "default", transition: "stroke-width 80ms" }}
            onMouseEnter={(e) =>
              setTooltip({ label: p.label, pct: p.pct, x: e.clientX, y: e.clientY })
            }
            onMouseMove={(e) =>
              setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)
            }
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </svg>

      {/* Fixed-position tooltip — escapes overflow:hidden parents */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 46,
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 9999,
            background: "rgba(15,23,42,0.88)",
            color: "#fff",
            borderRadius: 8,
            padding: "5px 11px",
            fontSize: 12.5,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            lineHeight: 1.4,
          }}
        >
          {tooltip.label}
          <span style={{ marginLeft: 7, fontWeight: 800, fontSize: 13.5 }}>
            {tooltip.pct}%
          </span>
        </div>
      )}
    </>
  );
}
