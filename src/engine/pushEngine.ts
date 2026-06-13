import { ACTIVITY_TYPES } from "@/constants";
import type { Assignment, ResolveOutput } from "@/types";

export const slotsOverlap = (a: Assignment, b: Assignment): boolean =>
  a.startSlot < b.endSlot && b.startSlot < a.endSlot;

const isPinned = (seg: Assignment): boolean =>
  ACTIVITY_TYPES[seg.typeId]?.pinned ?? false;

function findFreeStart(
  placed: Assignment[],
  from: number,
  len: number,
  total: number
): number | null {
  let start = Math.max(0, from);
  let guard = 0;
  while (start + len <= total && guard < 5000) {
    const probe = { startSlot: start, endSlot: start + len } as Assignment;
    const collision = placed.find((p) => slotsOverlap(probe, p));
    if (!collision) return start;
    start = collision.endSlot;
    guard++;
  }
  return null;
}

/**
 * Pure constraint resolver used during drag / resize.
 *
 * Key rule: segments that were ALREADY overlapping with the active segment
 * before the move are in a different visual lane (stacked by design).
 * They must NOT be cascaded — they stay exactly where they are.
 * Only sequential (non-overlapping) non-pinned segments cascade rightward.
 */
export function resolveRow(
  rowSegments: Assignment[],
  activeId: string,
  desired: Pick<Assignment, "startSlot" | "endSlot">,
  totalSlots: number
): ResolveOutput {
  const active = rowSegments.find((s) => s.id === activeId);
  if (!active) return { ok: false };

  const next: Assignment = { ...active, ...desired };

  if (
    next.startSlot < 0 ||
    next.endSlot > totalSlots ||
    next.startSlot >= next.endSlot
  ) {
    return { ok: false };
  }

  const pinned = rowSegments.filter((s) => s.id !== activeId && isPinned(s));
  for (const p of pinned) {
    if (slotsOverlap(next, p)) return { ok: false };
  }

  // These were already overlapping with active BEFORE the move → different lane.
  // Exclude from cascade; keep them in place.
  const preOverlapIds = new Set(
    rowSegments
      .filter((s) => s.id !== activeId && !isPinned(s) && slotsOverlap(s, active))
      .map((s) => s.id)
  );

  const placed: Assignment[] = [...pinned, next];

  const movable = rowSegments
    .filter((s) => s.id !== activeId && !isPinned(s) && !preOverlapIds.has(s.id))
    .sort((a, b) => a.startSlot - b.startSlot);

  const cascaded: Assignment[] = [];
  for (const seg of movable) {
    const len = seg.endSlot - seg.startSlot;
    const freeStart = findFreeStart(placed, seg.startSlot, len, totalSlots);
    if (freeStart === null) return { ok: false };
    const resolved = { ...seg, startSlot: freeStart, endSlot: freeStart + len };
    placed.push(resolved);
    cascaded.push(resolved);
  }

  const stacked = rowSegments.filter(
    (s) => s.id !== activeId && !isPinned(s) && preOverlapIds.has(s.id)
  );

  return { ok: true, segments: [next, ...cascaded, ...pinned, ...stacked] };
}

/**
 * Assigns each segment to the minimum vertical lane where no overlap exists.
 * Pure rendering helper — not used by the engine.
 */
export function computeLanes(segments: Assignment[]): Map<string, number> {
  const sorted = [...segments].sort((a, b) => a.startSlot - b.startSlot);
  const laneMap = new Map<string, number>();

  for (const seg of sorted) {
    let lane = 0;
    while (true) {
      const conflict = sorted.find(
        (s) =>
          s.id !== seg.id &&
          laneMap.get(s.id) === lane &&
          slotsOverlap(s, seg)
      );
      if (!conflict) break;
      lane++;
    }
    laneMap.set(seg.id, lane);
  }

  return laneMap;
}
