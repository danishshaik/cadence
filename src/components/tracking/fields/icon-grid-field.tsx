import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { Icon } from "@components/ui";

const isIOS = process.env.EXPO_OS === "ios";

export interface IconGridItem {
  id: string;
  label: string;
  icon: string;
  subtitle?: string;
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
  showBadge?: boolean;
  accentColor?: string;
  accentSoftColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  iconMutedColor?: string;
  badgeGradient?: [string, string];
  badgeIcon?: string;
  renderItemContent?: (params: {
    item: IconGridItem;
    isSelected: boolean;
  }) => React.ReactNode;
  gridStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  tileStyle?: StyleProp<ViewStyle>;
  tileSelectedStyle?: StyleProp<ViewStyle>;
  tilePressedStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  labelSelectedStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  subtitleSelectedStyle?: StyleProp<TextStyle>;
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
  showBadge = true,
  accentColor = "#0F172A",
  accentSoftColor = "#EEF2FF",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#4B5563",
  iconMutedColor = "#9CA3AF",
  badgeGradient = ["#0F172A", "#334155"],
  badgeIcon = "pill",
  renderItemContent,
  gridStyle,
  rowStyle,
  tileStyle,
  tileSelectedStyle,
  tilePressedStyle,
  labelStyle,
  labelSelectedStyle,
  subtitleStyle,
  subtitleSelectedStyle,
}: IconGridFieldProps) {
  const gridRows = rows ?? [
    items.slice(0, 2),
    items.slice(2, 4),
    items.slice(4, 6),
  ];

  const showTitleArea = showBadge || label || description;

  return (
    <View style={styles.container}>
      {showTitleArea ? (
        <View style={styles.titleArea}>
          {showBadge ? (
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
          ) : null}
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
      ) : null}

      <View style={[styles.grid, gridStyle]}>
        {gridRows.map((row) => (
          <View key={row.map((item) => item.id).join("-")} style={[styles.row, rowStyle]}>
            {row.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onToggle(item.id)}
                  style={({ pressed }) => [
                    styles.tile,
                    isSelected && { backgroundColor: accentSoftColor },
                    tileStyle,
                    isSelected && tileSelectedStyle,
                    pressed && styles.tilePressed,
                    pressed && tilePressedStyle,
                  ]}
                  disabled={disabled}
                >
                  {renderItemContent ? (
                    renderItemContent({ item, isSelected })
                  ) : (
                    <>
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
                          labelStyle,
                          isSelected && { color: accentColor },
                          isSelected && labelSelectedStyle,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.subtitle ? (
                        <Text
                          selectable
                          style={[
                            styles.itemSubtitle,
                            { color: textSecondaryColor },
                            subtitleStyle,
                            isSelected && { color: accentColor },
                            isSelected && subtitleSelectedStyle,
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        {noneOption ? (
          <View style={[styles.row, rowStyle]}>
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
    width: "100%",
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
    width: "100%",
    gap: 12,
  },
  row: {
    width: "100%",
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
  tilePressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  itemSubtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
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
