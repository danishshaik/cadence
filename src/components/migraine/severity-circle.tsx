import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";

interface SeverityCircleProps {
  severity: number; // 0-10
  minSize?: number;
  maxSize?: number;
}

const interpolateColor = (severity: number): string => {
  // 0-3: green, 4-6: yellow/orange, 7-10: red
  if (severity <= 3) {
    const t = severity / 3;
    return lerpColor("#4ADE80", "#FBBF24", t);
  } else if (severity <= 6) {
    const t = (severity - 3) / 3;
    return lerpColor("#FBBF24", "#F97316", t);
  } else {
    const t = (severity - 6) / 4;
    return lerpColor("#F97316", "#EF4444", t);
  }
};

const lerpColor = (color1: string, color2: string, t: number): string => {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

export function SeverityCircle({ severity, minSize = 80, maxSize = 200 }: SeverityCircleProps) {
  const animatedSize = useRef(new Animated.Value(minSize)).current;
  const animatedOpacity = useRef(new Animated.Value(0.2)).current;

  const targetSize = minSize + (maxSize - minSize) * (severity / 10);
  const color = interpolateColor(severity);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedSize, {
        toValue: targetSize,
        damping: 15,
        stiffness: 100,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: 0.2 + (severity / 10) * 0.3,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [severity, targetSize]);

  return (
    <View style={styles.container}>
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            width: Animated.multiply(animatedSize, 1.3),
            height: Animated.multiply(animatedSize, 1.3),
            backgroundColor: color,
            opacity: animatedOpacity,
          },
        ]}
      />
      {/* Main circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: animatedSize,
            height: animatedSize,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
  },
  glowCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  circle: {
    borderRadius: 1000,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
