import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { PAIN_LOCATIONS } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

export function LocationStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleLocationToggle = (locationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newLocations = formData.painLocations.includes(locationId)
      ? formData.painLocations.filter((id) => id !== locationId)
      : [...formData.painLocations, locationId];
    updateFormData("painLocations", newLocations);
  };

  const selectedCount = formData.painLocations.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where does it hurt?</Text>
      <Text style={styles.subtitle}>Tap all affected areas</Text>

      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <Defs>
            <RadialGradient id="painGlowPink" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colors.migraine} stopOpacity={0.6} />
              <Stop offset="70%" stopColor={colors.migraine} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={colors.migraine} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Head outline */}
          <Path
            d="M 50 5
               C 75 5 85 25 85 45
               C 85 65 75 75 65 78
               L 65 95
               L 35 95
               L 35 78
               C 25 75 15 65 15 45
               C 15 25 25 5 50 5 Z"
            fill="none"
            stroke={colors.border}
            strokeWidth={1.5}
          />

          {/* Eye outlines */}
          <Path d="M 35 45 Q 40 48 45 45" fill="none" stroke={colors.border} strokeWidth={0.8} />
          <Path d="M 55 45 Q 60 48 65 45" fill="none" stroke={colors.border} strokeWidth={0.8} />

          {/* Pain locations */}
          {PAIN_LOCATIONS.map((location) => {
            const isSelected = formData.painLocations.includes(location.id);
            return (
              <G key={location.id}>
                {isSelected && (
                  <Circle cx={location.cx} cy={location.cy} r={12} fill="url(#painGlowPink)" />
                )}
                <Circle
                  cx={location.cx}
                  cy={location.cy}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? colors.migraine : colors.border}
                  opacity={isSelected ? 1 : 0.5}
                />
              </G>
            );
          })}
        </Svg>

        {/* Touch targets */}
        {PAIN_LOCATIONS.map((location) => (
          <Pressable
            key={`touch-${location.id}`}
            onPress={() => handleLocationToggle(location.id)}
            style={[
              styles.touchTarget,
              {
                left: `${location.cx - 12}%`,
                top: `${location.cy - 12}%`,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.selectedInfo}>
        {selectedCount === 0 ? (
          <Text style={styles.selectedText}>No areas selected</Text>
        ) : (
          <Text style={styles.selectedText}>
            {selectedCount} area{selectedCount !== 1 ? "s" : ""} selected
          </Text>
        )}
      </View>

      <View style={styles.locationChips}>
        {formData.painLocations.map((locationId) => {
          const location = PAIN_LOCATIONS.find((l) => l.id === locationId);
          return (
            <Pressable
              key={locationId}
              onPress={() => handleLocationToggle(locationId)}
              style={styles.locationChip}
            >
              <Text style={styles.locationChipText}>{location?.label}</Text>
              <Text style={styles.locationChipX}>×</Text>
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
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  mapContainer: {
    width: "100%",
    aspectRatio: 1,
    maxHeight: 280,
    alignSelf: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    padding: 16,
  },
  touchTarget: {
    position: "absolute",
    width: "24%",
    height: "24%",
  },
  selectedInfo: {
    alignItems: "center",
    marginTop: 24,
  },
  selectedText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textSecondary,
  },
  locationChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 16,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.migraineLight,
    borderRadius: 16,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    gap: 6,
  },
  locationChipText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: colors.migraine,
  },
  locationChipX: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "400",
    color: colors.migraine,
  },
});
