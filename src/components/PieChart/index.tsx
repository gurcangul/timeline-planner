import { useState } from "react";
import styles from "./PieChart.module.css";

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
      <div className={styles.empty} style={{ width: size, height: size }}>
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
        className={styles.svg}
        onMouseLeave={() => setTooltip(null)}
      >
        {paths.map((p) => (
          <path
            key={p.label}
            d={p.d}
            fill={p.color}
            className={`${styles.slice} ${tooltip?.label === p.label ? styles.sliceActive : ""}`}
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
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y - 46 }}>
          {tooltip.label}
          <span className={styles.tooltipPct}>{tooltip.pct}%</span>
        </div>
      )}
    </>
  );
}
