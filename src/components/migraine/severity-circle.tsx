import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";

interface SeverityCircleProps {
  severity: number; // 0-10
  size?: number;
  baseGradientColors?: readonly [string, string, string];
  hotGradientColors?: readonly [string, string, string];
  shadow?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ANIMATION_CONFIG = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

export function SeverityCircle({
  severity,
  size = 160,
  baseGradientColors = ["#FFE6F3", "#FFB6DA", "#F48BC9"],
  hotGradientColors = ["#FF8AC7", "#F05FA9", "#C2185B"],
  shadow = "0 10px 28px rgba(233, 30, 140, 0.28)",
}: SeverityCircleProps) {
  const normalizedIntensity = Math.min(1, Math.max(0, severity / 10));
  const intensity = useSharedValue(normalizedIntensity);

  React.useEffect(() => {
    intensity.value = withTiming(normalizedIntensity, ANIMATION_CONFIG);
  }, [intensity, normalizedIntensity]);

  const scaleStyle = useAnimatedStyle(() => {
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
      style={[styles.container, { width: size, height: size, boxShadow: shadow }, scaleStyle]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="migraineBase" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={baseGradientColors[0]} stopOpacity={0.9} />
            <Stop offset="60%" stopColor={baseGradientColors[1]} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={baseGradientColors[2]} stopOpacity={1} />
          </RadialGradient>
          <RadialGradient id="migraineHot" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={hotGradientColors[0]} stopOpacity={0.9} />
            <Stop offset="60%" stopColor={hotGradientColors[1]} stopOpacity={0.95} />
            <Stop offset="100%" stopColor={hotGradientColors[2]} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#migraineBase)" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill="url(#migraineHot)"
          animatedProps={overlayProps}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
