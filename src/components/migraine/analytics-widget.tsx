import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useMigraineStore } from "@stores/migraine-store";
import { MIGRAINE_TRIGGERS } from "@/types/migraine";

export function MigraineAnalyticsWidget() {
  const router = useRouter();
  const logs = useMigraineStore((state) => state.logs);
  const getLogsForWeek = useMigraineStore((state) => state.getLogsForWeek);
  const getAverageSeverity = useMigraineStore((state) => state.getAverageSeverity);
  const getTopTrigger = useMigraineStore((state) => state.getTopTrigger);

  const weeklyLogs = getLogsForWeek();
  const avgSeverity = getAverageSeverity();
  const topTrigger = getTopTrigger();

  const handleLogAttack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-migraine");
  };

  const getTriggerLabel = (triggerId: string | null): string => {
    if (!triggerId) return "None";
    const trigger = MIGRAINE_TRIGGERS.find((t) => t.id === triggerId);
    return trigger?.label || triggerId;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="pulse" size={20} color={colors.migraine} />
          <Text style={styles.title}>Migraine Tracker</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{weeklyLogs.length}</Text>
          <Text style={styles.statLabel}>this week</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{avgSeverity.toFixed(1)}</Text>
          <Text style={styles.statLabel}>avg pain</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue} numberOfLines={1}>
            {getTriggerLabel(topTrigger)}
          </Text>
          <Text style={styles.statLabel}>top trigger</Text>
        </View>
      </View>

      <Pressable
        onPress={handleLogAttack}
        style={({ pressed }) => [styles.logButton, pressed && styles.logButtonPressed]}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.logButtonText}>Log Attack</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.migraine,
    borderRadius: 14,
    paddingVertical: 14,
  },
  logButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  logButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
