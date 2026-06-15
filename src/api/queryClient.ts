/**
 * Uygulama genelinde tek QueryClient örneği.
 * main.tsx içinde <QueryClientProvider> ile sağlanır.
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 sn boyunca veriyi taze say
      retry: (failureCount, error) => {
        // 4xx hatalarında tekrar deneme (yalnızca ağ/5xx için retry)
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
