# Denetim Planlama — Spring Boot REST API Spesifikasyonu

> Base URL: `https://api.example.com/api/v1`  
> Content-Type: `application/json`  
> Tarih formatı: `YYYY-MM-DD` (ISO 8601 LocalDate)  
> Yarım gün: `AM` | `PM`  
> Sayfalama: Spring Data `Pageable` — query params `page` (0-indexed), `size` (default 20), `sort`

---

## Ortak Sayfalama Yanıt Yapısı

```json
{
  "content": [ ...items ],
  "totalElements": 57,
  "totalPages": 3,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

---

## 1. Çalışanlar — `/employees`

### 1.1 Liste (sayfalı)
```
GET /employees?page=0&size=20&sort=name,asc&search=ahmet
```

| Parametre | Tip    | Açıklama                                  |
|-----------|--------|-------------------------------------------|
| `search`  | String | Ad veya ünvan içinde serbest metin arama  |
| `title`   | String | Ünvana göre filtrele (exact)              |
| `page`    | int    | Sayfa numarası (0-indexed)                |
| `size`    | int    | Sayfa büyüklüğü (default: 20)             |
| `sort`    | String | `name,asc` / `title,desc` vb.            |

**Response `200 OK`** — `Page<EmployeeDto>`
```json
{
  "content": [
    { "id": 1, "name": "Ahmet Yılmaz", "title": "Kıdemli Denetçi" }
  ],
  "totalElements": 13,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

### 1.2 Tekil çalışan
```
GET /employees/{id}
```
**Response `200 OK`**
```json
{ "id": 1, "name": "Ahmet Yılmaz", "title": "Kıdemli Denetçi" }
```

---

### 1.3 Yeni çalışan
```
POST /employees
```
**Request Body**
```json
{ "name": "Yeni Denetçi", "title": "Denetçi" }
```
**Response `201 Created`** — yeni oluşturulan `EmployeeDto`

---

### 1.4 Çalışan güncelle
```
PUT /employees/{id}
```
**Request Body** — `EmployeeUpdateRequest` (değişen alanlar)
```json
{ "name": "Ahmet Yılmaz", "title": "Uzman Denetçi" }
```
**Response `200 OK`** — güncellenmiş `EmployeeDto`

---

### 1.5 Çalışan sil
```
DELETE /employees/{id}
```
**Response `204 No Content`**

> ⚠️ Çalışana bağlı aktif atamalar varsa `409 Conflict` dön.

---

## 2. Aktivite Türleri — `/activity-types`

> Küçük, sabit liste — sayfalama gerekmez.

### 2.1 Tüm aktivite türleri
```
GET /activity-types
```
**Response `200 OK`** — `List<ActivityTypeDto>`
```json
[
  {
    "id": "takip",
    "label": "Takip & Raporlama",
    "shortLabel": "Takip",
    "color": "#4F46E5",
    "softColor": "#EEF0FF",
    "pinned": false
  },
  {
    "id": "izin",
    "label": "İzin",
    "shortLabel": "İzin",
    "color": "#D97706",
    "softColor": "#FEF1DE",
    "pinned": true
  }
]
```

---

### 2.2 Aktivite türü oluştur (admin)
```
POST /activity-types
```
**Request Body**
```json
{
  "id": "diger",
  "label": "Diğer",
  "shortLabel": "Diğer",
  "color": "#7C3AED",
  "softColor": "#F5F3FF",
  "pinned": false
}
```
**Response `201 Created`**

---

### 2.3 Aktivite türü güncelle (admin)
```
PUT /activity-types/{id}
```
**Response `200 OK`**

---

### 2.4 Aktivite türü sil (admin)
```
DELETE /activity-types/{id}
```
**Response `204 No Content`**

> ⚠️ Bu türde aktif atamalar varsa `409 Conflict` dön.

---

## 3. Şubeler — `/branches`

> Küçük, sabit liste — sayfalama gerekmez.

### 3.1 Tüm şubeler
```
GET /branches
```
**Response `200 OK`** — `List<BranchDto>`
```json
[
  { "id": 1, "name": "Kadıköy Şubesi" },
  { "id": 2, "name": "Levent Şubesi" }
]
```

---

### 3.2 Şube oluştur (admin)
```
POST /branches
```
**Request Body** — `{ "name": "Yeni Şube" }`  
**Response `201 Created`**

---

### 3.3 Şube güncelle / sil (admin)
```
PUT  /branches/{id}
DELETE /branches/{id}
```

---

## 4. Atamalar — `/assignments`

### 4.1 Atama listesi (sayfalı, filtrelenebilir)
```
GET /assignments?page=0&size=20&sort=startDate,asc
    &employeeId=1
    &activityTypeId=takip
    &startDate=2026-06-01
    &endDate=2026-06-30
```

| Parametre       | Tip    | Açıklama                                      |
|-----------------|--------|-----------------------------------------------|
| `employeeId`    | Long   | Çalışana göre filtrele                        |
| `activityTypeId`| String | Aktivite türüne göre filtrele                 |
| `startDate`     | Date   | Bu tarihten itibaren başlayan veya örtüşen    |
| `endDate`       | Date   | Bu tarihe kadar biten veya örtüşen            |
| `page`          | int    | Sayfa numarası (0-indexed)                    |
| `size`          | int    | Sayfa büyüklüğü (default: 20)                 |
| `sort`          | String | `startDate,asc` / `employee.name,asc` vb.    |

**Response `200 OK`** — `Page<AssignmentDto>`
```json
{
  "content": [
    {
      "id": 101,
      "employee": { "id": 1, "name": "Ahmet Yılmaz", "title": "Kıdemli Denetçi" },
      "activityType": { "id": "takip", "label": "Takip & Raporlama", "color": "#4F46E5" },
      "startDate": "2026-06-09",
      "startHalf": "AM",
      "endDate": "2026-06-12",
      "endHalf": "PM",
      "label": "Operasyon Merkezi Denetimi"
    }
  ],
  "totalElements": 57,
  "totalPages": 3,
  "size": 20,
  "number": 0
}
```

---

### 4.2 Tekil atama
```
GET /assignments/{id}
```
**Response `200 OK`** — `AssignmentDto`

---

### 4.3 Çalışana ait tüm atamalar (sayfalı)

> Gantt satırı yüklenirken veya istatistik sayfasında kullanılır.

```
GET /assignments/employee/{employeeId}?page=0&size=50&startDate=2026-06-01&endDate=2026-09-30
```
**Response `200 OK`** — `Page<AssignmentDto>`

---

### 4.4 Yeni atama oluştur
```
POST /assignments
```
**Request Body** — `AssignmentCreateRequest`
```json
{
  "employeeId": 1,
  "activityTypeId": "takip",
  "startDate": "2026-06-09",
  "startHalf": "AM",
  "endDate": "2026-06-12",
  "endHalf": "PM",
  "label": "Operasyon Merkezi Denetimi"
}
```
**Response `201 Created`** — `AssignmentDto`

> Pinned (izin/saglik) çakışması durumunda `409 Conflict`:
> ```json
> { "error": "PINNED_CONFLICT", "message": "İzin veya sağlık raporu ile çakışıyor." }
> ```

---

### 4.5 Atama güncelle
```
PUT /assignments/{id}
```
**Request Body** — `AssignmentUpdateRequest` (tüm alanlar)  
**Response `200 OK`** — `AssignmentDto`

---

### 4.6 Atama sil
```
DELETE /assignments/{id}
```
**Response `204 No Content`**

---

### 4.7 Toplu satır güncelleme (cascade push sonucu)

> Sürükle-bırak sonrası cascade engine birden fazla atamayı aynı anda günceller.

```
PUT /assignments/bulk
```
**Request Body** — `List<AssignmentUpdateRequest>`
```json
[
  { "id": 101, "startDate": "2026-06-10", "startHalf": "AM", "endDate": "2026-06-13", "endHalf": "PM" },
  { "id": 102, "startDate": "2026-06-16", "startHalf": "AM", "endDate": "2026-06-18", "endHalf": "PM" }
]
```
**Response `200 OK`** — `List<AssignmentDto>` (güncellenen atamalar)

> Herhangi bir kayıtta pinned çakışması varsa tüm işlem `409` ile geri alınır (transactional).

---

## 5. İstatistikler — `/statistics`

### 5.1 Çalışan bazlı istatistik
```
GET /statistics/employee/{employeeId}?startDate=2026-06-01&endDate=2026-06-30
```

| Parametre   | Tip  | Açıklama              |
|-------------|------|-----------------------|
| `startDate` | Date | Aralık başlangıcı     |
| `endDate`   | Date | Aralık bitişi         |

**Response `200 OK`**
```json
{
  "employeeId": 1,
  "employeeName": "Ahmet Yılmaz",
  "period": { "startDate": "2026-06-01", "endDate": "2026-06-30" },
  "totalWorkingDays": 21,
  "breakdown": [
    { "activityTypeId": "takip", "label": "Takip & Raporlama", "color": "#4F46E5", "days": 7.5, "percentage": 35 },
    { "activityTypeId": "sube",  "label": "Şube Ziyareti",     "color": "#0D9488", "days": 4.0, "percentage": 19 },
    { "activityTypeId": "unplanned", "label": "Plansız",       "color": "#E2E8F0", "days": 9.5, "percentage": 46 }
  ]
}
```

---

### 5.2 Tüm çalışanlar özet istatistik (sayfalı)
```
GET /statistics/summary?startDate=2026-06-01&endDate=2026-06-30&page=0&size=20
```
**Response `200 OK`** — `Page<EmployeeStatDto>`
```json
{
  "content": [
    {
      "employeeId": 1,
      "employeeName": "Ahmet Yılmaz",
      "title": "Kıdemli Denetçi",
      "totalWorkingDays": 21,
      "breakdown": [...]
    }
  ],
  "totalElements": 13,
  "totalPages": 1,
  "size": 20,
  "number": 0
}
```

---

## 6. Dışa Aktarma — `/assignments/export`

### 6.1 Excel raporu indir
```
GET /assignments/export?employeeIds=1,2,3&startDate=2026-06-01&endDate=2026-06-30
```

| Parametre     | Tip        | Açıklama                                              |
|---------------|------------|-------------------------------------------------------|
| `employeeIds` | Long list  | Virgülle ayrılmış çalışan ID'leri (boş = tümü)       |
| `startDate`   | Date       | Tarih aralığı başlangıcı                              |
| `endDate`     | Date       | Tarih aralığı bitişi                                  |

**Response `200 OK`**  
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="denetim-plani-2026-06.xlsx"
```

Excel sütunları: `Denetçi | Ünvan | Aktivite Türü | Başlangıç | Bitiş | Süre (gün) | Açıklama`

---

## 7. Hata Yanıtları

Tüm endpoint'ler standart hata yapısı kullanır:

```json
{
  "timestamp": "2026-06-11T10:30:00Z",
  "status": 409,
  "error": "CONFLICT",
  "code": "PINNED_CONFLICT",
  "message": "İzin veya sağlık raporu ile çakışıyor.",
  "path": "/api/v1/assignments"
}
```

| HTTP Kodu | Durum                                                  |
|-----------|--------------------------------------------------------|
| `400`     | Geçersiz request body (validation hatası)             |
| `401`     | Kimlik doğrulama gerekli                              |
| `403`     | Yetki yok (admin endpoint'lere erişim)                |
| `404`     | Kaynak bulunamadı                                     |
| `409`     | İş kuralı çakışması (pinned conflict, aktif kayıt)   |
| `500`     | Sunucu hatası                                         |

---

## 8. Güvenlik Notları

- JWT Bearer token kullanılacak (`Authorization: Bearer <token>`)
- Admin endpoint'leri (`POST/PUT/DELETE` aktivite türü, şube) `ROLE_ADMIN` gerektirir
- Çalışan silme ve export endpoint'leri `ROLE_MANAGER` veya `ROLE_ADMIN` gerektirir
- Diğer endpoint'ler `ROLE_USER` ile erişilebilir

---

## 9. Spring Boot Önerilen Proje Yapısı

```
src/main/java/com/bank/audit/
├── controller/
│   ├── EmployeeController.java
│   ├── ActivityTypeController.java
│   ├── BranchController.java
│   ├── AssignmentController.java
│   ├── StatisticsController.java
│   └── ExportController.java
├── service/
│   ├── EmployeeService.java
│   ├── AssignmentService.java        ← cascade conflict logic burada
│   ├── StatisticsService.java
│   └── ExportService.java            ← Apache POI / OpenXML
├── repository/
│   ├── EmployeeRepository.java       ← JpaRepository + custom queries
│   ├── AssignmentRepository.java     ← date range filter + Specification
│   └── ...
├── domain/
│   ├── Employee.java
│   ├── ActivityType.java
│   ├── Branch.java
│   └── Assignment.java               ← startDate, startHalf(AM/PM), endDate, endHalf
├── dto/
│   ├── request/                      ← CreateRequest, UpdateRequest sınıfları
│   └── response/                     ← Dto sınıfları
└── exception/
    ├── PinnedConflictException.java
    └── GlobalExceptionHandler.java   ← @ControllerAdvice
```

---

## 10. Assignment Varlığı — Notlar

Frontend `startSlot` / `endSlot` (haftalık ofset tabanlı) kullanıyor; **backend bunları bilmez**.  
Backend gerçek tarihlerle çalışır, frontend her yanıta gelen `startDate + startHalf` → slot dönüşümünü kendisi yapar.

```java
@Entity
public class Assignment {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    private ActivityType activityType;

    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    private HalfDay startHalf;   // AM | PM

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private HalfDay endHalf;     // AM | PM

    private String label;
}
```
