import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MoodLog } from "@/types/mood";

interface MoodStore {
  logs: MoodLog[];
  addLog: (log: Omit<MoodLog, "id" | "createdAt">) => void;
  updateLog: (id: string, updates: Partial<MoodLog>) => void;
  deleteLog: (id: string) => void;
  getLogsForWeek: () => MoodLog[];
  getLatestLog: () => MoodLog | null;
  getAverageEnergy: () => number;
  getAveragePositivity: () => number;
  getWeeklyTrend: () => { day: number; energy: number; positivity: number }[];
  getCurrentVibe: () => string;
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Sample data spanning the last 2 weeks
const generateSampleData = (): MoodLog[] => {
  const now = new Date();
  const logs: MoodLog[] = [];

  // Entry 1: Today morning, feeling good
  const date1 = new Date(now);
  date1.setHours(9, 0, 0, 0);
  logs.push({
    id: generateId(),
    energy: 0.4,
    positivity: 0.5,
    dominantMood: "Energized",
    emotions: ["content", "focused"],
    somaticSymptoms: [],
    triggers: [],
    selfCare: ["meditation", "exercise"],
    loggedAt: date1.toISOString(),
    createdAt: date1.toISOString(),
  });

  // Entry 2: Yesterday evening, anxious
  const date2 = new Date(now);
  date2.setDate(date2.getDate() - 1);
  date2.setHours(20, 0, 0, 0);
  logs.push({
    id: generateId(),
    energy: 0.6,
    positivity: -0.4,
    dominantMood: "Anxious",
    emotions: ["anxious", "overwhelmed"],
    somaticSymptoms: ["chest_tight", "stomach_butterflies"],
    triggers: ["work_stress", "poor_sleep"],
    selfCare: ["talked"],
    loggedAt: date2.toISOString(),
    createdAt: date2.toISOString(),
  });

  // Entry 3: 3 days ago, calm
  const date3 = new Date(now);
  date3.setDate(date3.getDate() - 3);
  date3.setHours(14, 0, 0, 0);
  logs.push({
    id: generateId(),
    energy: -0.3,
    positivity: 0.6,
    dominantMood: "Calm",
    emotions: ["grateful", "content"],
    somaticSymptoms: [],
    triggers: [],
    selfCare: ["journaled", "meditation"],
    loggedAt: date3.toISOString(),
    createdAt: date3.toISOString(),
  });

  // Entry 4: 5 days ago, low
  const date4 = new Date(now);
  date4.setDate(date4.getDate() - 5);
  date4.setHours(18, 0, 0, 0);
  logs.push({
    id: generateId(),
    energy: -0.7,
    positivity: -0.5,
    dominantMood: "Low",
    emotions: ["numb", "lonely", "foggy"],
    somaticSymptoms: ["chest_heavy", "back_heavy", "head_fog"],
    triggers: ["isolation", "weather"],
    selfCare: ["survived"],
    loggedAt: date4.toISOString(),
    createdAt: date4.toISOString(),
  });

  // Entry 5: 7 days ago, neutral
  const date5 = new Date(now);
  date5.setDate(date5.getDate() - 7);
  date5.setHours(11, 0, 0, 0);
  logs.push({
    id: generateId(),
    energy: 0.1,
    positivity: 0.2,
    dominantMood: "Neutral",
    emotions: ["focused"],
    somaticSymptoms: [],
    triggers: [],
    selfCare: ["exercise"],
    loggedAt: date5.toISOString(),
    createdAt: date5.toISOString(),
  });

  return logs;
};

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: MoodLog = {
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
        return get().logs.filter((log) => new Date(log.loggedAt) >= weekAgo);
      },

      getLatestLog: () => {
        const logs = get().logs;
        return logs.length > 0 ? logs[0] : null;
      },

      getAverageEnergy: () => {
        const weeklyLogs = get().getLogsForWeek();
        if (weeklyLogs.length === 0) return 0;
        const sum = weeklyLogs.reduce((acc, log) => acc + log.energy, 0);
        return sum / weeklyLogs.length;
      },

      getAveragePositivity: () => {
        const weeklyLogs = get().getLogsForWeek();
        if (weeklyLogs.length === 0) return 0;
        const sum = weeklyLogs.reduce((acc, log) => acc + log.positivity, 0);
        return sum / weeklyLogs.length;
      },

      getWeeklyTrend: () => {
        const logs = get().logs;
        const trend: { day: number; energy: number; positivity: number }[] = [];

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);

          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayLogs = logs.filter((log) => {
            const logDate = new Date(log.loggedAt);
            return logDate >= date && logDate < nextDate;
          });

          const avgEnergy = dayLogs.length > 0
            ? dayLogs.reduce((sum, l) => sum + l.energy, 0) / dayLogs.length
            : 0;
          const avgPositivity = dayLogs.length > 0
            ? dayLogs.reduce((sum, l) => sum + l.positivity, 0) / dayLogs.length
            : 0;

          trend.push({ day: 6 - i, energy: avgEnergy, positivity: avgPositivity });
        }

        return trend;
      },

      getCurrentVibe: () => {
        const latest = get().getLatestLog();
        if (!latest) return "Neutral";
        return latest.dominantMood;
      },
    }),
    {
      name: "cadence-mood",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
