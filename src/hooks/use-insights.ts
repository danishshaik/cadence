import { useQuery } from "@tanstack/react-query";
import { cadenceApi } from "@services/api";
import { useThreadStore } from "@stores/thread-store";
import type { InsightsResponse } from "@/types/api";

export const insightKeys = {
  all: ["insights"] as const,
  thread: (threadId: string) => [...insightKeys.all, threadId] as const,
};

export function useInsights(threadId: string | null) {
  const markInsightsRead = useThreadStore((state) => state.markInsightsRead);

  return useQuery({
    queryKey: insightKeys.thread(threadId ?? ""),
    queryFn: async (): Promise<InsightsResponse> => {
      if (!threadId) throw new Error("No thread ID");
      const data = await cadenceApi.getInsights(threadId);

      if (data.ready && data.insights) {
        markInsightsRead(threadId);
      }

      return data;
    },
    enabled: !!threadId,
    staleTime: 1000 * 60 * 5,
  });
}
