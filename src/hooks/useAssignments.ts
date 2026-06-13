import { useState, useCallback } from "react";
import { SEED_ASSIGNMENTS, nextId } from "@/data/seedData";
import { slotsOverlap } from "@/engine/pushEngine";
import { ACTIVITY_TYPES } from "@/constants";
import type { Assignment } from "@/types";

interface CreateParams {
  employeeId: string;
  startSlot: number;
  endSlot: number;
  typeId: string;
  label: string;
}

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(SEED_ASSIGNMENTS);

  const getRowSegments = useCallback(
    (employeeId: string): Assignment[] =>
      assignments.filter((s) => s.employeeId === employeeId),
    [assignments]
  );

  const commitRow = useCallback((employeeId: string, segments: Assignment[]) => {
    setAssignments((prev) => [
      ...prev.filter((s) => s.employeeId !== employeeId),
      ...segments,
    ]);
  }, []);

  const createAssignment = useCallback(
    (params: CreateParams): boolean => {
      const newSeg: Assignment = { id: nextId(), ...params };
      const rowSegs = assignments.filter((s) => s.employeeId === params.employeeId);

      // Pinned segments are hard anchors — nothing may overlap them
      const pinnedConflict = rowSegs.some(
        (s) => ACTIVITY_TYPES[s.typeId]?.pinned && slotsOverlap(s, newSeg)
      );
      if (pinnedConflict) return false;

      // A new pinned segment may not overlap anything
      if (ACTIVITY_TYPES[params.typeId]?.pinned) {
        if (rowSegs.some((s) => slotsOverlap(s, newSeg))) return false;
      }

      setAssignments((prev) => [...prev, newSeg]);
      return true;
    },
    [assignments]
  );

  const updateAssignment = useCallback(
    (id: string, params: Omit<CreateParams, "employeeId">): boolean => {
      const existing = assignments.find((s) => s.id === id);
      if (!existing) return false;

      const updated: Assignment = { ...existing, ...params };
      const rowSegs = assignments.filter(
        (s) => s.employeeId === existing.employeeId && s.id !== id
      );

      const pinnedConflict = rowSegs.some(
        (s) => ACTIVITY_TYPES[s.typeId]?.pinned && slotsOverlap(s, updated)
      );
      if (pinnedConflict) return false;

      if (ACTIVITY_TYPES[params.typeId]?.pinned) {
        if (rowSegs.some((s) => slotsOverlap(s, updated))) return false;
      }

      setAssignments((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return true;
    },
    [assignments]
  );

  const deleteAssignment = useCallback((id: string) => {
    setAssignments((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    assignments,
    getRowSegments,
    commitRow,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  };
}
