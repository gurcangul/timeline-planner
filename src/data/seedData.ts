import type { Assignment } from "@/types";

/*
 * Slot mapping (2 slots per working day, week = 5 days = 10 slots):
 *   Week 1 : slots  0 –  9   (this week)
 *   Week 2 : slots 10 – 19
 *   Week 3 : slots 20 – 29
 *   Week 4 : slots 30 – 39
 */

let _counter = 100;
export const nextId = (): string => `a${++_counter}`;

export const SEED_ASSIGNMENTS: Assignment[] = [
  // ─── e1 · Ahmet Yılmaz (Kıdemli Denetçi) ──────────────────────────────────
  { id: nextId(), employeeId: "e1", typeId: "takip",  startSlot:  0, endSlot:  7, label: "Operasyon Merkezi Denetimi" },
  { id: nextId(), employeeId: "e1", typeId: "sube",   startSlot:  8, endSlot: 12, label: "Levent Şubesi" },
  { id: nextId(), employeeId: "e1", typeId: "izin",   startSlot: 14, endSlot: 16, label: "Yıllık izin" },
  { id: nextId(), employeeId: "e1", typeId: "takip",  startSlot: 20, endSlot: 26, label: "Kredi Riski İzleme" },
  { id: nextId(), employeeId: "e1", typeId: "sube",   startSlot: 30, endSlot: 34, label: "Bakırköy Şubesi" },

  // ─── e2 · Elif Demir (Denetçi) ────────────────────────────────────────────
  { id: nextId(), employeeId: "e2", typeId: "sube",   startSlot:  0, endSlot:  4, label: "Kadıköy Şubesi" },
  { id: nextId(), employeeId: "e2", typeId: "izin",   startSlot:  4, endSlot:  8, label: "Yıllık izin" },
  { id: nextId(), employeeId: "e2", typeId: "takip",  startSlot: 12, endSlot: 18, label: "Mevduat Süreçleri" },
  { id: nextId(), employeeId: "e2", typeId: "sube",   startSlot: 22, endSlot: 26, label: "Ümraniye Şubesi" },
  { id: nextId(), employeeId: "e2", typeId: "takip",  startSlot: 32, endSlot: 38, label: "Dönem Sonu Raporu" },

  // ─── e3 · Mehmet Kaya (Denetçi) ───────────────────────────────────────────
  { id: nextId(), employeeId: "e3", typeId: "takip",  startSlot:  2, endSlot:  8, label: "Kredi Süreçleri" },
  { id: nextId(), employeeId: "e3", typeId: "saglik", startSlot: 10, endSlot: 14, label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e3", typeId: "sube",   startSlot: 16, endSlot: 20, label: "Kızılay Şubesi" },
  { id: nextId(), employeeId: "e3", typeId: "takip",  startSlot: 24, endSlot: 30, label: "AML Kontrol" },
  { id: nextId(), employeeId: "e3", typeId: "sube",   startSlot: 34, endSlot: 38, label: "Kocatepe Şubesi" },

  // ─── e4 · Zeynep Şahin (Uzman Denetçi) — yarım gün senaryosu ──────────────
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot:  0, endSlot:  4, label: "Hazine Denetimi" },
  { id: nextId(), employeeId: "e4", typeId: "izin",   startSlot:  6, endSlot:  7, label: "½ gün izin" },
  { id: nextId(), employeeId: "e4", typeId: "sube",   startSlot:  7, endSlot:  8, label: "Bornova Şubesi" },
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot: 10, endSlot: 16, label: "Döviz Riski" },
  { id: nextId(), employeeId: "e4", typeId: "sube",   startSlot: 20, endSlot: 24, label: "Alsancak Şubesi" },
  { id: nextId(), employeeId: "e4", typeId: "takip",  startSlot: 30, endSlot: 36, label: "Faiz Riski İzleme" },

  // ─── e5 · Can Öztürk (Denetçi) ────────────────────────────────────────────
  { id: nextId(), employeeId: "e5", typeId: "sube",   startSlot:  0, endSlot:  4, label: "Konak Şubesi" },
  { id: nextId(), employeeId: "e5", typeId: "takip",  startSlot:  6, endSlot: 10, label: "BT Denetimi" },
  // Aynı güne iki plan: sabah takip bitti öğleden sonra şube başladı (stacking demo)
  { id: nextId(), employeeId: "e5", typeId: "sube",   startSlot: 14, endSlot: 18, label: "Karşıyaka Şubesi" },
  { id: nextId(), employeeId: "e5", typeId: "takip",  startSlot: 14, endSlot: 16, label: "Anlık Kontrol" },
  { id: nextId(), employeeId: "e5", typeId: "izin",   startSlot: 26, endSlot: 30, label: "Yıllık izin" },

  // ─── e6 · Selin Arslan (Kıdemli Denetçi) ──────────────────────────────────
  { id: nextId(), employeeId: "e6", typeId: "takip",  startSlot:  0, endSlot:  8, label: "Kredi Riski Denetimi" },
  { id: nextId(), employeeId: "e6", typeId: "sube",   startSlot: 12, endSlot: 16, label: "Bakırköy Şubesi" },
  { id: nextId(), employeeId: "e6", typeId: "izin",   startSlot: 20, endSlot: 22, label: "Mazeret izni" },
  { id: nextId(), employeeId: "e6", typeId: "takip",  startSlot: 24, endSlot: 30, label: "Yıl Sonu Kapanış" },
  { id: nextId(), employeeId: "e6", typeId: "sube",   startSlot: 34, endSlot: 38, label: "Etlik Şubesi" },

  // ─── e7 · Burak Çelik (Denetçi Yardımcısı) ────────────────────────────────
  { id: nextId(), employeeId: "e7", typeId: "izin",   startSlot:  0, endSlot:  4, label: "Yıllık izin" },
  { id: nextId(), employeeId: "e7", typeId: "takip",  startSlot: 10, endSlot: 18, label: "Operasyon Riski" },
  { id: nextId(), employeeId: "e7", typeId: "sube",   startSlot: 22, endSlot: 26, label: "Ümraniye Şubesi" },
  { id: nextId(), employeeId: "e7", typeId: "takip",  startSlot: 30, endSlot: 36, label: "Çeyrek Dönem Raporu" },

  // ─── e8 · Ayşe Yıldız (Uzman Denetçi) ────────────────────────────────────
  { id: nextId(), employeeId: "e8", typeId: "sube",   startSlot:  2, endSlot:  8, label: "Alsancak Şubesi" },
  { id: nextId(), employeeId: "e8", typeId: "takip",  startSlot: 12, endSlot: 20, label: "Bilgi Teknolojileri" },
  { id: nextId(), employeeId: "e8", typeId: "sube",   startSlot: 24, endSlot: 28, label: "Kızılay Şubesi" },
  { id: nextId(), employeeId: "e8", typeId: "saglik", startSlot: 32, endSlot: 34, label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e8", typeId: "takip",  startSlot: 36, endSlot: 40, label: "Kapanış Değerlendirmesi" },

  // ─── e9 · Emre Koç (Denetçi) ──────────────────────────────────────────────
  { id: nextId(), employeeId: "e9", typeId: "saglik", startSlot:  4, endSlot:  8, label: "Sağlık raporu" },
  { id: nextId(), employeeId: "e9", typeId: "sube",   startSlot: 10, endSlot: 14, label: "Etlik Şubesi" },
  { id: nextId(), employeeId: "e9", typeId: "takip",  startSlot: 18, endSlot: 26, label: "Uyum Denetimi" },
  { id: nextId(), employeeId: "e9", typeId: "sube",   startSlot: 30, endSlot: 34, label: "Karşıyaka Şubesi" },

  // ─── e10 · Fatma Güneş (Baş Denetçi) ─────────────────────────────────────
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot:  0, endSlot: 10, label: "Üst Yönetim Koordinasyonu" },
  { id: nextId(), employeeId: "e10", typeId: "sube",  startSlot: 14, endSlot: 18, label: "Çankaya Şubesi" },
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot: 22, endSlot: 30, label: "Stratejik Plan İzleme" },
  { id: nextId(), employeeId: "e10", typeId: "sube",  startSlot: 32, endSlot: 36, label: "Kocatepe Şubesi" },
  { id: nextId(), employeeId: "e10", typeId: "takip", startSlot: 38, endSlot: 42, label: "Yönetim Kurulu Sunumu" },

  // ─── e11 · Hasan Aktaş (Kıdemli Denetçi) ─────────────────────────────────
  { id: nextId(), employeeId: "e11", typeId: "sube",  startSlot:  6, endSlot: 12, label: "Konak Şubesi" },
  { id: nextId(), employeeId: "e11", typeId: "takip", startSlot: 14, endSlot: 22, label: "İç Kontrol Değerlendirmesi" },
  { id: nextId(), employeeId: "e11", typeId: "izin",  startSlot: 26, endSlot: 30, label: "Yıllık izin" },
  { id: nextId(), employeeId: "e11", typeId: "sube",  startSlot: 32, endSlot: 36, label: "Levent Şubesi" },

  // ─── e12 · Merve Polat (Denetçi) ──────────────────────────────────────────
  { id: nextId(), employeeId: "e12", typeId: "takip", startSlot:  0, endSlot:  6, label: "AML Kontrol" },
  { id: nextId(), employeeId: "e12", typeId: "izin",  startSlot:  7, endSlot:  8, label: "½ gün izin" },
  // Aynı gün, izin sabah — şube öğlen (stacking demo)
  { id: nextId(), employeeId: "e12", typeId: "sube",  startSlot: 10, endSlot: 16, label: "Levent Şubesi" },
  { id: nextId(), employeeId: "e12", typeId: "takip", startSlot: 20, endSlot: 28, label: "Dönem Kapanış Raporu" },
  { id: nextId(), employeeId: "e12", typeId: "sube",  startSlot: 32, endSlot: 36, label: "Çankaya Şubesi" },

  // ─── e13 · Okan Şimşek (Denetçi) ─────────────────────────────────────────
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot:  4, endSlot:  8, label: "Kadıköy Şubesi" },
  { id: nextId(), employeeId: "e13", typeId: "takip", startSlot: 10, endSlot: 16, label: "Proje Denetimi" },
  // Aynı gün çakışan: farklı lane'e düşer (stacking demo)
  { id: nextId(), employeeId: "e13", typeId: "takip", startSlot: 12, endSlot: 18, label: "Risk Değerlendirmesi" },
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot: 22, endSlot: 26, label: "Bornova Şubesi" },
  { id: nextId(), employeeId: "e13", typeId: "izin",  startSlot: 30, endSlot: 32, label: "½ gün izin" },
  { id: nextId(), employeeId: "e13", typeId: "sube",  startSlot: 34, endSlot: 38, label: "Ümraniye Şubesi" },
];
