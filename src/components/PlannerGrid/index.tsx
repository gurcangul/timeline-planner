import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { EMPLOYEES, LEFT_W, SLOT_W, DAY_W, DAYS_PER_WEEK, SLOTS_PER_WEEK, SLOTS_PER_DAY } from "@/constants";
import { buildWorkingDays, TR_MONTH_NAMES } from "@/utils/date";
import { useAssignments } from "@/hooks/useAssignments";
import { useDragInteraction } from "@/hooks/useDragInteraction";
import { GridHeader } from "./GridHeader";
import { EmployeeRow } from "./EmployeeRow";
import { AssignModal } from "@/components/AssignModal";
import { ExportModal } from "@/components/ExportModal";
import { StatModal } from "@/components/StatModal";
import type { Assignment } from "@/types";

const MAX_WEEKS = 104;
const TOTAL_DAYS = MAX_WEEKS * DAYS_PER_WEEK;
const MIN_VISIBLE_DAYS = DAYS_PER_WEEK; // at least one full week

export function PlannerGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Measure scroll container width → compute how many full weeks fit
  const [containerWidth, setContainerWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fill the available width with as many whole DAYS as fit (not just whole weeks).
  const visibleDayCount = useMemo(() => {
    const available = containerWidth - LEFT_W;
    return Math.max(MIN_VISIBLE_DAYS, Math.floor(available / DAY_W));
  }, [containerWidth]);

  // Modal states
  const [editSegment, setEditSegment] = useState<Assignment | null>(null);
  const [showToolbarCreate, setShowToolbarCreate] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [statTarget, setStatTarget] = useState<string | "all" | null>(null);

  const allWorkingDays = useMemo(() => buildWorkingDays(MAX_WEEKS, 0), []);

  // Navigation moves by whole weeks, but the visible window is day-granular
  // so wide screens fill completely instead of leaving a sub-week gap.
  const startDay = weekOffset * DAYS_PER_WEEK;
  const visibleDays = useMemo(
    () => allWorkingDays.slice(startDay, startDay + visibleDayCount),
    [allWorkingDays, startDay, visibleDayCount]
  );

  const viewStartSlot = weekOffset * SLOTS_PER_WEEK;
  const visibleSlots  = visibleDayCount * SLOTS_PER_DAY;
  const totalSlots    = MAX_WEEKS * SLOTS_PER_WEEK;

  const maxWeekOffset = Math.max(
    0,
    Math.ceil((TOTAL_DAYS - visibleDayCount) / DAYS_PER_WEEK)
  );
  const canGoBack    = weekOffset > 0;
  const canGoForward = weekOffset < maxWeekOffset;

  // Drag edge auto-paging: shift one week, clamped to bounds.
  const pageBy = useCallback(
    (dir: -1 | 1) => {
      setWeekOffset((w) => Math.min(maxWeekOffset, Math.max(0, w + dir)));
    },
    [maxWeekOffset]
  );

  const {
    assignments,
    getRowSegments,
    commitRow,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAssignments();

  const { preview, selection, modal, startSelect, startMove, startResize, closeModal } =
    useDragInteraction({
      assignments,
      totalSlots,
      viewStartSlot,
      scrollContainerRef: scrollRef,
      commitRow,
      onEdgeReached: pageBy,
    });

  const getDisplaySegments = (employeeId: string) => {
    if (preview?.employeeId === employeeId) return preview.segments;
    return getRowSegments(employeeId);
  };

  const rangeLabel = (() => {
    const first = visibleDays[0];
    const last  = visibleDays[visibleDays.length - 1];
    if (!first || !last) return "";
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()} – ${last.getDate()} ${TR_MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()} ${TR_MONTH_NAMES[first.getMonth()]} – ${last.getDate()} ${TR_MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
  })();

  return (
    <div>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={toolbarStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{ ...navBtnStyle, opacity: canGoBack ? 1 : 0.3 }}
            disabled={!canGoBack}
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            title="Önceki hafta"
          >‹</button>
          <span style={navLabelStyle}>{rangeLabel}</span>
          <button
            style={{ ...navBtnStyle, opacity: canGoForward ? 1 : 0.3 }}
            disabled={!canGoForward}
            onClick={() => setWeekOffset((w) => Math.min(maxWeekOffset, w + 1))}
            title="Sonraki hafta"
          >›</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={secondaryBtnStyle} onClick={() => setShowExport(true)}>
            ⬇ Dışa Aktar
          </button>
          <button style={primaryBtnStyle} onClick={() => setShowToolbarCreate(true)}>
            + Plan Ekle
          </button>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          overflow: "auto",
          maxHeight: "75vh",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          position: "relative",
        }}
      >
        {/* Inner div fills at least the scroll container so no empty gap on wide screens */}
        <div style={{ minWidth: "100%", width: LEFT_W + visibleSlots * SLOT_W, position: "relative" }}>
          <GridHeader
            days={visibleDays}
            onHeaderClick={() => setStatTarget("all")}
          />

          {EMPLOYEES.map((emp, index) => {
            const rowSelection = selection?.employeeId === emp.id ? selection : null;
            return (
              <EmployeeRow
                key={emp.id}
                employeeId={emp.id}
                name={emp.name}
                title={emp.title}
                striped={index % 2 !== 0}
                viewStartSlot={viewStartSlot}
                visibleSlots={visibleSlots}
                days={visibleDays}
                segments={getDisplaySegments(emp.id)}
                selection={rowSelection}
                onTrackPointerDown={(e) => startSelect(e, emp.id)}
                onSegmentPointerDown={(e, seg) => startMove(e, seg)}
                onResizeLeft={(e, seg) => startResize(e, seg, "l")}
                onResizeRight={(e, seg) => startResize(e, seg, "r")}
                onDelete={deleteAssignment}
                onSegmentDoubleClick={setEditSegment}
                onEmployeeClick={(id) => setStatTarget(id)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}

      {modal && (
        <AssignModal
          mode="create"
          ctx={modal}
          allDays={allWorkingDays}
          onClose={closeModal}
          onSave={(data) => {
            const ok = createAssignment(data);
            if (ok) closeModal();
            return ok;
          }}
        />
      )}

      {showToolbarCreate && (
        <AssignModal
          mode="create-toolbar"
          allDays={allWorkingDays}
          onClose={() => setShowToolbarCreate(false)}
          onSave={(data) => {
            const ok = createAssignment(data);
            if (ok) setShowToolbarCreate(false);
            return ok;
          }}
        />
      )}

      {editSegment && (
        <AssignModal
          mode="edit"
          existing={editSegment}
          allDays={allWorkingDays}
          onClose={() => setEditSegment(null)}
          onDelete={() => { deleteAssignment(editSegment.id); setEditSegment(null); }}
          onSave={(data) => {
            const ok = updateAssignment(editSegment.id, data);
            if (ok) setEditSegment(null);
            return ok;
          }}
        />
      )}

      {showExport && (
        <ExportModal
          assignments={assignments}
          allDays={allWorkingDays}
          onClose={() => setShowExport(false)}
        />
      )}

      {statTarget !== null && (
        <StatModal
          target={statTarget}
          assignments={assignments}
          allDays={allWorkingDays}
          onClose={() => setStatTarget(null)}
        />
      )}
    </div>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const toolbarStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 10,
  gap: 12,
  flexWrap: "wrap",
};

const navBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  border: "1.5px solid #E2E8F0",
  borderRadius: 9,
  background: "#fff",
  fontSize: 20,
  lineHeight: "1",
  cursor: "pointer",
  color: "#0F172A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};

const navLabelStyle: React.CSSProperties = {
  fontSize: 13.5,
  fontWeight: 600,
  color: "#0F172A",
  minWidth: 240,
  textAlign: "center",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 9,
  background: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  color: "#475569",
};

const primaryBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: 9,
  background: "#4F46E5",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  color: "#fff",
};
