import React from "react";
import { Platform, PlatformColor, Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { colors } from "@theme";

interface GlassIconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  tintColor?: string;
}

export function GlassIconButton({
  icon,
  onPress,
  size = 38,
  tintColor = colors.coughGlass,
}: GlassIconButtonProps) {
  const isGlass = isLiquidGlassAvailable();
  const Container = isGlass ? GlassView : View;
  const iconColor = Platform.OS === "ios" ? PlatformColor("label") : colors.textPrimary;

  return (
    <Container
      {...(isGlass ? { glassEffectStyle: "regular", tintColor, isInteractive: true } : {})}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isGlass ? "transparent" : "rgba(120, 120, 128, 0.12)",
        borderCurve: "continuous",
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={onPress}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <SymbolView
          name={icon}
          size={20}
          tintColor={iconColor}
          fallback={<Text style={{ color: colors.textPrimary, fontSize: 18 }}>•</Text>}
        />
      </Pressable>
    </Container>
  );
}
