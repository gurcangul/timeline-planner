import { useRef, useMemo, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { EMPLOYEES, ACTIVITY_TYPES, LEFT_W, SLOT_W, DAY_W, DAYS_PER_WEEK, SLOTS_PER_WEEK, SLOTS_PER_DAY } from "@/constants";
import { buildWorkingDays, TR_MONTH_NAMES } from "@/utils/date";
import { useAssignments } from "@/hooks/useAssignments";
import { useDragInteraction } from "@/hooks/useDragInteraction";
import { GridHeader } from "./GridHeader";
import { EmployeeRow } from "./EmployeeRow";
import { AssignModal } from "@/components/AssignModal";
import { ExportModal } from "@/components/ExportModal";
import { StatModal } from "@/components/StatModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Assignment } from "@/types";
import styles from "./PlannerGrid.module.css";

const MAX_WEEKS = 104;
const TOTAL_DAYS = MAX_WEEKS * DAYS_PER_WEEK;
const MIN_VISIBLE_DAYS = DAYS_PER_WEEK; // at least one full week

export function PlannerGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Measure the ACTUAL scroll-container width (clientWidth excludes the vertical
  // scrollbar). Seed with 0 → first paint renders MIN days, corrected before the
  // browser paints by useLayoutEffect, so the grid never overflows horizontally.
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Fill the available width with as many whole DAYS as fit. The safety margin
  // keeps content strictly narrower than the container so `minWidth:100%` on the
  // inner wrapper governs the width and no horizontal scrollbar can appear.
  const SCROLLBAR_SAFETY = 4;
  const visibleDayCount = useMemo(() => {
    if (containerWidth <= 0) return MIN_VISIBLE_DAYS;
    const available = containerWidth - LEFT_W - SCROLLBAR_SAFETY;
    return Math.max(MIN_VISIBLE_DAYS, Math.floor(available / DAY_W));
  }, [containerWidth]);

  // Modal states
  const [editSegment, setEditSegment] = useState<Assignment | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Assignment | null>(null);
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

  // Navigation is re-slice based (not native horizontal scroll). Keep the
  // container pinned to the left so a stray scroll offset never leaves the
  // view stuck in empty space after paging.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [weekOffset, visibleDayCount]);

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
      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <button
            className={styles.navBtn}
            disabled={!canGoBack}
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            title="Önceki hafta"
          >‹</button>
          <span className={styles.navLabel}>{rangeLabel}</span>
          <button
            className={styles.navBtn}
            disabled={!canGoForward}
            onClick={() => setWeekOffset((w) => Math.min(maxWeekOffset, w + 1))}
            title="Sonraki hafta"
          >›</button>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={() => setShowExport(true)}>
            ⬇ Dışa Aktar
          </button>
          <button className={styles.primaryBtn} onClick={() => setShowToolbarCreate(true)}>
            + Plan Ekle
          </button>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div ref={scrollRef} className={styles.scroll}>
        <div className={styles.inner} style={{ width: LEFT_W + visibleSlots * SLOT_W }}>
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
                onDelete={setPendingDelete}
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
          onDelete={() => { setPendingDelete(editSegment); setEditSegment(null); }}
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

      {/* Delete confirmation */}
      {pendingDelete && (
        <ConfirmModal
          title="Planı sil"
          message={`"${pendingDelete.label || ACTIVITY_TYPES[pendingDelete.typeId]?.short || "Plan"}" silinecek. Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          onConfirm={() => {
            deleteAssignment(pendingDelete.id);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
