import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CongestionLog,
  CoughCharacterId,
  CongestionSourceId,
  PhlegmColorId,
  ReliefMeasureId,
  getSleepLabel,
} from "@/types/congestion";

interface CongestionStore {
  logs: CongestionLog[];
  addLog: (log: Omit<CongestionLog, "id" | "createdAt" | "sleepLabel">) => void;
  updateLog: (id: string, updates: Partial<CongestionLog>) => void;
  deleteLog: (id: string) => void;
  getLatestLog: () => CongestionLog | null;
  getWetDryTrend: (days?: number) => { day: string; type: "dry" | "productive" | "none" }[];
  getRestQualityLabel: () => "Good" | "Fair" | "Poor";
}

const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const generateSampleData = (): CongestionLog[] => {
  const now = new Date();
  const logs: CongestionLog[] = [];

  const coughOptions: CoughCharacterId[] = ["dry", "barking", "wet", "productive"];
  const reliefOptions: ReliefMeasureId[] = ["tea", "steam", "lozenge", "propped", "chest_rub"];
  const sourceOptions: CongestionSourceId[] = ["head", "throat", "bronchi", "deep_lungs"];
  const phlegmOptions: PhlegmColorId[] = ["clear", "yellow", "green"];

  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(9 + i, 0, 0, 0);

    const sleepQuality = Math.max(0, Math.min(3, i === 0 ? 1 : Math.floor(Math.random() * 4)));
    const isProductive = Math.random() > 0.5;
    const coughCharacters: CoughCharacterId[] = isProductive
      ? ["productive", "wet"]
      : [coughOptions[Math.floor(Math.random() * 2)]];
    const wokeDuringNight = sleepQuality > 1 || Math.random() > 0.65;

    logs.push({
      id: generateId(),
      createdAt: date.toISOString(),
      sleepQuality,
      sleepLabel: getSleepLabel(sleepQuality),
      wokeDuringNight,
      coughCharacters,
      congestionSource: [
        sourceOptions[Math.floor(Math.random() * sourceOptions.length)],
      ],
      phlegmColor: isProductive
        ? phlegmOptions[Math.floor(Math.random() * phlegmOptions.length)]
        : null,
      reliefMeasures: reliefOptions.filter(() => Math.random() > 0.6),
    });
  }

  return logs;
};

export const useCongestionStore = create<CongestionStore>()(
  persist(
    (set, get) => ({
      logs: generateSampleData(),

      addLog: (logData) => {
        const newLog: CongestionLog = {
          ...logData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          sleepLabel: getSleepLabel(logData.sleepQuality),
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
                  sleepLabel:
                    updates.sleepQuality !== undefined
                      ? getSleepLabel(updates.sleepQuality)
                      : log.sleepLabel,
                }
              : log
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter((log) => log.id !== id) }));
      },

      getLatestLog: () => {
        const logs = get().logs;
        return logs.length > 0 ? logs[0] : null;
      },

      getWetDryTrend: (days = 5) => {
        const result: { day: string; type: "dry" | "productive" | "none" }[] = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const dayLogs = get().logs.filter((log) => {
            const logDate = new Date(log.createdAt);
            return logDate >= date && logDate < nextDate;
          });

          if (dayLogs.length === 0) {
            result.push({ day: date.toLocaleDateString("en-US", { weekday: "short" }), type: "none" });
            continue;
          }

          const hasProductive = dayLogs.some(
            (log) => log.coughCharacters.includes("productive") || log.phlegmColor !== null
          );
          result.push({
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            type: hasProductive ? "productive" : "dry",
          });
        }

        return result;
      },

      getRestQualityLabel: () => {
        const latest = get().getLatestLog();
        if (!latest) return "Good";
        if (latest.sleepQuality <= 1) return "Good";
        if (latest.sleepQuality === 2) return "Fair";
        return "Poor";
      },
    }),
    {
      name: "cadence-congestion",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
