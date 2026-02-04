import React from "react";
import { StyleSheet, Text, View, ViewStyle, TextStyle } from "react-native";
import { mentalWeatherColors, mentalWeatherFonts } from "./mental-weather-theme";

type FlowTitleAlign = "center" | "left";

interface FlowTitleProps {
  title: string;
  subtitle?: string;
  align?: FlowTitleAlign;
  titleColor?: string;
  subtitleColor?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export function FlowTitle({
  title,
  subtitle,
  align = "center",
  titleColor = mentalWeatherColors.textPrimary,
  subtitleColor = mentalWeatherColors.textSoft,
  containerStyle,
  titleStyle,
  subtitleStyle,
}: FlowTitleProps) {
  const isCentered = align === "center";

  return (
    <View
      style={[
        styles.container,
        isCentered ? styles.centered : styles.leftAligned,
        containerStyle,
      ]}
    >
      <Text
        selectable
        style={[
          styles.title,
          { color: titleColor },
          isCentered && styles.centeredText,
          titleStyle,
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          selectable
          style={[
            styles.subtitle,
            { color: subtitleColor },
            isCentered && styles.centeredText,
            subtitleStyle,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  centered: {
    alignItems: "center",
  },
  leftAligned: {
    alignItems: "flex-start",
  },
  centeredText: {
    textAlign: "center",
  },
  title: {
    fontFamily: mentalWeatherFonts.rounded,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 15,
    fontWeight: "500",
  },
});
