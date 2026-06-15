import { DAY_W, ROW_H, SLOT_W, DAYS_PER_WEEK } from "@/constants";
import { getInitials, isWeekend } from "@/utils/date";
import { computeLanes } from "@/engine/pushEngine";
import { SegmentBar } from "./SegmentBar";
import type { Assignment, SelectionRange } from "@/types";
import styles from "./EmployeeRow.module.css";

interface Props {
  employeeId: string;
  name: string;
  title: string;
  striped: boolean;
  viewStartSlot: number;
  visibleSlots: number;
  days: Date[];
  segments: Assignment[];
  selection: SelectionRange | null;
  onTrackPointerDown: (e: React.PointerEvent) => void;
  onSegmentPointerDown: (e: React.PointerEvent, seg: Assignment) => void;
  onResizeLeft: (e: React.PointerEvent, seg: Assignment) => void;
  onResizeRight: (e: React.PointerEvent, seg: Assignment) => void;
  onDelete: (seg: Assignment) => void;
  onSegmentDoubleClick: (seg: Assignment) => void;
  onEmployeeClick: (employeeId: string) => void;
}

export function EmployeeRow({
  employeeId,
  name,
  title,
  striped,
  viewStartSlot,
  visibleSlots,
  days,
  segments,
  selection,
  onTrackPointerDown,
  onSegmentPointerDown,
  onResizeLeft,
  onResizeRight,
  onDelete,
  onSegmentDoubleClick,
  onEmployeeClick,
}: Props) {
  const viewEndSlot = viewStartSlot + visibleSlots;

  const visibleSegs = segments.filter(
    (s) => s.startSlot < viewEndSlot && s.endSlot > viewStartSlot
  );

  const laneMap = computeLanes(visibleSegs);
  const maxLane = visibleSegs.length > 0 ? Math.max(...laneMap.values()) : 0;
  const rowHeight = (maxLane + 1) * ROW_H;
  const trackWidth = visibleSlots * SLOT_W;

  return (
    <div
      className={`${styles.row} ${striped ? styles.striped : ""}`}
      style={{ minHeight: rowHeight }}
    >
      {/* Sticky employee panel */}
      <div
        className={styles.leftPanel}
        style={{ minHeight: rowHeight }}
        onClick={() => onEmployeeClick(employeeId)}
        title="İstatistikleri gör"
      >
        <div className={styles.avatar}>{getInitials(name)}</div>
        <div className={styles.identity}>
          <div className={styles.name}>{name}</div>
          <div className={styles.title}>{title}</div>
        </div>
      </div>

      {/* Track */}
      <div
        className={styles.track}
        style={{ width: trackWidth, minHeight: rowHeight }}
        onPointerDown={onTrackPointerDown}
      >
        {/* Day columns */}
        {days.map((day, i) => {
          const weekend = isWeekend(day);
          const isWeekStart = i % DAYS_PER_WEEK === 0 && i !== 0;
          return (
            <div
              key={i}
              className={[
                styles.dayCol,
                weekend ? styles.weekend : "",
                isWeekStart ? styles.weekStart : "",
              ].filter(Boolean).join(" ")}
              style={{ left: i * DAY_W }}
            >
              <span className={styles.halfDivider} />
            </div>
          );
        })}

        {/* Selection overlay */}
        {selection && (
          <div
            className={styles.selection}
            style={{
              left: (Math.min(selection.a, selection.b) - viewStartSlot) * SLOT_W,
              width: Math.abs(selection.b - selection.a) * SLOT_W,
            }}
          />
        )}

        {/* Segment bars — geometry clamped to the visible window so a bar that
            extends past the edge never overflows / creates horizontal scroll. */}
        {visibleSegs.map((seg) => {
          const lane = laneMap.get(seg.id) ?? 0;
          const clipStart = seg.startSlot < viewStartSlot;
          const clipEnd = seg.endSlot > viewEndSlot;
          const clampedStart = Math.max(seg.startSlot, viewStartSlot);
          const clampedEnd = Math.min(seg.endSlot, viewEndSlot);
          const visualLeft = (clampedStart - viewStartSlot) * SLOT_W + 2;
          const visualWidth = (clampedEnd - clampedStart) * SLOT_W - 4;
          return (
            <SegmentBar
              key={seg.id}
              seg={seg}
              lane={lane}
              visualLeft={visualLeft}
              visualWidth={visualWidth}
              clipStart={clipStart}
              clipEnd={clipEnd}
              onPointerDown={(e) => onSegmentPointerDown(e, seg)}
              onResizeLeft={(e) => onResizeLeft(e, seg)}
              onResizeRight={(e) => onResizeRight(e, seg)}
              onDelete={() => onDelete(seg)}
              onDoubleClick={() => onSegmentDoubleClick(seg)}
            />
          );
        })}
      </div>
    </div>
  );
}
