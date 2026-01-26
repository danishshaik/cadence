import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { SymbolView } from "expo-symbols";
import { colors } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";

const isIOS = process.env.EXPO_OS === "ios";

export function ArthritisDashboardWidget() {
  const getWeatherCorrelation = useArthritisStore((state) => state.getWeatherCorrelation);
  const getDailyStiffness = useArthritisStore((state) => state.getDailyStiffness);
  const getMostAffectedJoints = useArthritisStore((state) => state.getMostAffectedJoints);
  const logs = useArthritisStore((state) => state.logs);

  // Get weather correlation data
  const weatherData = getWeatherCorrelation();
  const hasWeatherCorrelation = weatherData.percentage > 50;

  // Get most affected joint for insight text
  const topJoints = getMostAffectedJoints(1);
  const topJoint = topJoints.length > 0 ? topJoints[0].id : null;
  const jointLabel = topJoint
    ? topJoint.replace(/_/g, " ").replace(/left|right/gi, "").trim()
    : "joints";

  // Get daily stiffness for the mini graph (last 5 days)
  const dailyData = getDailyStiffness(5);

  // Calculate graph points
  const graphWidth = 130;
  const graphHeight = 30;
  const maxStiffness = 10;

  const validPoints = dailyData.filter((d) => d.stiffness !== null);
  const points = dailyData.map((d, i) => {
    const x = (i / (dailyData.length - 1)) * graphWidth;
    const y = d.stiffness !== null
      ? graphHeight - (d.stiffness / maxStiffness) * graphHeight
      : graphHeight / 2;
    return { x, y, hasData: d.stiffness !== null, stiffness: d.stiffness };
  });

  const polylinePoints = points
    .filter((p) => p.hasData)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Get latest status for the dot color
  const latestLog = logs.length > 0 ? logs[0] : null;
  const latestStiffness = latestLog?.stiffness ?? 3;
  const dotColor = latestStiffness <= 3 ? colors.arthritis : colors.arthritisAlert;

  // Insight text based on data
  const insightText = hasWeatherCorrelation
    ? "Pressure Drop"
    : latestStiffness <= 3
    ? "Feeling Good"
    : "Monitor Activity";

  const insightCaption = hasWeatherCorrelation
    ? `Likely cause of ${jointLabel} stiffness`
    : latestStiffness <= 3
    ? "Mobility is good today"
    : `${jointLabel} needs attention`;

  return (
    <View style={styles.container}>
      {/* Top Half - Correlation Insight */}
      <View style={styles.insightSection}>
        <View style={styles.insightRow}>
          <View style={styles.weatherIcon}>
            <SymbolView
              name={hasWeatherCorrelation ? "cloud.rain.fill" : "sun.max.fill"}
              size={16}
              tintColor={hasWeatherCorrelation ? colors.arthritisTextSecondary : colors.arthritis}
              fallback={
                <Text style={styles.weatherIconFallback}>
                  {hasWeatherCorrelation ? "☁" : "☀"}
                </Text>
              }
            />
          </View>
          <Text style={styles.insightText}>{insightText}</Text>
        </View>
        <Text style={styles.insightCaption}>{insightCaption}</Text>
      </View>

      {/* Bottom Half - Mobility Trend Line */}
      <View style={styles.trendSection}>
        <Text style={styles.trendLabel}>5-Day Mobility</Text>
        <View style={styles.graphContainer}>
          <Svg width={graphWidth} height={graphHeight + 10} viewBox={`0 -5 ${graphWidth} ${graphHeight + 10}`}>
            {/* Baseline */}
            <Line
              x1="0"
              y1={graphHeight}
              x2={graphWidth}
              y2={graphHeight}
              stroke="rgba(119, 221, 119, 0.2)"
              strokeWidth="1"
            />
            {/* Trend line */}
            {polylinePoints && (
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke={colors.arthritis}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Data points */}
            {points.map((p, i) =>
              p.hasData ? (
                <Circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={i === points.length - 1 ? 5 : 3}
                  fill={
                    p.stiffness !== null && p.stiffness <= 3
                      ? colors.arthritis
                      : colors.arthritisAlert
                  }
                />
              ) : null
            )}
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 170,
    height: 170,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.arthritisBorder,
  },
  insightSection: {
    gap: 4,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.arthritisSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  weatherIconFallback: {
    fontSize: 12,
  },
  insightText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    fontWeight: "700",
    color: colors.arthritisText,
  },
  insightCaption: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: colors.arthritisTextSecondary,
    marginLeft: 32,
  },
  trendSection: {
    gap: 6,
  },
  trendLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(108, 122, 114, 0.7)",
  },
  graphContainer: {
    height: 40,
    justifyContent: "flex-end",
  },
});
