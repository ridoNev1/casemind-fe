"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchHighRiskClaims,
  type HighRiskFilters,
  type HighRiskResponse,
} from "@/lib/services/claims";

export function useHighRiskClaims(filters: HighRiskFilters) {
  return useQuery<HighRiskResponse>({
    queryKey: ["high-risk-claims", filters],
    queryFn: () => fetchHighRiskClaims(filters),
    refetchOnWindowFocus: false,
  });
}
