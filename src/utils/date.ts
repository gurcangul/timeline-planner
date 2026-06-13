import { TR_DAY_NAMES, TR_MONTH_NAMES } from "@/constants";

/** Monday of the current week at midnight — used as slot-0 epoch. */
export function getEpochMonday(): Date {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/** Build N weeks of working days starting from (epochMonday + offsetWeeks). */
export function buildWorkingDays(totalWeeks: number, offsetWeeks = 0): Date[] {
  const start = getEpochMonday();
  start.setDate(start.getDate() + offsetWeeks * 7);

  const days: Date[] = [];
  const cursor = new Date(start);

  while (days.length < totalWeeks * 5) {
    const wd = cursor.getDay();
    if (wd !== 0 && wd !== 6) days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function slotToDate(slot: number, allDays: Date[]): Date | undefined {
  return allDays[Math.floor(slot / 2)];
}

export function slotHalf(slot: number): "am" | "pm" {
  return slot % 2 === 0 ? "am" : "pm";
}

/** Convert a date + half-day choice to an absolute slot index. Returns -1 if not found. */
export function dateAndHalfToSlot(
  date: Date,
  half: "am" | "pm",
  allDays: Date[]
): number {
  const idx = allDays.findIndex(
    (d) =>
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
  );
  if (idx < 0) return -1;
  return idx * 2 + (half === "pm" ? 1 : 0);
}

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
  return new Date(y!, (m! - 1), d!);
}

export function formatSlotLabel(slot: number, allDays: Date[]): string {
  const day = allDays[Math.floor(slot / 2)];
  if (!day) return "—";
  const half = slot % 2 === 0 ? "ÖÖ" : "ÖS";
  return `${day.getDate()} ${TR_MONTH_NAMES[day.getMonth()]} ${half}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export { TR_DAY_NAMES, TR_MONTH_NAMES };
