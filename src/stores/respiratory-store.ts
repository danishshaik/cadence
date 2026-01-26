import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RespiratoryLog,
  RespiratorySymptomId,
  RespiratoryTriggerId,
  RespiratoryMedicationId,
  ImpactLevelId,
  getBreathingLabel,
  RESPIRATORY_SYMPTOMS,
  RESPIRATORY_TRIGGERS,
} from "@/types/respiratory";

interface RespiratoryStore {
  logs: RespiratoryLog[];

  // CRUD
  addLog: (log: Omit<RespiratoryLog, "id" | "createdAt" | "constrictionLabel">) => void;
  updateLog: (id: string, updates: Partial<RespiratoryLog>) => void;
  deleteLog: (id: string) => void;

  // Queries
  getLogsForWeek: () => RespiratoryLog[];
  getLogsForDays: (days: number) => RespiratoryLog[];

  // Analytics
  getAverageConstriction: () => number;
  getWeeklyTrend: () => "improving" | "stable" | "worsening";
  getTotalRescuePuffs: (days: number) => number;
  getDailyRescuePuffs: (days: number) => { day: string; puffs: number }[];
  getTopTriggers: (limit?: number) => { id: RespiratoryTriggerId; count: number }[];
  getTopSymptoms: (limit?: number) => { id: RespiratorySymptomId; count: number }[];
  getControlStatus: () => "well-controlled" | "partially-controlled" | "uncontrolled";
}

// Generate sample data for testing
function generateSampleData(): RespiratoryLog[] {
  const now = new Date();
  const logs: RespiratoryLog[] = [];

  const symptomOptions: RespiratorySymptomId[] = ["wheezing", "dry_cough", "runny_nose", "itchy_eyes"];
  const triggerOptions: RespiratoryTriggerId[] = ["pollen", "dust", "cold_air", "exercise"];
  const impactOptions: ImpactLevelId[] = ["none", "mild", "moderate"];
  const medOptions: RespiratoryMedicationId[] = ["controller_meds", "antihistamine"];

  for (let i = 13; i >= 0; i--) {
    // 60% chance of logging on each day
    if (Math.random() > 0.6) continue;

    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 8);

    const constriction = Math.floor(Math.random() * 5) + 2; // 2-6 range mostly
    const rescuePuffs = constriction > 5 ? Math.floor(Math.random() * 3) + 1 : 0;

    logs.push({
      id: `sample-respiratory-${i}`,
      createdAt: date.toISOString(),
      constriction,
      constrictionLabel: getBreathingLabel(constriction),
      symptoms: symptomOptions.filter(() => Math.random() > 0.6).slice(0, 2),
      triggers: triggerOptions.filter(() => Math.random() > 0.7).slice(0, 2),
      impact: impactOptions[Math.floor(Math.random() * impactOptions.length)],
      rescueInhalerPuffs: rescuePuffs,
      medications: rescuePuffs > 0 ? ["rescue_inhaler", ...medOptions.filter(() => Math.random() > 0.5)] : medOptions.filter(() => Math.random() > 0.6),
    });
  }

  return logs;
}

export const useRespiratoryStore = create<RespiratoryStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: RespiratoryLog = {
          ...logData,
          id: `respiratory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          constrictionLabel: getBreathingLabel(logData.constriction),
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
                  constrictionLabel:
                    updates.constriction !== undefined
                      ? getBreathingLabel(updates.constriction)
                      : log.constrictionLabel,
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

      getAverageConstriction: () => {
        const weekLogs = get().getLogsForWeek();
        if (weekLogs.length === 0) return 0;
        const sum = weekLogs.reduce((acc, log) => acc + log.constriction, 0);
        return Math.round((sum / weekLogs.length) * 10) / 10;
      },

      getWeeklyTrend: () => {
        const logs = get().logs.slice(0, 14);
        if (logs.length < 4) return "stable";

        const recent = logs.slice(0, Math.floor(logs.length / 2));
        const older = logs.slice(Math.floor(logs.length / 2));

        const recentAvg = recent.reduce((a, l) => a + l.constriction, 0) / recent.length;
        const olderAvg = older.reduce((a, l) => a + l.constriction, 0) / older.length;

        const diff = recentAvg - olderAvg;
        if (diff < -1) return "improving";
        if (diff > 1) return "worsening";
        return "stable";
      },

      getTotalRescuePuffs: (days) => {
        const logs = get().getLogsForDays(days);
        return logs.reduce((sum, log) => sum + log.rescueInhalerPuffs, 0);
      },

      getDailyRescuePuffs: (days) => {
        const result: { day: string; puffs: number }[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          const dayLogs = get().logs.filter(
            (log) => log.createdAt.split("T")[0] === dateStr
          );
          const puffs = dayLogs.reduce((sum, log) => sum + log.rescueInhalerPuffs, 0);

          result.push({ day: dayName, puffs });
        }

        return result;
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
          .map(([id, count]) => ({ id: id as RespiratoryTriggerId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getTopSymptoms: (limit = 3) => {
        const weekLogs = get().getLogsForWeek();
        const symptomCounts: Record<string, number> = {};

        weekLogs.forEach((log) => {
          log.symptoms.forEach((symptom) => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          });
        });

        return Object.entries(symptomCounts)
          .map(([id, count]) => ({ id: id as RespiratorySymptomId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getControlStatus: () => {
        const weekLogs = get().getLogsForWeek();
        if (weekLogs.length === 0) return "well-controlled";

        const rescueCount = weekLogs.filter((log) => log.rescueInhalerPuffs > 0).length;
        const severeCount = weekLogs.filter((log) => log.impact === "severe" || log.impact === "moderate").length;

        if (rescueCount > 4 || severeCount > 1) return "uncontrolled";
        if (rescueCount > 2 || severeCount > 0) return "partially-controlled";
        return "well-controlled";
      },
    }),
    {
      name: "cadence-respiratory",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
