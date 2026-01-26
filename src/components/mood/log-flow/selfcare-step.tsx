import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogMood } from "./log-mood-provider";
import { SELF_CARE_OPTIONS, SelfCareId } from "@/types/mood";

function SelfCareIcon({ icon, isSelected }: { icon: string; isSelected: boolean }) {
  const color = isSelected ? colors.mood : colors.textSecondary;
  const size = 24;

  const icons: Record<string, React.ReactNode> = {
    lotus: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21c-4-3-8-6-8-11a8 8 0 0116 0c0 5-4 8-8 11z"
          stroke={color}
          strokeWidth={1.5}
          fill={isSelected ? colors.moodLight : "none"}
        />
        <Path d="M12 13a3 3 0 100-6 3 3 0 000 6z" stroke={color} strokeWidth={1.5} fill="none" />
      </Svg>
    ),
    walk: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={5} r={2} stroke={color} strokeWidth={1.5} fill={isSelected ? colors.moodLight : "none"} />
        <Path
          d="M10 22l2-7 3 3v4M14 10l-2 4-4-1 1-4 5-1"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    book: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 19.5A2.5 2.5 0 016.5 17H20"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
          stroke={color}
          strokeWidth={1.5}
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
    chat: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
    pill: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M10.5 20.5l10-10a4.95 4.95 0 00-7-7l-10 10a4.95 4.95 0 007 7z"
          stroke={color}
          strokeWidth={1.5}
          fill={isSelected ? colors.moodLight : "none"}
        />
        <Line x1={8.5} y1={8.5} x2={15.5} y2={15.5} stroke={color} strokeWidth={1.5} />
      </Svg>
    ),
    shield: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isSelected ? colors.moodLight : "none"}
        />
      </Svg>
    ),
  };

  return icons[icon] || null;
}

function CheckIcon({ visible }: { visible: boolean }) {
  const scale = useSharedValue(visible ? 1 : 0);
  const opacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
      opacity.value = withSpring(1);
    } else {
      scale.value = withSpring(0);
      opacity.value = withSpring(0);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.checkContainer, animatedStyle]}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={10} fill={colors.success} />
        <Polyline
          points="7,12 10,15 17,8"
          stroke="#FFFFFF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

function SelfCareOption({
  option,
  isSelected,
  onPress,
}: {
  option: typeof SELF_CARE_OPTIONS[number];
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { damping: 15 }),
      withSpring(1, { damping: 12 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          animatedStyle,
        ]}
      >
        <SelfCareIcon icon={option.icon} isSelected={isSelected} />
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {option.label}
        </Text>
        <CheckIcon visible={isSelected} />
      </Animated.View>
    </Pressable>
  );
}

export function SelfCareStep() {
  const { formData, updateFormData } = useLogMood();

  const handleSelfCareToggle = (id: SelfCareId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = formData.selfCare;
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    updateFormData({ selfCare: updated });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Did you support yourself?</Text>
      <Text style={styles.subtitle}>Every small step counts</Text>

      <View style={styles.options}>
        {SELF_CARE_OPTIONS.map((option) => {
          const isSelected = formData.selfCare.includes(option.id);
          return (
            <SelfCareOption
              key={option.id}
              option={option}
              isSelected={isSelected}
              onPress={() => handleSelfCareToggle(option.id)}
            />
          );
        })}
      </View>

      {formData.selfCare.length > 0 && (
        <View style={styles.encouragement}>
          <Text style={styles.encouragementText}>
            {formData.selfCare.includes("survived")
              ? "That's enough. You showed up."
              : "Great job taking care of yourself!"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionSelected: {
    backgroundColor: colors.moodLight,
  },
  optionText: {
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: colors.mood,
  },
  checkContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  encouragement: {
    marginTop: "auto",
    paddingTop: 20,
    alignItems: "center",
  },
  encouragementText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.mood,
    fontWeight: "500",
    textAlign: "center",
  },
});
