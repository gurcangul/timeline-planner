import { useState } from "react";
import { SLOT_W, ROW_H, ACTIVITY_TYPES } from "@/constants";
import type { Assignment } from "@/types";

interface Props {
  seg: Assignment;
  lane: number;
  visualLeft: number;
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
  onPointerDown,
  onResizeLeft,
  onResizeRight,
  onDelete,
  onDoubleClick,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const type = ACTIVITY_TYPES[seg.typeId];
  if (!type) return null;

  const pinned = type.pinned;
  const width = (seg.endSlot - seg.startSlot) * SLOT_W - 4;
  const top = lane * LANE_H + 6;

  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={pinned ? "seg seg--pinned" : "seg seg--movable"}
      title={`${type.label} · ${seg.label}`}
      style={{
        position: "absolute",
        top,
        left: visualLeft,
        width,
        height: ROW_H - 12,
        border: `1.5px solid ${type.color}`,
        borderRadius: 8,
        background: pinned
          ? `repeating-linear-gradient(45deg, ${type.softColor}, ${type.softColor} 6px, #fff0 6px, #fff0 10px)`
          : type.softColor,
        color: type.color,
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        userSelect: "none",
        fontSize: 12,
        cursor: pinned ? "default" : "grab",
        // No overflow:hidden here — delete button must not be clipped
      }}
    >
      {!pinned && (
        <span className="seg__handle" onPointerDown={onResizeLeft} style={handleStyle("left")} />
      )}

      <span style={innerStyle}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            flexShrink: 0,
            background: type.color,
          }}
        />
        <span
          style={{
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}
        >
          {seg.label || type.short}
        </span>
        {pinned && (
          <span style={{ fontSize: 10, marginLeft: "auto", flexShrink: 0, opacity: 0.7 }}>
            🔒
          </span>
        )}
      </span>

      {!pinned && (
        <span className="seg__handle" onPointerDown={onResizeRight} style={handleStyle("right")} />
      )}

      {/* Delete button: positioned inside bounds, top-right corner */}
      {hovered && (
        <button
          style={deleteButtonStyle}
          onPointerDown={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

const handleStyle = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  [side]: 0,
  width: 7,
  cursor: "ew-resize",
  zIndex: 2,
  flexShrink: 0,
});

const innerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "0 9px",
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
};

const deleteButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 1,
  right: 4,
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "none",
  background: "#0F172A",
  color: "#fff",
  fontSize: 12,
  lineHeight: "15px",
  cursor: "pointer",
  zIndex: 3,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
