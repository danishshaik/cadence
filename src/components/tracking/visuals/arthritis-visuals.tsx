import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { colors, shadows } from "@theme";
import { ActivityTypeId, ManagementMethodId, WeatherConfirmationId } from "@/types/arthritis";

const isIOS = process.env.EXPO_OS === "ios";

const ACTIVITY_ICONS: Record<string, string> = {
  chair: "chair.fill",
  dumbbell: "dumbbell.fill",
  "heart-pulse": "heart.fill",
  accessibility: "figure.yoga",
  activity: "waveform.path.ecg",
  package: "shippingbox.fill",
};

const MANAGEMENT_ICONS: Record<string, string> = {
  pill: "pills.fill",
  droplet: "drop.fill",
  flame: "flame.fill",
  snowflake: "snowflake",
  wrap: "bandage.fill",
  cylinder: "cylinder.fill",
  moon: "moon.zzz.fill",
  "arrow-up": "arrow.up.circle.fill",
};

const ICON_COLORS: Record<string, string> = {
  nsaids: "#5C6BC0",
  topical: "#5C6BC0",
  heat: "#E57373",
  ice: "#64B5F6",
  compression: "#81C784",
  foam_rolling: "#81C784",
  rest: "#9575CD",
  elevation: "#9575CD",
};

export function ActivityPill({
  id,
  label,
  icon,
  selected,
  onPress,
}: {
  id: ActivityTypeId;
  label: string;
  icon: string;
  selected: boolean;
  onPress: (id: ActivityTypeId) => void;
}) {
  const symbolName = (ACTIVITY_ICONS[icon] || "circle.fill") as any;

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[styles.activityPill, selected && styles.activityPillSelected]}
    >
      <View style={styles.iconContainer}>
        <SymbolView
          name={symbolName}
          size={18}
          tintColor={selected ? "#FFFFFF" : colors.arthritisTextSecondary}
          fallback={
            <Text style={[styles.iconFallback, selected && styles.iconFallbackSelected]}>●</Text>
          }
        />
      </View>
      <Text style={[styles.activityText, selected && styles.activityTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ManagementCard({
  id,
  label,
  icon,
  selected,
  onPress,
  size,
}: {
  id: ManagementMethodId;
  label: string;
  icon: string;
  selected: boolean;
  onPress: (id: ManagementMethodId) => void;
  size: number;
}) {
  const symbolName = (MANAGEMENT_ICONS[icon] || "circle.fill") as any;
  const iconColor = selected ? colors.arthritis : (ICON_COLORS[id] || colors.arthritisTextSecondary);

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[styles.card, { width: size, height: size }, selected && styles.cardSelected]}
    >
      {selected && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      <View style={[styles.iconWrapper, selected && styles.iconWrapperSelected]}>
        <SymbolView
          name={symbolName}
          size={32}
          tintColor={iconColor}
          fallback={<Text style={[styles.iconFallbackLarge, { color: iconColor }]}>●</Text>}
        />
      </View>
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function WeatherConfirmationPill({
  id,
  label,
  selected,
  onPress,
}: {
  id: WeatherConfirmationId;
  label: string;
  selected: boolean;
  onPress: (id: WeatherConfirmationId) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function WeatherIcon({ pressure }: { pressure: "rising" | "falling" | "stable" | null }) {
  return (
    <View style={styles.weatherIconContainer}>
      <SymbolView
        name={`chevron.${pressure === "falling" ? "down" : pressure === "rising" ? "up" : "compact.down"}`}
        size={28}
        tintColor={colors.arthritis}
        fallback={
          <Text style={styles.iconFallback}>
            {pressure === "falling" ? "↓" : pressure === "rising" ? "↑" : "="}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  activityPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  activityPillSelected: {
    backgroundColor: colors.arthritis,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFallback: {
    fontSize: 16,
    color: colors.arthritisTextSecondary,
  },
  iconFallbackSelected: {
    color: "#FFFFFF",
  },
  activityText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
    flex: 1,
  },
  activityTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "#E5EBE5",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    position: "relative",
    ...shadows.sm,
  },
  cardSelected: {
    borderColor: colors.arthritis,
    borderWidth: 3,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.arthritis,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperSelected: {
    backgroundColor: colors.arthritisSurface,
  },
  iconFallbackLarge: {
    fontSize: 28,
  },
  cardLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.arthritisText,
    textAlign: "center",
  },
  cardLabelSelected: {
    color: colors.arthritisText,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#EEEEEE",
  },
  pillSelected: {
    backgroundColor: colors.arthritis,
  },
  pillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "700",
    color: colors.arthritisText,
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  weatherIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.arthritisSurface,
    alignItems: "center",
    justifyContent: "center",
  },
});
