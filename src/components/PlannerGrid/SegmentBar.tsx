import { SLOT_W, ROW_H, ACTIVITY_TYPES } from "@/constants";
import type { Assignment } from "@/types";
import styles from "./SegmentBar.module.css";

interface Props {
  seg: Assignment;
  lane: number;
  visualLeft: number;
  /** Width already clamped to the visible window by EmployeeRow. */
  visualWidth: number;
  /** True when the bar is cut off at the start/end by the window edge. */
  clipStart?: boolean;
  clipEnd?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onResizeLeft: (e: React.PointerEvent) => void;
  onResizeRight: (e: React.PointerEvent) => void;
  onDelete: () => void;
  onDoubleClick: () => void;
}

const LANE_H = ROW_H;

export function SegmentBar({
  seg,
  lane,
  visualLeft,
  visualWidth,
  clipStart = false,
  clipEnd = false,
  onPointerDown,
  onResizeLeft,
  onResizeRight,
  onDelete,
  onDoubleClick,
}: Props) {
  const type = ACTIVITY_TYPES[seg.typeId];
  if (!type) return null;

  const pinned = type.pinned;
  const width = Math.max(SLOT_W - 4, visualWidth);
  const top = lane * LANE_H + 6;

  const className = [
    styles.bar,
    pinned ? styles.pinned : styles.movable,
    clipStart ? styles.clipStart : "",
    clipEnd ? styles.clipEnd : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      className={className}
      title={`${type.label} · ${seg.label}`}
      style={{
        top,
        left: visualLeft,
        width,
        ["--seg-color" as string]: type.color,
        ["--seg-soft" as string]: type.softColor,
      }}
    >
      {!pinned && !clipStart && (
        <span
          className={`${styles.handle} ${styles.handleLeft}`}
          onPointerDown={onResizeLeft}
        />
      )}

      <span className={styles.inner}>
        <span className={styles.dot} />
        <span className={styles.label}>{seg.label || type.short}</span>
        {pinned && <span className={styles.lock}>🔒</span>}
      </span>

      {!pinned && !clipEnd && (
        <span
          className={`${styles.handle} ${styles.handleRight}`}
          onPointerDown={onResizeRight}
        />
      )}

      <button
        className={styles.delete}
        onPointerDown={(e) => { e.stopPropagation(); onDelete(); }}
      >
        ×
      </button>
    </div>
  );
}
