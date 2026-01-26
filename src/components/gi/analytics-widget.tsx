import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "@theme";
import { useGIStore } from "@stores/gi-store";
import { GILog } from "@/types/gi";

function GutIcon({ isHappy }: { isHappy: boolean }) {
  const color = isHappy ? colors.gi : colors.giSevere;

  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      {/* Stomach outline */}
      <Path
        d={isHappy
          ? "M16 4C10 4 6 8 6 14C6 20 8 24 12 26C14 27 18 27 20 26C24 24 26 20 26 14C26 8 22 4 16 4Z"
          : "M16 4C10 4 6 8 6 14C6 16 7 18 6.5 19C6 20 5 21 6 23C7 25 10 26 12 26C14 27 18 27 20 26C22 25 25 24 26 22C27 20 26 18 25.5 17C25 16 26 14 26 14C26 8 22 4 16 4Z"
        }
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      {/* Happy face or distress lines */}
      {isHappy ? (
        <>
          <Circle cx={12} cy={13} r={1.5} fill={color} />
          <Circle cx={20} cy={13} r={1.5} fill={color} />
          <Path d="M12 18C13 20 19 20 20 18" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <Circle cx={12} cy={13} r={1.5} fill={color} />
          <Circle cx={20} cy={13} r={1.5} fill={color} />
          <Path d="M12 20C13 18 19 18 20 20" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
          {/* Distress lines */}
          <Path d="M4 10L6 12" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M28 10L26 12" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M4 18L6 16" stroke={color} strokeWidth={1} strokeLinecap="round" />
          <Path d="M28 18L26 16" stroke={color} strokeWidth={1} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

function WeeklyTrendChart({ data }: { data: { day: number; severity: number }[] }) {
  const maxSeverity = 10;
  const barWidth = 8;
  const chartHeight = 32;
  const gap = 6;

  return (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const barHeight = item.severity === 0 ? 4 : (item.severity / maxSeverity) * chartHeight;
        const isHighSeverity = item.severity >= 6;

        return (
          <View key={index} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: barHeight,
                  backgroundColor: isHighSeverity ? colors.giSevere : colors.gi,
                  opacity: item.severity === 0 ? 0.3 : 1,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

// Compute derived values from logs
function computeIsFlareUp(logs: GILog[]): boolean {
  if (logs.length === 0) return false;
  const latest = logs[0];
  const logDate = new Date(latest.startedAt);
  const dayAgo = new Date();
  dayAgo.setDate(dayAgo.getDate() - 1);
  return logDate >= dayAgo && latest.severity >= 6;
}

function computeDaysSinceFlareUp(logs: GILog[]): number {
  const flareUps = logs.filter((log) => log.severity >= 6);
  if (flareUps.length === 0) return 30;
  const lastFlareUp = new Date(flareUps[0].startedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastFlareUp.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function computeWeeklyTrend(logs: GILog[]): { day: number; severity: number }[] {
  const trend: { day: number; severity: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const dayLogs = logs.filter((log) => {
      const logDate = new Date(log.startedAt);
      return logDate >= date && logDate < nextDate;
    });
    const maxSeverity = dayLogs.length > 0 ? Math.max(...dayLogs.map((l) => l.severity)) : 0;
    trend.push({ day: 6 - i, severity: maxSeverity });
  }
  return trend;
}

export function GIAnalyticsWidget() {
  const router = useRouter();
  const logs = useGIStore((state) => state.logs);

  const isFlareUp = useMemo(() => computeIsFlareUp(logs), [logs]);
  const daysSinceFlareUp = useMemo(() => computeDaysSinceFlareUp(logs), [logs]);
  const weeklyTrend = useMemo(() => computeWeeklyTrend(logs), [logs]);

  const handleLogSymptom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-gi");
  };

  const statusText = isFlareUp ? "Flare-up" : "Stable";
  const statusSubtext = isFlareUp
    ? "Active symptoms"
    : daysSinceFlareUp === 0
      ? "Feeling good today"
      : `${daysSinceFlareUp} day${daysSinceFlareUp !== 1 ? "s" : ""} without symptoms`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="leaf" size={20} color={colors.gi} />
          <Text style={styles.title}>Digestive Health</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <GutIcon isHappy={!isFlareUp} />
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, isFlareUp && styles.statusLabelFlare]}>
              {statusText}
            </Text>
            <Text style={styles.statusSubtext}>{statusSubtext}</Text>
          </View>
        </View>

        {/* Trend Section */}
        <View style={styles.trendSection}>
          <Text style={styles.trendLabel}>This week</Text>
          <WeeklyTrendChart data={weeklyTrend} />
        </View>
      </View>

      <Pressable
        onPress={handleLogSymptom}
        style={({ pressed }) => [styles.logButton, pressed && styles.logButtonPressed]}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.logButtonText}>Log Symptoms</Text>
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
  contentRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  statusSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.gi,
    marginBottom: 2,
  },
  statusLabelFlare: {
    color: colors.giSevere,
  },
  statusSubtext: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
  trendSection: {
    alignItems: "flex-end",
  },
  trendLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 32,
  },
  barWrapper: {
    justifyContent: "flex-end",
    height: 32,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gi,
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
