import React from "react";
import { View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Line, Circle, Ellipse } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { mentalWeatherColors } from "./mental-weather-theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const SMOOTH_CONFIG = { duration: 180 };

const clamp = (value: number, min = 0, max = 1) => {
  "worklet";
  return Math.min(max, Math.max(min, value));
};

export interface AxisGridValue {
  energy: number;
  positivity: number;
}

interface AxisGridProps {
  value: AxisGridValue;
  onChange?: (value: AxisGridValue) => void;
  size?: number;
  lineInset?: number;
  blobRatio?: number;
  glowRatio?: number;
  interactive?: boolean;
}

export function AxisGrid({
  value,
  onChange,
  size = 300,
  lineInset = 25,
  blobRatio = 0.3,
  glowRatio = 0.47,
  interactive = true,
}: AxisGridProps) {
  const padding = Math.min(lineInset, size * 0.2);
  const innerSize = size - padding * 2;
  const center = padding + innerSize / 2;
  const gridRadius = Math.min(20, size * 0.08);
  const innerRadius = Math.max(0, gridRadius - 4);
  const blobRadius = (size * blobRatio) / 2;
  const glowRadius = (size * glowRatio) / 2;
  const insetRatio = blobRadius / innerSize;
  const minBound = Math.min(0.5, Math.max(0, insetRatio));
  const maxBound = Math.min(1, Math.max(0.5, 1 - insetRatio));
  const clampToBounds = (value: number) => {
    "worklet";
    return clamp(value, minBound, maxBound);
  };
  const initialX = Math.min(maxBound, Math.max(minBound, (value.positivity + 1) / 2));
  const initialY = Math.min(maxBound, Math.max(minBound, 1 - (value.energy + 1) / 2));

  const normalizedX = useSharedValue(initialX);
  const normalizedY = useSharedValue(initialY);
  const startX = useSharedValue(initialX);
  const startY = useSharedValue(initialY);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    normalizedX.value = withTiming(clampToBounds((value.positivity + 1) / 2), SMOOTH_CONFIG);
    normalizedY.value = withTiming(clampToBounds(1 - (value.energy + 1) / 2), SMOOTH_CONFIG);
  }, [value.positivity, value.energy, normalizedX, normalizedY]);

  const triggerHaptic = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const updateValues = React.useCallback(
    (nx: number, ny: number) => {
      const positivity = nx * 2 - 1;
      const energy = 1 - ny * 2;
      onChange?.({
        positivity: Math.max(-1, Math.min(1, positivity)),
        energy: Math.max(-1, Math.min(1, energy)),
      });
    },
    [onChange]
  );

  const panGesture = Gesture.Pan()
    .enabled(interactive)
    .onStart(() => {
      startX.value = normalizedX.value;
      startY.value = normalizedY.value;
      scale.value = withTiming(1.04, { duration: 150 });
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      const nextX = clampToBounds(startX.value + event.translationX / innerSize);
      const nextY = clampToBounds(startY.value + event.translationY / innerSize);
      normalizedX.value = nextX;
      normalizedY.value = nextY;
    })
    .onEnd(() => {
      startX.value = normalizedX.value;
      startY.value = normalizedY.value;
      scale.value = withTiming(1, { duration: 150 });
      runOnJS(updateValues)(normalizedX.value, normalizedY.value);
      runOnJS(triggerHaptic)();
    });

  const tapGesture = Gesture.Tap()
    .enabled(interactive)
    .onEnd((event) => {
      const tapX = clampToBounds((event.x - padding) / innerSize);
      const tapY = clampToBounds((event.y - padding) / innerSize);
      normalizedX.value = withTiming(tapX, SMOOTH_CONFIG);
      normalizedY.value = withTiming(tapY, SMOOTH_CONFIG);
      startX.value = tapX;
      startY.value = tapY;
      runOnJS(updateValues)(tapX, tapY);
      runOnJS(triggerHaptic)();
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const blobProps = useAnimatedProps(() => ({
    cx: normalizedX.value * innerSize + padding,
    cy: normalizedY.value * innerSize + padding,
    r: blobRadius * scale.value,
  }));

  const glowProps = useAnimatedProps(() => ({
    cx: normalizedX.value * innerSize + padding,
    cy: normalizedY.value * innerSize + padding,
    rx: glowRadius * scale.value,
    ry: glowRadius * scale.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { width: size, height: size, borderRadius: gridRadius }]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="blobGlow" cx="50%" cy="40%" rx="50%" ry="60%">
              <Stop offset="0%" stopColor="#FDCB6E" stopOpacity={0.33} />
              <Stop offset="50%" stopColor="#FDCB6E" stopOpacity={0.12} />
              <Stop offset="100%" stopColor="#FDCB6E" stopOpacity={0} />
            </RadialGradient>
            <LinearGradient id="blobFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#F9CA54" />
              <Stop offset="100%" stopColor="#E8A838" />
            </LinearGradient>
          </Defs>

          <Rect
            x={padding}
            y={padding}
            width={innerSize}
            height={innerSize}
            fill="#FFFFFF"
            rx={innerRadius}
          />

          <Line
            x1={padding}
            y1={center}
            x2={size - padding}
            y2={center}
            stroke={mentalWeatherColors.gridLine}
            strokeWidth={1}
          />
          <Line
            x1={center}
            y1={padding}
            x2={center}
            y2={size - padding}
            stroke={mentalWeatherColors.gridLine}
            strokeWidth={1}
          />

          <AnimatedEllipse animatedProps={glowProps} fill="url(#blobGlow)" />
          <AnimatedCircle animatedProps={blobProps} fill="url(#blobFill)" />
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
