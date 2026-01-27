import React, { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

type HostComponent = React.ComponentType<{
  children: React.ReactNode;
  matchContents?: boolean | { vertical?: boolean; horizontal?: boolean };
  style?: StyleProp<ViewStyle>;
}>;

type SwiftSliderComponent = React.ComponentType<{
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onEditingChanged?: (isEditing: boolean) => void;
  modifiers?: unknown[];
  style?: StyleProp<ViewStyle>;
}>;

type ComposeSliderComponent = React.ComponentType<{
  value?: number;
  min?: number;
  max?: number;
  steps?: number;
  color?: string;
  elementColors?: {
    thumbColor?: string;
    activeTrackColor?: string;
    inactiveTrackColor?: string;
  };
  onValueChange?: (value: number) => void;
  modifiers?: unknown[];
}>;

type TintModifierFactory = (color: string) => unknown;

export type ExpoSliderProps = {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  style?: StyleProp<ViewStyle>;
  hostStyle?: StyleProp<ViewStyle>;
};

const isIOS = process.env.EXPO_OS === "ios";
const isAndroid = process.env.EXPO_OS === "android";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stepToSteps(min: number, max: number, step?: number) {
  if (!step || step <= 0) return 0;
  const totalSteps = Math.round((max - min) / step);
  return Math.max(0, totalSteps - 1);
}

export function ExpoSlider({
  value,
  minimumValue = 0,
  maximumValue = 1,
  step,
  onValueChange,
  onSlidingComplete,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  style,
  hostStyle,
}: ExpoSliderProps) {
  const min = minimumValue;
  const max = maximumValue;
  const clampedValue = clamp(value, min, max);
  const flattenedStyle = StyleSheet.flatten(style);
  const hostMergedStyle = flattenedStyle ? [flattenedStyle, hostStyle] : hostStyle;
  const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValueRef = useRef(clampedValue);

  useEffect(() => {
    lastValueRef.current = clampedValue;
  }, [clampedValue]);

  useEffect(() => {
    return () => {
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, []);

  const scheduleCompletion = useCallback(
    (nextValue: number) => {
      if (!onSlidingComplete) return;
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
      completionTimeoutRef.current = setTimeout(() => {
        onSlidingComplete(nextValue);
        completionTimeoutRef.current = null;
      }, 150);
    },
    [onSlidingComplete]
  );

  const handleValueChange = useCallback(
    (nextValue: number) => {
      lastValueRef.current = nextValue;
      onValueChange?.(nextValue);
      if (isAndroid) {
        // Compose does not provide an "editing finished" callback, so we debounce.
        scheduleCompletion(nextValue);
      }
    },
    [onValueChange, scheduleCompletion]
  );

  if (isIOS) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const swift = require("@expo/ui/swift-ui") as {
      Host: HostComponent;
      Slider: SwiftSliderComponent;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const modifiersModule = require("@expo/ui/swift-ui/modifiers") as {
      tint: TintModifierFactory;
    };
    const tintColor = minimumTrackTintColor ?? thumbTintColor;
    const modifiers = tintColor ? [modifiersModule.tint(tintColor)] : undefined;

    return (
      <swift.Host matchContents style={hostMergedStyle}>
        <swift.Slider
          value={clampedValue}
          min={min}
          max={max}
          step={step}
          modifiers={modifiers}
          onValueChange={handleValueChange}
          onEditingChanged={(editing) => {
            if (!editing && onSlidingComplete) {
              onSlidingComplete(lastValueRef.current);
            }
          }}
        />
      </swift.Host>
    );
  }

  if (isAndroid) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const compose = require("@expo/ui/jetpack-compose") as {
      Host: HostComponent;
      Slider: ComposeSliderComponent;
      fillMaxWidth: (fraction?: number) => unknown;
    };
    const steps = stepToSteps(min, max, step);
    const elementColors =
      minimumTrackTintColor || maximumTrackTintColor || thumbTintColor
        ? {
            thumbColor: thumbTintColor ?? minimumTrackTintColor,
            activeTrackColor: minimumTrackTintColor,
            inactiveTrackColor: maximumTrackTintColor,
          }
        : undefined;

    return (
      <compose.Host matchContents style={hostMergedStyle}>
        <compose.Slider
          value={clampedValue}
          min={min}
          max={max}
          steps={steps}
          color={minimumTrackTintColor}
          elementColors={elementColors}
          onValueChange={handleValueChange}
          modifiers={[compose.fillMaxWidth()]}
        />
      </compose.Host>
    );
  }

  // Minimal fallback for non-native platforms (e.g., web) without extra dependencies.
  const stepSize = step && step > 0 ? step : (max - min) / 10 || 1;
  const decrement = () => handleValueChange(clamp(clampedValue - stepSize, min, max));
  const increment = () => handleValueChange(clamp(clampedValue + stepSize, min, max));

  return (
    <View style={hostMergedStyle}>
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          },
          style,
        ]}
      >
        <Pressable onPress={decrement} style={{ padding: 8 }}>
          <Text>-</Text>
        </Pressable>
        <Text>{Math.round(clampedValue)}</Text>
        <Pressable onPress={increment} style={{ padding: 8 }}>
          <Text>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
