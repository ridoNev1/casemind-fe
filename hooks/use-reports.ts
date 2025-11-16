"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchDuplicateClaims,
  fetchSeverityMismatch,
  type DuplicateClaimRow,
  type SeverityMismatchRow,
} from "@/lib/services/reports";

export function useSeverityMismatch(limit = 20) {
  return useQuery<SeverityMismatchRow[]>({
    queryKey: ["reports", "severity-mismatch", limit],
    queryFn: () => fetchSeverityMismatch({ limit }),
    staleTime: 1000 * 60,
  });
}

export function useDuplicateClaims(limit = 20) {
  return useQuery<DuplicateClaimRow[]>({
    queryKey: ["reports", "duplicate-claims", limit],
    queryFn: () => fetchDuplicateClaims({ limit }),
    staleTime: 1000 * 60,
  });
}
