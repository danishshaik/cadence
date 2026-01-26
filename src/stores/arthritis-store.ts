import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArthritisLog,
  JointLocationId,
  ActivityTypeId,
  ManagementMethodId,
  WeatherConfirmationId,
  getStiffnessLabel,
} from "@/types/arthritis";

interface ArthritisStore {
  logs: ArthritisLog[];

  // CRUD
  addLog: (log: Omit<ArthritisLog, "id" | "createdAt" | "stiffnessLabel">) => void;
  updateLog: (id: string, updates: Partial<ArthritisLog>) => void;
  deleteLog: (id: string) => void;

  // Queries
  getLogsForWeek: () => ArthritisLog[];
  getLogsForDays: (days: number) => ArthritisLog[];

  // Analytics
  getAverageStiffness: () => number;
  getWeeklyTrend: () => "improving" | "stable" | "worsening";
  getMostAffectedJoints: (limit?: number) => { id: JointLocationId; count: number }[];
  getTopManagementMethods: (limit?: number) => { id: ManagementMethodId; count: number }[];
  getWeatherCorrelation: () => { weatherAffected: number; total: number; percentage: number };
  getMobilityStatus: () => "good" | "moderate" | "poor";
  getDaysWithGoodMobility: (days: number) => number;
  getDailyStiffness: (days: number) => { day: string; stiffness: number | null }[];
}

// Generate sample data for testing
function generateSampleData(): ArthritisLog[] {
  const now = new Date();
  const logs: ArthritisLog[] = [];

  const jointOptions: JointLocationId[] = ["knee_left", "knee_right", "lumbar_spine", "hip_left", "wrist_right"];
  const activityOptions: ActivityTypeId[] = ["sedentary", "gym_heavy", "yoga_stretch", "cardio"];
  const managementOptions: ManagementMethodId[] = ["heat", "ice", "nsaids", "topical", "rest"];
  const weatherOptions: WeatherConfirmationId[] = ["yes", "no", "cold"];
  const pressureOptions: ArthritisLog["barometricPressure"][] = ["rising", "falling", "stable"];

  for (let i = 13; i >= 0; i--) {
    // 60% chance of logging on each day
    if (Math.random() > 0.6) continue;

    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(Math.floor(Math.random() * 12) + 7);

    const stiffness = Math.floor(Math.random() * 6) + 2; // 2-7 range mostly
    const isMorning = date.getHours() < 10;

    logs.push({
      id: `sample-arthritis-${i}`,
      createdAt: date.toISOString(),
      stiffness,
      stiffnessLabel: getStiffnessLabel(stiffness),
      morningStiffness: isMorning && stiffness > 4,
      affectedJoints: jointOptions.filter(() => Math.random() > 0.6).slice(0, 3),
      bilateralSymmetry: Math.random() > 0.7,
      barometricPressure: pressureOptions[Math.floor(Math.random() * pressureOptions.length)],
      temperature: Math.floor(Math.random() * 30) + 40,
      humidity: Math.floor(Math.random() * 50) + 30,
      weatherConfirmation: stiffness > 5 ? weatherOptions[Math.floor(Math.random() * weatherOptions.length)] : "no",
      activities: activityOptions.filter(() => Math.random() > 0.6).slice(0, 2),
      managementMethods: stiffness > 4 ? managementOptions.filter(() => Math.random() > 0.5).slice(0, 3) : [],
    });
  }

  return logs;
}

export const useArthritisStore = create<ArthritisStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: ArthritisLog = {
          ...logData,
          id: `arthritis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          stiffnessLabel: getStiffnessLabel(logData.stiffness),
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
                  stiffnessLabel:
                    updates.stiffness !== undefined
                      ? getStiffnessLabel(updates.stiffness)
                      : log.stiffnessLabel,
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

      getAverageStiffness: () => {
        const weekLogs = get().getLogsForWeek();
        if (weekLogs.length === 0) return 0;
        const sum = weekLogs.reduce((acc, log) => acc + log.stiffness, 0);
        return Math.round((sum / weekLogs.length) * 10) / 10;
      },

      getWeeklyTrend: () => {
        const logs = get().logs.slice(0, 14);
        if (logs.length < 4) return "stable";

        const recent = logs.slice(0, Math.floor(logs.length / 2));
        const older = logs.slice(Math.floor(logs.length / 2));

        const recentAvg = recent.reduce((a, l) => a + l.stiffness, 0) / recent.length;
        const olderAvg = older.reduce((a, l) => a + l.stiffness, 0) / older.length;

        const diff = recentAvg - olderAvg;
        if (diff < -1) return "improving"; // Lower stiffness = better
        if (diff > 1) return "worsening";
        return "stable";
      },

      getMostAffectedJoints: (limit = 3) => {
        const weekLogs = get().getLogsForWeek();
        const jointCounts: Record<string, number> = {};

        weekLogs.forEach((log) => {
          log.affectedJoints.forEach((joint) => {
            jointCounts[joint] = (jointCounts[joint] || 0) + 1;
          });
        });

        return Object.entries(jointCounts)
          .map(([id, count]) => ({ id: id as JointLocationId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getTopManagementMethods: (limit = 3) => {
        const weekLogs = get().getLogsForWeek();
        const methodCounts: Record<string, number> = {};

        weekLogs.forEach((log) => {
          log.managementMethods.forEach((method) => {
            methodCounts[method] = (methodCounts[method] || 0) + 1;
          });
        });

        return Object.entries(methodCounts)
          .map(([id, count]) => ({ id: id as ManagementMethodId, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      },

      getWeatherCorrelation: () => {
        const weekLogs = get().getLogsForWeek();
        const total = weekLogs.length;
        const weatherAffected = weekLogs.filter(
          (log) => log.weatherConfirmation === "yes" || log.weatherConfirmation === "cold"
        ).length;

        return {
          weatherAffected,
          total,
          percentage: total > 0 ? Math.round((weatherAffected / total) * 100) : 0,
        };
      },

      getMobilityStatus: () => {
        const avgStiffness = get().getAverageStiffness();
        if (avgStiffness <= 3) return "good";
        if (avgStiffness <= 6) return "moderate";
        return "poor";
      },

      getDaysWithGoodMobility: (days) => {
        const logs = get().getLogsForDays(days);
        return logs.filter((log) => log.stiffness <= 3).length;
      },

      getDailyStiffness: (days) => {
        const result: { day: string; stiffness: number | null }[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

          const dayLogs = get().logs.filter(
            (log) => log.createdAt.split("T")[0] === dateStr
          );

          const stiffness =
            dayLogs.length > 0
              ? dayLogs.reduce((sum, log) => sum + log.stiffness, 0) / dayLogs.length
              : null;

          result.push({ day: dayName, stiffness });
        }

        return result;
      },
    }),
    {
      name: "cadence-arthritis",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
