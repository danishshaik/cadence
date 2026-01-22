import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

interface UserStore {
  userId: string | null;
  pushToken: string | null;
  initializeUser: () => Promise<string>;
  setPushToken: (token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: null,
      pushToken: null,

      initializeUser: async () => {
        let { userId } = get();

        if (!userId) {
          userId = Crypto.randomUUID();
          set({ userId });
        }

        return userId;
      },

      setPushToken: (pushToken) => set({ pushToken }),

      clearUser: () => set({ userId: null, pushToken: null }),
    }),
    {
      name: "cadence-user",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
