import type { Assignment } from "@/types";

/*
 * Slot mapping — 7 days/week = 14 slots/week:
 *   Week 1 : slots  0 – 13   (Mon–Sun)
 *   Week 2 : slots 14 – 27
 *   Week 3 : slots 28 – 41
 *   Week 4 : slots 42 – 55
 *
 * R(s) converts old 5-day-week slots to 7-day-week slots.
 * Within a week the weekday order is unchanged (Mon=0..Fri=8-9).
 * Weekend slots (10–13 per week) are simply left unoccupied in seed data.
 */
const R = (s: number): number => Math.floor(s / 10) * 14 + (s % 10);

let _counter = 100;
export const nextId = (): string => `a${++_counter}`;

export const SEED_ASSIGNMENTS: Assignment[] = [
  // ─── e1 · Ahmet Yılmaz (Kıdemli Denetçi) ──────────────────────────────────
  { id: nextId(), employeeId: "e1", typeId: "takip",  startSlot: R( 0), endSlot: R( 7), label: "Operasyon Merkezi Denetimi" },
  { id: nextId(), employeeId: "e1", typeId: "sube",   startSlot: R( 8), endSlot: R(12), label: "Levent Şubesi" },
  { id: nextId(), employeeId: "e1", typeId: "izin",   startSlot: R(14), endSlot: R(16), label: "Yıllık izin" },
  { id: nextId(), employeeId: "e1", typeId: "takip",  startSlot: R(20), endSlot: R(26), label: "Kredi Riski İzleme" },
  { id: nextId(), employeeId: "e1", typeId: "sube",   startSlot: R(30), endSlot: R(34), label: "Bakırköy Şubesi" },

  // ─── e2 · Elif Demir (Denetçi) ────────────────────────────────────────────
  { id: nextId(), employeeId: "e2", typeId: "sube",   startSlot: R( 0), endSlot: R( 4), label: "Kadıköy Şubesi" },
  { id: nextId(), employeeId: "e2", typeId: "izin",   startSlot: R( 4), endSlot: R( 8), label: "Yıllık izin" },
  { id: nextId(), employeeId: "e2", typeId: "takip",  startSlot: R(12), endSlot: R(18), label: "Mevduat Süreçleri" },
  { id: nextId(), employeeId: "e2", typeId: "sube",   startSlot: R(22), endSlot: R(26), label: "Ümraniye Şubesi" },
  { id: nextId(), employeeId: "e2", typeId: "takip",  startSlot: R(32), endSlot: R(38), label: "Dönem Sonu Raporu" },

  // ─── e3 · Mehmet Kaya (Denetçi) ───────────────────────────────────────────
  { id: nextId(), employeeId: "e3", typeId: "takip",  startSlot: R( 2), endSlot: R( 8), label: "Kredi Süreçleri" },
  { id: nextId(), employeeId: "e3", typeId: "saglik", startSlot: R(10), endSlot: R(14), label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e3", typeId: "sube",   startSlot: R(16), endSlot: R(20), label: "Kızılay Şubesi" },
  { id: nextId(), employeeId: "e3", typeId: "takip",  startSlot: R(24), endSlot: R(30), label: "AML Kontrol" },
  { id: nextId(), employeeId: "e3", typeId: "sube",   startSlot: R(34), endSlot: R(38), label: "Kocatepe Şubesi" },

  // ─── e4 · Zeynep Şahin (Uzman Denetçi) ────────────────────────────────────
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot: R( 0), endSlot: R( 4), label: "Hazine Denetimi" },
  { id: nextId(), employeeId: "e4", typeId: "izin",   startSlot: R( 6), endSlot: R( 7), label: "½ gün izin" },
  { id: nextId(), employeeId: "e4", typeId: "sube",   startSlot: R( 7), endSlot: R( 8), label: "Bornova Şubesi" },
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot: R(10), endSlot: R(16), label: "Döviz Riski" },
  { id: nextId(), employeeId: "e4", typeId: "sube",   startSlot: R(20), endSlot: R(24), label: "Alsancak Şubesi" },
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot: R(30), endSlot: R(36), label: "Faiz Riski İzleme" },

  // ─── e5 · Can Öztürk (Denetçi) ────────────────────────────────────────────
  { id: nextId(), employeeId: "e5", typeId: "sube",   startSlot: R( 0), endSlot: R( 4), label: "Konak Şubesi" },
  { id: nextId(), employeeId: "e5", typeId: "takip",  startSlot: R( 6), endSlot: R(10), label: "BT Denetimi" },
  // Stacking demo: aynı slotta iki plan
  { id: nextId(), employeeId: "e5", typeId: "sube",   startSlot: R(14), endSlot: R(18), label: "Karşıyaka Şubesi" },
  { id: nextId(), employeeId: "e5", typeId: "takip",  startSlot: R(14), endSlot: R(16), label: "Anlık Kontrol" },
  { id: nextId(), employeeId: "e5", typeId: "izin",   startSlot: R(26), endSlot: R(30), label: "Yıllık izin" },

  // ─── e6 · Selin Arslan (Kıdemli Denetçi) ──────────────────────────────────
  { id: nextId(), employeeId: "e6", typeId: "takip",  startSlot: R( 0), endSlot: R( 8), label: "Kredi Riski Denetimi" },
  { id: nextId(), employeeId: "e6", typeId: "sube",   startSlot: R(12), endSlot: R(16), label: "Bakırköy Şubesi" },
  { id: nextId(), employeeId: "e6", typeId: "izin",   startSlot: R(20), endSlot: R(22), label: "Mazeret izni" },
  { id: nextId(), employeeId: "e6", typeId: "takip",  startSlot: R(24), endSlot: R(30), label: "Yıl Sonu Kapanış" },
  { id: nextId(), employeeId: "e6", typeId: "sube",   startSlot: R(34), endSlot: R(38), label: "Etlik Şubesi" },

  // ─── e7 · Burak Çelik (Denetçi Yardımcısı) ────────────────────────────────
  { id: nextId(), employeeId: "e7", typeId: "izin",   startSlot: R( 0), endSlot: R( 4), label: "Yıllık izin" },
  { id: nextId(), employeeId: "e7", typeId: "takip",  startSlot: R(10), endSlot: R(18), label: "Operasyon Riski" },
  { id: nextId(), employeeId: "e7", typeId: "sube",   startSlot: R(22), endSlot: R(26), label: "Ümraniye Şubesi" },
  { id: nextId(), employeeId: "e7", typeId: "takip",  startSlot: R(30), endSlot: R(36), label: "Çeyrek Dönem Raporu" },

  // ─── e8 · Ayşe Yıldız (Uzman Denetçi) ────────────────────────────────────
  { id: nextId(), employeeId: "e8", typeId: "sube",   startSlot: R( 2), endSlot: R( 8), label: "Alsancak Şubesi" },
  { id: nextId(), employeeId: "e8", typeId: "takip",  startSlot: R(12), endSlot: R(20), label: "Bilgi Teknolojileri" },
  { id: nextId(), employeeId: "e8", typeId: "sube",   startSlot: R(24), endSlot: R(28), label: "Kızılay Şubesi" },
  { id: nextId(), employeeId: "e8", typeId: "saglik", startSlot: R(32), endSlot: R(34), label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e8", typeId: "takip",  startSlot: R(36), endSlot: R(40), label: "Kapanış Değerlendirmesi" },

  // ─── e9 · Emre Koç (Denetçi) ──────────────────────────────────────────────
  { id: nextId(), employeeId: "e9", typeId: "saglik", startSlot: R( 4), endSlot: R( 8), label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e9", typeId: "sube",   startSlot: R(10), endSlot: R(14), label: "Etlik Şubesi" },
  { id: nextId(), employeeId: "e9", typeId: "takip",  startSlot: R(18), endSlot: R(26), label: "Uyum Denetimi" },
  { id: nextId(), employeeId: "e9", typeId: "sube",   startSlot: R(30), endSlot: R(34), label: "Karşıyaka Şubesi" },

  // ─── e10 · Fatma Güneş (Baş Denetçi) ─────────────────────────────────────
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot: R( 0), endSlot: R(10), label: "Üst Yönetim Koordinasyonu" },
  { id: nextId(), employeeId: "e10", typeId: "sube",  startSlot: R(14), endSlot: R(18), label: "Çankaya Şubesi" },
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot: R(22), endSlot: R(30), label: "Stratejik Plan İzleme" },
  { id: nextId(), employeeId: "e10", typeId: "sube",  startSlot: R(32), endSlot: R(36), label: "Kocatepe Şubesi" },
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot: R(38), endSlot: R(42), label: "Yönetim Kurulu Sunumu" },

  // ─── e11 · Hasan Aktaş (Kıdemli Denetçi) ─────────────────────────────────
  { id: nextId(), employeeId: "e11", typeId: "sube",  startSlot: R( 6), endSlot: R(12), label: "Konak Şubesi" },
  { id: nextId(), employeeId: "e11", typeId: "takip", startSlot: R(14), endSlot: R(22), label: "İç Kontrol Değerlendirmesi" },
  { id: nextId(), employeeId: "e11", typeId: "izin",  startSlot: R(26), endSlot: R(30), label: "Yıllık izin" },
  { id: nextId(), employeeId: "e11", typeId: "sube",  startSlot: R(32), endSlot: R(36), label: "Levent Şubesi" },

  // ─── e12 · Merve Polat (Denetçi) ──────────────────────────────────────────
  { id: nextId(), employeeId: "e12", typeId: "takip", startSlot: R( 0), endSlot: R( 6), label: "AML Kontrol" },
  { id: nextId(), employeeId: "e12", typeId: "izin",  startSlot: R( 7), endSlot: R( 8), label: "½ gün izin" },
  { id: nextId(), employeeId: "e12", typeId: "sube",  startSlot: R(10), endSlot: R(16), label: "Levent Şubesi" },
  { id: nextId(), employeeId: "e12", typeId: "takip", startSlot: R(20), endSlot: R(28), label: "Dönem Kapanış Raporu" },
  { id: nextId(), employeeId: "e12", typeId: "sube",  startSlot: R(32), endSlot: R(36), label: "Çankaya Şubesi" },

  // ─── e13 · Okan Şimşek (Denetçi) ─────────────────────────────────────────
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot: R( 4), endSlot: R( 8), label: "Kadıköy Şubesi" },
  { id: nextId(), employeeId: "e13", typeId: "takip", startSlot: R(10), endSlot: R(16), label: "Proje Denetimi" },
  // Stacking demo: çakışan iki takip planı
  { id: nextId(), employeeId: "e13", typeId: "takip", startSlot: R(12), endSlot: R(18), label: "Risk Değerlendirmesi" },
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot: R(22), endSlot: R(26), label: "Bornova Şubesi" },
  { id: nextId(), employeeId: "e13", typeId: "izin",  startSlot: R(30), endSlot: R(32), label: "½ gün izin" },
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot: R(34), endSlot: R(38), label: "Ümraniye Şubesi" },
];
