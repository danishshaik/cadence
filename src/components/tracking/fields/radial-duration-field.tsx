import React from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { ExpoSegmentedPicker } from "@components/ui";
import { RadialDurationPreset, RadialDurationUnit } from "../flow-config";

const isIOS = process.env.EXPO_OS === "ios";
const DIAL_SIZE = 260;
const DIAL_CENTER = DIAL_SIZE / 2;
const KNOB_SIZE = 32;

interface RadialDurationFieldProps {
  label?: string;
  description?: string;
  units: RadialDurationUnit[];
  selectedUnitId: string;
  onUnitChange: (unitId: string) => void;
  value: number;
  onChange: (value: number) => void;
  presets?: RadialDurationPreset[];
  disabled?: boolean;
  accentColor?: string;
  surfaceColor?: string;
  mutedColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
}

export function RadialDurationField({
  label,
  description,
  units,
  selectedUnitId,
  onUnitChange,
  value,
  onChange,
  presets,
  disabled,
  accentColor = "#6C5CE7",
  surfaceColor = "#FFFFFF",
  mutedColor = "#E6E6F0",
  textPrimaryColor = "#2F3A34",
  textSecondaryColor = "#9AA2A0",
}: RadialDurationFieldProps) {
  const hasUnits = units.length > 0;
  const activeUnit =
    units.find((unit) => unit.id === selectedUnitId) ??
    units[0] ?? {
      id: "fallback",
      label: "Seconds",
      min: 0,
      max: 59,
      step: 1,
      targetKey: "durationSeconds",
    };

  const radius = 108;
  const strokeWidth = 22;
  const range = Math.max(1, activeUnit.max - activeUnit.min);
  const step = activeUnit.step ?? 1;
  const normalized = Math.min(
    1,
    Math.max(0, (value - activeUnit.min) / range)
  );
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - normalized);
  const knobAngleRadians = (normalized * 360 - 90) * (Math.PI / 180);
  const knobX = DIAL_CENTER + radius * Math.cos(knobAngleRadians);
  const knobY = DIAL_CENTER + radius * Math.sin(knobAngleRadians);
  const visiblePresets =
    presets?.filter((preset) => !preset.unitId || preset.unitId === activeUnit.id) ?? [];

  const updateFromTouchPoint = React.useCallback(
    (x: number, y: number) => {
      const dx = x - DIAL_CENTER;
      const dy = y - DIAL_CENTER;
      let degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (degrees < 0) {
        degrees += 360;
      }
      const ratio = degrees / 360;
      const raw = activeUnit.min + ratio * range;
      const stepped = Math.round((raw - activeUnit.min) / step) * step + activeUnit.min;
      const next = Math.min(activeUnit.max, Math.max(activeUnit.min, stepped));
      onChange(next);
    },
    [activeUnit.max, activeUnit.min, onChange, range, step]
  );

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => {
          updateFromTouchPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        onPanResponderMove: (event) => {
          updateFromTouchPoint(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
      }),
    [disabled, updateFromTouchPoint]
  );

  if (!hasUnits) {
    return null;
  }

  return (
    <View style={styles.container}>
      {(label || description) && (
        <View style={styles.titleArea}>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}>
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}>
              {description}
            </Text>
          ) : null}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <ExpoSegmentedPicker
          options={units.map((unit) => ({ id: unit.id, label: unit.label }))}
          selectedId={activeUnit.id}
          onChange={onUnitChange}
          disabled={disabled}
          accentColor={accentColor}
          style={styles.unitToggle}
        />

        <View style={styles.dialWrap}>
          <Svg width={DIAL_SIZE} height={DIAL_SIZE} viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}>
            <Circle
              cx={DIAL_CENTER}
              cy={DIAL_CENTER}
              r={radius}
              stroke={mutedColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={DIAL_CENTER}
              cy={DIAL_CENTER}
              r={radius}
              stroke={accentColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${DIAL_CENTER} ${DIAL_CENTER})`}
              fill="none"
            />
          </Svg>
          <View
            style={[
              styles.knob,
              {
                left: knobX - KNOB_SIZE / 2,
                top: knobY - KNOB_SIZE / 2,
                borderColor: accentColor,
              },
            ]}
          />
          <View style={styles.dialTouchLayer} {...panResponder.panHandlers} />
          <View style={styles.centerContent}>
            <Text selectable style={[styles.valueText, { color: accentColor }]}>
              {value}
            </Text>
            <Text selectable style={[styles.unitText, { color: textSecondaryColor }]}>
              {activeUnit.label}
            </Text>
          </View>
        </View>

        {visiblePresets.length > 0 ? (
          <View style={styles.presetsRow}>
            {visiblePresets.map((preset) => {
              const selected = preset.value === value;
              return (
                <Pressable
                  key={preset.id}
                  disabled={disabled}
                  onPress={() => {
                    if (preset.unitId && preset.unitId !== activeUnit.id) {
                      onUnitChange(preset.unitId);
                    }
                    onChange(preset.value);
                  }}
                  style={[
                    styles.presetPill,
                    { borderColor: mutedColor, backgroundColor: "#FFFFFF" },
                    selected && { borderColor: accentColor, backgroundColor: "#F0EDFC" },
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      styles.presetText,
                      { color: textSecondaryColor },
                      selected && { color: accentColor },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
    alignItems: "center",
  },
  titleArea: {
    width: "100%",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 24,
    gap: 18,
    alignItems: "center",
    boxShadow: "0 12px 24px rgba(108, 92, 231, 0.1)",
  },
  unitToggle: {
    width: "100%",
  },
  dialWrap: {
    width: 260,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    gap: 6,
  },
  dialTouchLayer: {
    position: "absolute",
    width: 260,
    height: 260,
  },
  knob: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.14)",
  },
  valueText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 52,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  unitText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    textTransform: "lowercase",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    width: "100%",
  },
  presetPill: {
    borderWidth: 1,
    borderRadius: 999,
    borderCurve: "continuous",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  presetText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
  },
});
