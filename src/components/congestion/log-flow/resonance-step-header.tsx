import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

const isIOS = process.env.EXPO_OS === "ios";

interface ResonanceStepHeaderProps {
  title: string;
  subtitle: string;
  titleGap?: number;
  horizontalPadding?: number;
  subtitleWeight?: "400" | "500" | "600";
  style?: StyleProp<ViewStyle>;
}

export function ResonanceStepHeader({
  title,
  subtitle,
  titleGap = 8,
  horizontalPadding = 24,
  subtitleWeight = "400",
  style,
}: ResonanceStepHeaderProps) {
  return (
    <View style={[styles.container, { gap: titleGap, paddingHorizontal: horizontalPadding }, style]}>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable style={[styles.subtitle, { fontWeight: subtitleWeight }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: "#2F3A34",
    textAlign: "center",
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: "#7B857F",
    textAlign: "center",
    lineHeight: 18,
  },
});
