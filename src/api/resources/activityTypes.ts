/**
 * Aktivite türü servisleri — API_SPEC.md §2.
 * Küçük, sabit liste olduğu için sayfalama yok; uzun staleTime ile cache'lenir.
 */

import { useQuery } from "@tanstack/react-query";
import { http } from "../http";
import { qk } from "../queryKeys";
import type { ActivityTypeDto } from "../types";

export const activityTypesApi = {
  list: () => http.get<ActivityTypeDto[]>("/activity-types"),
};

export function useActivityTypes() {
  return useQuery({
    queryKey: qk.activityTypes.all,
    queryFn: activityTypesApi.list,
    staleTime: 60 * 60 * 1000, // 1 saat — neredeyse hiç değişmez
  });
}
