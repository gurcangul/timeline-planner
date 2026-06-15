import { DAY_W, ROW_H, LEFT_W, SLOT_W, DAYS_PER_WEEK } from "@/constants";
import { getInitials, isWeekend } from "@/utils/date";
import { computeLanes } from "@/engine/pushEngine";
import { SegmentBar } from "./SegmentBar";
import type { Assignment, SelectionRange } from "@/types";

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
  onDelete: (id: string) => void;
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
  const totalLanes = maxLane + 1;
  const rowHeight = totalLanes * ROW_H;

  const trackWidth = visibleSlots * SLOT_W;

  return (
    <div
      style={{
        display: "flex",
        minHeight: rowHeight,
        borderBottom: "1px solid #F1F5F9",
        background: striped ? "#FBFCFE" : "#FFFFFF",
      }}
    >
      {/* Sticky employee panel */}
      <div
        style={{ ...leftPanelStyle, minHeight: rowHeight, cursor: "pointer" }}
        onClick={() => onEmployeeClick(employeeId)}
        title="İstatistikleri gör"
      >
        <div style={avatarStyle}>{getInitials(name)}</div>
        <div style={{ minWidth: 0 }}>
          <div style={nameStyle}>{name}</div>
          <div style={titleStyle}>{title}</div>
        </div>
      </div>

      {/* Track */}
      <div
        style={{
          position: "relative",
          width: trackWidth,
          minHeight: rowHeight,
          touchAction: "none",
          overflow: "hidden", // wide bars / preview must never overflow the viewport
        }}
        onPointerDown={onTrackPointerDown}
      >
        {/* Day columns */}
        {days.map((day, i) => {
          const weekend = isWeekend(day);
          const isWeekStart = i % DAYS_PER_WEEK === 0 && i !== 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: i * DAY_W,
                width: DAY_W,
                borderRight: "1px solid #EEF2F6",
                boxSizing: "border-box",
                background: weekend
                  ? striped ? "rgba(0,0,0,0.028)" : "rgba(0,0,0,0.018)"
                  : "transparent",
                ...(isWeekStart ? { borderLeft: "2px solid #CBD5E1" } : {}),
              }}
            >
              {/* AM/PM half-day divider */}
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: SLOT_W,
                  width: 1,
                  background: "#F4F7FA",
                }}
              />
            </div>
          );
        })}

        {/* Selection overlay */}
        {selection && (
          <div
            style={{
              position: "absolute",
              top: 4,
              bottom: 4,
              left: (Math.min(selection.a, selection.b) - viewStartSlot) * SLOT_W,
              width: Math.abs(selection.b - selection.a) * SLOT_W,
              background: "rgba(79,70,229,0.12)",
              border: "1.5px dashed #4F46E5",
              borderRadius: 8,
              pointerEvents: "none",
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
              onDelete={() => onDelete(seg.id)}
              onDoubleClick={() => onSegmentDoubleClick(seg)}
            />
          );
        })}
      </div>
    </div>
  );
}

const leftPanelStyle: React.CSSProperties = {
  width: LEFT_W,
  minWidth: LEFT_W,
  position: "sticky",
  left: 0,
  zIndex: 4,
  background: "inherit",
  borderRight: "1px solid #E2E8F0",
  display: "flex",
  alignItems: "flex-start",
  gap: 11,
  padding: "11px 16px",
  boxSizing: "border-box",
};

const avatarStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 9,
  background: "#1E293B",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11.5,
  fontWeight: 700,
  flexShrink: 0,
};

const nameStyle: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 600,
  color: "#0F172A",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const titleStyle: React.CSSProperties = {
  fontSize: 11.5,
  color: "#94A3B8",
};
