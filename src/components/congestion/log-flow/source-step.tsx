import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { CONGESTION_SOURCES, CongestionSourceId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";
import { ResonanceStepHeader } from "./resonance-step-header";

const isIOS = process.env.EXPO_OS === "ios";

const DESIGN_WIDTH = 302;
const DESIGN_HEIGHT = 420;
const MAP_HEIGHT = 420;
const DOT_RADIUS = 12;
const PULSE_RADIUS = 24;

const SOURCE_POINTS: Record<
  CongestionSourceId,
  { cx: number; cy: number; label: string }
> = {
  head: { cx: 156, cy: 58, label: "Head" },
  throat: { cx: 156, cy: 122, label: "Throat" },
  bronchi: { cx: 156, cy: 168, label: "Bronchi" },
  deep_lungs: { cx: 156, cy: 284, label: "Deep Lungs" },
};

const DECORATIVE_POINTS = [
  { key: "lung_l", cx: 120, cy: 210 },
  { key: "lung_r", cx: 192, cy: 210 },
];

function BodySilhouette({ width, height }: { width: number; height: number }) {
  const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
  const offsetX = (width - DESIGN_WIDTH * scale) / 2;
  const offsetY = (height - DESIGN_HEIGHT * scale) / 2;

  const sx = (value: number) => offsetX + value * scale;
  const sy = (value: number) => offsetY + value * scale;
  const ss = (value: number) => value * scale;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.shapeHead,
          {
            left: sx(120),
            top: sy(30),
            width: ss(72),
            height: ss(72),
            borderRadius: ss(36),
            backgroundColor: "#E2E8E5",
          },
        ]}
      />
      <View
        style={[
          styles.shapeNeck,
          { left: sx(143), top: sy(98), width: ss(26), height: ss(44), borderRadius: ss(6) },
        ]}
      />
      <View
        style={[
          styles.shapeArm,
          { left: sx(44), top: sy(148), width: ss(32), height: ss(160), borderRadius: ss(14) },
        ]}
      />
      <View
        style={[
          styles.shapeArm,
          { left: sx(236), top: sy(148), width: ss(32), height: ss(160), borderRadius: ss(14) },
        ]}
      />
      <View
        style={[
          styles.shapeTorso,
          {
            left: sx(82),
            top: sy(138),
            width: ss(148),
            height: ss(210),
            borderRadius: ss(24),
            backgroundColor: "#D4DBD7",
          },
        ]}
      />
      <View
        style={[
          styles.shapeLung,
          {
            left: sx(94),
            top: sy(168),
            width: ss(58),
            height: ss(92),
            borderTopLeftRadius: ss(8),
            borderTopRightRadius: ss(18),
            borderBottomRightRadius: ss(8),
            borderBottomLeftRadius: ss(18),
            backgroundColor: "#BEC7C2",
          },
        ]}
      />
      <View
        style={[
          styles.shapeLung,
          {
            left: sx(160),
            top: sy(168),
            width: ss(58),
            height: ss(92),
            borderTopLeftRadius: ss(18),
            borderTopRightRadius: ss(8),
            borderBottomRightRadius: ss(18),
            borderBottomLeftRadius: ss(8),
            backgroundColor: "#BEC7C2",
          },
        ]}
      />
      <View
        style={[
          styles.shapeTrachea,
          {
            left: sx(150),
            top: sy(128),
            width: ss(14),
            height: ss(50),
            borderRadius: ss(4),
          },
        ]}
      />
    </View>
  );
}

