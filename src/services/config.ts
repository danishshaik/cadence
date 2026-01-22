const FALLBACK_PROD_URL = "https://api.cadence.health";
const FALLBACK_LOCALHOST = "http://localhost:3000";
const FALLBACK_ANDROID = "http://10.0.2.2:3000";

const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const devFallback =
  process.env.EXPO_OS === "android" ? FALLBACK_ANDROID : FALLBACK_LOCALHOST;

export const config = {
  apiUrl: envApiUrl ?? (__DEV__ ? devFallback : FALLBACK_PROD_URL),
} as const;
