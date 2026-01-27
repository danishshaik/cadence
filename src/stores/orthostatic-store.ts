import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrthostaticLog } from "@/types/orthostatic";

interface OrthostaticStore {
  logs: OrthostaticLog[];
  addLog: (log: Omit<OrthostaticLog, "id" | "createdAt">) => void;
  updateLog: (id: string, updates: Partial<OrthostaticLog>) => void;
  deleteLog: (id: string) => void;
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const generateSampleData = (): OrthostaticLog[] => {
  const now = new Date();
  const logs: OrthostaticLog[] = [];

  const addLog = (offsetDays: number, severity: number, seconds: number, minutes: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - offsetDays);
    date.setHours(8 + offsetDays, 15, 0, 0);
    logs.push({
      id: generateId(),
      severity,
      durationSeconds: seconds,
      durationMinutes: minutes,
      symptoms: severity >= 7 ? ["eyes", "ears"] : ["eyes"],
      positionBeforeStanding: offsetDays % 2 === 0 ? "supine" : "sitting",
      sedentaryDuration: offsetDays % 3 === 0 ? "one_hour_plus" : "under_10_min",
      hydrationFactors: offsetDays % 2 === 0 ? ["dehydrated"] : [],
      createdAt: date.toISOString(),
    });
  };

  addLog(1, 4, 12, 0);
  addLog(3, 6, 18, 0);
  addLog(5, 7, 30, 1);
  addLog(8, 3, 9, 0);
  addLog(11, 8, 20, 2);

  return logs;
};

export const useOrthostaticStore = create<OrthostaticStore>()(
  persist(
    (set) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: OrthostaticLog = {
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
    }),
    {
      name: "cadence-orthostatic",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);
