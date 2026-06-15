/**
 * İstatistik servisleri — API_SPEC.md §5.
 * Tek denetçi kırılımı + tüm ekip özeti (sayfalı).
 * Excel dışa aktarım §6 — Blob indirir.
 */

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { http, downloadBlob } from "../http";
import { qk, type StatFilters } from "../queryKeys";
import type { Page, EmployeeStatDto } from "../types";

export const statisticsApi = {
  employee: (employeeId: number, filters?: StatFilters) =>
    http.get<EmployeeStatDto>(`/statistics/employee/${employeeId}`, { params: filters }),

  summary: (filters?: StatFilters & { page?: number; size?: number }) =>
    http.get<Page<EmployeeStatDto>>("/statistics/summary", { params: filters }),

  /** Excel raporu indir (xlsx Blob). employeeIds virgülle ayrılır. */
  exportXlsx: (params: { employeeIds?: number[]; startDate: string; endDate: string }) =>
    downloadBlob("/assignments/export", {
      employeeIds: params.employeeIds?.join(","),
      startDate: params.startDate,
      endDate: params.endDate,
    }),
};

export function useEmployeeStats(employeeId: number, filters?: StatFilters, enabled = true) {
  return useQuery({
    queryKey: qk.statistics.employee(employeeId, filters),
    queryFn: () => statisticsApi.employee(employeeId, filters),
    enabled,
  });
}

export function useStatsSummary(filters?: StatFilters & { page?: number; size?: number }) {
  return useQuery({
    queryKey: qk.statistics.summary(filters),
    queryFn: () => statisticsApi.summary(filters),
    placeholderData: keepPreviousData,
  });
}
