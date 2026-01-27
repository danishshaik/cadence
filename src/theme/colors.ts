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
  respiratoryIndigo: "#5C6BC0", // Calm Indigo - active/selected
  respiratoryIndigoLight: "#E8EAF6",
  respiratoryAlert: "#FFB74D", // Alert Amber - constriction/warning
  respiratoryAlertLight: "#FFF3E0",
  respiratorySevere: "#EF5350", // For severe/emergency states

  // Congestion/Recovery theme (Resonance)
  restorativeSage: "#88D8B0",
  honeyAmber: "#FFC107",
  midnightBlue: "#2C3E50",
  vaporWhite: "#F0F4F8",
  coughDry: "#CBD5E1",
  coughGlass: "rgba(255, 255, 255, 0.7)",

  // Orthostatic Hypotension theme (Stability & Calm)
  orthostatic: "#667EEA",
  orthostaticLight: "#F9F9F9",
  orthostaticMuted: "#C9D4FF",
  orthostaticAlert: "#F7C1B5",
  orthostaticIndigo300: "#A5B4FC",
  orthostaticIndigo600: "#4F46E5",
  orthostaticIndigo: "#6366F1",
  orthostaticSlate: "#64748B",
  orthostaticGreyBlue: "#F1F5F9",
  orthostaticTrack: "#C7D2FE",

  // Arthritis/Musculoskeletal theme (Sage)
  arthritis: "#77DD77", // Sage Green - primary, natural relief
  arthritisLight: "#F9F9F9", // Soft Cloud White - background
  arthritisMuted: "#CFF6CF", // Light sage for gradients
  arthritisText: "#2F3A34", // Dark sage-gray for text
  arthritisTextSecondary: "#6C7A72", // Muted sage for labels
  arthritisAlert: "#E6A86A", // Muted orange for stiff/painful states
  arthritisAlertLight: "#FFF5EB",
  arthritisSurface: "#E7F6E7", // Very light sage for surfaces
  arthritisBorder: "#D6DED6", // Subtle border

  // Borders
  border: "#E5E7EB",
  borderFocused: "#3B82F6",

  // Drawer
  drawerBackground: "#F9FAFB",
  drawerOverlay: "rgba(0,0,0,0.3)",
} as const;

export type ColorKey = keyof typeof colors;
