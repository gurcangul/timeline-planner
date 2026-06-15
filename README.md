# Denetim Planlama — Gantt Saha Çizelgesi

Banka iç denetim ekipleri için **haftalık saha planlama** aracı. Denetçiler sol
sütunda sabit dururken, günler sağa doğru kayan bir Gantt zaman çizelgesi üzerinde
sürükle-bırak ile atama yapılır, planlar taşınır/uzatılır, çakışmalar otomatik çözülür.

React 18 + TypeScript + Vite ile geliştirilmiştir. Şu an veriler **mock** (in-memory)
çalışır; gerçek backend için TanStack Query tabanlı bir servis katmanı iskeleti hazırdır
(bkz. [API_SPEC.md](API_SPEC.md)).

---

## Kurulum ve Çalıştırma

```bash
npm install
npm start        # geliştirme sunucusu → http://localhost:5173
```

| Komut | Açıklama |
|-------|----------|
| `npm start` / `npm run dev` | Vite geliştirme sunucusu |
| `npm run build`             | TypeScript derleme + üretim çıktısı (`dist/`) |
| `npm run preview`           | Derlenmiş çıktıyı önizler |
| `npm run lint`              | ESLint |
| `npm test`                  | Vitest (izleme modu) |
| `npm run test:run`          | Vitest (tek sefer çalıştır) |

> Üretim derlemesi `vite.config.ts` içinde `base: "/mgul/"` alt yolu ile alınır.
> Backend bağlanacağında `.env` dosyasına `VITE_API_BASE_URL` eklenir
> (örnek için [.env.example](.env.example)).

---

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Sürükle-seç** | Boş alanı sürükleyerek aralık seç → tür ata modalı açılır |
| **Taşı** | Bir planı tutup zaman çizelgesinde kaydır |
| **Yeniden boyutlandır** | Planı kenarından tutup uzat/daralt — diğer planları **kaydırmaz** |
| **Cascade push** | Bir planı *taşıdığında* yoluna çıkan planlar sağa akar |
| **Sabit (pinned) planlar** | İzin & Sağlık Raporu çapadır; kaymaz, cascade'e dahil olmaz, üstüne plan konmaz |
| **Üst üste planlama** | Aynı zaman dilimine birden çok plan; otomatik dikey şeritlere (lane) ayrılır |
| **Kenar otomatik kaydırma** | Sürüklerken ekran kenarına dayanınca takvim hafta hafta otomatik ilerler |
| **Plan Ekle** | Sağ üstteki butonla denetçi seçerek sıfırdan plan oluştur |
| **Düzenle / Sil** | Plana çift tıkla → düzenleme modalı; üzerine gelince çıkan × ile sil |
| **Excel dışa aktarım** | Denetçi + tarih filtreli `.xlsx` raporu (SheetJS) |
| **İstatistik** | Denetçiye tıkla → bireysel pasta grafik; "Denetçi" başlığına tıkla → tüm ekip özeti. Dilimde hover → yüzde |
| **7 günlük takvim** | Hafta sonları dahil; hafta sonu sütunları farklı tonda |
| **Responsive** | Ekrana kaç gün sığıyorsa o kadar gün gösterilir (boşluk bırakmaz) |
| **Sonsuz navigasyon** | İleri/geri oklarla ~2 yıllık (104 hafta) aralıkta gezinme |

### Aktivite Türleri

| Tür | Kısa | Renk | Sabit | Not |
|-----|------|------|-------|-----|
| Takip & Raporlama | Takip | `#4F46E5` Mor | — | |
| Şube Ziyareti | Şube | `#0D9488` Yeşil | — | Şube seçimi gerektirir |
| İzin | İzin | `#D97706` Turuncu | 🔒 | Çapa |
| Sağlık Raporu | Rapor | `#E11D48` Kırmızı | 🔒 | Çapa |
| Diğer | Diğer | `#7C3AED` Mor (açık) | — | Zorunlu serbest açıklama; barda bu metin görünür |

---

## Nasıl Kullanılır?

