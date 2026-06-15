import { describe, it, expect } from "vitest";
import { slotsOverlap, resolveRow, resolveResizeRow, computeLanes } from "./pushEngine";
import type { Assignment } from "@/types";

// Test yardımcısı: kısa atama üretici
let id = 0;
const seg = (
  startSlot: number,
  endSlot: number,
  typeId = "takip",
  employeeId = "e1"
): Assignment => ({ id: `s${++id}`, employeeId, typeId, startSlot, endSlot, label: "" });

const TOTAL = 1000;

describe("slotsOverlap", () => {
  it("çakışan aralıkları true döner", () => {
    expect(slotsOverlap(seg(0, 4), seg(2, 6))).toBe(true);
  });
  it("bitişik (uç uca) aralıklar çakışmaz", () => {
    expect(slotsOverlap(seg(0, 4), seg(4, 8))).toBe(false);
  });
  it("ayrık aralıklar çakışmaz", () => {
    expect(slotsOverlap(seg(0, 4), seg(10, 12))).toBe(false);
  });
});

describe("resolveRow (taşıma + cascade)", () => {
  it("aktif plan, komşu planı sağa iter", () => {
    const a = seg(0, 4);
    const b = seg(4, 8);
    const res = resolveRow([a, b], a.id, { startSlot: 2, endSlot: 6 }, TOTAL);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const A = res.segments.find((s) => s.id === a.id)!;
    const B = res.segments.find((s) => s.id === b.id)!;
    expect([A.startSlot, A.endSlot]).toEqual([2, 6]);
    // B, A'nın bittiği yere (6) kayar, uzunluğunu (4) korur
    expect([B.startSlot, B.endSlot]).toEqual([6, 10]);
  });

  it("sabit (pinned) plana çakışma engellenir", () => {
    const a = seg(0, 4, "takip");
    const pinned = seg(4, 8, "izin");
    const res = resolveRow([a, pinned], a.id, { startSlot: 4, endSlot: 8 }, TOTAL);
    expect(res.ok).toBe(false);
  });

  it("önceden üst üste binen (stacked) plan cascade'e dahil olmaz", () => {
    const a = seg(0, 4);
    const stacked = seg(0, 4); // a ile aynı yerde başlıyor → farklı lane
    const res = resolveRow([a, stacked], a.id, { startSlot: 2, endSlot: 6 }, TOTAL);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const S = res.segments.find((s) => s.id === stacked.id)!;
    expect([S.startSlot, S.endSlot]).toEqual([0, 4]); // yerinde kalır
  });

  it("sınır dışına taşıma reddedilir", () => {
    const a = seg(0, 4);
    expect(resolveRow([a], a.id, { startSlot: -2, endSlot: 2 }, TOTAL).ok).toBe(false);
    expect(resolveRow([a], a.id, { startSlot: 998, endSlot: 1002 }, TOTAL).ok).toBe(false);
  });
});

describe("resolveResizeRow (boyutlandırma, cascade YOK)", () => {
  it("aktif plan büyürken komşu plan kaymaz", () => {
    const a = seg(0, 4);
    const b = seg(6, 10);
    const res = resolveResizeRow([a, b], a.id, { startSlot: 0, endSlot: 8 }, TOTAL);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const B = res.segments.find((s) => s.id === b.id)!;
    expect([B.startSlot, B.endSlot]).toEqual([6, 10]); // hiç oynamadı
  });

  it("sabit plana çakışan boyutlandırma reddedilir", () => {
    const a = seg(0, 4, "takip");
    const pinned = seg(6, 10, "saglik");
    const res = resolveResizeRow([a, pinned], a.id, { startSlot: 0, endSlot: 8 }, TOTAL);
    expect(res.ok).toBe(false);
  });
});

describe("computeLanes (görsel şerit yerleşimi)", () => {
  it("çakışmayan planlar aynı şeride (0) düşer", () => {
    const a = seg(0, 4);
    const b = seg(4, 8);
    const lanes = computeLanes([a, b]);
    expect(lanes.get(a.id)).toBe(0);
    expect(lanes.get(b.id)).toBe(0);
  });

  it("çakışan planlar farklı şeritlere ayrılır", () => {
    const a = seg(0, 4);
    const b = seg(2, 6);
    const lanes = computeLanes([a, b]);
    expect(lanes.get(a.id)).toBe(0);
    expect(lanes.get(b.id)).toBe(1);
  });
});
