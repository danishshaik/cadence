import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useRespiratoryStore } from "@stores/respiratory-store";
import { RespiratoryLog } from "@/types/respiratory";

const isIOS = process.env.EXPO_OS === "ios";

function computeDaysSinceRescue(logs: RespiratoryLog[]): number | null {
  const rescueLog = logs.find((log) => log.rescueInhalerPuffs > 0);
  if (!rescueLog) return null;
  const lastDate = new Date(rescueLog.createdAt);
  const now = new Date();
  const diffTime = now.getTime() - lastDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function computeRisk(log?: RespiratoryLog) {
  if (!log) {
    return { label: "Air Quality", value: "Unknown", level: 0.45 };
  }

  if (log.airQualityIndex !== undefined) {
    const aqi = log.airQualityIndex;
    if (aqi <= 50) return { label: "Air Quality", value: "Good", level: 0.15 };
    if (aqi <= 100) return { label: "Air Quality", value: "Moderate", level: 0.45 };
    if (aqi <= 150) return { label: "Air Quality", value: "High", level: 0.75 };
    return { label: "Air Quality", value: "Very High", level: 0.9 };
  }

  if (log.pollenLevel) {
    const map = {
      low: { value: "Low", level: 0.2 },
      moderate: { value: "Moderate", level: 0.5 },
      high: { value: "High", level: 0.78 },
      very_high: { value: "Very High", level: 0.92 },
    } as const;
    const entry = map[log.pollenLevel];
    return { label: "Pollen", value: entry.value, level: entry.level };
  }

  return { label: "Air Quality", value: "Unknown", level: 0.45 };
}

export function RespiratoryAnalyticsWidget() {
  const router = useRouter();
  const logs = useRespiratoryStore((state) => state.logs);

  const daysSinceRescue = useMemo(() => computeDaysSinceRescue(logs), [logs]);
  const risk = useMemo(() => computeRisk(logs[0]), [logs]);

  const handleLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-respiratory");
  };

  const displayDays =
    daysSinceRescue === null ? "--" : daysSinceRescue >= 30 ? "30+" : `${daysSinceRescue}`;
  const controlColor = daysSinceRescue === 0 ? colors.respiratoryAlert : colors.respiratoryIndigo;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="pulse" size={18} color={colors.respiratoryIndigo} />
          <Text style={styles.title}>Asthma · Chest Tightness</Text>
        </View>
        <Pressable onPress={handleLog} style={({ pressed }) => [styles.logPill, pressed && styles.logPillPressed]}>
          <Ionicons name="add" size={14} color="#FFFFFF" />
          <Text style={styles.logPillText}>Log</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        <View style={styles.metricTop}>
          <Text style={[styles.metricValue, { color: controlColor }]}>{displayDays}</Text>
          <Text style={styles.metricLabel}>Days fully controlled</Text>
        </View>

        <View style={styles.metricBottom}>
          <Text style={styles.metricLabelSmall}>Environmental risk</Text>
          <View style={styles.riskBar}>
            <View style={styles.riskTrack} />
            <View
              style={[
                styles.riskDot,
                {
                  left: `${Math.min(Math.max(risk.level, 0.05), 0.95) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.riskText}>{`${risk.label}: ${risk.value}`}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.respiratoryLight,
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
    backgroundColor: colors.respiratoryIndigo,
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
    color: colors.textSecondary,
  },
  metricBottom: {
    gap: 8,
  },
  metricLabelSmall: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textTertiary,
  },
  riskBar: {
    height: 12,
    justifyContent: "center",
  },
  riskTrack: {
    height: 8,
    borderRadius: 999,
    borderCurve: "continuous",
    backgroundColor: "rgba(92, 107, 192, 0.18)",
  },
  riskDot: {
    position: "absolute",
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.respiratoryIndigo,
    transform: [{ translateX: -6 }],
  },
  riskText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
});
