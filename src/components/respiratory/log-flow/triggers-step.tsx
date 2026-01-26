import React, { useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useLogRespiratory } from "./log-respiratory-provider";
import { RespiratoryTriggerId } from "@/types/respiratory";

const isIOS = process.env.EXPO_OS === "ios";

const TRIGGER_BUBBLES: Array<{
  id: RespiratoryTriggerId;
  label: string;
  sizeScale: number;
  drift: number;
  anchor: { x: number; y: number };
}> = [
  { id: "cold_air", label: "Cold Air", sizeScale: 0.76, drift: 7, anchor: { x: 0.18, y: 0.22 } },
  { id: "exercise", label: "Exercise", sizeScale: 0.78, drift: 9, anchor: { x: 0.7, y: 0.18 } },
  { id: "smoke", label: "Smoke/Vape", sizeScale: 0.78, drift: 10, anchor: { x: 0.3, y: 0.52 } },
  { id: "dust", label: "Dust/Cleaning", sizeScale: 0.74, drift: 8, anchor: { x: 0.72, y: 0.46 } },
  { id: "pets", label: "Pets", sizeScale: 0.7, drift: 6, anchor: { x: 0.22, y: 0.78 } },
  { id: "stress", label: "Stress/Anxiety", sizeScale: 0.8, drift: 9, anchor: { x: 0.72, y: 0.76 } },
];

function TriggerBubble({
  id,
  label,
  size,
  left,
  top,
  drift,
  selected,
  onPress,
}: {
  id: RespiratoryTriggerId;
  label: string;
  size: number;
  left: number;
  top: number;
  drift: number;
  selected: boolean;
  onPress: (id: RespiratoryTriggerId) => void;
}) {
  const float = useSharedValue(0);
  const pop = useSharedValue(1);
  const fontSize = Math.max(11, Math.min(14, size * 0.17));
  const lineHeight = Math.max(13, Math.min(17, size * 0.2));
  const labelText = label.includes("/") ? label.split("/").join("\n") : label;

  useEffect(() => {
    const duration = 6800 + drift * 260;
    float.value = withRepeat(
      withSequence(
        withTiming(-1, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [drift]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: float.value * drift * 0.2 },
      { translateX: float.value * drift * 0.1 },
      { scale: pop.value },
    ],
  }));

  const handlePress = () => {
    pop.value = withSequence(withTiming(0.92, { duration: 120 }), withTiming(1, { duration: 180 }));
    onPress(id);
  };

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left,
          top,
        },
        selected ? styles.bubbleSelected : styles.bubbleIdle,
        bubbleStyle,
      ]}
    >
      <Pressable onPress={handlePress} style={styles.bubblePressable}>
        <Text
          style={[
            styles.bubbleText,
            { fontSize, lineHeight },
            selected && styles.bubbleTextSelected,
          ]}
          numberOfLines={2}
        >
          {labelText}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function TriggersStep() {
  const { formData, updateFormData } = useLogRespiratory();
  const { width, height } = useWindowDimensions();

  const stageWidth = Math.min(width - 32, 360);
  const stageHeight = Math.min(320, Math.max(220, height * 0.34));

  const positionedBubbles = useMemo(
    () =>
      TRIGGER_BUBBLES.map((bubble) => {
        const baseSize = Math.min(stageWidth, stageHeight) * 0.32;
        const words = bubble.label.split("/");
        const longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
        const minSizeByLabel = 24 + longestWord * 7;
        const size = Math.min(
          112,
          Math.max(64, minSizeByLabel, baseSize * bubble.sizeScale)
        );
        const padding = 6;
        const left = Math.min(
          stageWidth - size - padding,
          Math.max(padding, bubble.anchor.x * stageWidth - size / 2)
        );
        const top = Math.min(
          stageHeight - size - padding,
          Math.max(padding, bubble.anchor.y * stageHeight - size / 2)
        );
        return {
          ...bubble,
          size,
          left,
          top,
        };
      }),
    [stageWidth, stageHeight]
  );

  const handleToggle = (id: RespiratoryTriggerId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.triggers;
    const updated = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];
    updateFormData({ triggers: updated });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>What’s in the air?</Text>
        <Text style={styles.subtitle}>Tap the bubbles that match your triggers</Text>
      </View>

      <View style={[styles.stage, { width: stageWidth, height: stageHeight }]}>
        <Svg
          width={stageWidth}
          height={stageHeight}
          viewBox="0 0 100 100"
          style={styles.ribbons}
        >
          <Path
            d="M2 18 C 20 6, 38 34, 58 20 S 86 30, 98 14"
            stroke="rgba(92, 107, 192, 0.22)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M0 48 C 18 36, 36 58, 58 46 S 84 56, 100 42"
            stroke="rgba(92, 107, 192, 0.16)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M4 78 C 22 64, 40 92, 62 72 S 90 82, 100 70"
            stroke="rgba(92, 107, 192, 0.2)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="18" cy="20" r="2.4" fill="rgba(92, 107, 192, 0.25)" />
          <Circle cx="70" cy="18" r="1.8" fill="rgba(92, 107, 192, 0.2)" />
          <Circle cx="26" cy="52" r="2.2" fill="rgba(92, 107, 192, 0.18)" />
          <Circle cx="78" cy="50" r="1.6" fill="rgba(92, 107, 192, 0.18)" />
          <Circle cx="20" cy="78" r="2.1" fill="rgba(92, 107, 192, 0.18)" />
          <Circle cx="84" cy="76" r="1.7" fill="rgba(92, 107, 192, 0.18)" />
        </Svg>
        {positionedBubbles.map((bubble) => (
          <TriggerBubble
            key={bubble.id}
            id={bubble.id}
            label={bubble.label}
            size={bubble.size}
            left={bubble.left}
            top={bubble.top}
            drift={bubble.drift}
            selected={formData.triggers.includes(bubble.id)}
            onPress={handleToggle}
          />
        ))}
      </View>

      <Text style={styles.footerNote}>
        {formData.triggers.length === 0
          ? "No triggers selected"
          : `${formData.triggers.length} trigger${formData.triggers.length !== 1 ? "s" : ""} selected`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  stage: {
    backgroundColor: "rgba(225, 245, 254, 0.5)",
    borderRadius: 28,
    borderCurve: "continuous",
    position: "relative",
    overflow: "hidden",
  },
  ribbons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bubble: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderCurve: "continuous",
    borderWidth: 1,
    ...shadows.sm,
  },
  bubbleIdle: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: colors.respiratoryIndigoLight,
  },
  bubbleSelected: {
    backgroundColor: colors.respiratoryIndigo,
    borderColor: colors.respiratoryIndigo,
  },
  bubblePressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  bubbleText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.respiratoryIndigo,
    textAlign: "center",
  },
  bubbleTextSelected: {
    color: "#FFFFFF",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
