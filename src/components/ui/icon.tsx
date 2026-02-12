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
  add: { ios: "plus", android: "add" } as unknown as SymbolName,
  body: { ios: "figure.stand", android: "accessibility_new" } as unknown as SymbolName,
  "body-outline": { ios: "figure.stand", android: "accessibility_new" } as unknown as SymbolName,
  "chevron-back": { ios: "chevron.left", android: "chevron_left" } as unknown as SymbolName,
  "chevron-up": { ios: "chevron.up", android: "keyboard_arrow_up" } as unknown as SymbolName,
  "chevron-down": { ios: "chevron.down", android: "keyboard_arrow_down" } as unknown as SymbolName,
  checkmark: { ios: "checkmark", android: "check" } as unknown as SymbolName,
  "checkmark-circle": {
    ios: "checkmark.circle.fill",
    android: "check_circle",
  } as unknown as SymbolName,
  "cloud-rain": { ios: "cloud.rain", android: "rainy" } as unknown as SymbolName,
  sparkles: { ios: "sparkles", android: "auto_awesome" } as unknown as SymbolName,
  people: { ios: "person.2.fill", android: "group" } as unknown as SymbolName,
  leaf: { ios: "leaf.fill", android: "eco" } as unknown as SymbolName,
  "leaf-outline": { ios: "leaf", android: "eco" } as unknown as SymbolName,
  pulse: { ios: "waveform.path.ecg", android: "monitor_heart" } as unknown as SymbolName,
  "pulse-outline": { ios: "waveform.path.ecg", android: "monitor_heart" } as unknown as SymbolName,
  "heart-pulse": { ios: "heart.pulse", android: "monitor_heart" } as unknown as SymbolName,
  brain: { ios: "brain.head.profile", android: "psychology" } as unknown as SymbolName,
  footprints: { ios: "figure.walk", android: "directions_walk" } as unknown as SymbolName,
  "book-open": { ios: "book", android: "menu_book" } as unknown as SymbolName,
  "message-circle": { ios: "message", android: "chat" } as unknown as SymbolName,
  "pen-line": { ios: "pencil", android: "edit" } as unknown as SymbolName,
  shield: { ios: "shield.fill", android: "shield" } as unknown as SymbolName,
  wind: { ios: "wind", android: "air" } as unknown as SymbolName,
  wine: { ios: "wineglass", android: "wine_bar" } as unknown as SymbolName,
  coffee: { ios: "cup.and.saucer", android: "local_cafe" } as unknown as SymbolName,
  "close-circle": { ios: "xmark.circle.fill", android: "cancel" } as unknown as SymbolName,
  cloudy: { ios: "cloud.fill", android: "cloud" } as unknown as SymbolName,
  "droplets": { ios: "drop.fill", android: "water_drop" } as unknown as SymbolName,
  "fast-food-outline": { ios: "fork.knife", android: "fastfood" } as unknown as SymbolName,
  monitor: { ios: "display", android: "desktop_windows" } as unknown as SymbolName,
  moon: { ios: "moon.fill", android: "bedtime" } as unknown as SymbolName,
  "moon-outline": { ios: "moon", android: "bedtime" } as unknown as SymbolName,
  pill: { ios: "pills.fill", android: "medication" } as unknown as SymbolName,
  plus: { ios: "plus", android: "add" } as unknown as SymbolName,
  sunrise: { ios: "sunrise", android: "wb_twilight" } as unknown as SymbolName,
  sunset: { ios: "sunset", android: "wb_twilight" } as unknown as SymbolName,
  sun: { ios: "sun.max", android: "wb_sunny" } as unknown as SymbolName,
  syringe: { ios: "syringe", android: "vaccines" } as unknown as SymbolName,
  "utensils-crossed": { ios: "fork.knife", android: "restaurant" } as unknown as SymbolName,
  "volume-2": { ios: "speaker.wave.2", android: "volume_up" } as unknown as SymbolName,
  "x": { ios: "xmark", android: "close" } as unknown as SymbolName,
  zap: { ios: "bolt.fill", android: "bolt" } as unknown as SymbolName,
  "camera-reverse-outline": {
    ios: "arrow.triangle.2.circlepath.camera",
    android: "flip_camera_android",
  } as unknown as SymbolName,
  "sunny-outline": { ios: "sun.max", android: "wb_sunny" } as unknown as SymbolName,
  "water-outline": { ios: "drop", android: "water_drop" } as unknown as SymbolName,
  "alert-circle-outline": {
    ios: "exclamationmark.circle",
    android: "warning",
  } as unknown as SymbolName,
  "bed-outline": { ios: "bed.double", android: "bed" } as unknown as SymbolName,
  "hand-left-outline": { ios: "hand.raised", android: "pan_tool" } as unknown as SymbolName,
  "flask-outline": { ios: "flask", android: "science" } as unknown as SymbolName,
  "cloud-outline": { ios: "cloud", android: "cloud" } as unknown as SymbolName,
  "fitness-outline": { ios: "figure.run", android: "directions_run" } as unknown as SymbolName,
  "help-circle-outline": { ios: "questionmark.circle", android: "help" } as unknown as SymbolName,
  "volume-high-outline": { ios: "speaker.wave.3", android: "volume_up" } as unknown as SymbolName,
  "eye-outline": { ios: "eye", android: "visibility" } as unknown as SymbolName,
};

export function Icon({ name, size = 24, color, weight, style, fallback }: IconProps) {
  const resolvedName = useMemo<SymbolName>(() => {
    if (ICON_MAP[name]) return ICON_MAP[name];
    // Allow passing SF Symbol names directly for iOS-heavy UI.
    return { ios: name as any, android: "help" } as unknown as SymbolName;
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
