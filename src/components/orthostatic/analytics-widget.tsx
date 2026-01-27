import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Icon } from "@components/ui";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useOrthostaticStore } from "@stores/orthostatic-store";
import { OrthostaticLog } from "@/types/orthostatic";

const isIOS = process.env.EXPO_OS === "ios";

const getDurationSeconds = (log: OrthostaticLog) =>
  log.durationMinutes * 60 + log.durationSeconds;

const computeDaysSinceHighSeverity = (logs: OrthostaticLog[]) => {
  const highLog = logs.find((log) => log.severity >= 8);
  if (!highLog) return null;
  const lastDate = new Date(highLog.createdAt);
  const now = new Date();
  const diffTime = now.getTime() - lastDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export function OrthostaticAnalyticsWidget() {
  const router = useRouter();
  const logs = useOrthostaticStore((state) => state.logs);

  const daysSinceHigh = useMemo(() => computeDaysSinceHighSeverity(logs), [logs]);
  const trend = useMemo(
    () => logs.slice(0, 5).map((log) => getDurationSeconds(log)),
    [logs]
  );

  const handleLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-orthostatic");
  };

  const displayDays = daysSinceHigh === null ? "--" : daysSinceHigh >= 30 ? "30+" : `${daysSinceHigh}`;

  const max = Math.max(30, ...trend);
  const bars = trend.length ? trend : [12, 18, 8, 28, 16];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="pulse" size={18} color={colors.orthostatic} />
          <Text style={styles.title}>Orthostatic Hypotension</Text>
        </View>
        <Pressable onPress={handleLog} style={({ pressed }) => [styles.logPill, pressed && styles.logPillPressed]}>
          <Icon name="add" size={14} color="#FFFFFF" />
          <Text style={styles.logPillText}>Log</Text>
        </Pressable>
      </View>

      <View style={styles.metricTop}>
        <Text style={styles.metricValue}>{displayDays}</Text>
        <View style={styles.metricSubRow}>
          <View style={styles.statusDot} />
          <Text style={styles.metricLabel}>Days since last high-severity episode</Text>
        </View>
      </View>

      <View style={styles.trendSection}>
        <Text style={styles.trendLabel}>Recovery time trend</Text>
        <View style={styles.trendCard}>
          <View style={styles.trendRow}>
            {bars.map((value, index) => {
              const height = Math.max(6, Math.round((value / max) * 30));
              const isTail = index === bars.length - 1;
              return (
                <View
                  key={`${value}-${index}`}
                  style={[
                    styles.trendBar,
                    { height, opacity: isTail ? 0.4 : 1 },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.orthostaticLight,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    ...shadows.widget,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  logPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.orthostatic,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderCurve: "continuous",
  },
  logPillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  logPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  metricTop: {
    gap: 6,
  },
  metricValue: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 38,
    fontWeight: "700",
    color: "#2F355B",
  },
  metricSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  metricLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  trendSection: {
    marginTop: 16,
    gap: 8,
  },
  trendLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  trendCard: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  trendBar: {
    width: 20,
    borderRadius: 999,
    backgroundColor: colors.orthostatic,
  },
});
