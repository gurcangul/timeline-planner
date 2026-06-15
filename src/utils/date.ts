import { TR_DAY_NAMES, TR_MONTH_NAMES, SLOTS_PER_DAY } from "@/constants";

export type Half = "am" | "pm";

/** Monday of the current week at midnight — used as slot-0 epoch. */
export function getEpochMonday(): Date {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Build N weeks of ALL calendar days (Mon–Sun) starting from epochMonday + offsetWeeks. */
export function buildWorkingDays(totalWeeks: number, offsetWeeks = 0): Date[] {
  const start = getEpochMonday();
  start.setDate(start.getDate() + offsetWeeks * 7);

  const days: Date[] = [];
  const cursor = new Date(start);

  while (days.length < totalWeeks * 7) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

// ─── slot ↔ day primitives ─────────────────────────────────────────────────

/** Index into the working-days array that a slot belongs to. */
export function slotToDayIndex(slot: number): number {
  return Math.floor(slot / SLOTS_PER_DAY);
}

export function slotHalf(slot: number): Half {
  return slot % SLOTS_PER_DAY === 0 ? "am" : "pm";
}

export function slotToDate(slot: number, allDays: Date[]): Date | undefined {
  return allDays[slotToDayIndex(slot)];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Convert a date + half-day choice to an absolute slot index. Returns -1 if not found. */
export function dateAndHalfToSlot(date: Date, half: Half, allDays: Date[]): number {
  const idx = allDays.findIndex((d) => isSameDay(d, date));
  if (idx < 0) return -1;
  return idx * SLOTS_PER_DAY + (half === "pm" ? 1 : 0);
}

/**
 * Resolve two <input type="date"> strings into a half-open absolute slot range
 * [start, end). The start half is AM, the end half is PM (full inclusive days).
 *
 * @param clampStartToZero when a start date precedes the epoch (slot < 0),
 *        clamp it to slot 0 instead of failing — used by the statistics view.
 * Returns null when the range is empty or cannot be resolved.
 */
export function slotRangeFromInputs(
  startStr: string,
  endStr: string,
  allDays: Date[],
  clampStartToZero = false
): [number, number] | null {
  if (!startStr || !endStr) return null;
  const rawStart = dateAndHalfToSlot(fromInputDateString(startStr), "am", allDays);
  const rawEnd = dateAndHalfToSlot(fromInputDateString(endStr), "pm", allDays);

  const start = rawStart < 0 ? (clampStartToZero ? 0 : -1) : rawStart;
  if (start < 0 || rawEnd < 0 || rawEnd + 1 <= start) return null;
  return [start, rawEnd + 1];
}

// ─── formatting ─────────────────────────────────────────────────────────────

/** YYYY-MM-DD string for <input type="date"> */
export function toInputDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD without timezone shift. */
export function fromInputDateString(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** "08.06.2026 Sabah" style label for a slot — used in exports. */
export function formatSlotDateTime(slot: number, allDays: Date[]): string {
  const day = slotToDate(slot, allDays);
  if (!day) return "—";
  const half = slotHalf(slot) === "am" ? "Sabah" : "Öğleden Sonra";
  const dd = String(day.getDate()).padStart(2, "0");
  const mm = String(day.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${day.getFullYear()} ${half}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── date-range presets (shared by Stat & Export modals) ─────────────────────

export interface DateRange {
  start: Date;
  end: Date;
}

/** Mon–Sun range containing `ref`. */
export function weekRange(ref = new Date()): DateRange {
  const offset = (ref.getDay() + 6) % 7; // Mon = 0
  const start = new Date(ref);
  start.setDate(ref.getDate() - offset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function monthRange(ref = new Date()): DateRange {
  return {
    start: new Date(ref.getFullYear(), ref.getMonth(), 1),
    end: new Date(ref.getFullYear(), ref.getMonth() + 1, 0),
  };
}

export function quarterRange(ref = new Date()): DateRange {
  const q = Math.floor(ref.getMonth() / 3) * 3;
  return {
    start: new Date(ref.getFullYear(), q, 1),
    end: new Date(ref.getFullYear(), q + 3, 0),
  };
}

export function yearRange(ref = new Date()): DateRange {
  return {
    start: new Date(ref.getFullYear(), 0, 1),
    end: new Date(ref.getFullYear(), 11, 31),
  };
}

export { TR_DAY_NAMES, TR_MONTH_NAMES };
