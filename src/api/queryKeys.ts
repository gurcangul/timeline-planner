/**
 * Merkezî query-key fabrikası.
 *
 * Tüm React Query anahtarları buradan üretilir; böylece invalidate/prefetch
 * işlemleri tip güvenli ve tutarlı olur. Örn:
 *   queryClient.invalidateQueries({ queryKey: qk.assignments.all })
 */

import type { PageParams } from "./types";

export interface AssignmentFilters extends PageParams {
  employeeId?: number;
  activityTypeId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StatFilters {
  startDate?: string;
  endDate?: string;
}

export const qk = {
  employees: {
    all: ["employees"] as const,
    list: (params?: PageParams) => ["employees", "list", params ?? {}] as const,
    detail: (id: number) => ["employees", "detail", id] as const,
  },
  activityTypes: {
    all: ["activityTypes"] as const,
  },
  branches: {
    all: ["branches"] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    list: (filters?: AssignmentFilters) => ["assignments", "list", filters ?? {}] as const,
    byEmployee: (employeeId: number, filters?: AssignmentFilters) =>
      ["assignments", "employee", employeeId, filters ?? {}] as const,
    detail: (id: number) => ["assignments", "detail", id] as const,
  },
  statistics: {
    employee: (employeeId: number, filters?: StatFilters) =>
      ["statistics", "employee", employeeId, filters ?? {}] as const,
    summary: (filters?: StatFilters & { page?: number; size?: number }) =>
      ["statistics", "summary", filters ?? {}] as const,
  },
} as const;
