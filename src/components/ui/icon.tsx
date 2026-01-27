import React, { useMemo } from "react";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { StyleProp, ViewStyle } from "react-native";

type SymbolName = SymbolViewProps["name"];
type SymbolWeight = SymbolViewProps["weight"];

export type IconProps = {
  name: string;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
  fallback?: React.ReactNode;
};

const ICON_MAP: Record<string, SymbolName> = {
  add: { ios: "plus", android: "add" } as SymbolName,
  body: { ios: "figure.stand", android: "accessibility_new" } as SymbolName,
  "body-outline": { ios: "figure.stand", android: "accessibility_new" } as SymbolName,
  "chevron-back": { ios: "chevron.left", android: "chevron_left" } as SymbolName,
  "chevron-up": { ios: "chevron.up", android: "keyboard_arrow_up" } as SymbolName,
  "chevron-down": { ios: "chevron.down", android: "keyboard_arrow_down" } as SymbolName,
  checkmark: { ios: "checkmark", android: "check" } as SymbolName,
  "checkmark-circle": {
    ios: "checkmark.circle.fill",
    android: "check_circle",
  } as SymbolName,
  sparkles: { ios: "sparkles", android: "auto_awesome" } as SymbolName,
  leaf: { ios: "leaf.fill", android: "eco" } as SymbolName,
  "leaf-outline": { ios: "leaf", android: "eco" } as SymbolName,
  pulse: { ios: "waveform.path.ecg", android: "monitor_heart" } as SymbolName,
  "pulse-outline": { ios: "waveform.path.ecg", android: "monitor_heart" } as SymbolName,
  "close-circle": { ios: "xmark.circle.fill", android: "cancel" } as SymbolName,
  cloudy: { ios: "cloud.fill", android: "cloud" } as SymbolName,
  "camera-reverse-outline": {
    ios: "arrow.triangle.2.circlepath.camera",
    android: "flip_camera_android",
  } as SymbolName,
  moon: { ios: "moon.fill", android: "bedtime" } as SymbolName,
  "moon-outline": { ios: "moon", android: "bedtime" } as SymbolName,
  "sunny-outline": { ios: "sun.max", android: "wb_sunny" } as SymbolName,
  "water-outline": { ios: "drop", android: "water_drop" } as SymbolName,
  "alert-circle-outline": {
    ios: "exclamationmark.circle",
    android: "warning",
  } as SymbolName,
  "fast-food-outline": { ios: "fork.knife", android: "fastfood" } as SymbolName,
  "bed-outline": { ios: "bed.double", android: "bed" } as SymbolName,
  "hand-left-outline": { ios: "hand.raised", android: "pan_tool" } as SymbolName,
  "flask-outline": { ios: "flask", android: "science" } as SymbolName,
  "cloud-outline": { ios: "cloud", android: "cloud" } as SymbolName,
  "fitness-outline": { ios: "figure.run", android: "directions_run" } as SymbolName,
  "help-circle-outline": { ios: "questionmark.circle", android: "help" } as SymbolName,
  "volume-high-outline": { ios: "speaker.wave.3", android: "volume_up" } as SymbolName,
  "eye-outline": { ios: "eye", android: "visibility" } as SymbolName,
};

export function Icon({ name, size = 24, color, weight, style, fallback }: IconProps) {
  const resolvedName = useMemo<SymbolName>(() => {
    if (ICON_MAP[name]) return ICON_MAP[name];
    // Allow passing SF Symbol names directly for iOS-heavy UI.
    return { ios: name as any, android: "help" } as SymbolName;
  }, [name]);

  return (
    <SymbolView
      name={resolvedName}
      size={size}
      tintColor={color}
      weight={weight}
      style={style}
      fallback={fallback}
    />
  );
}
