import React from "react";
import { View, Text, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Line, G, Circle, Ellipse } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogMood } from "./log-mood-provider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const GRID_CELLS = 6;
const HANDLE_SIZE = 24;

// Timing config for smooth, non-springy animation
const SMOOTH_CONFIG = {
  duration: 200,
  easing: Easing.out(Easing.cubic),
};

export function CoreStateStep() {
  const { formData, updateFormData } = useLogMood();
  const { width: screenWidth } = useWindowDimensions();

  // Grid sizing - make it square and centered
  const gridSize = Math.min(screenWidth - 100, 280);
  const cardPadding = 16;
  const innerGridSize = gridSize - cardPadding * 2;

  // Shared values for position (0-1 normalized)
  const normalizedX = useSharedValue((formData.positivity + 1) / 2);
  const normalizedY = useSharedValue((1 - (formData.energy + 1) / 2));
  const scale = useSharedValue(1);

  // For gesture tracking
  const startX = useSharedValue((formData.positivity + 1) / 2);
  const startY = useSharedValue((1 - (formData.energy + 1) / 2));

  // Handle visibility (only show when dragging)
  const isDragging = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateValues = (nx: number, ny: number) => {
    const positivity = nx * 2 - 1;
    const energy = 1 - ny * 2;
    updateFormData({
      positivity: Math.max(-1, Math.min(1, positivity)),
      energy: Math.max(-1, Math.min(1, energy)),
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = normalizedX.value;
      startY.value = normalizedY.value;
      scale.value = withTiming(1.05, { duration: 150 });
      isDragging.value = withTiming(1, { duration: 150 });
      runOnJS(triggerHaptic)();
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(1, startX.value + e.translationX / innerGridSize));
      const newY = Math.max(0, Math.min(1, startY.value + e.translationY / innerGridSize));
      normalizedX.value = newX;
      normalizedY.value = newY;
    })
    .onEnd(() => {
      startX.value = normalizedX.value;
      startY.value = normalizedY.value;
      scale.value = withTiming(1, { duration: 150 });
      isDragging.value = withTiming(0, { duration: 200 });
      runOnJS(updateValues)(normalizedX.value, normalizedY.value);
      runOnJS(triggerHaptic)();
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      const tapX = (e.x - cardPadding) / innerGridSize;
      const tapY = (e.y - cardPadding) / innerGridSize;
      const newX = Math.max(0, Math.min(1, tapX));
      const newY = Math.max(0, Math.min(1, tapY));

      normalizedX.value = withTiming(newX, SMOOTH_CONFIG);
      normalizedY.value = withTiming(newY, SMOOTH_CONFIG);
      startX.value = newX;
      startY.value = newY;
      runOnJS(updateValues)(newX, newY);
      runOnJS(triggerHaptic)();
    });

  const gesture = Gesture.Race(panGesture, tapGesture);

  // Simple circle blob
  const blobProps = useAnimatedProps(() => {
    const x = normalizedX.value * innerGridSize + cardPadding;
    const y = normalizedY.value * innerGridSize + cardPadding;
    const radius = 35 * scale.value;

    return {
      cx: x,
      cy: y,
      r: radius,
    };
  });

  // Glow behind blob
  const glowProps = useAnimatedProps(() => {
    const x = normalizedX.value * innerGridSize + cardPadding;
    const y = normalizedY.value * innerGridSize + cardPadding;
    const baseSize = 50 * scale.value;

    return {
      cx: x,
      cy: y,
      rx: baseSize,
      ry: baseSize,
    };
  });

  // Handle position and visibility (only visible when dragging)
  const handleStyle = useAnimatedStyle(() => {
    const x = normalizedX.value * innerGridSize + cardPadding;
    const y = normalizedY.value * innerGridSize + cardPadding;

    return {
      opacity: isDragging.value,
      transform: [
        { translateX: x - HANDLE_SIZE / 2 },
        { translateY: y - HANDLE_SIZE / 2 },
        { scale: scale.value },
      ],
    };
  });

  // Generate grid lines
  const gridLines = [];
  const cellSize = innerGridSize / GRID_CELLS;

  for (let i = 0; i <= GRID_CELLS; i++) {
    const pos = i * cellSize + cardPadding;
    const isEdge = i === 0 || i === GRID_CELLS;
    const isCenter = i === GRID_CELLS / 2;

    // Vertical lines
    gridLines.push(
      <Line
        key={`v-${i}`}
        x1={pos}
        y1={cardPadding}
        x2={pos}
        y2={gridSize - cardPadding}
        stroke={isCenter ? colors.textSecondary : colors.border}
        strokeWidth={isCenter ? 1.5 : isEdge ? 1 : 0.5}
        opacity={isCenter ? 0.5 : isEdge ? 0.3 : 0.25}
      />
    );
    // Horizontal lines
    gridLines.push(
      <Line
        key={`h-${i}`}
        x1={cardPadding}
        y1={pos}
        x2={gridSize - cardPadding}
        y2={pos}
        stroke={isCenter ? colors.textSecondary : colors.border}
        strokeWidth={isCenter ? 1.5 : isEdge ? 1 : 0.5}
        opacity={isCenter ? 0.5 : isEdge ? 0.3 : 0.25}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How does your mind{"\n"}feel right now?</Text>

      <View style={styles.gridWrapper}>
        <View style={styles.gridColumn}>
          {/* Y-Axis Labels - Rotated text along left edge, centered in each quadrant half */}
          <View style={[styles.yAxisLabelTop, { top: cardPadding + innerGridSize / 4 }]}>
            <Text style={styles.axisLabelVertical}>High Energy</Text>
          </View>
          <View style={[styles.yAxisLabelBottom, { top: cardPadding + (innerGridSize * 3) / 4 }]}>
            <Text style={styles.axisLabelVertical}>Low Energy</Text>
          </View>

          {/* Grid Card */}
          <View style={[styles.gridCard, { width: gridSize, height: gridSize }]}>
            <GestureDetector gesture={gesture}>
              <View style={styles.gridInner}>
                <Svg width={gridSize} height={gridSize}>
                  <Defs>
                    <RadialGradient id="blobGlow" cx="50%" cy="40%" rx="50%" ry="60%">
                      <Stop offset="0%" stopColor="#FDCB6E" stopOpacity={0.5} />
                      <Stop offset="50%" stopColor="#FDCB6E" stopOpacity={0.2} />
                      <Stop offset="100%" stopColor="#FDCB6E" stopOpacity={0} />
                    </RadialGradient>
                    <LinearGradient id="blobFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#F9CA54" />
                      <Stop offset="100%" stopColor="#E8A838" />
                    </LinearGradient>
                  </Defs>

                  {/* White grid background */}
                  <Rect
                    x={cardPadding}
                    y={cardPadding}
                    width={innerGridSize}
                    height={innerGridSize}
                    fill="#FFFFFF"
                    rx={4}
                  />

                  {/* Grid lines */}
                  <G>{gridLines}</G>

                  {/* Glow behind blob */}
                  <AnimatedEllipse
                    animatedProps={glowProps}
                    fill="url(#blobGlow)"
                  />

                  {/* Circle blob */}
                  <AnimatedCircle
                    animatedProps={blobProps}
                    fill="url(#blobFill)"
                  />
                </Svg>

                {/* Draggable handle */}
                <Animated.View style={[styles.handle, handleStyle]}>
                  <View style={styles.handleInner} />
                </Animated.View>
              </View>
            </GestureDetector>
          </View>

          {/* X-Axis Labels */}
          <View style={[styles.xAxisLabels, { width: gridSize }]}>
            <Text style={styles.axisLabel}>Unpleasant</Text>
            <Text style={styles.axisLabel}>Pleasant</Text>
          </View>
        </View>
      </View>

      {/* Current mood label */}
      <View style={styles.moodLabelContainer}>
        <Text style={styles.moodLabel}>{formData.dominantMood}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 34,
  },
  gridWrapper: {
    alignItems: "center",
  },
  yAxisLabelTop: {
    position: "absolute",
    left: -48,
    width: 80,
    alignItems: "center",
    zIndex: 1,
  },
  yAxisLabelBottom: {
    position: "absolute",
    left: -48,
    width: 80,
    alignItems: "center",
    zIndex: 1,
  },
  axisLabelVertical: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
    transform: [{ rotate: "-90deg" }],
  },
  gridColumn: {
    alignItems: "center",
    position: "relative",
  },
  gridCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gridInner: {
    flex: 1,
  },
  xAxisLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  axisLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  handle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#A29BFE",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#6C5CE7",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  handleInner: {
    width: HANDLE_SIZE - 6,
    height: HANDLE_SIZE - 6,
    borderRadius: (HANDLE_SIZE - 6) / 2,
    backgroundColor: "#6C5CE7",
  },
  moodLabelContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  moodLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "600",
    color: colors.mood,
  },
});