1. **Plan oluştur** — Bir denetçinin satırında boş alanı yatay olarak **sürükle**,
   bırakınca açılan modalda tür/tarih seç ve kaydet. Tek tıklama tam günü seçer.
   Alternatif: sağ üstteki **+ Plan Ekle** ile denetçi seçerek oluştur.
2. **Taşı** — Bir planı tutup sürükle. Yoluna çıkan planlar otomatik sağa kayar
   (cascade). İzin/Sağlık planları sabittir, kaymaz.
3. **Uzat / kısalt** — Planın sol veya sağ kenarından tut ve sürükle. Bu işlem
   komşu planları **kaydırmaz**.
4. **Uzak tarihe sürükle** — Sürüklerken ekranın kenarına dayan; takvim hafta hafta
   otomatik ilerler, böylece ekranda görünmeyen tarihlere de plan koyabilirsin.
5. **Düzenle / sil** — Plana **çift tıkla** → düzenleme modalı. Plan üzerine gelince
   sağ üstte çıkan **×** ile sil.
6. **Gezin** — Sol üstteki **‹ ›** oklarıyla haftalar arasında ilerle.
7. **İstatistik** — Soldaki bir denetçiye tıkla → bireysel pasta grafik. "Denetçi"
   başlığına tıkla → tüm ekip dağılımı.
8. **Excel'e aktar** — **Dışa Aktar** ile denetçi ve tarih aralığı seçip `.xlsx` indir.

---

## Slot Modeli

Tüm zaman aritmetiği **yarım gün slotları** üzerinden yürür:

- **1 gün = 2 slot** (ÖÖ / ÖS) → `SLOTS_PER_DAY = 2`
- **1 hafta = 7 gün = 14 slot** → `SLOTS_PER_WEEK = 14`
- **Slot 0** = içinde bulunulan haftanın **Pazartesi ÖÖ**'si (epoch)
- Aralıklar **yarı açık**tır: `startSlot` dahil, `endSlot` hariç

Bu model sayesinde yarım günlük planlar (½ gün izin vb.) özel durum gerektirmeden
ifade edilir. Görünürdeki gün/hafta penceresi ile mutlak slot koordinatları her zaman
ayrıdır; navigasyon `weekOffset` ile yapılır, slotlar mutlak kalır.

---

## Mimari

```
src/
├── api/                        # TanStack Query servis katmanı (backend iskeleti)
│   ├── http.ts                 #   fetch sarmalayıcı: base URL, JWT, ApiError, blob
│   ├── queryClient.ts          #   QueryClient + akıllı retry yapılandırması
│   ├── queryKeys.ts            #   merkezî, tip güvenli query-key fabrikası (qk.*)
│   ├── types.ts                #   DTO'lar + Page<T> + Pageable + HalfDay
│   ├── index.ts                #   tek giriş noktası
│   └── resources/              #   uç fonksiyonları + useQuery/useMutation hook'ları
│       ├── employees.ts        #     liste(sayfalı)/detay/CRUD
│       ├── activityTypes.ts    #     sabit liste (uzun cache)
│       ├── branches.ts         #     sabit liste
│       ├── assignments.ts      #     filtreli+sayfalı liste, bulkUpdate (cascade)
│       └── statistics.ts       #     denetçi/özet + Excel blob export
│
├── components/
│   ├── PlannerHeader.tsx       # Başlık + renk açıklama (legend)
│   ├── PlannerGrid/            # Ana Gantt ızgarası
│   │   ├── index.tsx           #   toolbar, navigasyon, responsive pencere, modallar
│   │   ├── GridHeader.tsx      #   gün başlıkları + hafta sonu tonlama
│   │   ├── EmployeeRow.tsx     #   sticky denetçi paneli + track + lane yerleşimi
│   │   └── SegmentBar.tsx      #   tek plan barı (taşı/uzat/sil/çift tık)
│   ├── AssignModal/            # Plan oluştur / düzenle (create / create-toolbar / edit)
│   ├── ExportModal/            # Excel dışa aktarım (denetçi + tarih filtresi)
│   ├── StatModal/              # İstatistik modalı (bireysel / tüm ekip)
│   └── PieChart/               # Saf SVG pasta grafik + hover tooltip
│
├── engine/
│   └── pushEngine.ts           # Saf cascade çözücü (resolveRow / resolveResizeRow)
│                               #   + lane hesaplama (computeLanes) + slotsOverlap
├── hooks/
│   ├── useAssignments.ts       # Plan CRUD state + çakışma kuralı (wouldConflict)
│   └── useDragInteraction.ts   # Pointer event mantığı + kenar otomatik kaydırma
│
├── utils/
│   ├── date.ts                 # Slot↔tarih, tarih aralığı çözümü, preset'ler, formatlama
│   ├── statistics.ts           # İstatistik hesabı (computeStats / statsToSlices)
│   └── export.ts               # SheetJS xlsx üretimi
│
├── constants/index.ts          # Boyutlar, slot sabitleri, denetçiler, türler, şubeler
├── data/seedData.ts            # Örnek veri (64 atama, 13 denetçi)
├── types/index.ts              # Çekirdek TypeScript arayüzleri
├── styles/global.css
├── App.tsx
└── main.tsx                    # QueryClientProvider + StrictMode kök
```

