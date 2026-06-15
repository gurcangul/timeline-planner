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

const isPinned = (typeId: string): boolean => ACTIVITY_TYPES[typeId]?.pinned ?? false;

/**
 * Pinned activities (izin / sağlık) are hard anchors: nothing may overlap them,
 * and a pinned activity may not overlap anything. Non-pinned activities may
 * freely stack on each other. `rowSegs` must exclude the candidate itself.
 */
function wouldConflict(rowSegs: Assignment[], candidate: Assignment): boolean {
  if (isPinned(candidate.typeId)) {
    return rowSegs.some((s) => slotsOverlap(s, candidate));
  }
  return rowSegs.some((s) => isPinned(s.typeId) && slotsOverlap(s, candidate));
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
      const candidate: Assignment = { id: nextId(), ...params };
      const rowSegs = assignments.filter((s) => s.employeeId === params.employeeId);
      if (wouldConflict(rowSegs, candidate)) return false;

      setAssignments((prev) => [...prev, candidate]);
      return true;
    },
    [assignments]
  );

  const updateAssignment = useCallback(
    (id: string, params: Omit<CreateParams, "employeeId">): boolean => {
      const existing = assignments.find((s) => s.id === id);
      if (!existing) return false;

      const candidate: Assignment = { ...existing, ...params };
      const rowSegs = assignments.filter(
        (s) => s.employeeId === existing.employeeId && s.id !== id
      );
      if (wouldConflict(rowSegs, candidate)) return false;

      setAssignments((prev) => prev.map((s) => (s.id === id ? candidate : s)));
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
