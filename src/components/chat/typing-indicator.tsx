import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { Avatar } from "@components/shared";
import { colors, radius, spacing } from "@theme";

export function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animation = withRepeat(
      withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 })),
      -1,
      false
    );

    dot1.value = animation;
    dot2.value = withDelay(150, animation);
    dot3.value = withDelay(300, animation);
  }, [dot1, dot2, dot3]);

  const animatedDot1 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot1.value * 0.6,
    transform: [{ translateY: -dot1.value * 4 }],
  }));

  const animatedDot2 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot2.value * 0.6,
    transform: [{ translateY: -dot2.value * 4 }],
  }));

  const animatedDot3 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot3.value * 0.6,
    transform: [{ translateY: -dot3.value * 4 }],
  }));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        gap: spacing.sm,
      }}
    >
      <Avatar name="Cadence" size="sm" />
      <View
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          borderBottomLeftRadius: radius.sm,
          paddingVertical: spacing.sm + 4,
          paddingHorizontal: spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Animated.View
            style={[
              { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textTertiary },
              animatedDot1,
            ]}
          />
          <Animated.View
            style={[
              { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textTertiary },
              animatedDot2,
            ]}
          />
          <Animated.View
            style={[
              { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textTertiary },
              animatedDot3,
            ]}
          />
        </View>
      </View>
    </View>
  );
}
