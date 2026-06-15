/**
 * Şube servisleri — API_SPEC.md §3.
 * Küçük, sabit liste; sayfalama yok.
 */

import { useQuery } from "@tanstack/react-query";
import { http } from "../http";
import { qk } from "../queryKeys";
import type { BranchDto } from "../types";

export const branchesApi = {
  list: () => http.get<BranchDto[]>("/branches"),
};

export function useBranches() {
  return useQuery({
    queryKey: qk.branches.all,
    queryFn: branchesApi.list,
    staleTime: 60 * 60 * 1000, // 1 saat
  });
}
