import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";
import { ArthritisLog, JOINT_LOCATIONS } from "@/types/arthritis";

const isIOS = process.env.EXPO_OS === "ios";

function computeDaysWithGoodMobility(logs: ArthritisLog[]): number {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentLogs = logs.filter((log) => new Date(log.createdAt) >= weekAgo);
  return recentLogs.filter((log) => log.stiffness <= 3).length;
}

function computeWeatherInsight(logs: ArthritisLog[]) {
  if (logs.length === 0) {
    return { hasCorrelation: false, label: "Weather Impact", value: "Unknown" };
  }

  const recentLogs = logs.slice(0, 7);
  const weatherAffected = recentLogs.filter(
    (log) => log.weatherConfirmation === "yes" || log.weatherConfirmation === "cold"
  ).length;

  const percentage = Math.round((weatherAffected / recentLogs.length) * 100);

  if (percentage >= 50) {
    const latestLog = logs[0];
    if (latestLog?.barometricPressure === "falling") {
      return { hasCorrelation: true, label: "Pressure Drop", value: "Likely trigger" };
    }
    if (latestLog?.weatherConfirmation === "cold") {
      return { hasCorrelation: true, label: "Cold Weather", value: "Likely trigger" };
    }
    return { hasCorrelation: true, label: "Weather", value: `${percentage}% correlation` };
  }

  return { hasCorrelation: false, label: "Weather Impact", value: "Low correlation" };
}

function getMostAffectedJoint(logs: ArthritisLog[]): string | null {
  const jointCounts: Record<string, number> = {};
  const recentLogs = logs.slice(0, 14);

  recentLogs.forEach((log) => {
    log.affectedJoints.forEach((joint) => {
      jointCounts[joint] = (jointCounts[joint] || 0) + 1;
    });
  });

  const entries = Object.entries(jointCounts);
  if (entries.length === 0) return null;

  const topJoint = entries.sort((a, b) => b[1] - a[1])[0][0];
  const jointInfo = JOINT_LOCATIONS.find((j) => j.id === topJoint);
  return jointInfo?.label.replace(/Left |Right /g, "") ?? null;
}

export function ArthritisAnalyticsWidget() {
  const router = useRouter();
  const logs = useArthritisStore((state) => state.logs);

  const goodDays = useMemo(() => computeDaysWithGoodMobility(logs), [logs]);
  const weatherInsight = useMemo(() => computeWeatherInsight(logs), [logs]);
  const topJoint = useMemo(() => getMostAffectedJoint(logs), [logs]);

  const handleLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-arthritis");
  };

  const displayDays = goodDays >= 7 ? "7" : `${goodDays}`;
  const mobilityColor = goodDays >= 5 ? colors.arthritis : goodDays >= 2 ? colors.arthritisAlert : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="body" size={18} color={colors.arthritis} />
          <Text style={styles.title}>Arthritis · Joint Pain</Text>
        </View>
        <Pressable onPress={handleLog} style={({ pressed }) => [styles.logPill, pressed && styles.logPillPressed]}>
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.logPillText}>Log</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        <View style={styles.metricTop}>
          <Text style={[styles.metricValue, { color: mobilityColor }]}>{displayDays}</Text>
          <Text style={styles.metricLabel}>Days with good mobility this week</Text>
        </View>

        <View style={styles.metricBottom}>
          <View style={styles.insightRow}>
            <View style={styles.insightIcon}>
              <Ionicons
                name={weatherInsight.hasCorrelation ? "rainy" : "sunny"}
                size={14}
                color={weatherInsight.hasCorrelation ? colors.arthritisTextSecondary : colors.arthritis}
              />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightLabel}>{weatherInsight.label}</Text>
              <Text style={styles.insightValue}>{weatherInsight.value}</Text>
            </View>
          </View>
          {topJoint && (
            <Text style={styles.jointNote}>Most affected: {topJoint}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.arthritisLight,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.arthritisBorder,
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
    color: colors.arthritisText,
  },
  logPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.arthritis,
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
  grid: {
    gap: 16,
  },
  metricTop: {
    alignItems: "flex-start",
    gap: 4,
  },
  metricValue: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 40,
    fontWeight: "700",
  },
  metricLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
  },
  metricBottom: {
    gap: 8,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.arthritisSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  insightText: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.arthritisText,
  },
  insightValue: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.arthritisTextSecondary,
  },
  jointNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.arthritisTextSecondary,
    marginTop: 4,
  },
});
