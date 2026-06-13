import { DAY_W, ROW_H, LEFT_W, SLOT_W } from "@/constants";
import { getInitials } from "@/utils/date";
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
  days: Date[];                 // visible days only
  segments: Assignment[];       // all row segments (absolute slots)
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

  // Only render segments that overlap the visible window
  const visibleSegs = segments.filter(
    (s) => s.startSlot < viewEndSlot && s.endSlot > viewStartSlot
  );

  const laneMap = computeLanes(visibleSegs);
  const maxLane = visibleSegs.length > 0 ? Math.max(...laneMap.values()) : 0;
  const totalLanes = maxLane + 1;
  const rowHeight = totalLanes * ROW_H;

  const toVisualLeft = (slot: number) =>
    (slot - viewStartSlot) * SLOT_W + 2;

  return (
    <div
      style={{
        display: "flex",
        minHeight: rowHeight,
        borderBottom: "1px solid #F1F5F9",
        background: striped ? "#FBFCFE" : "#FFFFFF",
      }}
    >
      {/* Sticky employee panel — click opens stat modal */}
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
          width: visibleSlots * SLOT_W,
          minHeight: rowHeight,
          touchAction: "none",
        }}
        onPointerDown={onTrackPointerDown}
      >
        {/* Day grid lines */}
        {days.map((_, i) => (
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
              ...(i % 5 === 0 && i !== 0 ? { borderLeft: "2px solid #CBD5E1" } : {}),
            }}
          >
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
        ))}

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

        {/* Segment bars with lane positioning */}
        {visibleSegs.map((seg) => {
          const lane = laneMap.get(seg.id) ?? 0;
          return (
            <SegmentBar
              key={seg.id}
              seg={seg}
              lane={lane}
              visualLeft={toVisualLeft(seg.startSlot)}
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
