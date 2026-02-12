import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { HotspotMapHotspot } from "../flow-config";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

interface HotspotMapFieldProps extends FieldProps<string[]> {
  hotspots: HotspotMapHotspot[];
  accentColor?: string;
  accentSoftColor?: string;
  cardColor?: string;
  bodyColor?: string;
  borderColor?: string;
  textPrimaryColor?: string;
}

export function HotspotMapField({
  value,
  onChange,
  hotspots,
  disabled,
  accentColor = "#6C5CE7",
  accentSoftColor = "#6C5CE71A",
  cardColor = "#FFFFFF",
  bodyColor = "#F3F4F6",
  borderColor = "#E6E6F0",
  textPrimaryColor = "#2F3A34",
}: HotspotMapFieldProps) {
  const selected = React.useMemo(() => value ?? [], [value]);

  const toggle = React.useCallback(
    (id: string) => {
      if (disabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const next = selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id];
      onChange(next);
    },
    [disabled, onChange, selected]
  );

  const calloutHotspot = hotspots.find(
    (hotspot) => selected.includes(hotspot.id) && hotspot.calloutLabel
  );

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
        <View style={[styles.head, { backgroundColor: bodyColor }]} />
        <View style={[styles.leftEar, { backgroundColor: bodyColor }]} />
        <View style={[styles.rightEar, { backgroundColor: bodyColor }]} />
        <View style={[styles.torso, { backgroundColor: bodyColor }]} />
        <View style={[styles.leftArm, { backgroundColor: bodyColor }]} />
        <View style={[styles.rightArm, { backgroundColor: bodyColor }]} />
        <View style={[styles.leftLeg, { backgroundColor: bodyColor }]} />
        <View style={[styles.rightLeg, { backgroundColor: bodyColor }]} />

        {hotspots.map((hotspot) => {
          const isSelected = selected.includes(hotspot.id);
          const size = hotspot.size ?? 24;
          const outerSize = Math.max(size + 8, 24);
          return (
            <Pressable
              key={hotspot.id}
              onPress={() => toggle(hotspot.id)}
              style={[
                styles.hotspot,
                {
                  width: outerSize,
                  height: outerSize,
                  borderRadius: outerSize / 2,
                  left: hotspot.x - outerSize / 2,
                  top: hotspot.y - outerSize / 2,
                  borderColor: isSelected ? accentColor : borderColor,
                  backgroundColor: isSelected ? accentSoftColor : "#FFFFFF",
                },
              ]}
            >
              <View
                style={[
                  styles.hotspotInner,
                  {
                    width: size / 2,
                    height: size / 2,
                    borderRadius: size / 4,
                    backgroundColor: isSelected ? accentColor : "transparent",
                  },
                ]}
              />
            </Pressable>
          );
        })}

        {calloutHotspot ? (
          <>
            <View
              style={[
                styles.callout,
                {
                  left: calloutHotspot.x + (calloutHotspot.calloutOffsetX ?? 20),
                  top: calloutHotspot.y + (calloutHotspot.calloutOffsetY ?? -34),
                  backgroundColor: accentColor,
                },
              ]}
            >
              <Text selectable style={styles.calloutText}>
                {calloutHotspot.calloutLabel}
              </Text>
            </View>
            <View
              style={[
                styles.calloutLine,
                {
                  left: calloutHotspot.x + 10,
                  top: calloutHotspot.y - 6,
                  backgroundColor: accentColor,
                },
              ]}
            />
          </>
        ) : null}
      </View>

      {selected.length > 0 ? (
        <Text selectable style={[styles.selectionText, { color: textPrimaryColor }]}>
          {selected.length} {selected.length === 1 ? "area" : "areas"} selected
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  card: {
    width: 260,
    height: 380,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(108, 92, 231, 0.12)",
  },
  head: {
    position: "absolute",
    left: 100,
    top: 16,
    width: 60,
    height: 64,
    borderRadius: 32,
  },
  leftEar: {
    position: "absolute",
    left: 92,
    top: 38,
    width: 12,
    height: 20,
    borderRadius: 6,
  },
  rightEar: {
    position: "absolute",
    left: 156,
    top: 38,
    width: 12,
    height: 20,
    borderRadius: 6,
  },
  torso: {
    position: "absolute",
    left: 95,
    top: 75,
    width: 70,
    height: 120,
    borderRadius: 20,
  },
  leftArm: {
    position: "absolute",
    left: 65,
    top: 80,
    width: 24,
    height: 100,
    borderRadius: 12,
  },
  rightArm: {
    position: "absolute",
    left: 171,
    top: 80,
    width: 24,
    height: 100,
    borderRadius: 12,
  },
  leftLeg: {
    position: "absolute",
    left: 95,
    top: 200,
    width: 28,
    height: 130,
    borderRadius: 14,
  },
  rightLeg: {
    position: "absolute",
    left: 137,
    top: 200,
    width: 28,
    height: 130,
    borderRadius: 14,
  },
  hotspot: {
    position: "absolute",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  hotspotInner: {
    borderRadius: 999,
  },
  callout: {
    position: "absolute",
    borderRadius: 8,
    borderCurve: "continuous",
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  calloutText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  calloutLine: {
    position: "absolute",
    width: 14,
    height: 1,
    transform: [{ rotate: "-30deg" }],
  },
  selectionText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
