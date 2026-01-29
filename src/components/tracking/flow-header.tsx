import React from "react";
import {
  PlatformColor,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProgressIndicator, ProgressVariant } from "./progress-indicator";

const isIOS = process.env.EXPO_OS === "ios";

interface FlowHeaderProps {
  currentStep: number;
  totalSteps: number;
  progressVariant?: ProgressVariant;
  showBack?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  backgroundColor?: string;
  activeColor?: string;
  inactiveColor?: string;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  height?: number;
  includeSafeArea?: boolean;
}

export function FlowHeader({
  currentStep,
  totalSteps,
  progressVariant = "dots",
  showBack = true,
  onBack,
  onCancel,
  backgroundColor,
  activeColor,
  inactiveColor,
  iconColor,
  containerStyle,
  height = 96,
  includeSafeArea = true,
}: FlowHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = includeSafeArea ? insets.top : 0;

  return (
    <View
      style={[
        styles.container,
        { height: height + topInset },
        backgroundColor && { backgroundColor },
        containerStyle,
      ]}
    >
      <View style={[styles.content, { paddingTop: 6 + topInset }]}>
        <View style={styles.side}>
          {showBack && onBack && (
            <Pressable onPress={onBack} style={styles.iconButton}>
              <SymbolView
                name="chevron.left"
                size={20}
                tintColor={iconColor ?? PlatformColor("label")}
                fallback={<Text style={[styles.iconFallback, iconColor && { color: iconColor }]}>‹</Text>}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.center}>
          <ProgressIndicator
            variant={progressVariant}
            currentStep={currentStep}
            totalSteps={totalSteps}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        </View>

        <View style={[styles.side, styles.sideRight]}>
          {onCancel && (
            <Pressable onPress={onCancel} style={styles.iconButton}>
              <SymbolView
                name="xmark"
                size={18}
                tintColor={iconColor ?? PlatformColor("label")}
                fallback={<Text style={[styles.iconFallback, iconColor && { color: iconColor }]}>×</Text>}
              />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  side: {
    width: 40,
    alignItems: "flex-start",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 16,
  },
  iconFallback: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 20,
  },
});
