import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, spacing, radius, typography } from "@theme";

interface NewThreadButtonProps {
  onPress: () => void;
}

export function NewThreadButton({ onPress }: NewThreadButtonProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: spacing.md,
        marginHorizontal: spacing.sm,
        marginVertical: spacing.sm,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: colors.primaryLight,
        gap: spacing.sm,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          borderCurve: "continuous",
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SymbolView
          name="plus"
          size={20}
          tintColor={colors.primary}
          fallback={<Text selectable style={{ color: colors.primary }}>+</Text>}
        />
      </View>
      <Text selectable style={{ ...typography.bodyMedium, color: colors.primary }}>
        New Symptom
      </Text>
    </TouchableOpacity>
  );
}
