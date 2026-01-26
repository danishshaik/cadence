import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { colors, shadows } from "@theme";
import { useCongestionStore } from "@stores/congestion-store";
import { CongestionLog } from "@/types/congestion";

const isIOS = process.env.EXPO_OS === "ios";

function getCoughSeverity(log?: CongestionLog | null) {
  if (!log) return 0;
  let score = 0;
  if (log.coughCharacters.includes("barking")) score += 0.4;
  if (log.coughCharacters.includes("wet")) score += 0.3;
  if (log.coughCharacters.includes("productive")) score += 0.4;
  if (log.phlegmColor === "green" || log.phlegmColor === "pink") score += 0.3;
  return Math.min(1, score);
}

function getMoonPhase(log?: CongestionLog | null) {
  if (!log) return "full" as const;
  const sleepScore = 1 - log.sleepQuality / 3;
  const coughScore = 1 - getCoughSeverity(log);
  const ratio = (sleepScore + coughScore) / 2;

  if (ratio > 0.7) return "full" as const;
  if (ratio > 0.45) return "crescent" as const;
  return "eclipse" as const;
}

function MoonPhase({ phase }: { phase: "full" | "crescent" | "eclipse" }) {
  return (
    <View style={styles.moonWrap}>
      <View style={styles.moon} />
      {phase === "crescent" && <View style={styles.moonMaskCrescent} />}
      {phase === "eclipse" && <View style={styles.moonMaskEclipse} />}
    </View>
  );
}

export function CongestionAnalyticsWidget() {
  const router = useRouter();
  const logs = useCongestionStore((state) => state.logs);
  const getLatestLog = useCongestionStore((state) => state.getLatestLog);
  const getWetDryTrend = useCongestionStore((state) => state.getWetDryTrend);
  const getRestQualityLabel = useCongestionStore((state) => state.getRestQualityLabel);

  const latestLog = useMemo(() => getLatestLog(), [logs]);
  const phase = useMemo(() => getMoonPhase(latestLog), [latestLog]);
  const restLabel = useMemo(() => getRestQualityLabel(), [logs]);
  const trend = useMemo(() => getWetDryTrend(5), [logs]);

  const handleLog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/log-congestion");
  };

  return (
    <LinearGradient
      colors={[colors.midnightBlue, colors.vaporWhite]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <SymbolView
            name="moon"
            size={18}
            tintColor={colors.restorativeSage}
            fallback={<Text style={styles.fallbackIcon}>●</Text>}
          />
          <Text style={styles.title}>Resonance</Text>
        </View>
        <Pressable onPress={handleLog} style={({ pressed }) => [styles.logPill, pressed && styles.logPillPressed]}>
          <SymbolView
            name="plus"
            size={14}
            tintColor="#FFFFFF"
            fallback={<Text style={styles.fallbackIconLight}>+</Text>}
          />
          <Text style={styles.logPillText}>Log</Text>
        </Pressable>
      </View>

      <View style={styles.topMetric}>
        <MoonPhase phase={phase} />
        <Text style={styles.restLabel}>Rest Quality: {restLabel}</Text>
      </View>

      <View style={styles.bottomMetric}>
        <Text style={styles.trendLabel}>Wet / Dry Trend</Text>
        <View style={styles.trendRow}>
          {trend.map((item, index) => (
            <View
              key={`${item.day}-${index}`}
              style={[
                styles.trendSegment,
                item.type === "productive"
                  ? styles.trendProductive
                  : item.type === "dry"
                  ? styles.trendDry
                  : styles.trendNone,
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  logPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.restorativeSage,
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
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  topMetric: {
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  moonWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  moon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8F1D9",
  },
  moonMaskCrescent: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.midnightBlue,
    right: 8,
  },
  moonMaskEclipse: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.midnightBlue,
    left: 8,
  },
  restLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.restorativeSage,
  },
  bottomMetric: {
    gap: 8,
  },
  trendLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  trendRow: {
    flexDirection: "row",
    gap: 6,
  },
  trendSegment: {
    flex: 1,
    height: 8,
    borderRadius: 6,
  },
  trendProductive: {
    backgroundColor: colors.honeyAmber,
  },
  trendDry: {
    backgroundColor: colors.coughDry,
  },
  trendNone: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  fallbackIcon: {
    color: colors.restorativeSage,
    fontSize: 12,
  },
  fallbackIconLight: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});
