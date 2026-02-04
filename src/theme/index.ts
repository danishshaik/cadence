export { colors, mentalWeatherColors, mentalWeatherFonts } from "./colors";
export { spacing } from "./spacing";
export { typography } from "./typography";

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.04)",
  },
  md: {
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
  },
  widget: {
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
  },
} as const;
