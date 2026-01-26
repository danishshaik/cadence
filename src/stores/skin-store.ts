import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SkinLog,
  BreakoutTypeId,
  SkinTriggerId,
  RoutineStepId,
  TreatmentActiveId,
  SpotTreatmentId,
  RoutineTime,
  getSeverityLabel,
} from "@/types/skin";

interface SkinStore {
  logs: SkinLog[];

  // CRUD
  addLog: (log: Omit<SkinLog, "id" | "createdAt" | "severityLabel">) => void;
  updateLog: (id: string, updates: Partial<SkinLog>) => void;
  deleteLog: (id: string) => void;

  // Queries
  getLogsForWeek: () => SkinLog[];
  getLogsForDays: (days: number) => SkinLog[];

  // Analytics
  getAverageSeverity: () => number;
  getWeeklyTrend: () => "improving" | "stable" | "worsening";
  getConsistencyStreak: () => number;
  getTopTriggers: (limit?: number) => { id: SkinTriggerId; count: number }[];
  getCommonBreakoutTypes: () => { id: BreakoutTypeId; count: number }[];
  getRoutineAdherence: () => number; // percentage

  // Get previous photo for ghost overlay
  getPreviousPhotoUri: () => string | undefined;
}

// Generate sample data for testing
function generateSampleData(): SkinLog[] {
  const now = new Date();
  const logs: SkinLog[] = [];

  const breakoutOptions: BreakoutTypeId[] = ["whitehead", "papule", "blackhead", "cystic"];
  const triggerOptions: SkinTriggerId[] = ["stress", "poor_sleep", "dairy_sugar", "cycle"];
  const routineOptions: RoutineStepId[] = ["cleanser", "moisturizer", "spf", "treatment"];
  const activeOptions: TreatmentActiveId[] = ["retinol", "salicylic", "niacinamide"];

  for (let i = 13; i >= 0; i--) {
    // 50% chance of logging on each day
    if (Math.random() > 0.5) continue;

    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(Math.random() > 0.5 ? 8 : 21); // AM or PM

    const severity = Math.floor(Math.random() * 6) + 2; // 2-7 range
    const routineTime: RoutineTime = date.getHours() < 12 ? "am" : "pm";

    logs.push({
      id: `sample-skin-${i}`,
      createdAt: date.toISOString(),
      breakoutTypes: breakoutOptions
        .filter(() => Math.random() > 0.6)
        .slice(0, 2) as BreakoutTypeId[],
      severity,
      severityLabel: getSeverityLabel(severity),
      triggers: triggerOptions
        .filter(() => Math.random() > 0.7)
        .slice(0, 2) as SkinTriggerId[],
      routineTime,
      routineSteps: routineOptions.filter(() => Math.random() > 0.3) as RoutineStepId[],
      treatmentActives: activeOptions.filter(() => Math.random() > 0.7) as TreatmentActiveId[],
      spotTreatments: Math.random() > 0.7 ? ["pimple_patch"] : [],
    });
  }

  return logs;
}

export const useSkinStore = create<SkinStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: SkinLog = {
          ...logData,
          id: `skin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          severityLabel: getSeverityLabel(logData.severity),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
      },

      updateLog: (id, updates) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id
              ? {
                  ...log,
                  ...updates,
                  severityLabel:
                    updates.severity !== undefined
                      ? getSeverityLabel(updates.severity)
                      : log.severityLabel,
                }
              : log
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter((log) => log.id !== id) }));
      },

      getLogsForWeek: () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return get().logs.filter((log) => new Date(log.createdAt) >= weekAgo);
      },

      getLogsForDays: (days) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return get().logs.filter((log) => new Date(log.createdAt) >= cutoff);
      },

      getAverageSeverity: () => {
        const weekLogs = get().getLogsForWeek();
        if (weekLogs.length === 0) return 0;
        const sum = weekLogs.reduce((acc, log) => acc + log.severity, 0);
        return Math.round((sum / weekLogs.length) * 10) / 10;
      },

      getWeeklyTrend: () => {
        const logs = get().logs.slice(0, 14); // Last 2 weeks of logs
        if (logs.length < 4) return "stable";

        const recent = logs.slice(0, Math.floor(logs.length / 2));
        const older = logs.slice(Math.floor(logs.length / 2));

        const recentAvg = recent.reduce((a, l) => a + l.severity, 0) / recent.length;
        const olderAvg = older.reduce((a, l) => a + l.severity, 0) / older.length;

        const diff = recentAvg - olderAvg;
        if (diff < -1) return "improving";
        if (diff > 1) return "worsening";
        return "stable";
      },

      getConsistencyStreak: () => {
        const logs = get().logs;
        if (logs.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dateStr = checkDate.toISOString().split("T")[0];

          const hasLog = logs.some((log) => log.createdAt.split("T")[0] === dateStr);

          if (hasLog) {
            streak++;
          } else if (i > 0) {
            // Allow today to be missing, but break on any other missing day
            break;
          }
        }

        return streak;
      },

      getTopTriggers: (limit = 3) => {
        const weekLogs = get().getLogsForWeek();
        const triggerCounts: Record<string, number> = {};

        weekLogs.forEach((log) => {
          log.triggers.forEach((trigger) => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
          });
        });

        return Object.entries(triggerCounts)
          .map(([id, count]) => ({ id: id as SkinTriggerId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getCommonBreakoutTypes: () => {
        const weekLogs = get().getLogsForWeek();
        const typeCounts: Record<string, number> = {};

        weekLogs.forEach((log) => {
          log.breakoutTypes.forEach((type) => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
          });
        });

        return Object.entries(typeCounts)
          .map(([id, count]) => ({ id: id as BreakoutTypeId, count }))
          .sort((a, b) => b.count - a.count);
      },

      getRoutineAdherence: () => {
        const weekLogs = get().getLogsForWeek();
        if (weekLogs.length === 0) return 0;

        // Count logs with at least 3 routine steps completed
        const adherentLogs = weekLogs.filter((log) => log.routineSteps.length >= 3);
        return Math.round((adherentLogs.length / weekLogs.length) * 100);
      },

      getPreviousPhotoUri: () => {
        const logsWithPhotos = get().logs.filter((log) => log.photoUri);
        return logsWithPhotos[0]?.photoUri;
      },
    }),
    {
      name: "cadence-skin",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
