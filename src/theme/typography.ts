import { TextStyle } from "react-native";

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: "600", lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: "600", lineHeight: 24 },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: "500", lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: "400", lineHeight: 20 },
  label: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
} as const;

export type TypographyKey = keyof typeof typography;
