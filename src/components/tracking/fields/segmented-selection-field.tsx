import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { FlowOption } from "../flow-config";

const isIOS = process.env.EXPO_OS === "ios";

export interface SegmentedSelectionFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: FlowOption[];
  label?: string;
  description?: string;
  disabled?: boolean;
  accentColor?: string;
  cardColor?: string;
  segmentSurfaceColor?: string;
  dividerColor?: string;
  segmentSelectedTextColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  showDividers?: boolean;
  containerRadius?: number;
  segmentRadius?: number;
  segmentMinHeight?: number;
  cardStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  cardShadow?: string;
}

export function SegmentedSelectionField({
  value,
  onChange,
  options,
  label,
  description,
  disabled,
  accentColor = "#6C5CE7",
  cardColor = "#FFFFFF",
  segmentSurfaceColor = "#F3F4F6",
  dividerColor = "#D1D5DB",
  segmentSelectedTextColor = "#FFFFFF",
  textPrimaryColor = "#2F3A34",
  textSecondaryColor = "#6C7A72",
  showDividers = true,
  containerRadius = 12,
  segmentRadius = 10,
  segmentMinHeight = 40,
  cardStyle,
  style,
  cardShadow = "0 12px 24px rgba(108, 92, 231, 0.1)",
}: SegmentedSelectionFieldProps) {
  if (options.length === 0) {
    return null;
  }

  const segmented = (
    <View
      style={[
        styles.segmentedWrap,
        { backgroundColor: segmentSurfaceColor, borderRadius: containerRadius },
        style,
      ]}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <React.Fragment key={option.value}>
            <Pressable
              onPress={() => {
                if (disabled) return;
                onChange(option.value);
              }}
              style={({ pressed }) => [
                styles.segment,
                {
                  minHeight: segmentMinHeight,
                  borderRadius: segmentRadius,
                },
                selected && { backgroundColor: accentColor },
                pressed && styles.segmentPressed,
              ]}
            >
              <Text
                selectable
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.9}
                style={[
                  styles.segmentText,
                  { color: textSecondaryColor },
                  selected && { color: segmentSelectedTextColor },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
            {showDividers && index < options.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: dividerColor }]} />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: cardColor },
        cardShadow ? { boxShadow: cardShadow } : null,
        cardStyle,
      ]}
    >
      {label ? (
        <Text selectable style={[styles.label, { color: textPrimaryColor }]}>
          {label}
        </Text>
      ) : null}

      {segmented}

      {description ? (
        <Text selectable style={[styles.description, { color: textSecondaryColor }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 24,
    gap: 16,
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  segmentedWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderCurve: "continuous",
    padding: 4,
    width: "100%",
  },
  segment: {
    flex: 1,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  segmentPressed: {
    opacity: 0.92,
  },
  segmentText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 20,
  },
  description: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
  },
});
