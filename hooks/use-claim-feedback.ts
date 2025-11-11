"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitClaimFeedback,
  type ClaimFeedbackPayload,
} from "@/lib/services/claims";

export function useClaimFeedback(claimId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClaimFeedbackPayload) =>
      submitClaimFeedback(claimId as string, payload),
    onSuccess: () => {
      if (claimId) {
        queryClient.invalidateQueries({ queryKey: ["claim-summary", claimId] });
      }
    },
  });
}
