import type { ActivityType, Employee } from "@/types";

export const SLOT_W = 30;
export const DAY_W = SLOT_W * 2;
export const ROW_H = 38;
export const HEADER_H = 58;
export const LEFT_W = 232;
export const DEFAULT_WEEKS = 4;
export const DAYS_PER_WEEK = 7;
export const SLOTS_PER_WEEK = DAYS_PER_WEEK * 2; // 14

export const ACTIVITY_TYPES: Record<string, ActivityType> = {
  takip: {
    id: "takip",
    label: "Takip & Raporlama",
    short: "Takip",
    color: "#4F46E5",
    softColor: "#EEF0FF",
    pinned: false,
  },
  sube: {
    id: "sube",
    label: "Şube Ziyareti",
    short: "Şube",
    color: "#0D9488",
    softColor: "#E4F4F2",
    pinned: false,
  },
  izin: {
    id: "izin",
    label: "İzin",
    short: "İzin",
    color: "#D97706",
    softColor: "#FEF1DE",
    pinned: true,
  },
  saglik: {
    id: "saglik",
    label: "Sağlık Raporu",
    short: "Rapor",
    color: "#E11D48",
    softColor: "#FCE5EA",
    pinned: true,
  },
  diger: {
    id: "diger",
    label: "Diğer",
    short: "Diğer",
    color: "#7C3AED",
    softColor: "#F5F3FF",
    pinned: false,
  },
};

export const ACTIVITY_TYPE_LIST = Object.values(ACTIVITY_TYPES);

export const BRANCHES = [
  "Kadıköy Şubesi",
  "Levent Şubesi",
  "Bornova Şubesi",
  "Çankaya Şubesi",
  "Konak Şubesi",
  "Bakırköy Şubesi",
  "Ümraniye Şubesi",
  "Kızılay Şubesi",
  "Alsancak Şubesi",
  "Etlik Şubesi",
  "Karşıyaka Şubesi",
  "Kocatepe Şubesi",
];

export const EMPLOYEES: Employee[] = [
  { id: "e1",  name: "Ahmet Yılmaz",   title: "Kıdemli Denetçi" },
  { id: "e2",  name: "Elif Demir",     title: "Denetçi" },
  { id: "e3",  name: "Mehmet Kaya",    title: "Denetçi" },
  { id: "e4",  name: "Zeynep Şahin",   title: "Uzman Denetçi" },
  { id: "e5",  name: "Can Öztürk",     title: "Denetçi" },
  { id: "e6",  name: "Selin Arslan",   title: "Kıdemli Denetçi" },
  { id: "e7",  name: "Burak Çelik",    title: "Denetçi Yardımcısı" },
  { id: "e8",  name: "Ayşe Yıldız",   title: "Uzman Denetçi" },
  { id: "e9",  name: "Emre Koç",       title: "Denetçi" },
  { id: "e10", name: "Fatma Güneş",    title: "Baş Denetçi" },
  { id: "e11", name: "Hasan Aktaş",    title: "Kıdemli Denetçi" },
  { id: "e12", name: "Merve Polat",    title: "Denetçi" },
  { id: "e13", name: "Okan Şimşek",   title: "Denetçi" },
];

export const TR_DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;
export const TR_MONTH_NAMES = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
] as const;
