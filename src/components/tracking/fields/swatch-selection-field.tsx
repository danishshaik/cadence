import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { SwatchOption } from "../flow-config";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

interface SwatchSelectionFieldProps extends FieldProps<string | null> {
  options: SwatchOption[];
  insights?: Record<string, string>;
  accentColor?: string;
  cardColor?: string;
  cardBorderColor?: string;
  cardShadow?: string;
  labelColor?: string;
  labelSelectedColor?: string;
  insightBackgroundColor?: string;
  insightTextColor?: string;
  insightIconColor?: string;
  insightIconName?: string;
}

function SwatchFill({ option }: { option: SwatchOption }) {
  if (option.gradient) {
    return (
      <LinearGradient
        colors={option.gradient}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: option.color ?? "#E5EBE5",
        },
      ]}
    />
  );
}

export function SwatchSelectionField({
  value,
  onChange,
  options,
  insights,
  disabled,
  accentColor = "#88D8B0",
  cardColor = "#FFFFFF",
  cardBorderColor = "#E5EBE5",
  cardShadow = "0 8px 20px rgba(47, 58, 52, 0.06)",
  labelColor = "#6C7A72",
  labelSelectedColor = "#2F3A34",
  insightBackgroundColor = "rgba(255, 249, 196, 0.18)",
  insightTextColor = "#6C7A72",
  insightIconColor = "#F9A825",
  insightIconName = "info",
}: SwatchSelectionFieldProps) {
  const insight = value ? insights?.[value] : null;

  const handleSelect = (nextId: string) => {
    if (disabled) return;
    Haptics.selectionAsync();
    onChange(nextId);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardColor,
            borderColor: cardBorderColor,
            boxShadow: cardShadow,
          },
        ]}
      >
        <View style={styles.row}>
          {options.map((option) => {
            const selected = option.id === value;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.swatchWrap,
                  pressed && styles.swatchPressed,
                ]}
              >
                <View
                  style={[
                    styles.swatch,
                    selected && {
                      borderColor: accentColor,
                      borderWidth: 3,
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
                    },
                    !selected && styles.swatchIdle,
                  ]}
                >
                  <SwatchFill option={option} />
                </View>
                <Text
                  selectable
                  style={[
                    styles.swatchLabel,
                    { color: selected ? labelSelectedColor : labelColor },
                    selected && styles.swatchLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {insight ? (
          <View style={[styles.insightPill, { backgroundColor: insightBackgroundColor }]}>
            <Icon name={insightIconName} size={16} color={insightIconColor} />
            <Text selectable style={[styles.insightText, { color: insightTextColor }]}>
              {insight}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 28,
    gap: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    gap: 8,
  },
  swatchWrap: {
    alignItems: "center",
    gap: 8,
  },
  swatchPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  swatchIdle: {
    borderWidth: 1.5,
    borderColor: "#E5EBE5",
  },
  swatchLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
  },
  swatchLabelSelected: {
    fontWeight: "600",
  },
  insightPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  insightText: {
    flex: 1,
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
  },
});
