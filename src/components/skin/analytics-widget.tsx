import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Icon } from "@components/ui";
import * as Haptics from "expo-haptics";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";
import { colors } from "@theme";
import { useSkinStore } from "@stores/skin-store";

// Healing Heatmap Sparkline
function HealingSparkline({
  data,
  width,
  height,
  trend,
}: {
  data: { severity: number }[];
  width: number;
  height: number;
  trend: "improving" | "stable" | "worsening";
}) {
  const pathData = useMemo(() => {
    if (data.length < 2) return null;

    const padding = 4;
    const maxVal = 10;
    const minVal = 1;

    // Create points
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + ((maxVal - d.severity) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y };
    });

    // Create smooth curve path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      pathD += ` Q ${cpx} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`;
      pathD += ` Q ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
    }

    // Create fill path (area under curve)
    const fillD = pathD + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { pathD, fillD, lastPoint: points[points.length - 1] };
  }, [data, width, height]);

  if (!pathData) {
    return (
      <View style={{ width, height, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 11, color: colors.textTertiary }}>Log more to see trends</Text>
      </View>
    );
  }

  const lineColor = trend === "improving" ? colors.skin : colors.skinAlert;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
          <Stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>
      {/* Area fill */}
      <Path d={pathData.fillD} fill="url(#sparkFill)" />
      {/* Line */}
      <Path
        d={pathData.pathD}
        fill="none"
        stroke={lineColor}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point */}
      <Circle cx={pathData.lastPoint.x} cy={pathData.lastPoint.y} r={4} fill={lineColor} />
    </Svg>
  );
}

export function SkinAnalyticsWidget() {
  const router = useRouter();
  const logs = useSkinStore((state) => state.logs);
  const streak = useSkinStore((state) => state.getConsistencyStreak());
  const trend = useSkinStore((state) => state.getWeeklyTrend());
  const avgSeverity = useSkinStore((state) => state.getAverageSeverity());

  const recentLogs = useMemo(() => {
    return [...logs].slice(0, 14).reverse().map((log) => ({ severity: log.severity }));
  }, [logs]);

  const handleLogSkin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-skin");
  };

  // Generate week circles for streak display
  const weekCircles = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = 6 - i;
    return dayIndex < streak;
  });

  const trendLabel =
    trend === "improving" ? "Improving" : trend === "worsening" ? "Needs attention" : "Stable";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="sparkles" size={20} color={colors.skin} />
          <Text style={styles.title}>Skin Clarity</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {/* Streak Section */}
        <View style={styles.streakSection}>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Day{streak !== 1 ? "s" : ""}</Text>
          </View>
          <View style={styles.weekCircles}>
            {weekCircles.map((filled, i) => (
              <View key={i} style={[styles.dayCircle, filled && styles.dayCircleFilled]} />
            ))}
          </View>
        </View>

        {/* Sparkline Section */}
        <View style={styles.sparklineSection}>
          <Text style={styles.trendLabel}>{trendLabel}</Text>
          <HealingSparkline data={recentLogs} width={100} height={36} trend={trend} />
        </View>
      </View>

      <Pressable
        onPress={handleLogSkin}
        style={({ pressed }) => [styles.logButton, pressed && styles.logButtonPressed]}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.logButtonText}>Log Skin</Text>
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
  streakSection: {
    flex: 1,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 8,
  },
  streakNumber: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.skin,
  },
  streakLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
  weekCircles: {
    flexDirection: "row",
    gap: 5,
  },
  dayCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayCircleFilled: {
    backgroundColor: colors.skin,
    borderColor: colors.skin,
  },
  sparklineSection: {
    alignItems: "flex-end",
  },
  trendLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 6,
  },
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.skin,
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
