import React, { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { JointLocationId, JOINT_LOCATIONS } from "@/types/arthritis";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

// Design coordinate system
const DESIGN_WIDTH = 260;
const DESIGN_HEIGHT = 380;

const SILHOUETTE_COLOR = "#F3F4F6";
const JOINT_STROKE = "#E5E7EB";
const JOINT_SELECTED = "#77DD77";
const JOINT_RING = "rgba(119, 221, 119, 0.125)";

const JOINT_DOT_SIZE = 20;
const JOINT_RING_SIZE = 32;

const SILHOUETTE_PARTS = [
  { x: 105, y: 20, width: 50, height: 50, radius: 25 }, // Head
  { x: 95, y: 75, width: 70, height: 120, radius: 20 }, // Torso
  { x: 65, y: 80, width: 24, height: 100, radius: 12 }, // Left arm
  { x: 171, y: 80, width: 24, height: 100, radius: 12 }, // Right arm
  { x: 95, y: 200, width: 28, height: 130, radius: 14 }, // Left leg
  { x: 137, y: 200, width: 28, height: 130, radius: 14 }, // Right leg
];

const JOINT_POSITIONS: Partial<Record<JointLocationId, { x: number; y: number }>> = {
  shoulder_left: { x: 77 / DESIGN_WIDTH, y: 90 / DESIGN_HEIGHT },
  shoulder_right: { x: 183 / DESIGN_WIDTH, y: 90 / DESIGN_HEIGHT },
  elbow_left: { x: 77 / DESIGN_WIDTH, y: 135 / DESIGN_HEIGHT },
  elbow_right: { x: 183 / DESIGN_WIDTH, y: 135 / DESIGN_HEIGHT },
  wrist_left: { x: 77 / DESIGN_WIDTH, y: 175 / DESIGN_HEIGHT },
  wrist_right: { x: 183 / DESIGN_WIDTH, y: 175 / DESIGN_HEIGHT },
  hip_left: { x: 109 / DESIGN_WIDTH, y: 200 / DESIGN_HEIGHT },
  hip_right: { x: 151 / DESIGN_WIDTH, y: 200 / DESIGN_HEIGHT },
  knee_left: { x: 109 / DESIGN_WIDTH, y: 260 / DESIGN_HEIGHT },
  knee_right: { x: 151 / DESIGN_WIDTH, y: 260 / DESIGN_HEIGHT },
  ankle_left: { x: 109 / DESIGN_WIDTH, y: 320 / DESIGN_HEIGHT },
  ankle_right: { x: 151 / DESIGN_WIDTH, y: 320 / DESIGN_HEIGHT },
};

function SkeletonMap({ width, height }: { width: number; height: number }) {
  const scale = width / DESIGN_WIDTH;
  const s = (v: number) => v * scale;

  return (
    <View style={{ width, height }}>
      {SILHOUETTE_PARTS.map((part, index) => (
        <View
          key={`sil-${index}`}
          style={{
            position: "absolute",
            left: s(part.x),
            top: s(part.y),
            width: s(part.width),
            height: s(part.height),
            borderRadius: s(part.radius),
            backgroundColor: SILHOUETTE_COLOR,
          }}
        />
      ))}
    </View>
  );
}

function JointDot({
  id,
  x,
  y,
  selected,
  onPress,
  scale = 1,
}: {
  id: JointLocationId;
  x: number;
  y: number;
  selected: boolean;
  onPress: (id: JointLocationId) => void;
  scale?: number;
}) {
  const pulseScale = useSharedValue(1);
  const dotSize = JOINT_DOT_SIZE * scale;
  const pulseSize = JOINT_RING_SIZE * scale;

  React.useEffect(() => {
    if (selected) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [selected]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: selected ? 0.3 : 0,
  }));

  return (
    <Pressable
      onPress={() => onPress(id)}
      style={[
        styles.jointDot,
        {
          left: x - dotSize / 2,
          top: y - dotSize / 2,
          width: dotSize,
          height: dotSize,
        },
      ]}
      hitSlop={12}
    >
      <Animated.View
        style={[
          styles.pulseRing,
          pulseStyle,
          {
            width: pulseSize,
            height: pulseSize,
            borderRadius: pulseSize / 2,
            left: (dotSize - pulseSize) / 2,
            top: (dotSize - pulseSize) / 2,
          },
        ]}
      />
      <View
        style={[
          styles.dotInner,
          selected && styles.dotSelected,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
          },
        ]}
      />
    </Pressable>
  );
}

