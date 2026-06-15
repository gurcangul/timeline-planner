/**
 * Atama servisleri — API_SPEC.md §4.
 * GET /assignments liste sayfalı ve filtrelenebilir (denetçi, tür, tarih aralığı).
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { http } from "../http";
import { qk, type AssignmentFilters } from "../queryKeys";
import type {
  Page,
  AssignmentDto,
  AssignmentUpsertRequest,
  AssignmentBulkUpdateItem,
} from "../types";

// ─── raw endpoints ─────────────────────────────────────────────────────────

export const assignmentsApi = {
  list: (filters?: AssignmentFilters) =>
    http.get<Page<AssignmentDto>>("/assignments", { params: filters }),

  byEmployee: (employeeId: number, filters?: AssignmentFilters) =>
    http.get<Page<AssignmentDto>>(`/assignments/employee/${employeeId}`, { params: filters }),

  detail: (id: number) => http.get<AssignmentDto>(`/assignments/${id}`),

  create: (body: AssignmentUpsertRequest) => http.post<AssignmentDto>("/assignments", body),

  update: (id: number, body: AssignmentUpsertRequest) =>
    http.put<AssignmentDto>(`/assignments/${id}`, body),

  /** Cascade push sonrası toplu güncelleme (transactional). */
  bulkUpdate: (items: AssignmentBulkUpdateItem[]) =>
    http.put<AssignmentDto[]>("/assignments/bulk", items),

  remove: (id: number) => http.delete<void>(`/assignments/${id}`),
};

// ─── hooks ───────────────────────────────────────────────────────────────────

export function useAssignmentsQuery(filters?: AssignmentFilters) {
  return useQuery({
    queryKey: qk.assignments.list(filters),
    queryFn: () => assignmentsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeAssignments(employeeId: number, filters?: AssignmentFilters) {
  return useQuery({
    queryKey: qk.assignments.byEmployee(employeeId, filters),
    queryFn: () => assignmentsApi.byEmployee(employeeId, filters),
    placeholderData: keepPreviousData,
  });
}

export function useCreateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignmentUpsertRequest) => assignmentsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments.all }),
  });
}

export function useUpdateAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AssignmentUpsertRequest }) =>
      assignmentsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments.all }),
  });
}

export function useBulkUpdateAssignments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: AssignmentBulkUpdateItem[]) => assignmentsApi.bulkUpdate(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments.all }),
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => assignmentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.assignments.all }),
  });
}
