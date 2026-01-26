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

  // Migraine theme (Migraine Buddy-inspired)
  migraine: "#E91E8C",
  migraineLight: "#FDF2F8",
  migraineMuted: "#F9A8D4",

  // GI/Digestive health theme
  gi: "#88C9A1", // Soft Sage Green
  giLight: "#E8F5ED",
  giMuted: "#B8DFCA",
  giSevere: "#FF8C94", // Muted Coral for flare-ups
  giSevereLight: "#FFE5E7",

  // Mood/Mental health theme (Periwinkle Blue)
  mood: "#6C5CE7",
  moodLight: "#EDE9FC",
  moodMuted: "#A29BFE",
  moodWarm: "#FDCB6E", // Yellow for positive/energetic
  moodCool: "#74B9FF", // Blue for calm
  moodDark: "#5849BE", // Darker periwinkle

  // Skin/Dermatology theme (Clarity)
  skin: "#4ECDC4", // Fresh Mint - primary action, healing
  skinLight: "#E8FAF8",
  skinMuted: "#8FE3DD",
  skinAlert: "#E89893", // Soft Clay - severity/inflammation
  skinAlertLight: "#FDF2F1",
  skinCalm: "#7FCDCD", // Cooling blue-teal for low severity

  // Respiratory/Allergy theme
  respiratory: "#4FC3F7", // Oxygen Blue - clear, open breathing
  respiratoryLight: "#E1F5FE",
  respiratoryMuted: "#81D4FA",
  respiratoryAlert: "#FFB74D", // Alert Amber - constriction/warning
  respiratoryAlertLight: "#FFF3E0",
  respiratorySevere: "#EF5350", // For severe/emergency states

  // Borders
  border: "#E5E7EB",
  borderFocused: "#3B82F6",

  // Drawer
  drawerBackground: "#F9FAFB",
  drawerOverlay: "rgba(0,0,0,0.3)",
} as const;

export type ColorKey = keyof typeof colors;
