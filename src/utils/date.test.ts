import { describe, it, expect } from "vitest";
import {
  slotToDayIndex,
  slotHalf,
  buildWorkingDays,
  dateAndHalfToSlot,
  slotToDate,
  slotRangeFromInputs,
  toInputDateString,
  monthRange,
  quarterRange,
  yearRange,
  weekRange,
  getInitials,
  isWeekend,
} from "./date";

describe("slot ↔ gün ilkel dönüşümleri", () => {
  it("slotToDayIndex: iki slot bir gün", () => {
    expect(slotToDayIndex(0)).toBe(0);
    expect(slotToDayIndex(1)).toBe(0);
    expect(slotToDayIndex(2)).toBe(1);
    expect(slotToDayIndex(3)).toBe(1);
  });
  it("slotHalf: çift=am, tek=pm", () => {
    expect(slotHalf(0)).toBe("am");
    expect(slotHalf(1)).toBe("pm");
    expect(slotHalf(14)).toBe("am");
  });
});

describe("buildWorkingDays", () => {
  it("hafta sonları dahil 7*hafta gün üretir", () => {
    expect(buildWorkingDays(2)).toHaveLength(14);
  });
  it("ilk gün Pazartesi'dir", () => {
    expect(buildWorkingDays(1)[0]!.getDay()).toBe(1);
  });
});

describe("dateAndHalfToSlot ↔ slotToDate", () => {
  const days = buildWorkingDays(2);

  it("tarih+yarım → slot", () => {
    expect(dateAndHalfToSlot(days[0]!, "am", days)).toBe(0);
    expect(dateAndHalfToSlot(days[0]!, "pm", days)).toBe(1);
    expect(dateAndHalfToSlot(days[1]!, "am", days)).toBe(2);
  });
  it("bilinmeyen tarih -1 döner", () => {
    expect(dateAndHalfToSlot(new Date(1990, 0, 1), "am", days)).toBe(-1);
  });
  it("slotToDate, gün dizisinden doğru günü verir", () => {
    expect(slotToDate(2, days)).toBe(days[1]);
    expect(slotToDate(3, days)).toBe(days[1]);
  });
});

describe("slotRangeFromInputs", () => {
  const days = buildWorkingDays(2);
  const d = (i: number) => toInputDateString(days[i]!);

  it("geçerli aralığı yarı-açık slot aralığına çevirir", () => {
    // start günü 0 (am=0), end günü 2 (pm=5) → [0, 6)
    expect(slotRangeFromInputs(d(0), d(2), days)).toEqual([0, 6]);
  });
  it("boş girdi null döner", () => {
    expect(slotRangeFromInputs("", d(2), days)).toBeNull();
  });
  it("bitiş başlangıçtan önceyse null döner", () => {
    expect(slotRangeFromInputs(d(2), d(0), days)).toBeNull();
  });
  it("clamp=true ile epoch öncesi başlangıç slot 0'a sabitlenir", () => {
    const before = toInputDateString(new Date(1990, 0, 1));
    expect(slotRangeFromInputs(before, d(1), days, true)).toEqual([0, 4]);
  });
});

describe("tarih aralığı preset'leri", () => {
  const ref = new Date(2026, 5, 15); // 15 Haz 2026, Pazartesi

  it("monthRange: ayın ilk ve son günü", () => {
    const r = monthRange(ref);
    expect(toInputDateString(r.start)).toBe("2026-06-01");
    expect(toInputDateString(r.end)).toBe("2026-06-30");
  });
  it("quarterRange: çeyreğin ilk ve son günü (Q2)", () => {
    const r = quarterRange(ref);
    expect(toInputDateString(r.start)).toBe("2026-04-01");
    expect(toInputDateString(r.end)).toBe("2026-06-30");
  });
  it("yearRange: yılın ilk ve son günü", () => {
    const r = yearRange(ref);
    expect(toInputDateString(r.start)).toBe("2026-01-01");
    expect(toInputDateString(r.end)).toBe("2026-12-31");
  });
  it("weekRange: Pazartesi–Pazar", () => {
    const r = weekRange(new Date(2026, 5, 17)); // Çarşamba
    expect(r.start.getDay()).toBe(1); // Pzt
    expect(r.end.getDay()).toBe(0); // Paz
    expect(toInputDateString(r.start)).toBe("2026-06-15");
    expect(toInputDateString(r.end)).toBe("2026-06-21");
  });
});

describe("yardımcılar", () => {
  it("getInitials baş harfleri büyük üretir", () => {
    expect(getInitials("Ahmet Yılmaz")).toBe("AY");
    expect(getInitials("fatma güneş")).toBe("FG");
  });
  it("isWeekend yalnızca Cmt/Paz için true", () => {
    expect(isWeekend(new Date(2026, 5, 20))).toBe(true); // Cmt
    expect(isWeekend(new Date(2026, 5, 21))).toBe(true); // Paz
    expect(isWeekend(new Date(2026, 5, 22))).toBe(false); // Pzt
  });
});
