"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchClaimChat,
  postClaimChatMessage,
  type ClaimChatMessage,
} from "@/lib/services/claims";

export function useClaimChat(claimId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery<ClaimChatMessage[]>({
    queryKey: ["claim-chat", claimId],
    queryFn: () => fetchClaimChat(claimId as string),
    enabled: Boolean(claimId),
    staleTime: 1000 * 5,
  });

  const mutation = useMutation({
    mutationFn: (message: string) => postClaimChatMessage(claimId as string, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claim-chat", claimId] });
    },
  });

  return {
    ...query,
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}
