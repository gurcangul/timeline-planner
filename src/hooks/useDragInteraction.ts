import { useEffect, useRef, useState, useCallback } from "react";
import { resolveRow, resolveResizeRow } from "@/engine/pushEngine";
import { ACTIVITY_TYPES, SLOT_W, LEFT_W, SLOTS_PER_DAY } from "@/constants";
import type {
  Assignment,
  ActiveDrag,
  RowPreview,
  SelectionRange,
  ModalContext,
} from "@/types";

/** Pointer bu kadar piksel kenara yaklaşınca otomatik hafta ilerletilir. */
const EDGE_ZONE = 56;
/** Otomatik ilerleme adımları arası süre (ms). */
const EDGE_PAGE_INTERVAL = 380;

type EdgeDir = -1 | 0 | 1;

interface Params {
  assignments: Assignment[];
  totalSlots: number;
  viewStartSlot: number;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  commitRow: (employeeId: string, segments: Assignment[]) => void;
  /**
   * Sürükleme sırasında pointer görünür alanın kenarına dayandığında çağrılır.
   * PlannerGrid bunu haftayı ileri/geri kaydırmaya bağlar. dir: +1 ileri, -1 geri.
   */
  onEdgeReached?: (dir: -1 | 1) => void;
}

export function useDragInteraction({
  assignments,
  totalSlots,
  viewStartSlot,
  scrollContainerRef,
  commitRow,
  onEdgeReached,
}: Params) {
  const dragRef = useRef<ActiveDrag | null>(null);
  const lastValidRef = useRef<RowPreview | null>(null);
  const selectionRef = useRef<SelectionRange | null>(null);

  // Edge-auto-paging state
  const lastClientXRef = useRef<number | null>(null);
  const edgeDirRef = useRef<EdgeDir>(0);
  const onEdgeReachedRef = useRef(onEdgeReached);
  useEffect(() => {
    onEdgeReachedRef.current = onEdgeReached;
  }, [onEdgeReached]);

  const [preview, setPreview] = useState<RowPreview | null>(null);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [modal, setModal] = useState<ModalContext | null>(null);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  /**
   * Converts a clientX coordinate to an ABSOLUTE slot index.
   * LEFT_W is the sticky employee panel — the track starts after it.
   */
  const clientXToAbsoluteSlot = useCallback(
    (clientX: number): number => {
      const el = scrollContainerRef.current;
      if (!el) return viewStartSlot;
      const rect = el.getBoundingClientRect();
      const pixelsIntoTrack = clientX - rect.left - LEFT_W + el.scrollLeft;
      return viewStartSlot + pixelsIntoTrack / SLOT_W;
    },
    [scrollContainerRef, viewStartSlot]
  );

  // ── pointer move / up listeners (re-bound when viewStartSlot changes) ──────
  useEffect(() => {
    /** Recompute the dragged/resized segment preview from a clientX. */
    const applyDrag = (clientX: number) => {
      const drag = dragRef.current;
      if (!drag || drag.kind === "select") return;

      const rowSegs = assignments.filter((s) => s.employeeId === drag.employeeId);
      const seg = rowSegs.find((s) => s.id === drag.id);
      if (!seg) return;

      const slotF = clientXToAbsoluteSlot(clientX);
      const len = seg.endSlot - seg.startSlot;
      const delta = Math.round(slotF - drag.startSlotF);

      let desired: Pick<Assignment, "startSlot" | "endSlot">;
      if (drag.kind === "move") {
        const ns = Math.max(0, Math.min(totalSlots - len, drag.origStart + delta));
        desired = { startSlot: ns, endSlot: ns + len };
      } else if (drag.kind === "resize-r") {
        const ne = Math.max(drag.origStart + 1, Math.min(totalSlots, drag.origEnd + delta));
        desired = { startSlot: drag.origStart, endSlot: ne };
      } else {
        const ns = Math.max(0, Math.min(drag.origEnd - 1, drag.origStart + delta));
        desired = { startSlot: ns, endSlot: drag.origEnd };
      }

      const isResize = drag.kind === "resize-l" || drag.kind === "resize-r";
      const result = isResize
        ? resolveResizeRow(rowSegs, drag.id, desired, totalSlots)
        : resolveRow(rowSegs, drag.id, desired, totalSlots);
      if (result.ok) {
        lastValidRef.current = { employeeId: drag.employeeId, segments: result.segments };
        setPreview(lastValidRef.current);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.kind === "select") {
        const slotF = clientXToAbsoluteSlot(e.clientX);
        setSelection((prev) =>
          prev
            ? { ...prev, b: Math.max(viewStartSlot, Math.min(totalSlots, Math.round(slotF))) }
            : null
        );
        return;
      }

      lastClientXRef.current = e.clientX;

      // Detect whether the pointer is in the left/right edge zone of the track.
      const el = scrollContainerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const leftBound = rect.left + LEFT_W + EDGE_ZONE;
        const rightBound = rect.right - EDGE_ZONE;
        edgeDirRef.current = e.clientX > rightBound ? 1 : e.clientX < leftBound ? -1 : 0;
      }

      applyDrag(e.clientX);
    };

    const onPointerUp = () => {
      const drag = dragRef.current;
      if (!drag) return;

      if (drag.kind === "select") {
        const sel = selectionRef.current;
        if (sel) {
          const rawA = Math.min(sel.a, sel.b);
          const rawB = Math.max(sel.a, sel.b);
          let startSlot: number;
          let endSlot: number;
          if (rawA === rawB) {
            startSlot = Math.floor(rawA / SLOTS_PER_DAY) * SLOTS_PER_DAY;
            endSlot = startSlot + SLOTS_PER_DAY;
          } else {
            startSlot = rawA;
            endSlot = rawB;
          }
          setModal({ employeeId: drag.employeeId, startSlot, endSlot });
        }
        setSelection(null);
      } else if (lastValidRef.current) {
        commitRow(lastValidRef.current.employeeId, lastValidRef.current.segments);
      }

      dragRef.current = null;
      lastValidRef.current = null;
      edgeDirRef.current = 0;
      lastClientXRef.current = null;
      setPreview(null);
    };

    // When the week shifts mid-drag (auto-paging), refresh the preview using the
    // last known pointer position against the NEW viewStartSlot mapping.
    if (
      dragRef.current &&
      dragRef.current.kind !== "select" &&
      lastClientXRef.current !== null
    ) {
      applyDrag(lastClientXRef.current);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [assignments, totalSlots, viewStartSlot, clientXToAbsoluteSlot, commitRow, scrollContainerRef]);

  // ── auto-paging timer (mounted once) ───────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      const drag = dragRef.current;
      if (!drag || drag.kind === "select") return;
      const dir = edgeDirRef.current;
      if (dir !== 0) onEdgeReachedRef.current?.(dir);
    }, EDGE_PAGE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const startSelect = useCallback(
    (e: React.PointerEvent, employeeId: string) => {
      if (e.button !== 0) return;
      edgeDirRef.current = 0;
      lastClientXRef.current = null;
      const slot = Math.floor(clientXToAbsoluteSlot(e.clientX));
      dragRef.current = { kind: "select", employeeId, anchor: slot };
      setSelection({ employeeId, a: slot, b: slot });
    },
    [clientXToAbsoluteSlot]
  );

  const startMove = useCallback(
    (e: React.PointerEvent, seg: Assignment) => {
      // Always stop propagation so track's startSelect doesn't fire
      e.stopPropagation();
      if (e.button !== 0 || ACTIVITY_TYPES[seg.typeId]?.pinned) return;
      edgeDirRef.current = 0;
      lastClientXRef.current = e.clientX;
      dragRef.current = {
        kind: "move",
        id: seg.id,
        employeeId: seg.employeeId,
        startSlotF: clientXToAbsoluteSlot(e.clientX),
        origStart: seg.startSlot,
        origEnd: seg.endSlot,
      };
    },
    [clientXToAbsoluteSlot]
  );

  const startResize = useCallback(
    (e: React.PointerEvent, seg: Assignment, side: "l" | "r") => {
      e.stopPropagation();
      if (e.button !== 0 || ACTIVITY_TYPES[seg.typeId]?.pinned) return;
      edgeDirRef.current = 0;
      lastClientXRef.current = e.clientX;
      dragRef.current = {
        kind: side === "r" ? "resize-r" : "resize-l",
        id: seg.id,
        employeeId: seg.employeeId,
        startSlotF: clientXToAbsoluteSlot(e.clientX),
        origStart: seg.startSlot,
        origEnd: seg.endSlot,
      };
    },
    [clientXToAbsoluteSlot]
  );

  const closeModal = useCallback(() => setModal(null), []);

  return {
    preview,
    selection,
    modal,
    startSelect,
    startMove,
    startResize,
    closeModal,
  };
}
