/**
 * Çalışan (Denetçi) servisleri — API_SPEC.md §1.
 * GET /employees liste sayfalıdır.
 */

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { http } from "../http";
import { qk } from "../queryKeys";
import type { Page, PageParams, EmployeeDto, EmployeeUpsertRequest } from "../types";

interface EmployeeListParams extends PageParams {
  search?: string;
  title?: string;
}

// ─── raw endpoints ─────────────────────────────────────────────────────────

export const employeesApi = {
  list: (params?: EmployeeListParams) =>
    http.get<Page<EmployeeDto>>("/employees", { params }),
  detail: (id: number) => http.get<EmployeeDto>(`/employees/${id}`),
  create: (body: EmployeeUpsertRequest) => http.post<EmployeeDto>("/employees", body),
  update: (id: number, body: EmployeeUpsertRequest) =>
    http.put<EmployeeDto>(`/employees/${id}`, body),
  remove: (id: number) => http.delete<void>(`/employees/${id}`),
};

// ─── hooks ───────────────────────────────────────────────────────────────────

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: qk.employees.list(params),
    queryFn: () => employeesApi.list(params),
    placeholderData: keepPreviousData, // sayfa geçişinde eski veriyi koru
  });
}

export function useEmployee(id: number, enabled = true) {
  return useQuery({
    queryKey: qk.employees.detail(id),
    queryFn: () => employeesApi.detail(id),
    enabled,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: EmployeeUpsertRequest) => employeesApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employees.all }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: EmployeeUpsertRequest }) =>
      employeesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employees.all }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employees.all }),
  });
}