export function SourceStep() {
  const { formData, updateFormData } = useLogCongestion();
  const { width } = useWindowDimensions();

  const cardWidth = Math.min(342, width - 48);
  const cardHeight = MAP_HEIGHT;
  const mapScale = Math.min(cardWidth / DESIGN_WIDTH, cardHeight / DESIGN_HEIGHT);
  const mapOffsetX = (cardWidth - DESIGN_WIDTH * mapScale) / 2;
  const mapOffsetY = (cardHeight - DESIGN_HEIGHT * mapScale) / 2;
  const mapX = (value: number) => mapOffsetX + value * mapScale;
  const mapY = (value: number) => mapOffsetY + value * mapScale;
  const dotRadius = DOT_RADIUS * mapScale;
  const pulseRadius = PULSE_RADIUS * mapScale;

  const handleSelect = (id: CongestionSourceId) => {
    Haptics.selectionAsync();
    const selected = formData.congestionSource.includes(id);
    updateFormData({
      congestionSource: selected
        ? formData.congestionSource.filter((item) => item !== id)
        : [...formData.congestionSource, id],
    });
  };

  const selectedSources = formData.congestionSource;
  const selectedLabel =
    selectedSources.length === 1 ? SOURCE_POINTS[selectedSources[0]]?.label : null;
  const pillText =
    selectedSources.length === 0
      ? "Select a zone"
      : selectedLabel
      ? `${selectedLabel} • Selected`
      : `${selectedSources.length} areas selected`;

  return (
    <View style={styles.container}>
      <ResonanceStepHeader
        title="Where is the congestion sitting?"
        subtitle="Tap to select the affected area"
      />

      <View style={styles.mapWrap}>
        <View style={[styles.mapCard, { width: cardWidth, height: cardHeight }]}>
          <View style={styles.mapCardBackground} />

          <BodySilhouette width={cardWidth} height={cardHeight} />

          {DECORATIVE_POINTS.map((point) => {
            const left = mapX(point.cx);
            const top = mapY(point.cy);
            return (
              <View
                key={point.key}
                style={[
                  styles.decorativeDot,
                  {
                    left: left - dotRadius,
                    top: top - dotRadius,
                    width: dotRadius * 2,
                    height: dotRadius * 2,
                    borderRadius: dotRadius,
                  },
                ]}
              />
            );
          })}

          {CONGESTION_SOURCES.map((source) => {
            const config = SOURCE_POINTS[source.id];
            const isSelected = selectedSources.includes(source.id);
            const left = mapX(config.cx);
            const top = mapY(config.cy);

            return (
              <View key={source.id} style={{ position: "absolute", left, top }}>
                {isSelected ? (
                  <View
                    style={[
                      styles.pulseRing,
                      {
                        left: -pulseRadius,
                        top: -pulseRadius,
                        width: pulseRadius * 2,
                        height: pulseRadius * 2,
                        borderRadius: pulseRadius,
                      },
                    ]}
                  />
                ) : null}
                <Pressable
                  onPress={() => handleSelect(source.id)}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.dot,
                    {
                      width: dotRadius * 2,
                      height: dotRadius * 2,
                      borderRadius: dotRadius,
                      transform: [{ translateX: -dotRadius }, { translateY: -dotRadius }],
                    },
                    isSelected && styles.dotSelected,
                    pressed && {
                      opacity: 0.9,
                      transform: [{ translateX: -dotRadius }, { translateY: -dotRadius }, { scale: 0.95 }],
                    },
                  ]}
                >
                  {isSelected ? <View style={styles.dotCore} /> : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.selectedPill, !selectedLabel && styles.selectedPillIdle]}>
        <Text selectable style={[styles.selectedPillText, !selectedLabel && styles.selectedPillTextIdle]}>
          {pillText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    paddingTop: 2,
  },
  mapWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  mapCard: {
    borderRadius: 24,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5EBE5",
    boxShadow: "0 12px 32px rgba(136, 216, 176, 0.09)",
  },
  mapCardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  shapeHead: {
    position: "absolute",
  },
  shapeNeck: {
    position: "absolute",
    backgroundColor: "#E2E8E5",
  },
  shapeTorso: {
    position: "absolute",
  },
  shapeArm: {
    position: "absolute",
    backgroundColor: "#E2E8E5",
  },
  shapeLung: {
    position: "absolute",
  },
  shapeTrachea: {
    position: "absolute",
    backgroundColor: "#CBD4CF",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(136, 216, 176, 0.5)",
    backgroundColor: "rgba(136, 216, 176, 0.08)",
    boxShadow: "0 0 10px rgba(136, 216, 176, 0.3)",
  },
  decorativeDot: {
    position: "absolute",
    backgroundColor: "#F5FAF8",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    boxShadow: "0 2px 6px rgba(136, 216, 176, 0.1)",
  },
  dot: {
    backgroundColor: "#F5FAF8",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    boxShadow: "0 2px 6px rgba(136, 216, 176, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotSelected: {
    backgroundColor: colors.restorativeSage,
    borderColor: colors.restorativeSage,
    boxShadow: "0 0 12px rgba(136, 216, 176, 0.45)",
  },
  dotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  selectedPill: {
    borderRadius: 100,
    borderCurve: "continuous",
    backgroundColor: "#E0F2F1",
    borderWidth: 1,
    borderColor: "#E5EBE5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
    boxShadow: "0 2px 8px rgba(136, 216, 176, 0.12)",
  },
  selectedPillIdle: {
    backgroundColor: "#F3F6F4",
    borderColor: "#E5EBE5",
  },
  selectedPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5A52",
  },
  selectedPillTextIdle: {
    color: "#7B857F",
    fontWeight: "500",
  },
});
