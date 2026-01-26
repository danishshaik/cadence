import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from "react-native-svg";
import { colors } from "@theme";
import { useMoodStore } from "@stores/mood-store";

// Mood Blob SVG - organic shape that reflects energy/positivity
function MoodBlob({ energy, positivity, size }: { energy: number; positivity: number; size: number }) {
  // Color based on position
  let fillColor: string = colors.moodMuted;
  if (positivity > 0.2 && energy > 0.2) {
    fillColor = colors.moodWarm;
  } else if (positivity < -0.2 && energy < -0.2) {
    fillColor = colors.moodDark;
  } else if (positivity < -0.2 && energy > 0.2) {
    fillColor = "#FF7675";
  } else if (positivity > 0.2 && energy < -0.2) {
    fillColor = colors.moodCool;
  }

  // Organic blob shape that varies with energy
  const blobPath = energy > 0
    ? "M 50,10 C 75,15 90,35 85,55 C 80,75 65,90 45,90 C 25,90 10,75 15,50 C 20,25 30,10 50,10"
    : "M 50,15 C 70,20 85,40 80,60 C 75,80 60,88 45,85 C 30,82 15,70 20,50 C 25,30 35,15 50,15";

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={fillColor} stopOpacity={0.9} />
          <Stop offset="100%" stopColor={fillColor} stopOpacity={0.6} />
        </LinearGradient>
      </Defs>
      <G>
        {/* Soft glow */}
        <Circle cx={50} cy={50} r={40} fill={fillColor} opacity={0.2} />
        {/* Main blob */}
        <Path d={blobPath} fill="url(#blobGrad)" />
      </G>
    </Svg>
  );
}

// River Flow Chart - smooth wave representing the week
function RiverFlowChart({ data, width, height }: {
  data: { day: number; energy: number; positivity: number }[];
  width: number;
  height: number;
}) {
  const pathData = useMemo(() => {
    if (data.length === 0) return "";

    const segmentWidth = width / (data.length - 1 || 1);
    const midHeight = height / 2;

    // Build a smooth bezier curve
    let path = "";
    const points = data.map((d, i) => ({
      x: i * segmentWidth,
      y: midHeight - (d.energy * midHeight * 0.7), // energy affects wave height
    }));

    if (points.length < 2) {
      return `M 0,${midHeight} L ${width},${midHeight}`;
    }

    path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + segmentWidth * 0.5;
      const cp2x = p1.x - segmentWidth * 0.5;
      path += ` C ${cp1x},${p0.y} ${cp2x},${p1.y} ${p1.x},${p1.y}`;
    }

    // Close the path to create filled area
    const bottomPath = `L ${width},${height} L 0,${height} Z`;
    return path + bottomPath;
  }, [data, width, height]);

  // Get average positivity for color
  const avgPositivity = data.length > 0
    ? data.reduce((sum, d) => sum + d.positivity, 0) / data.length
    : 0;

  const waveColor = avgPositivity > 0.2
    ? colors.moodWarm
    : avgPositivity < -0.2
      ? colors.moodCool
      : colors.moodMuted;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={waveColor} stopOpacity={0.3} />
          <Stop offset="50%" stopColor={waveColor} stopOpacity={0.6} />
          <Stop offset="100%" stopColor={waveColor} stopOpacity={0.3} />
        </LinearGradient>
      </Defs>
      <Path d={pathData} fill="url(#waveGrad)" />
      {/* Top wave line */}
      <Path
        d={pathData.split(" L ")[0]}
        fill="none"
        stroke={waveColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MoodAnalyticsWidget() {
  const router = useRouter();
  const logs = useMoodStore((state) => state.logs);
  const getLatestLog = useMoodStore((state) => state.getLatestLog);
  const getCurrentVibe = useMoodStore((state) => state.getCurrentVibe);
  const getWeeklyTrend = useMoodStore((state) => state.getWeeklyTrend);

  const latestLog = useMemo(() => getLatestLog(), [logs]);
  const currentVibe = useMemo(() => getCurrentVibe(), [logs]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(), [logs]);

  const handleLogMood = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-mood");
  };

  const energy = latestLog?.energy ?? 0;
  const positivity = latestLog?.positivity ?? 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="cloudy" size={20} color={colors.mood} />
          <Text style={styles.title}>Mental Weather</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        {/* Current State */}
        <View style={styles.blobSection}>
          <MoodBlob energy={energy} positivity={positivity} size={56} />
          <View style={styles.vibeText}>
            <Text style={styles.vibeLabel}>{currentVibe}</Text>
            <Text style={styles.vibeSubtext}>Current vibe</Text>
          </View>
        </View>

        {/* Trend Section */}
        <View style={styles.trendSection}>
          <Text style={styles.trendLabel}>Last 7 Days</Text>
          <RiverFlowChart data={weeklyTrend} width={100} height={36} />
        </View>
      </View>

      <Pressable
        onPress={handleLogMood}
        style={({ pressed }) => [styles.logButton, pressed && styles.logButtonPressed]}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.logButtonText}>Check In</Text>
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
  blobSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vibeText: {
    flex: 1,
  },
  vibeLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 18,
    fontWeight: "700",
    color: colors.mood,
    marginBottom: 2,
  },
  vibeSubtext: {
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
  logButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.mood,
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
