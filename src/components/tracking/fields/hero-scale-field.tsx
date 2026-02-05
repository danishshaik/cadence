import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ExpoSlider } from "@components/ui";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

interface HeroScaleFieldProps extends FieldProps<number> {
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  gradientColors?: string[];
  cardGradientColors?: string[];
  accentColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  pillBackgroundColor?: string;
  tickInactiveColor?: string;
  tickActiveColor?: string;
  hero?: React.ReactNode | ((value: number) => React.ReactNode);
  valueFormatter?: (value: number) => string;
  valueLabel?: string;
  cardShadow?: string;
}

export function HeroScaleField({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  leftLabel,
  rightLabel,
  gradientColors = ["#D1FAE5", "#FEF3C7", "#FBCFE8", "#FCA5A5"],
  cardGradientColors = ["#FFFFFF", "#F7F7F7"],
  accentColor = "#0F172A",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#6B7280",
  pillBackgroundColor = "#E5E7EB",
  tickInactiveColor = "#D1D5DB",
  tickActiveColor = "#0F172A",
  hero,
  valueFormatter,
  valueLabel,
  label,
  description,
  cardShadow = "0 12px 30px rgba(15, 23, 42, 0.12)",
}: HeroScaleFieldProps) {
  const ticks = Array.from({ length: max - min + 1 }, (_, index) => index + min);
  const formattedValue = valueFormatter ? valueFormatter(value) : String(value);
  const heroContent =
    typeof hero === "function"
      ? hero(value)
      : hero ?? (
          <View style={styles.valueStack}>
            <Text selectable style={[styles.valueNumber, { color: accentColor }]}>
              {formattedValue}
            </Text>
            {valueLabel ? (
              <View style={[styles.severityPill, { backgroundColor: pillBackgroundColor }]}>
                <Text selectable style={[styles.severityPillText, { color: accentColor }]}
                >
                  {valueLabel}
                </Text>
              </View>
            ) : null}
          </View>
        );

  return (
    <View style={styles.container}>
      {(label || description) && (
        <View style={styles.titleArea}>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}>
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}>
              {description}
            </Text>
          ) : null}
        </View>
      )}

      <LinearGradient
        colors={cardGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.card, { boxShadow: cardShadow }]}
      >
        {heroContent}

        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrackWrap}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientTrack}
            />
            <ExpoSlider
              style={styles.slider}
              hostStyle={styles.sliderHost}
              minimumValue={min}
              maximumValue={max}
              step={step}
              value={value}
              onValueChange={onChange}
              minimumTrackTintColor={accentColor}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={accentColor}
            />
          </View>
          <View style={styles.sliderTicks}>
            {ticks.map((tick) => {
              const isActive = tick === value;
              return (
                <View
                  key={`tick-${tick}`}
                  style={[
                    styles.tick,
                    { backgroundColor: tickInactiveColor },
                    isActive && [styles.tickActive, { backgroundColor: tickActiveColor }],
                  ]}
                />
              );
            })}
          </View>
          {(leftLabel || rightLabel) && (
            <View style={styles.sliderLabels}>
              <Text selectable style={[styles.sliderLabel, { color: textMutedColor }]}
              >
                {leftLabel ?? ""}
              </Text>
              <Text selectable style={[styles.sliderLabel, { color: textMutedColor }]}
              >
                {rightLabel ?? ""}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
    width: "100%",
  },
  titleArea: {
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 24,
    gap: 20,
    alignItems: "center",
  },
  valueStack: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  valueNumber: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 56,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  severityPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderCurve: "continuous",
  },
  severityPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
  },
  sliderContainer: {
    width: "100%",
    gap: 10,
  },
  sliderTrackWrap: {
    height: 40,
    justifyContent: "center",
  },
  gradientTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 100,
    borderCurve: "continuous",
  },
  slider: {
    height: 40,
  },
  sliderHost: {
    height: 40,
  },
  sliderTicks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 10,
  },
  tick: {
    width: 4,
    height: 4,
    borderRadius: 99,
  },
  tickActive: {
    width: 8,
    height: 8,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
  },
});
