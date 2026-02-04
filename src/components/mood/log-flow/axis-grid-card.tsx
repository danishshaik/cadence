import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AxisGrid, type AxisGridValue } from "./axis-grid";
import { mentalWeatherColors, mentalWeatherFonts } from "./mental-weather-theme";

const DEFAULT_GRID_TOP = 28;
const DEFAULT_GRID_INSET = 25;
const DEFAULT_GRID_MAX_SIZE = 300;
const DEFAULT_GRID_WIDTH_OFFSET = 42;
const DEFAULT_MAX_WIDTH = 360;
const DEFAULT_HORIZONTAL_INSET = 24;
const DEFAULT_TOP_LABEL_RATIO = 0.403;
const DEFAULT_BOTTOM_LABEL_RATIO = 0.893;
const DEFAULT_SIDE_LABEL_WIDTH = 84;
const DEFAULT_SIDE_LABEL_HEIGHT = 12;
const DEFAULT_SIDE_LABEL_GAP = 18;
const DEFAULT_SIDE_LABEL_ROTATION = -90;

interface AxisGridCardProps {
  value: AxisGridValue;
  onChange?: (value: AxisGridValue) => void;
  dominantLabel: string;
  leftAxisLabel?: string;
  rightAxisLabel?: string;
  topAxisLabel?: string;
  bottomAxisLabel?: string;
  cardGradient?: string[];
  borderColor?: string;
  borderWidth?: number;
  accentColor?: string;
  accentLightColor?: string;
  textSoftColor?: string;
  textFontFamily?: string;
  maxWidth?: number;
  horizontalInset?: number;
  gridTop?: number;
  gridInset?: number;
  gridMaxSize?: number;
  gridWidthOffset?: number;
  topLabelRatio?: number;
  bottomLabelRatio?: number;
  sideLabelWidth?: number;
  sideLabelHeight?: number;
  sideLabelGap?: number;
  sideLabelRotation?: number;
  interactive?: boolean;
}

export function AxisGridCard({
  value,
  onChange,
  dominantLabel,
  leftAxisLabel = "Unpleasant",
  rightAxisLabel = "Pleasant",
  topAxisLabel = "High energy",
  bottomAxisLabel = "Low energy",
  cardGradient = mentalWeatherColors.cardGradient,
  borderColor = mentalWeatherColors.borderSoft,
  borderWidth = 1,
  accentColor = mentalWeatherColors.accent,
  accentLightColor = mentalWeatherColors.accentLight,
  textSoftColor = mentalWeatherColors.textSoft,
  textFontFamily = mentalWeatherFonts.text,
  maxWidth = DEFAULT_MAX_WIDTH,
  horizontalInset = DEFAULT_HORIZONTAL_INSET,
  gridTop = DEFAULT_GRID_TOP,
  gridInset = DEFAULT_GRID_INSET,
  gridMaxSize = DEFAULT_GRID_MAX_SIZE,
  gridWidthOffset = DEFAULT_GRID_WIDTH_OFFSET,
  topLabelRatio = DEFAULT_TOP_LABEL_RATIO,
  bottomLabelRatio = DEFAULT_BOTTOM_LABEL_RATIO,
  sideLabelWidth = DEFAULT_SIDE_LABEL_WIDTH,
  sideLabelHeight = DEFAULT_SIDE_LABEL_HEIGHT,
  sideLabelGap = DEFAULT_SIDE_LABEL_GAP,
  sideLabelRotation = DEFAULT_SIDE_LABEL_ROTATION,
  interactive = true,
}: AxisGridCardProps) {
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(width - horizontalInset * 2, maxWidth);
  const gridSize = Math.min(cardWidth - gridWidthOffset, gridMaxSize);
  const axisWidth = gridSize - gridInset * 2;
  const gridLeft = (cardWidth - gridSize) / 2;
  const rotatedLabelWidth = sideLabelHeight;
  const rotatedLabelHeight = sideLabelWidth;
  const sideLabelLeft = gridLeft - rotatedLabelWidth - sideLabelGap;
  const topLabelTop = gridTop + gridSize * topLabelRatio - rotatedLabelHeight / 2;
  const bottomLabelTop = gridTop + gridSize * bottomLabelRatio - rotatedLabelHeight / 2;

  return (
    <LinearGradient
      colors={cardGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.card,
        {
          maxWidth: cardWidth,
          paddingTop: gridTop,
          borderColor,
          borderWidth,
        },
      ]}
    >
      <View style={styles.gridWrapper}>
        <AxisGrid
          value={value}
          onChange={onChange}
          size={gridSize}
          lineInset={gridInset}
          interactive={interactive}
        />
      </View>

      <View style={[styles.axisLabels, { width: axisWidth }]}>
        <View style={styles.axisLabelItemLeft}>
          <Text selectable style={[styles.axisLabel, { color: textSoftColor, fontFamily: textFontFamily }]}>
            {leftAxisLabel}
          </Text>
        </View>
        <View style={styles.axisLabelItemRight}>
          <Text selectable style={[styles.axisLabel, { color: textSoftColor, fontFamily: textFontFamily }]}>
            {rightAxisLabel}
          </Text>
        </View>
      </View>

      <View style={[styles.valuePill, { backgroundColor: accentLightColor }]}>
        <Text selectable style={[styles.valueLabel, { color: accentColor, fontFamily: textFontFamily }]}>
          {dominantLabel}
        </Text>
      </View>

      <View
        style={[
          styles.axisSideLabel,
          {
            top: topLabelTop,
            left: sideLabelLeft,
            width: sideLabelWidth,
            height: sideLabelHeight,
            transform: [{ rotate: `${sideLabelRotation}deg` }],
          },
        ]}
      >
        <Text selectable style={[styles.axisSideLabelText, { color: textSoftColor, fontFamily: textFontFamily }]}>
          {topAxisLabel}
        </Text>
      </View>
      <View
        style={[
          styles.axisSideLabel,
          {
            top: bottomLabelTop,
            left: sideLabelLeft,
            width: sideLabelWidth,
            height: sideLabelHeight,
            transform: [{ rotate: `${sideLabelRotation}deg` }],
          },
        ]}
      >
        <Text selectable style={[styles.axisSideLabelText, { color: textSoftColor, fontFamily: textFontFamily }]}>
          {bottomAxisLabel}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderCurve: "continuous",
    paddingBottom: 16,
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  gridWrapper: {
    alignItems: "center",
  },
  axisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  axisLabelItemLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  axisLabelItemRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  valuePill: {
    marginTop: 30,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderCurve: "continuous",
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  axisSideLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  axisSideLabelText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
