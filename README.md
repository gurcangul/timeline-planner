# Denetim Planlama — Gantt Takvimi

Banka iç denetim ekipleri için haftalık planlama aracı. React + TypeScript ile geliştirilmiştir.

## Kurulum ve Çalıştırma

```bash
npm install
npm start        # geliştirme sunucusu → http://localhost:5173
```

Derleme için:

```bash
npm run build    # dist/ klasörüne üretim çıktısı alır
npm run preview  # derlenmiş çıktıyı önizler
```

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Sürükle-Bırak** | Gantt satırında sürükleyerek yeni plan oluştur veya mevcut planı taşı |
| **Yeniden Boyutlandır** | Planın kenarından tutup genişlet/daralt (diğer planları kaydırmaz) |
| **Cascade Push** | Bir planı taşıdığında sıradaki planlar sağa kayar |
| **Pinned Planlar** | İzin ve Sağlık Raporu sabit çapa — cascade'e dahil olmaz |
| **Üst Üste Planlar** | Aynı zaman dilimine birden fazla plan eklenebilir (farklı satırlarda görünür) |
| **Plan Ekle** | Sağ üst "Plan Ekle" butonundan çalışan seçerek plan oluştur |
| **Düzenle / Sil** | Plana çift tıklayarak düzenleme modalını aç |
| **Excel Dışa Aktarım** | Çalışan ve tarih filtreli `.xlsx` raporu indir |
| **İstatistik** | Çalışana tıklayarak pasta grafik; "Denetçi" başlığına tıklayarak tüm ekip özeti |
| **Hafta Sonu** | 7 günlük takvim — hafta sonları çalışılabilir, farklı tonla gösterilir |
| **Sonsuz Navigasyon** | İleri/geri ok ile 2 yıllık zaman diliminde gezin |

## Aktivite Türleri

| Tür | Renk | Kilitli |
|-----|------|---------|
| Takip & Raporlama | Mor | — |
| Şube Ziyareti | Yeşil | — |
| İzin 🔒 | Turuncu | Evet |
| Sağlık Raporu 🔒 | Kırmızı | Evet |
| Diğer | Mor (açık) | — |

## Teknik Yapı

```
src/
├── components/
│   ├── PlannerGrid/       # Ana Gantt ızgarası (Header, EmployeeRow, SegmentBar)
│   ├── AssignModal/       # Plan oluştur / düzenle modalı
│   ├── ExportModal/       # Excel dışa aktarım modalı
│   ├── StatModal/         # İstatistik ve pasta grafik modalı
│   └── PieChart/          # Saf SVG pasta grafik bileşeni
├── engine/
│   └── pushEngine.ts      # Cascade motoru + lane hesaplama
├── hooks/
│   ├── useAssignments.ts  # Plan CRUD state yönetimi
│   └── useDragInteraction.ts # Pointer event & drag mantığı
├── utils/
│   ├── date.ts            # Slot ↔ tarih dönüşümleri
│   └── export.ts          # SheetJS Excel üretimi
├── constants/             # Boyutlar, çalışanlar, aktivite türleri
├── data/seedData.ts       # Örnek veriler (57 atama)
└── types/index.ts         # TypeScript arayüzleri
```

## Slot Modeli

Zaman dilimi sistemi: **1 gün = 2 slot** (ÖÖ + ÖS). 7 günlük haftada 14 slot/hafta.

- Slot 0 = Bu haftanın Pazartesi ÖÖ
- `startSlot` dahil, `endSlot` hariç (yarı açık aralık)

## Backend API

Spring Boot ile geliştirilecek REST API spesifikasyonu için [API_SPEC.md](API_SPEC.md) dosyasına bakın.
