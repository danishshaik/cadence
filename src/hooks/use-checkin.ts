import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cadenceApi } from "@services/api";
import { useThreadStore } from "@stores/thread-store";
import { threadKeys } from "./use-threads";
import type { CheckinRequest, CheckinResponse } from "@/types/api";

interface UseCheckinReturn {
  submitCheckin: (answers: Record<string, unknown>) => Promise<CheckinResponse>;
  isSubmitting: boolean;
  error: Error | null;
  lastResponse: CheckinResponse | null;
}

export function useCheckin(threadId: string | null): UseCheckinReturn {
  const queryClient = useQueryClient();
  const updateThread = useThreadStore((state) => state.updateThread);

  const mutation = useMutation({
    mutationFn: async (answers: Record<string, unknown>) => {
      if (!threadId) {
        throw new Error("No thread ID");
      }
      const data: CheckinRequest = { threadId, answers };
      return cadenceApi.submitCheckin(data);
    },
    onSuccess: (response) => {
      if (!threadId) return;

      updateThread(threadId, {
        checkinCount: response.checkinCount,
        lastCheckinAt: new Date().toISOString(),
      });

      if (response.insightsReady) {
        updateThread(threadId, {
          phase: "insight_ready",
          hasUnreadInsights: true,
        });
      }

      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });

  return {
    submitCheckin: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error as Error | null,
    lastResponse: mutation.data ?? null,
  };
}
