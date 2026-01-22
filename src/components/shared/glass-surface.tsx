import React from "react";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { View, ViewStyle } from "react-native";
import { radius } from "@theme";

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  tintColor?: string;
  glassEffectStyle?: "clear" | "regular";
  borderRadius?: number;
}

export function GlassSurface({
  children,
  style,
  tintColor = "rgba(255, 255, 255, 0.7)",
  glassEffectStyle = "regular",
  borderRadius = radius.xl,
}: GlassSurfaceProps) {
  const isGlass = isLiquidGlassAvailable();
  const GlassComponent = isGlass ? GlassView : View;

  return (
    <GlassComponent
      {...(isGlass ? { glassEffectStyle, tintColor } : {})}
      style={[
        {
          backgroundColor: isGlass ? "transparent" : "rgba(255, 255, 255, 0.72)",
          borderRadius,
          borderCurve: "continuous",
          overflow: "hidden",
        },
        // Only add border/shadow for fallback - glass handles its own chrome
        !isGlass && {
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.45)",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
        },
        style,
      ]}
    >
      {children}
    </GlassComponent>
  );
}
