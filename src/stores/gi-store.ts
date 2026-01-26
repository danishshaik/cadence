import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GILog, SymptomId, TriggerId, BristolType } from "@/types/gi";

interface GIStore {
  logs: GILog[];
  addLog: (log: Omit<GILog, "id" | "createdAt">) => void;
  updateLog: (id: string, updates: Partial<GILog>) => void;
  deleteLog: (id: string) => void;
  getLogsForWeek: () => GILog[];
  getLatestLog: () => GILog | null;
  getDaysSinceLastFlareUp: () => number;
  getWeeklyTrend: () => { day: number; severity: number }[];
  getTopTrigger: () => string | null;
  isFlareUp: () => boolean;
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Sample data spanning the last 2 weeks
const generateSampleData = (): GILog[] => {
  const now = new Date();
  const logs: GILog[] = [];

  // Entry 1: 1 day ago, mild bloating
  const date1 = new Date(now);
  date1.setDate(date1.getDate() - 1);
  date1.setHours(19, 30, 0, 0);
  logs.push({
    id: generateId(),
    severity: 3,
    severityLabel: "mild",
    startedAt: date1.toISOString(),
    context: "1_2_hours_after",
    painLocations: ["upper_abdomen"],
    symptoms: ["bloating", "gas"],
    bowelMovement: "type4",
    triggers: ["dairy"],
    notes: "Had ice cream after dinner",
    createdAt: date1.toISOString(),
  });

  // Entry 2: 3 days ago, moderate cramping
  const date2 = new Date(now);
  date2.setDate(date2.getDate() - 3);
  date2.setHours(8, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 6,
    severityLabel: "moderate",
    startedAt: date2.toISOString(),
    context: "upon_waking",
    painLocations: ["lower_left", "navel"],
    symptoms: ["cramping", "constipation"],
    bowelMovement: "type2",
    triggers: ["stress", "fiber"],
    notes: "Stressful week at work",
    createdAt: date2.toISOString(),
  });

  // Entry 3: 5 days ago, mild
  const date3 = new Date(now);
  date3.setDate(date3.getDate() - 5);
  date3.setHours(13, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 2,
    severityLabel: "mild",
    startedAt: date3.toISOString(),
    context: "immediately_after_eating",
    painLocations: ["upper_abdomen"],
    symptoms: ["heartburn"],
    bowelMovement: "type4",
    triggers: ["spicy", "caffeine"],
    notes: null,
    createdAt: date3.toISOString(),
  });

  // Entry 4: 8 days ago, severe flare-up
  const date4 = new Date(now);
  date4.setDate(date4.getDate() - 8);
  date4.setHours(22, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 8,
    severityLabel: "severe",
    startedAt: date4.toISOString(),
    context: "1_2_hours_after",
    painLocations: ["generalized"],
    symptoms: ["cramping", "nausea", "diarrhea"],
    bowelMovement: "type6",
    triggers: ["gluten", "stress"],
    notes: "Ate pasta at restaurant, very bad reaction",
    createdAt: date4.toISOString(),
  });

  // Entry 5: 10 days ago, moderate
  const date5 = new Date(now);
  date5.setDate(date5.getDate() - 10);
  date5.setHours(7, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 5,
    severityLabel: "moderate",
    startedAt: date5.toISOString(),
    context: "upon_waking",
    painLocations: ["lower_right"],
    symptoms: ["bloating", "gas", "constipation"],
    bowelMovement: "type1",
    triggers: ["fiber"],
    notes: null,
    createdAt: date5.toISOString(),
  });

  return logs;
};

export const useGIStore = create<GIStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: GILog = {
          ...logData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
      },

      updateLog: (id, updates) => {
        set((state) => ({
          logs: state.logs.map((log) => (log.id === id ? { ...log, ...updates } : log)),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        }));
      },

      getLogsForWeek: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return get().logs.filter((log) => new Date(log.startedAt) >= weekAgo);
      },

      getLatestLog: () => {
        const logs = get().logs;
        return logs.length > 0 ? logs[0] : null;
      },

      getDaysSinceLastFlareUp: () => {
        const logs = get().logs;
        const flareUps = logs.filter((log) => log.severity >= 6);
        if (flareUps.length === 0) return 30; // No flare-ups in history

        const lastFlareUp = new Date(flareUps[0].startedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastFlareUp.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
      },

      getWeeklyTrend: () => {
        const logs = get().logs;
        const trend: { day: number; severity: number }[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayLogs = logs.filter((log) => {
            const logDate = new Date(log.startedAt);
            return logDate >= date && logDate < nextDate;
          });

          const maxSeverity = dayLogs.length > 0
            ? Math.max(...dayLogs.map((l) => l.severity))
            : 0;

          trend.push({ day: 6 - i, severity: maxSeverity });
        }

        return trend;
      },

      getTopTrigger: () => {
        const logs = get().logs;
        if (logs.length === 0) return null;

        const triggerCounts: Record<string, number> = {};
        logs.forEach((log) => {
          log.triggers.forEach((trigger) => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
          });
        });

        const sorted = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
      },

      isFlareUp: () => {
        const latest = get().getLatestLog();
        if (!latest) return false;

        // Check if latest log is within last 24 hours and severity >= 6
        const logDate = new Date(latest.startedAt);
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);

        return logDate >= dayAgo && latest.severity >= 6;
      },
    }),
    {
      name: "cadence-gi",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
