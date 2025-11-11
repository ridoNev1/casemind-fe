import { apiClient } from "@/lib/api-client";

export type HighRiskClaim = {
  claim_id: string;
  facility_id: string | null;
  facility_name: string | null;
  facility_class: string | null;
  service_type: string | null;
  severity_group: string | null;
  province_name: string | null;
  dx_primary_code: string | null;
  dx_primary_label: string | null;
  dx_primary_group?: string | null | undefined;
  amount_claimed: number;
  amount_paid: number;
  amount_gap: number;
  los: number;
  risk_score: number;
  rule_score: number;
  ml_score: number;
  ml_score_normalized: number;
  flags: string[];
  duplicate_pattern?: boolean;
  peer?: {
    mean?: number;
    p90?: number;
  };
  model_version?: string;
  ruleset_version?: string;
  discharge_dt?: string;
  admit_dt?: string;
  latest_feedback?: Record<string, unknown> | null;
};

export type HighRiskMeta = {
  total: number;
  page: number;
  page_size: number;
  model_version: string;
  ruleset_version: string;
  filters?: Record<string, unknown>;
};

export type HighRiskResponse = {
  data: HighRiskClaim[];
  meta: HighRiskMeta;
};

export type HighRiskFilters = {
  page?: number;
  page_size?: number;
  severity?: string;
  service_type?: string;
  facility_class?: string;
  start_date?: string;
  end_date?: string;
  discharge_start?: string;
  discharge_end?: string;
  min_risk_score?: number;
  max_risk_score?: number;
  min_ml_score?: number;
  province?: string;
  dx?: string;
  limit?: number;
  refresh_cache?: boolean;
};

export type ClaimSummarySection = {
  title: string;
  content: string;
};

export type ClaimSummary = {
  claim_id: string;
  generated_at: string;
  model_version: string;
  ruleset_version: string;
  risk_score: number;
  rule_score: number | null;
  ml_score: number | null;
  ml_score_normalized: number | null;
  bpjs_payment_ratio: number | null;
  flags: string[];
  sections: ClaimSummarySection[];
  narrative: string;
  generative_summary: string | null;
  follow_up_questions: string[];
  llm: Record<string, unknown>;
  peer: {
    key: string;
    p90: number | null;
    cost_zscore: number | null;
  };
  claim: {
    dx_primary_code: string | null;
    dx_primary_label: string | null;
    severity_group: string | null;
    service_type: string | null;
    facility_class: string | null;
    province_name: string | null;
    los: number | null;
    amount_claimed: number | null;
    amount_paid: number | null;
    amount_gap: number | null;
  };
  latest_feedback?: Record<string, unknown> | null;
};

export type ClaimChatMessage = {
  id: string;
  claim_id: string;
  sender: string;
  role: "user" | "assistant" | string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string | null;
};

export type ClaimFeedbackPayload = {
  decision: "approved" | "partial" | "rejected";
  correction_ratio?: number | null;
  notes?: string;
};

export type ClaimFeedbackResponse = {
  data: {
    id: string;
    claim_id: string;
    decision: string;
    correction_ratio: number | null;
    notes: string | null;
    reviewer_id: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
};

export async function fetchHighRiskClaims(
  filters: HighRiskFilters
): Promise<HighRiskResponse> {
  const params = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
    ...filters,
  };

  const { data } = await apiClient.get<HighRiskResponse>("/claims/high-risk", {
    params,
  });

  return data;
}

export async function fetchClaimSummary(
  claimId: string
): Promise<ClaimSummary> {
  const { data } = await apiClient.get<{ data: ClaimSummary }>(
    `/claims/${claimId}/summary`
  );
  return data.data;
}

export async function fetchClaimChat(
  claimId: string
): Promise<ClaimChatMessage[]> {
  const { data } = await apiClient.get<{ data: ClaimChatMessage[] }>(
    `/claims/${claimId}/chat`
  );
  return data.data;
}

export async function postClaimChatMessage(
  claimId: string,
  message: string
): Promise<ClaimChatMessage> {
  const { data } = await apiClient.post<{
    data: { user_message: ClaimChatMessage; bot_message?: ClaimChatMessage };
  }>(`/claims/${claimId}/chat`, { message });
  // Return bot message if exists, otherwise user message to simplify append logic
  return data.data.bot_message ?? data.data.user_message;
}

export async function submitClaimFeedback(
  claimId: string,
  payload: ClaimFeedbackPayload
) {
  const { data } = await apiClient.post<ClaimFeedbackResponse>(
    `/claims/${claimId}/feedback`,
    payload
  );
  return data.data;
}