### Tasarım ilkeleri

- **Saf motor:** `pushEngine.ts` React'ten bağımsız, yan etkisiz fonksiyonlardır.
  Cascade (`resolveRow`) ile yeniden boyutlandırma (`resolveResizeRow`) ayrı tutulur:
  *taşıma* yoldaki planları iter, *boyutlandırma* hiçbir planı kaydırmaz.
- **Lane'ler yalnızca görseldir:** Üst üste binen planlar `computeLanes` ile render
  anında dikey şeritlere ayrılır; motor lane'den habersizdir.
- **Mutlak slot koordinatları:** Görünür pencere değişse de planların konumu mutlak
  slotla tutulur; kenar otomatik kaydırma da bu sayede sorunsuz çalışır.
- **Util'ler view'dan ayrı:** Tarih ve istatistik mantığı bileşenlerden çıkarılıp
  saf, yeniden kullanılabilir fonksiyonlara taşınmıştır.

---

## Teknoloji Yığını

- **React 18** + **TypeScript** (strict)
- **Vite 5** (geliştirme + derleme)
- **@tanstack/react-query 5** — sunucu durumu (servis katmanı iskeleti)
- **SheetJS (xlsx)** — Excel dışa aktarım
- Saf **SVG** pasta grafik (harici grafik kütüphanesi yok)
- Inline `React.CSSProperties` stilleri (CSS framework yok — bilinçli tercih)
- **Vitest** — saf çekirdek mantığın birim testleri

### Testler

Testler saf, deterministik çekirdeği hedefler (DOM'a dokunmaz):

| Dosya | Kapsam |
|-------|--------|
| `src/engine/pushEngine.test.ts` | Cascade itme, boyutlandırma (itme yok), sabit plan çakışması, üst üste binme dışlama, şerit yerleşimi |
| `src/utils/date.test.ts` | Slot↔tarih dönüşümleri, aralık çözümü, ay/çeyrek/yıl/hafta preset'leri |
| `src/utils/statistics.test.ts` | Tür bazında slot toplama, aralık kırpma, "Plansız" dilimi |

```bash
npm run test:run   # 35 test
```

Yol takma adı: `@` → `src/` ([vite.config.ts](vite.config.ts) ve `tsconfig`).

---

## Backend Entegrasyonu

Şu an bileşenler in-memory `useAssignments` hook'unu kullanır. Spring Boot tabanlı
gerçek backend için tüm REST uçları [API_SPEC.md](API_SPEC.md) dosyasında, bunlara
karşılık gelen React Query hook iskeleti ise [`src/api/`](src/api) altında hazırdır.

Geçiş yapılırken:

1. `.env` → `VITE_API_BASE_URL` ayarlanır.
2. Bileşenler `useAssignments` yerine `src/api` hook'larına bağlanır.
3. Backend DTO (gerçek tarih) ↔ frontend slot modeli dönüşümü `resources/assignments.ts`
   içine eklenecek bir `adapt()` katmanıyla yapılır (kod içinde yorumlandı).
