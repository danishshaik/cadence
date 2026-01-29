import React from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FlowAction {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

interface FlowFooterProps {
  primaryAction: FlowAction;
  secondaryAction?: FlowAction;
  fullWidthPrimaryWhenSolo?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  buttonRowStyle?: StyleProp<ViewStyle>;
  primaryButtonStyle?: StyleProp<ViewStyle>;
  secondaryButtonStyle?: StyleProp<ViewStyle>;
  primaryTextStyle?: StyleProp<TextStyle>;
  secondaryTextStyle?: StyleProp<TextStyle>;
  primaryPressedStyle?: StyleProp<ViewStyle>;
  secondaryPressedStyle?: StyleProp<ViewStyle>;
}

export function FlowFooter({
  primaryAction,
  secondaryAction,
  fullWidthPrimaryWhenSolo = true,
  containerStyle,
  buttonRowStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  primaryTextStyle,
  secondaryTextStyle,
  primaryPressedStyle,
  secondaryPressedStyle,
}: FlowFooterProps) {
  const insets = useSafeAreaInsets();
  const showSecondary = Boolean(secondaryAction);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 12 }, containerStyle]}>
      <View style={[styles.buttonRow, buttonRowStyle]}>
        {secondaryAction && (
          <Pressable
            accessibilityLabel={secondaryAction.accessibilityLabel}
            onPress={secondaryAction.onPress}
            testID={secondaryAction.testID}
            style={({ pressed }) => [
              styles.secondaryButton,
              secondaryButtonStyle,
              pressed && styles.pressed,
              pressed && secondaryPressedStyle,
            ]}
          >
            <Text style={[styles.secondaryText, secondaryTextStyle]}>
              {secondaryAction.label}
            </Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel={primaryAction.accessibilityLabel}
          onPress={primaryAction.onPress}
          testID={primaryAction.testID}
          style={({ pressed }) => [
            styles.primaryButton,
            fullWidthPrimaryWhenSolo && !showSecondary && styles.primaryButtonFull,
            primaryButtonStyle,
            pressed && styles.pressed,
            pressed && primaryPressedStyle,
          ]}
        >
          <Text style={[styles.primaryText, primaryTextStyle]}>{primaryAction.label}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonFull: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
