const isIOS = process.env.EXPO_OS === "ios";

export const mentalWeatherFonts = {
  rounded: isIOS ? "SF Pro Rounded" : "sans-serif",
  text: isIOS ? "SF Pro Text" : "sans-serif",
} as const;

export const mentalWeatherColors = {
  background: ["#F9F7FF", "#FDF7FB"],
  cardGradient: ["#FFFFFF", "#FAF8FF"],
  surface: "#FFFFFF",
  accent: "#6C5CE7",
  accentLight: "#F0EDFC",
  textPrimary: "#2F3A34",
  textTitle: "#2F355B",
  textMuted: "#4A5A52",
  textSecondary: "#9AA2A0",
  textSoft: "#7B857F",
  textSubtle: "#64748B",
  hint: "rgba(108, 92, 231, 0.56)",
  borderSoft: "#EEEEF4",
  borderMuted: "#E6E6F0",
  buttonMuted: "#F3F4F6",
  gridLine: "#EEEAF7",
} as const;
