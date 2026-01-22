export const colors = {
  // Backgrounds
  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSecondary: "#F9FAFB",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  // Accents
  primary: "#3B82F6",
  primaryLight: "#EFF6FF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  // Severity gradient
  severityLow: "#4ADE80",
  severityMid: "#FBBF24",
  severityHigh: "#F87171",

  // Borders
  border: "#E5E7EB",
  borderFocused: "#3B82F6",

  // Drawer
  drawerBackground: "#F9FAFB",
  drawerOverlay: "rgba(0,0,0,0.3)",
} as const;

export type ColorKey = keyof typeof colors;
