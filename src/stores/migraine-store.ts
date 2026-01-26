import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MigraineLog } from "@/types/migraine";

interface MigraineStore {
  logs: MigraineLog[];
  addLog: (log: Omit<MigraineLog, "id" | "createdAt">) => void;
  updateLog: (id: string, updates: Partial<MigraineLog>) => void;
  deleteLog: (id: string) => void;
  getLogsForWeek: () => MigraineLog[];
  getAverageSeverity: () => number;
  getTopTrigger: () => string | null;
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Sample data spanning the last 2 weeks
const generateSampleData = (): MigraineLog[] => {
  const now = new Date();
  const logs: MigraineLog[] = [];

  // Entry 1: 2 days ago, moderate
  const date1 = new Date(now);
  date1.setDate(date1.getDate() - 2);
  date1.setHours(14, 30, 0, 0);
  logs.push({
    id: generateId(),
    severity: 5,
    severityLabel: "moderate",
    startedAt: date1.toISOString(),
    timeOfDay: "afternoon",
    isOngoing: false,
    durationMinutes: 180,
    painLocations: ["left_temple", "left_eye"],
    triggers: ["stress", "screen_time"],
    medicationTaken: true,
    medications: [{ name: "Ibuprofen", takenAt: date1.toISOString() }],
    notes: "Started after long meeting",
    createdAt: date1.toISOString(),
  });

  // Entry 2: 4 days ago, severe
  const date2 = new Date(now);
  date2.setDate(date2.getDate() - 4);
  date2.setHours(7, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 8,
    severityLabel: "severe",
    startedAt: date2.toISOString(),
    timeOfDay: "morning",
    isOngoing: false,
    durationMinutes: 360,
    painLocations: ["left_frontal", "right_frontal", "occipital"],
    triggers: ["lack_of_sleep", "stress"],
    medicationTaken: true,
    medications: [
      { name: "Sumatriptan", takenAt: date2.toISOString() },
      { name: "Ibuprofen", takenAt: new Date(date2.getTime() + 3600000).toISOString() },
    ],
    notes: "Woke up with it, likely from poor sleep",
    createdAt: date2.toISOString(),
  });

  // Entry 3: 6 days ago, mild
  const date3 = new Date(now);
  date3.setDate(date3.getDate() - 6);
  date3.setHours(18, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 3,
    severityLabel: "mild",
    startedAt: date3.toISOString(),
    timeOfDay: "evening",
    isOngoing: false,
    durationMinutes: 90,
    painLocations: ["right_temple"],
    triggers: ["dehydration"],
    medicationTaken: false,
    medications: [],
    notes: null,
    createdAt: date3.toISOString(),
  });

  // Entry 4: 9 days ago, moderate
  const date4 = new Date(now);
  date4.setDate(date4.getDate() - 9);
  date4.setHours(22, 30, 0, 0);
  logs.push({
    id: generateId(),
    severity: 6,
    severityLabel: "moderate",
    startedAt: date4.toISOString(),
    timeOfDay: "evening",
    isOngoing: false,
    durationMinutes: 240,
    painLocations: ["left_frontal", "left_eye"],
    triggers: ["bright_light", "stress"],
    medicationTaken: true,
    medications: [{ name: "Acetaminophen", takenAt: date4.toISOString() }],
    notes: "After being outside without sunglasses",
    createdAt: date4.toISOString(),
  });

  // Entry 5: 11 days ago, severe
  const date5 = new Date(now);
  date5.setDate(date5.getDate() - 11);
  date5.setHours(3, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 7,
    severityLabel: "severe",
    startedAt: date5.toISOString(),
    timeOfDay: "night",
    isOngoing: false,
    durationMinutes: 480,
    painLocations: ["occipital", "cervical"],
    triggers: ["weather", "hormonal"],
    medicationTaken: true,
    medications: [{ name: "Sumatriptan", takenAt: date5.toISOString() }],
    notes: "Pressure change from storm",
    createdAt: date5.toISOString(),
  });

  // Entry 6: 13 days ago, mild
  const date6 = new Date(now);
  date6.setDate(date6.getDate() - 13);
  date6.setHours(10, 0, 0, 0);
  logs.push({
    id: generateId(),
    severity: 4,
    severityLabel: "mild",
    startedAt: date6.toISOString(),
    timeOfDay: "morning",
    isOngoing: false,
    durationMinutes: 120,
    painLocations: ["right_frontal"],
    triggers: ["skipped_meal", "caffeine"],
    medicationTaken: false,
    medications: [],
    notes: "Skipped breakfast, had extra coffee",
    createdAt: date6.toISOString(),
  });

  return logs;
};

export const useMigraineStore = create<MigraineStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: MigraineLog = {
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

      getAverageSeverity: () => {
        const logs = get().logs;
        if (logs.length === 0) return 0;
        const sum = logs.reduce((acc, log) => acc + log.severity, 0);
        return Math.round((sum / logs.length) * 10) / 10;
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
    }),
    {
      name: "cadence-migraine",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
