import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions, LayoutChangeEvent } from "react-native";
import { colors, shadows } from "@theme";
import { CONGESTION_SOURCES, CongestionSourceId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";

const isIOS = process.env.EXPO_OS === "ios";

// Design coordinate system
const DESIGN_WIDTH = 260;
const DESIGN_HEIGHT = 380;

// Configuration for each source node (position and size based on design)
const SOURCE_CONFIG: Record<CongestionSourceId, { cx: number; cy: number; w: number; h: number; r?: number }> = {
  throat: { 
    cx: 0.5, cy: 60 / DESIGN_HEIGHT, 
    w: 60 / DESIGN_WIDTH, h: 60 / DESIGN_HEIGHT, 
    r: 999 
  },
  bronchi: { 
    cx: 0.5, cy: 160 / DESIGN_HEIGHT, 
    w: 100 / DESIGN_WIDTH, h: 100 / DESIGN_HEIGHT, 
    r: 999 
  },
  deep_lungs: { 
    cx: 0.5, cy: 280 / DESIGN_HEIGHT, 
    w: 140 / DESIGN_WIDTH, h: 80 / DESIGN_HEIGHT, 
    r: 40 / DESIGN_WIDTH // Scaled radius
  },
};

function BodySilhouette({ width, height }: { width: number; height: number }) {
  const scaleX = width / DESIGN_WIDTH;
  const scaleY = height / DESIGN_HEIGHT;

  const s = (val: number, scale: number) => val * scale;
  const sx = (val: number) => s(val, scaleX);
  const sy = (val: number) => s(val, scaleY);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Head: x: 103, y: 6, w: 54, h: 54 */}
      <View
        style={{
          position: "absolute",
          left: sx(103),
          top: sy(6),
          width: sx(54),
          height: sy(54),
          borderRadius: sx(27),
          backgroundColor: "#F7FAFC",
          borderColor: "#E2E8F0",
          borderWidth: 1,
        }}
      />
      {/* Neck: x: 117, y: 56, w: 26, h: 22 */}
      <View
        style={{
          position: "absolute",
          left: sx(117),
          top: sy(56),
          width: sx(26),
          height: sy(22),
          borderRadius: sx(10),
          backgroundColor: "#F7FAFC",
          borderColor: "#E2E8F0",
          borderWidth: 1,
        }}
      />
      {/* Shoulders: x: 35, y: 74, w: 190, h: 46 */}
      <View
        style={{
          position: "absolute",
          left: sx(35),
          top: sy(74),
          width: sx(190),
          height: sy(46),
          borderRadius: sx(24),
          backgroundColor: "#F7FAFC",
          borderColor: "#E2E8F0",
          borderWidth: 1,
        }}
      />
      {/* Torso: x: 35, y: 110, w: 190, h: 230 */}
      <View
        style={{
          position: "absolute",
          left: sx(35),
          top: sy(110),
          width: sx(190),
          height: sy(230),
          borderRadius: sx(28),
          backgroundColor: "#F7FAFC",
          borderColor: "#E2E8F0",
          borderWidth: 1,
        }}
      />
      {/* Abdomen: x: 55, y: 260, w: 150, h: 90 */}
      <View
        style={{
          position: "absolute",
          left: sx(55),
          top: sy(260),
          width: sx(150),
          height: sy(90),
          borderRadius: sx(75), // rough approximation for ellipse
          backgroundColor: "#F7FAFC",
          borderColor: "#E2E8F0",
          borderWidth: 1,
        }}
      />
    </View>
  );
}

export function SourceStep() {
  const { formData, updateFormData } = useLogCongestion();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  // Calculate dimensions to fit in container while maintaining aspect ratio
  // Default to window based calculation if container size not yet available
  const availableWidth = containerSize.width || windowWidth - 32;
  const availableHeight = containerSize.height || windowHeight * 0.5;

  const aspectRatio = DESIGN_WIDTH / DESIGN_HEIGHT;
  
  let cardWidth = availableWidth;
  let cardHeight = cardWidth / aspectRatio;

  if (cardHeight > availableHeight) {
    cardHeight = availableHeight;
    cardWidth = cardHeight * aspectRatio;
  }

  // Cap max size to not be enormous on tablets/desktop
  if (cardWidth > 320) {
    cardWidth = 320;
    cardHeight = cardWidth / aspectRatio;
  }

  const handleSelect = (id: CongestionSourceId) => {
    updateFormData({ congestionSource: id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Where is the congestion sitting?</Text>
        <Text style={styles.subtitle}>Tap to select the affected area</Text>
      </View>

      <View style={styles.body} onLayout={handleLayout}>
        <View style={[styles.torsoCard, { width: cardWidth, height: cardHeight }]}>
          <BodySilhouette width={cardWidth} height={cardHeight} />
          
          {CONGESTION_SOURCES.map((source) => {
            const isSelected = formData.congestionSource === source.id;
            const config = SOURCE_CONFIG[source.id];
            
            const width = config.w * cardWidth;
            const height = config.h * cardHeight;
            const left = config.cx * cardWidth - width / 2;
            const top = config.cy * cardHeight - height / 2;
            const borderRadius = config.r === 999 ? 999 : (config.r || 0) * cardWidth;

            return (
              <Pressable
                key={source.id}
                onPress={() => handleSelect(source.id)}
                style={({ pressed }) => [
                  styles.node,
                  {
                    width,
                    height,
                    borderRadius,
                    left,
                    top,
                  },
                  isSelected && styles.nodeSelected,
                  pressed && styles.nodePressed,
                ]}
              >
                <Text style={[styles.nodeText, isSelected && styles.nodeTextSelected]}>
                  {source.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 16,
    paddingTop: 4,
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  body: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  torsoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 34,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    ...shadows.sm,
  },
  node: {
    position: "absolute",
    backgroundColor: colors.vaporWhite,
    borderWidth: 2,
    borderColor: "#D6E3F0",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  nodeSelected: {
    borderColor: colors.honeyAmber,
    backgroundColor: "#FFF7E2",
    boxShadow: "0 0 12px rgba(255, 193, 7, 0.5)",
  },
  nodePressed: {
    transform: [{ scale: 0.97 }],
  },
  nodeText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },
  nodeTextSelected: {
    color: colors.honeyAmber,
  },
});
