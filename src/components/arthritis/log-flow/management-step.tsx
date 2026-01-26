import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";
import { ManagementMethodId, MANAGEMENT_METHODS } from "@/types/arthritis";

const isIOS = process.env.EXPO_OS === "ios";

// Map management icons to SF Symbols
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

// Icon colors for visual variety
const ICON_COLORS: Record<string, string> = {
  nsaids: "#5C6BC0", // Indigo for medical
  topical: "#5C6BC0",
  heat: "#E57373", // Warm red for heat
  ice: "#64B5F6", // Cool blue for ice
  compression: "#81C784", // Green for physical
  foam_rolling: "#81C784",
  rest: "#9575CD", // Purple for rest
  elevation: "#9575CD",
};

function ManagementCard({
  id,
  label,
  description,
  icon,
  selected,
  onPress,
  size,
}: {
  id: ManagementMethodId;
  label: string;
  description: string;
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
      style={[
        styles.card,
        { width: size, height: size },
        selected && styles.cardSelected,
      ]}
    >
      {selected && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
      <View style={[styles.iconWrapper, selected && styles.iconWrapperSelected]}>
        <SymbolView
          name={symbolName}
          size={32}
          tintColor={iconColor}
          fallback={
            <Text style={[styles.iconFallback, { color: iconColor }]}>●</Text>
          }
        />
      </View>
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ManagementStep() {
  const { formData, updateFormData } = useLogArthritis();
  const { width } = useWindowDimensions();

  const cardSize = Math.min((width - 60) / 2, 150);

  const handleMethodPress = (id: ManagementMethodId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.managementMethods;
    const updated = current.includes(id)
      ? current.filter((m) => m !== id)
      : [...current, id];
    updateFormData({ managementMethods: updated });
  };

  // Split methods into two columns
  const leftColumn = MANAGEMENT_METHODS.filter((_, i) => i % 2 === 0);
  const rightColumn = MANAGEMENT_METHODS.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you managing it?</Text>
        <Text style={styles.subtitle}>Select any that help</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.column}>
          {leftColumn.map((method) => (
            <ManagementCard
              key={method.id}
              id={method.id}
              label={method.label}
              description={method.description}
              icon={method.icon}
              selected={formData.managementMethods.includes(method.id)}
              onPress={handleMethodPress}
              size={cardSize}
            />
          ))}
        </View>
        <View style={styles.column}>
          {rightColumn.map((method) => (
            <ManagementCard
              key={method.id}
              id={method.id}
              label={method.label}
              description={method.description}
              icon={method.icon}
              selected={formData.managementMethods.includes(method.id)}
              onPress={handleMethodPress}
              size={cardSize}
            />
          ))}
        </View>
      </ScrollView>

      <Text style={styles.footerNote}>
        {formData.managementMethods.length === 0
          ? "No methods selected"
          : `${formData.managementMethods.length} method${formData.managementMethods.length !== 1 ? "s" : ""} selected`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.arthritisText,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 4,
  },
  column: {
    gap: 12,
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
  iconFallback: {
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
    fontWeight: "700",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
    marginTop: 12,
  },
});