interface JointMapFieldProps extends FieldProps<JointLocationId[]> {
  bilateralSymmetry?: boolean;
  onBilateralChange?: (value: boolean) => void;
}

export function JointMapField({
  value,
  onChange,
  bilateralSymmetry = false,
  onBilateralChange,
  disabled,
  error,
}: JointMapFieldProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const handleJointPress = (id: JointLocationId) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = value;

    if (bilateralSymmetry) {
      const joint = JOINT_LOCATIONS.find((j) => j.id === id);
      if (joint && "side" in joint) {
        const baseName = id.replace(/_left$|_right$/, "");
        const leftId = `${baseName}_left` as JointLocationId;
        const rightId = `${baseName}_right` as JointLocationId;

        const bothSelected = current.includes(leftId) && current.includes(rightId);
        if (bothSelected) {
          onChange(current.filter((j) => j !== leftId && j !== rightId));
        } else {
          const newJoints = current.filter((j) => j !== leftId && j !== rightId);
          onChange([...newJoints, leftId, rightId]);
        }
        return;
      }
    }

    const updated = current.includes(id)
      ? current.filter((j) => j !== id)
      : [...current, id];
    onChange(updated);
  };

  const toggleBilateral = () => {
    if (!onBilateralChange || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBilateralChange(!bilateralSymmetry);
  };

  const availableWidth = containerSize.width || windowWidth - 32;
  const availableHeight = containerSize.height || windowHeight * 0.6;
  const aspectRatio = DESIGN_WIDTH / DESIGN_HEIGHT;

  let mapWidth = availableWidth;
  let mapHeight = mapWidth / aspectRatio;

  if (mapHeight > availableHeight) {
    mapHeight = availableHeight;
    mapWidth = mapHeight * aspectRatio;
  }

  if (mapWidth > 320) {
    mapWidth = 320;
    mapHeight = mapWidth / aspectRatio;
  }

  const scaleFactor = mapWidth / DESIGN_WIDTH;

  return (
    <View style={styles.container}>
      <View style={styles.body} onLayout={handleLayout}>
        <View style={[styles.skeletonCard, { width: mapWidth, height: mapHeight }]}>
          <SkeletonMap width={mapWidth} height={mapHeight} />

          {Object.entries(JOINT_POSITIONS).map(([id, pos]) => (
            <JointDot
              key={id}
              id={id as JointLocationId}
              x={pos.x * mapWidth}
              y={pos.y * mapHeight}
              selected={value.includes(id as JointLocationId)}
              onPress={handleJointPress}
              scale={scaleFactor}
            />
          ))}
        </View>
      </View>

      {onBilateralChange ? (
        <View style={styles.footer}>
          <Pressable
            onPress={toggleBilateral}
            style={[styles.bilateralPill, bilateralSymmetry && styles.bilateralPillActive]}
          >
            <Text
              style={[
                styles.bilateralText,
                bilateralSymmetry && styles.bilateralTextActive,
              ]}
            >
              Both Sides: {bilateralSymmetry ? "On" : "Off"}
            </Text>
          </Pressable>
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  body: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  skeletonCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderCurve: "continuous",
    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.07)",
    position: "relative",
  },
  jointDot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    backgroundColor: JOINT_RING,
    borderColor: JOINT_SELECTED,
    borderWidth: 2,
  },
  dotInner: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: JOINT_STROKE,
  },
  dotSelected: {
    backgroundColor: JOINT_SELECTED,
    borderWidth: 0,
  },
  footer: {
    alignItems: "center",
    gap: 12,
  },
  bilateralPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#F2F5F2",
    borderWidth: 1,
    borderColor: colors.arthritisBorder,
  },
  bilateralPillActive: {
    backgroundColor: colors.arthritisSurface,
    borderColor: colors.arthritis,
  },
  bilateralText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.arthritisTextSecondary,
  },
  bilateralTextActive: {
    color: colors.arthritisText,
  },
  error: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.error ?? "#DC2626",
  },
});
