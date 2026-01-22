import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Thread {
  id: string;
  symptomSummary: string | null;
  symptomCategory?: string;
  phase: "intake" | "clarifying" | "tracking" | "insight_ready" | "designing" | "scheduling";
  status: "active" | "paused" | "completed";
  lastCheckinAt: string | null;
  checkinCount: number;
  createdAt: string;
  hasUnreadInsights?: boolean;
}

interface ThreadStore {
  threads: Thread[];
  activeThreadId: string | null;
  isLoading: boolean;
  error: string | null;
  setThreads: (threads: Thread[]) => void;
  setActiveThread: (threadId: string | null) => void;
  addThread: (thread: Thread) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  removeThread: (threadId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markInsightsRead: (threadId: string) => void;
}

export const useThreadStore = create<ThreadStore>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      isLoading: false,
      error: null,

      setThreads: (threads) => set({ threads }),

      setActiveThread: (threadId) => set({ activeThreadId: threadId }),

      addThread: (thread) =>
        set((state) => ({
          threads: [thread, ...state.threads],
          activeThreadId: thread.id,
        })),

      updateThread: (threadId, updates) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, ...updates } : thread
          ),
        })),

      removeThread: (threadId) =>
        set((state) => ({
          threads: state.threads.filter((thread) => thread.id !== threadId),
          activeThreadId:
            state.activeThreadId === threadId
              ? state.threads[0]?.id ?? null
              : state.activeThreadId,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      markInsightsRead: (threadId) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, hasUnreadInsights: false } : thread
          ),
        })),
    }),
    {
      name: "cadence-threads",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);

export const useActiveThread = () =>
  useThreadStore((state) => state.threads.find((thread) => thread.id === state.activeThreadId));

export const useThreadsByStatus = () => {
  const threads = useThreadStore((state) => state.threads);

  return {
    active: threads.filter((thread) => thread.status === "active"),
    paused: threads.filter((thread) => thread.status === "paused"),
    completed: threads.filter((thread) => thread.status === "completed"),
  };
};
