import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ExpoSlider } from "@components/ui";
import { FieldProps } from "../types";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const isIOS = process.env.EXPO_OS === "ios";

interface HeroScaleFieldProps extends FieldProps<number> {
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  gradientColors?: readonly [string, string, ...string[]];
  cardGradientColors?: readonly [string, string, ...string[]];
  accentColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  pillBackgroundColor?: string;
  tickInactiveColor?: string;
  tickActiveColor?: string;
  heroVariant?: "default" | "orb";
  orbSize?: number;
  orbGradientColors?: readonly [string, string, string];
  orbHotGradientColors?: readonly [string, string, string];
  orbShadow?: string;
  orbAnimation?: "expand" | "shake";
  orbShakeMinOffset?: number;
  orbShakeMaxOffset?: number;
  orbShakeRotationDeg?: number;
  orbShakeCycleDurationMs?: number;
  hero?: React.ReactNode | ((value: number) => React.ReactNode);
  valueFormatter?: (value: number) => string;
  valueLabel?: string;
  cardShadow?: string;
}

interface AnimatedOrbProps {
  intensity: number;
  size: number;
  baseGradientColors: readonly [string, string, string];
  hotGradientColors: readonly [string, string, string];
  shadow: string;
  animation: "expand" | "shake";
  shakeMinOffset: number;
  shakeMaxOffset: number;
  shakeRotationDeg: number;
  shakeCycleDurationMs: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ORB_ANIMATION_CONFIG = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

function AnimatedOrb({
  intensity: normalizedIntensity,
  size,
  baseGradientColors,
  hotGradientColors,
  shadow,
  animation,
  shakeMinOffset,
  shakeMaxOffset,
  shakeRotationDeg,
  shakeCycleDurationMs,
}: AnimatedOrbProps) {
  const intensity = useSharedValue(normalizedIntensity);
  const shake = useSharedValue(0);
  const radius = size / 2;
  const gradientSuffix = React.useMemo(
    () => Math.random().toString(36).slice(2, 8),
    []
  );
  const baseGradientId = `heroScaleOrbBase-${gradientSuffix}`;
  const hotGradientId = `heroScaleOrbHot-${gradientSuffix}`;

  React.useEffect(() => {
    intensity.value = withTiming(normalizedIntensity, ORB_ANIMATION_CONFIG);
  }, [intensity, normalizedIntensity]);

  React.useEffect(() => {
    if (animation !== "shake") {
      cancelAnimation(shake);
      shake.value = 0;
      return;
    }
    shake.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: Math.max(80, Math.round(shakeCycleDurationMs / 2)),
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(-1, {
          duration: Math.max(80, Math.round(shakeCycleDurationMs / 2)),
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(shake);
    };
  }, [animation, shake, shakeCycleDurationMs]);

  const motionStyle = useAnimatedStyle(() => {
    if (animation === "shake") {
      const amplitude = interpolate(intensity.value, [0, 1], [shakeMinOffset, shakeMaxOffset]);
      const translateX = shake.value * amplitude;
      const rotate = shake.value * shakeRotationDeg;
      return {
        transform: [{ translateX }, { rotateZ: `${rotate}deg` }],
      };
    }
    const scale = interpolate(intensity.value, [0, 1], [0.92, 1.08]);
    return {
      transform: [{ scale }],
    };
  });

  const overlayProps = useAnimatedProps(() => ({
    opacity: interpolate(intensity.value, [0, 1], [0, 0.85]),
  }));

  return (
    <Animated.View
      style={[
        styles.orbWrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          boxShadow: shadow,
        },
        motionStyle,
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id={baseGradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={baseGradientColors[0]} stopOpacity={0.9} />
            <Stop offset="60%" stopColor={baseGradientColors[1]} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={baseGradientColors[2]} stopOpacity={1} />
          </RadialGradient>
          <RadialGradient id={hotGradientId} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={hotGradientColors[0]} stopOpacity={0.9} />
            <Stop offset="60%" stopColor={hotGradientColors[1]} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={hotGradientColors[2]} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={radius} cy={radius} r={radius} fill={`url(#${baseGradientId})`} />
        <AnimatedCircle
          cx={radius}
          cy={radius}
          r={radius}
          fill={`url(#${hotGradientId})`}
          animatedProps={overlayProps}
        />
      </Svg>
    </Animated.View>
  );
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
  heroVariant = "default",
  orbSize = 160,
  orbGradientColors = ["#DFF7EE", "#88D8B0", "#4DB6AC"],
  orbHotGradientColors = ["#C7F0E0", "#5CC8AF", "#2F9D8F"],
  orbShadow = "0 10px 28px rgba(77, 182, 172, 0.24)",
  orbAnimation = "expand",
  orbShakeMinOffset = 1,
  orbShakeMaxOffset = 5,
  orbShakeRotationDeg = 1.8,
  orbShakeCycleDurationMs = 180,
  hero,
  valueFormatter,
  valueLabel,
  label,
  description,
  cardShadow = "0 12px 30px rgba(15, 23, 42, 0.12)",
}: HeroScaleFieldProps) {
  const ticks = Array.from({ length: max - min + 1 }, (_, index) => index + min);
  const formattedValue = valueFormatter ? valueFormatter(value) : String(value);
  const normalizedOrbIntensity =
    max > min ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;
  const heroContent =
    typeof hero === "function"
      ? hero(value)
      : hero ??
        (heroVariant === "orb" ? (
          <View style={styles.valueStack}>
            <AnimatedOrb
              intensity={normalizedOrbIntensity}
              size={orbSize}
              baseGradientColors={orbGradientColors}
              hotGradientColors={orbHotGradientColors}
              shadow={orbShadow}
              animation={orbAnimation}
              shakeMinOffset={orbShakeMinOffset}
              shakeMaxOffset={orbShakeMaxOffset}
              shakeRotationDeg={orbShakeRotationDeg}
              shakeCycleDurationMs={orbShakeCycleDurationMs}
            />
            <Text selectable style={[styles.valueNumber, { color: accentColor }]}>
              {formattedValue}
            </Text>
            {valueLabel ? (
              <View style={[styles.severityPill, { backgroundColor: pillBackgroundColor }]}>
                <Text selectable style={[styles.severityPillText, { color: accentColor }]}>
                  {valueLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.valueStack}>
            <Text selectable style={[styles.valueNumber, { color: accentColor }]}>
              {formattedValue}
            </Text>
            {valueLabel ? (
              <View style={[styles.severityPill, { backgroundColor: pillBackgroundColor }]}>
                <Text selectable style={[styles.severityPillText, { color: accentColor }]}>
                  {valueLabel}
                </Text>
              </View>
            ) : null}
          </View>
        ));

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
  orbWrap: {
    overflow: "hidden",
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
