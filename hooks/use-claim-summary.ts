"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchClaimSummary, type ClaimSummary } from "@/lib/services/claims";

export function useClaimSummary(claimId?: string) {
  return useQuery<ClaimSummary>({
    queryKey: ["claim-summary", claimId],
    queryFn: () => fetchClaimSummary(claimId as string),
    enabled: Boolean(claimId),
    staleTime: 1000 * 30,
  });
}
