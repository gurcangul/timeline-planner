/**
 * Backend DTO tipleri — API_SPEC.md ile birebir eşleşir.
 *
 * NOT: Frontend dahili olarak "slot" (yarım gün) modeliyle çalışır; backend ise
 * gerçek tarihlerle (startDate + startHalf) konuşur. Dönüşüm api katmanında
 * yapılacak (bkz. resources/assignments.ts adapt* fonksiyonları — ileride).
 */

/** Spring Data Pageable yanıt zarfı (API_SPEC.md ortak yapı). */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-indexed mevcut sayfa
  first: boolean;
  last: boolean;
}

/** Sayfalama + sıralama istek parametreleri. */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string; // örn. "name,asc"
}

export type HalfDay = "AM" | "PM";

// ─── Employee ────────────────────────────────────────────────────────────────

export interface EmployeeDto {
  id: number;
  name: string;
  title: string;
}

export interface EmployeeUpsertRequest {
  name: string;
  title: string;
}

// ─── Activity Type ───────────────────────────────────────────────────────────

export interface ActivityTypeDto {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  softColor: string;
  pinned: boolean;
}

// ─── Branch ──────────────────────────────────────────────────────────────────

export interface BranchDto {
  id: number;
  name: string;
}

// ─── Assignment ──────────────────────────────────────────────────────────────

export interface AssignmentDto {
  id: number;
  employee: EmployeeDto;
  activityType: Pick<ActivityTypeDto, "id" | "label" | "color">;
  startDate: string; // ISO LocalDate (YYYY-MM-DD)
  startHalf: HalfDay;
  endDate: string;
  endHalf: HalfDay;
  label: string;
}

export interface AssignmentUpsertRequest {
  employeeId: number;
  activityTypeId: string;
  startDate: string;
  startHalf: HalfDay;
  endDate: string;
  endHalf: HalfDay;
  label: string;
}

/** Toplu güncelleme (cascade push sonucu) — API_SPEC.md §4.7. */
export interface AssignmentBulkUpdateItem extends Partial<AssignmentUpsertRequest> {
  id: number;
}

// ─── Statistics ──────────────────────────────────────────────────────────────

export interface StatBreakdownItem {
  activityTypeId: string;
  label: string;
  color: string;
  days: number;
  percentage: number;
}

export interface EmployeeStatDto {
  employeeId: number;
  employeeName: string;
  title?: string;
  totalWorkingDays: number;
  breakdown: StatBreakdownItem[];
}
