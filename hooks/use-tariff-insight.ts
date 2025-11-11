"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchTariffInsight,
  type TariffInsightParams,
  type TariffInsightRow,
} from "@/lib/services/reports";

export function useTariffInsight(params?: TariffInsightParams) {
  return useQuery<TariffInsightRow[]>({
    queryKey: ["tariff-insight", params],
    queryFn: () => fetchTariffInsight(params as TariffInsightParams),
    enabled: Boolean(params && (params.facility_id || params.province)),
    staleTime: 1000 * 30,
  });
}
