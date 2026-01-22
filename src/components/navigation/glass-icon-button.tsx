import React from "react";
import { Pressable, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { colors } from "@theme";

interface GlassIconButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
}

export function GlassIconButton({ icon, onPress, size = 38 }: GlassIconButtonProps) {
  const isGlass = isLiquidGlassAvailable();
  const Container = isGlass ? GlassView : View;

  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: 8 }}>
      <Container
        {...(isGlass ? { glassEffectStyle: "regular" } : {})}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isGlass ? undefined : "rgba(120, 120, 128, 0.12)",
        }}
      >
        <SymbolView
          name={icon}
          size={20}
          tintColor={colors.textPrimary}
          fallback={<Text style={{ color: colors.textPrimary, fontSize: 18 }}>•</Text>}
        />
      </Container>
    </Pressable>
  );
}
