import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { FieldProps } from "../types";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";

const isIOS = process.env.EXPO_OS === "ios";

export interface CategorizedChipCategory {
  id: string;
  label: string;
  icon: string;
}

export interface CategorizedChipItem {
  id: string;
  label: string;
  category: string;
}

interface CategorizedChipFieldProps extends FieldProps<string[]> {
  categories: CategorizedChipCategory[];
  items: CategorizedChipItem[];
  accentColor?: string;
  accentSoftColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  headerTextColor?: string;
  headerIconColor?: string;
  chipTextColor?: string;
  chipSelectedTextColor?: string;
  summaryTextColor?: string;
}

export function CategorizedChipField({
  value,
  onChange,
  disabled,
  categories,
  items,
  accentColor = mentalWeatherColors.accent,
  accentSoftColor = mentalWeatherColors.accentLight,
  surfaceColor = mentalWeatherColors.surface,
  borderColor = mentalWeatherColors.borderSoft,
  headerTextColor = mentalWeatherColors.textSecondary,
  headerIconColor,
  chipTextColor = mentalWeatherColors.textMuted,
  chipSelectedTextColor = mentalWeatherColors.accent,
  summaryTextColor = mentalWeatherColors.accent,
}: CategorizedChipFieldProps) {
  const selected = React.useMemo(() => value ?? [], [value]);
  const selectedCount = selected.length;

  const handleToggle = React.useCallback(
    (id: string) => {
      if (disabled) return;
      if (isIOS) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      const next = selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id];
      onChange(next);
    },
    [disabled, onChange, selected]
  );

  return (
    <View style={styles.container}>
      <View style={styles.cards}>
        {categories.map((category) => {
          const categoryItems = items.filter((item) => item.category === category.id);
          return (
            <View key={category.id} style={[styles.card, { backgroundColor: surfaceColor }]}>
              <View style={styles.cardHeader}>
                <Icon
                  name={category.icon}
                  size={16}
                  color={headerIconColor ?? headerTextColor}
                />
                <Text selectable style={[styles.cardTitle, { color: headerTextColor }]}>
                  {category.label}
                </Text>
              </View>

              <View style={styles.chipRow}>
                {categoryItems.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleToggle(item.id)}
                      disabled={disabled}
                      style={({ pressed }) => [
                        styles.chip,
                        { backgroundColor: surfaceColor, borderColor },
                        isSelected && styles.chipSelected,
                        isSelected && {
                          backgroundColor: accentSoftColor,
                          borderColor: accentColor,
                        },
                        pressed && styles.chipPressed,
                      ]}
                    >
                      {isSelected ? (
                        <Icon name="checkmark" size={14} color={accentColor} />
                      ) : null}
                      <Text
                        selectable
                        style={[
                          styles.chipText,
                          { color: chipTextColor },
                          isSelected && styles.chipTextSelected,
                          isSelected && { color: chipSelectedTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {selectedCount > 0 ? (
        <View style={styles.summary}>
          <View style={[styles.summaryBadge, { backgroundColor: accentSoftColor }]}
          >
            <Icon name="checkmark-circle" size={14} color={accentColor} />
            <Text selectable style={[styles.summaryText, { color: summaryTextColor }]}
            >
              {selectedCount} selected
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  cards: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  chipSelected: {
    borderWidth: 1.5,
  },
  chipPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  chipText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    fontWeight: "600",
  },
  summary: {
    paddingVertical: 4,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    alignSelf: "flex-start",
  },
  summaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
