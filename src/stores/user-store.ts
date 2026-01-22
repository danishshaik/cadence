import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserStore {
  userId: string | null;
  pushToken: string | null;
  initializeUser: () => Promise<string | null>;
  setUserId: (userId: string) => void;
  setPushToken: (token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: null,
      pushToken: null,

      initializeUser: async () => get().userId,

      setUserId: (userId) => set({ userId }),

      setPushToken: (pushToken) => set({ pushToken }),

      clearUser: () => set({ userId: null, pushToken: null }),
    }),
    {
      name: "cadence-user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
