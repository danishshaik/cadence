import React from "react";
import { View, Text } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, typography } from "@theme";

interface HeaderTitleProps {
  title?: string;
}

export function HeaderTitle({ title = "Cadence" }: HeaderTitleProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.textPrimary }}>
        {title}
      </Text>
      <SymbolView
        name="chevron.down"
        size={12}
        tintColor={colors.textTertiary}
        fallback={<Text selectable style={{ color: colors.textTertiary }}>˅</Text>}
      />
    </View>
  );
}
