import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@theme";

const isIOS = process.env.EXPO_OS === "ios";

export function BreatheDashboardWidget() {
  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreValue}>12</Text>
        <Text style={styles.scoreLabel}>Days fully controlled</Text>
      </View>

      <View style={styles.airQualityContainer}>
        <Text style={styles.aqLabel}>Air Quality: Good</Text>
        <View style={styles.aqBar}>
          <LinearGradient
            colors={["#4CAF50", "#81D4FA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aqFill}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 170,
    height: 170,
    backgroundColor: colors.respiratoryLight,
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden", // clip: true
  },
  scoreContainer: {
    gap: 2,
  },
  scoreValue: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 36,
    fontWeight: "700",
    color: colors.respiratoryIndigo,
  },
  scoreLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: "#3D5A80",
    width: 120,
  },
  airQualityContainer: {
    gap: 6,
  },
  aqLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(92, 107, 192, 0.5)", // #5C6BC080
  },
  aqBar: {
    width: "100%",
    height: 6,
    backgroundColor: colors.respiratoryLight, // #E1F5FE, same as bg so might be invisible if not for containing frame?
    // In design pen: fill: #E1F5FE. Wait, if bar has same fill as container, it's invisible.
    // Maybe it's a placeholder?
    // Actually, in design pen, "AQ Bar" has fill #E1F5FE.
    // And "aqFill" is inside it.
    borderRadius: 100,
  },
  aqFill: {
    width: 40,
    height: 6,
    borderRadius: 100,
  },
});
