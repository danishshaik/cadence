import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cadenceApi } from "@services/api";
import { useThreadStore } from "@stores/thread-store";
import type { Thread } from "@/types/api";

export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  list: (status?: string) => [...threadKeys.lists(), { status }] as const,
  details: () => [...threadKeys.all, "detail"] as const,
  detail: (id: string) => [...threadKeys.details(), id] as const,
};

export function useThreads(status?: "active" | "paused" | "completed") {
  const setThreads = useThreadStore((state) => state.setThreads);

  return useQuery({
    queryKey: threadKeys.list(status),
    queryFn: async () => {
      const data = await cadenceApi.getThreads(status);
      setThreads(data.threads.map(threadToStoreThread));
      return data.threads;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useThread(threadId: string | null) {
  const updateThread = useThreadStore((state) => state.updateThread);

  return useQuery({
    queryKey: threadKeys.detail(threadId ?? ""),
    queryFn: async () => {
      if (!threadId) throw new Error("No thread ID");
      const data = await cadenceApi.getThread(threadId);
      const lastCheckinAt = data.checkins.length
        ? data.checkins[data.checkins.length - 1].loggedAt
        : null;

      updateThread(threadId, {
        symptomSummary: data.symptomSummary,
        symptomCategory: data.symptomCategory ?? undefined,
        phase: data.phase,
        status: data.status,
        checkinCount: data.checkins.length,
        lastCheckinAt,
      });

      return data;
    },
    enabled: !!threadId,
  });
}

export function useRefreshThreads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

function threadToStoreThread(thread: Thread) {
  return {
    id: thread.id,
    symptomSummary: thread.symptomSummary,
    symptomCategory: thread.symptomCategory ?? undefined,
    phase: thread.phase,
    status: thread.status,
    lastCheckinAt: thread.lastCheckinAt,
    checkinCount: 0,
    createdAt: thread.createdAt,
  };
}
