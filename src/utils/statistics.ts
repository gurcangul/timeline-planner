import { ACTIVITY_TYPE_LIST } from "@/constants";
import type { Assignment } from "@/types";

export interface StatSlice {
  label: string;
  value: number;
  color: string;
}

export const UNPLANNED_COLOR = "#E2E8F0";
export const UNPLANNED_LABEL = "Plansız";

/** Slot count per activity type for the given employees within [startSlot, endSlot). */
export function computeStats(
  assignments: Assignment[],
  employeeIds: string[],
  startSlot: number,
  endSlot: number
): Map<string, number> {
  const ids = new Set(employeeIds);
  const stats = new Map<string, number>();
  for (const a of assignments) {
    if (!ids.has(a.employeeId)) continue;
    const s = Math.max(a.startSlot, startSlot);
    const e = Math.min(a.endSlot, endSlot);
    if (e <= s) continue;
    stats.set(a.typeId, (stats.get(a.typeId) ?? 0) + (e - s));
  }
  return stats;
}

/** Total slots in a range (never negative). */
export function rangeSlotCount(startSlot: number, endSlot: number): number {
  return Math.max(0, endSlot - startSlot);
}

/**
 * Convert a stats map into pie-chart slices, appending an "Plansız" slice for
 * the unassigned remainder of `totalSlots`.
 */
export function statsToSlices(stats: Map<string, number>, totalSlots: number): StatSlice[] {
  const assigned = Array.from(stats.values()).reduce((a, b) => a + b, 0);
  const free = Math.max(0, totalSlots - assigned);

  const slices: StatSlice[] = ACTIVITY_TYPE_LIST
    .filter((t) => (stats.get(t.id) ?? 0) > 0)
    .map((t) => ({ label: t.label, value: stats.get(t.id) ?? 0, color: t.color }));

  if (free > 0) slices.push({ label: UNPLANNED_LABEL, value: free, color: UNPLANNED_COLOR });
  return slices;
}
