import { describe, it, expect } from "vitest";
import {
  computeStats,
  rangeSlotCount,
  statsToSlices,
  UNPLANNED_LABEL,
} from "./statistics";
import type { Assignment } from "@/types";

const a = (
  employeeId: string,
  typeId: string,
  startSlot: number,
  endSlot: number
): Assignment => ({ id: `${employeeId}-${startSlot}`, employeeId, typeId, startSlot, endSlot, label: "" });

const data: Assignment[] = [
  a("e1", "takip", 0, 4),
  a("e1", "sube", 4, 8),
  a("e2", "takip", 0, 6), // başka denetçi — sayılmamalı
];

describe("computeStats", () => {
  it("tür bazında slot toplar", () => {
    const s = computeStats(data, ["e1"], 0, 8);
    expect(s.get("takip")).toBe(4);
    expect(s.get("sube")).toBe(4);
  });

  it("aralık dışını kırpar", () => {
    const s = computeStats(data, ["e1"], 2, 6);
    expect(s.get("takip")).toBe(2); // 2..4
    expect(s.get("sube")).toBe(2); // 4..6
  });

  it("yalnızca verilen denetçileri sayar", () => {
    const s = computeStats(data, ["e1"], 0, 8);
    // e2'nin takip'i dahil edilmemeli → takip yalnızca e1'in 4 slotu
    expect(s.get("takip")).toBe(4);
  });
});

describe("rangeSlotCount", () => {
  it("aralık uzunluğunu verir", () => {
    expect(rangeSlotCount(2, 6)).toBe(4);
  });
  it("negatif sonucu 0'a sabitler", () => {
    expect(rangeSlotCount(6, 2)).toBe(0);
  });
});

describe("statsToSlices", () => {
  it("atanmamış kalanı 'Plansız' dilimi olarak ekler", () => {
    const stats = new Map([["takip", 4]]);
    const slices = statsToSlices(stats, 10);
    const plansiz = slices.find((s) => s.label === UNPLANNED_LABEL);
    expect(plansiz?.value).toBe(6);
  });

  it("tam dolu aralıkta 'Plansız' dilimi olmaz", () => {
    const stats = new Map([["takip", 10]]);
    const slices = statsToSlices(stats, 10);
    expect(slices.some((s) => s.label === UNPLANNED_LABEL)).toBe(false);
  });
});
