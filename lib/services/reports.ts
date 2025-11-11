import { apiClient } from "@/lib/api-client";

export type TariffInsightRow = {
  facility_id: string | null;
  facility_name: string;
  facility_match_quality: string;
  province_name: string;
  district_name: string;
  dx_primary_group: string | null;
  claim_count: number;
  total_claimed: number;
  total_paid: number;
  total_gap: number;
  avg_gap: number;
  avg_cost_zscore: number | null;
  avg_payment_ratio: number | null;
};

export type TariffInsightParams = {
  province?: string | null;
  facility_id?: string | null;
  severity?: string | null;
  service_type?: string | null;
  dx_group?: string | null;
  limit?: number;
};

export async function fetchTariffInsight(
  params: TariffInsightParams,
): Promise<TariffInsightRow[]> {
  const { data } = await apiClient.get<{ data: TariffInsightRow[] }>(
    "/reports/tariff-insight",
    {
      params,
    },
  );
  return data.data;
}
