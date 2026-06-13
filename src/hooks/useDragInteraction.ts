import { useEffect, useRef, useState, useCallback } from "react";
import { resolveRow, resolveResizeRow } from "@/engine/pushEngine";
import { ACTIVITY_TYPES, SLOT_W, LEFT_W } from "@/constants";
import type {
  Assignment,
  ActiveDrag,
  RowPreview,
  SelectionRange,
  ModalContext,
} from "@/types";

interface Params {
  assignments: Assignment[];
  totalSlots: number;
  viewStartSlot: number;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  commitRow: (employeeId: string, segments: Assignment[]) => void;
}

export function useDragInteraction({
  assignments,
  totalSlots,
  viewStartSlot,
  scrollContainerRef,
  commitRow,
}: Params) {
  const dragRef = useRef<ActiveDrag | null>(null);
  const lastValidRef = useRef<RowPreview | null>(null);
  const selectionRef = useRef<SelectionRange | null>(null);

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

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const slotF = clientXToAbsoluteSlot(e.clientX);

      if (drag.kind === "select") {
        setSelection((prev) =>
          prev
            ? {
                ...prev,
                b: Math.max(viewStartSlot, Math.min(totalSlots, Math.round(slotF))),
              }
            : null
        );
        return;
      }

      const rowSegs = assignments.filter((s) => s.employeeId === drag.employeeId);
      const seg = rowSegs.find((s) => s.id === drag.id);
      if (!seg) return;

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

    const onPointerUp = (_e: PointerEvent) => {
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
            // Single click: snap to full day
            startSlot = Math.floor(rawA / 2) * 2;
            endSlot = startSlot + 2;
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
      setPreview(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [assignments, totalSlots, viewStartSlot, clientXToAbsoluteSlot, commitRow]);

  const startSelect = useCallback(
    (e: React.PointerEvent, employeeId: string) => {
      if (e.button !== 0) return;
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
