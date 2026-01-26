import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from "react-native";
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G, Ellipse } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useLogGI } from "./log-gi-provider";
import { GI_PAIN_LOCATIONS, PainLocationId } from "@/types/gi";

function AbdominalBodyMap({
  selectedLocations,
  onLocationPress,
  size,
}: {
  selectedLocations: PainLocationId[];
  onLocationPress: (id: PainLocationId) => void;
  size: number;
}) {
  const handlePress = (id: PainLocationId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLocationPress(id);
  };

  const locationCoords: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
    upper_abdomen: { cx: 50, cy: 28, rx: 22, ry: 12 },
    lower_left: { cx: 28, cy: 68, rx: 14, ry: 16 },
    lower_right: { cx: 72, cy: 68, rx: 14, ry: 16 },
    navel: { cx: 50, cy: 50, rx: 12, ry: 12 },
    generalized: { cx: 50, cy: 50, rx: 35, ry: 30 },
  };

  return (
    <View style={[styles.mapContainer, { width: size, height: size }]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <RadialGradient id="painGradient" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.giSevere} stopOpacity={0.7} />
            <Stop offset="60%" stopColor={colors.giSevere} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={colors.giSevere} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Torso outline */}
        <Path
          d="M 50 8
             C 35 8 22 12 18 20
             L 12 45
             C 10 55 10 65 12 75
             L 18 92
             C 22 96 35 98 50 98
             C 65 98 78 96 82 92
             L 88 75
             C 90 65 90 55 88 45
             L 82 20
             C 78 12 65 8 50 8 Z"
          fill={colors.surfaceSecondary}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* Subtle quadrant lines */}
        <Path d="M 50 20 L 50 85" stroke={colors.border} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />
        <Path d="M 20 50 L 80 50" stroke={colors.border} strokeWidth={0.5} strokeDasharray="2,2" opacity={0.5} />

        {/* Navel marker */}
        <Circle cx={50} cy={50} r={2} fill={colors.border} />

        {/* Selected pain locations */}
        {selectedLocations.map((locId) => {
          const coords = locationCoords[locId];
          if (!coords) return null;

          return (
            <G key={locId}>
              <Ellipse cx={coords.cx} cy={coords.cy} rx={coords.rx} ry={coords.ry} fill="url(#painGradient)" />
              {locId !== "generalized" && (
                <Circle cx={coords.cx} cy={coords.cy} r={4} fill={colors.giSevere} opacity={0.8} />
              )}
            </G>
          );
        })}

        {/* Touch targets */}
        {GI_PAIN_LOCATIONS.filter((loc) => loc.id !== "generalized").map((location) => {
          const coords = locationCoords[location.id];
          return (
            <Circle
              key={location.id}
              cx={coords.cx}
              cy={coords.cy}
              r={15}
              fill="transparent"
              onPress={() => handlePress(location.id)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

export function LocationStep() {
  const { formData, updateFormData } = useLogGI();
  const { width, height } = useWindowDimensions();

  // Calculate available space for body map
  const mapSize = Math.min(width - 48, height * 0.32);

  const handleLocationPress = (id: PainLocationId) => {
    const currentLocations = formData.painLocations;

    if (id === "generalized") {
      updateFormData({ painLocations: ["generalized"] });
      return;
    }

    let newLocations = currentLocations.filter((loc) => loc !== "generalized");

    if (newLocations.includes(id)) {
      newLocations = newLocations.filter((loc) => loc !== id);
    } else {
      newLocations = [...newLocations, id];
    }

    updateFormData({ painLocations: newLocations });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where is the pain?</Text>

      <AbdominalBodyMap
        selectedLocations={formData.painLocations}
        onLocationPress={handleLocationPress}
        size={mapSize}
      />

      {/* Compact 3-column grid for location buttons */}
      <View style={styles.locationGrid}>
        {GI_PAIN_LOCATIONS.map((location) => {
          const isSelected = formData.painLocations.includes(location.id);
          return (
            <Pressable
              key={location.id}
              onPress={() => handleLocationPress(location.id)}
              style={({ pressed }) => [
                styles.locationButton,
                isSelected && styles.locationButtonSelected,
                pressed && styles.locationButtonPressed,
              ]}
            >
              <Text style={[styles.locationButtonText, isSelected && styles.locationButtonTextSelected]} numberOfLines={1}>
                {location.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  mapContainer: {
    alignSelf: "center",
    marginBottom: 16,
  },
  locationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  locationButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: "30%",
    alignItems: "center",
  },
  locationButtonSelected: {
    backgroundColor: colors.giSevereLight,
    borderColor: colors.giSevere,
  },
  locationButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  locationButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  locationButtonTextSelected: {
    color: colors.giSevere,
  },
});
