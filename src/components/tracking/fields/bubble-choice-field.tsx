import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

export interface BubbleChoiceItem {
  id: string;
  label: string;
  icon: string;
  size: number;
  x: number;
  y: number;
  labelSize?: number;
}

interface BubbleChoiceFieldProps extends FieldProps<string[]> {
  items: BubbleChoiceItem[];
  accentColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
}

export function BubbleChoiceField({
  value,
  onChange,
  disabled,
  label,
  description,
  items,
  accentColor = "#0F172A",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#4B5563",
}: BubbleChoiceFieldProps) {
  const selectedItems = value ?? [];

  const handleToggle = (id: string) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = selectedItems.includes(id)
      ? selectedItems.filter((item) => item !== id)
      : [...selectedItems, id];
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {(label || description) && (
        <>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}
            >
              {description}
            </Text>
          ) : null}
        </>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.bubbleCanvas}>
          {items.map((bubble) => {
            const isSelected = selectedItems.includes(bubble.id);
            return (
              <Pressable
                key={bubble.id}
                onPress={() => handleToggle(bubble.id)}
                style={({ pressed }) => [
                  styles.bubble,
                  {
                    width: bubble.size,
                    height: bubble.size,
                    left: bubble.x,
                    top: bubble.y,
                    backgroundColor: isSelected ? accentColor : "#FFFFFF",
                  },
                  pressed && styles.bubblePressed,
                ]}
                disabled={disabled}
              >
                <Icon
                  name={bubble.icon}
                  size={24}
                  color={isSelected ? "#FFFFFF" : accentColor}
                />
                <Text
                  selectable
                  style={[
                    styles.bubbleLabel,
                    { color: textMutedColor },
                    bubble.labelSize ? { fontSize: bubble.labelSize } : null,
                    isSelected && styles.bubbleLabelSelected,
                  ]}
                >
                  {bubble.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  bubbleCanvas: {
    position: "relative",
    width: "100%",
    maxWidth: 340,
    minHeight: 430,
    alignSelf: "center",
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bubblePressed: {
    transform: [{ scale: 0.97 }],
  },
  bubbleLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  bubbleLabelSelected: {
    color: "#FFFFFF",
  },
});
