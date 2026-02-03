import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Icon } from "@components/ui";

const isIOS = process.env.EXPO_OS === "ios";

export interface IconGridItem {
  id: string;
  label: string;
  icon: string;
}

interface IconGridNoneOption {
  label: string;
  selected: boolean;
  onPress: () => void;
}

interface IconGridFieldProps {
  label?: string;
  description?: string;
  items: IconGridItem[];
  rows?: IconGridItem[][];
  selectedIds: string[];
  onToggle: (id: string) => void;
  noneOption?: IconGridNoneOption;
  disabled?: boolean;
  accentColor?: string;
  accentSoftColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  iconMutedColor?: string;
  badgeGradient?: [string, string];
  badgeIcon?: string;
}

export function IconGridField({
  label,
  description,
  items,
  rows,
  selectedIds,
  onToggle,
  noneOption,
  disabled,
  accentColor = "#0F172A",
  accentSoftColor = "#EEF2FF",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#4B5563",
  iconMutedColor = "#9CA3AF",
  badgeGradient = ["#0F172A", "#334155"],
  badgeIcon = "pill",
}: IconGridFieldProps) {
  const gridRows = rows ?? [
    items.slice(0, 2),
    items.slice(2, 4),
    items.slice(4, 6),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <View style={styles.badge}>
          <Svg width={56} height={56} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="iconGridBadge" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={badgeGradient[0]} />
                <Stop offset="100%" stopColor={badgeGradient[1]} />
              </RadialGradient>
            </Defs>
            <Rect width={56} height={56} rx={16} fill="url(#iconGridBadge)" />
          </Svg>
          <Icon name={badgeIcon} size={24} color="#FFFFFF" />
        </View>
        {label ? (
          <Text selectable style={[styles.title, { color: textPrimaryColor }]}
          >
            {label}
          </Text>
        ) : null}
        {description ? (
          <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}
          >
            {description}
          </Text>
        ) : null}
      </View>

      <View style={styles.grid}>
        {gridRows.map((row) => (
          <View key={row.map((item) => item.id).join("-")} style={styles.row}>
            {row.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onToggle(item.id)}
                  style={[styles.tile, isSelected && { backgroundColor: accentSoftColor }]}
                  disabled={disabled}
                >
                  <Icon
                    name={item.icon}
                    size={32}
                    color={isSelected ? accentColor : iconMutedColor}
                  />
                  <Text
                    selectable
                    style={[
                      styles.label,
                      { color: textMutedColor },
                      isSelected && { color: accentColor },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        {noneOption ? (
          <View style={styles.row}>
            <Pressable
              onPress={noneOption.onPress}
              style={[
                styles.noneTile,
                noneOption.selected && { backgroundColor: accentSoftColor },
              ]}
              disabled={disabled}
            >
              <Icon
                name="x"
                size={20}
                color={noneOption.selected ? accentColor : iconMutedColor}
              />
              <Text
                selectable
                style={[
                  styles.noneLabel,
                  { color: textMutedColor },
                  noneOption.selected && { color: accentColor },
                ]}
              >
                {noneOption.label}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleArea: {
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    textAlign: "center",
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  tile: {
    flex: 1,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  noneTile: {
    flex: 1,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  noneLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
  },
});
