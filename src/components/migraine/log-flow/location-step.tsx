import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { PAIN_REGIONS, findPainRegion } from "@/types/migraine";
import { useLogMigraine } from "./log-migraine-provider";

type HeadView = "front" | "back";

const FRONT_SILHOUETTE =
  "M 150,30 C 95,30 55,50 55,90 C 52,130 52,150 52,150 C 55,180 60,210 65,230 C 65,250 70,270 85,290 L 100,320 L 70,370 L 230,370 L 200,320 L 215,290 C 230,270 235,250 235,230 C 240,210 245,180 248,150 C 248,150 248,130 245,90 C 245,50 205,30 150,30 Z";

const BACK_SILHOUETTE =
  "M 150,30 C 95,30 55,50 55,140 C 55,180 60,220 75,250 L 100,320 L 70,370 L 230,370 L 200,320 L 225,250 C 240,220 245,180 245,140 C 245,50 205,30 150,30 Z";

const isIOS = Platform.OS === "ios";

export function LocationStep() {
  const { formData, updateFormData } = useLogMigraine();
  const [view, setView] = useState<HeadView>("front");

  const handleRegionToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newLocations = formData.painLocations.includes(id)
      ? formData.painLocations.filter((loc) => loc !== id)
      : [...formData.painLocations, id];
    updateFormData("painLocations", newLocations);
  };

  const currentRegions = PAIN_REGIONS[view];
  const selectedCount = formData.painLocations.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where does it hurt?</Text>
      <Text style={styles.subtitle}>Tap all affected areas</Text>

      {/* View toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setView("front")}
          style={[styles.toggleButton, view === "front" && styles.toggleButtonSelected]}
        >
          <Text style={[styles.toggleText, view === "front" && styles.toggleTextSelected]}>
            Front
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setView("back")}
          style={[styles.toggleButton, view === "back" && styles.toggleButtonSelected]}
        >
          <Text style={[styles.toggleText, view === "back" && styles.toggleTextSelected]}>
            Back
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 300 400">
          <Defs>
            <LinearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ebd8c4" />
              <Stop offset="100%" stopColor="#dcc4ae" />
            </LinearGradient>
          </Defs>

          {/* Base silhouette */}
          <Path
            d={view === "front" ? FRONT_SILHOUETTE : BACK_SILHOUETTE}
            fill="url(#skinGrad)"
          />

          {/* Ears */}
          <G opacity={0.9} fill="#dcc4ae">
            <Path d="M 52,150 C 42,150 38,170 38,190 C 38,210 48,220 58,210" />
            <Path d="M 248,150 C 258,150 262,170 262,190 C 262,210 252,220 242,210" />
          </G>

          {/* Pressable region paths */}
          {currentRegions.map((region) => {
            const isSelected = formData.painLocations.includes(region.id);
            return (
              <Path
                key={region.id}
                d={region.path}
                fill={isSelected ? colors.migraine : "transparent"}
                fillOpacity={isSelected ? 0.55 : 0}
                stroke="#8d6e63"
                strokeWidth={1.2}
                strokeDasharray="4,4"
                strokeLinecap="round"
                strokeLinejoin="round"
                onPress={() => handleRegionToggle(region.id)}
              />
            );
          })}

          {/* Facial feature hints (front view only) */}
          {view === "front" && (
            <G
              opacity={0.4}
              stroke="#5d4037"
              fill="none"
              strokeLinecap="round"
            >
              <Path d="M 80,180 Q 95,175 110,180" strokeWidth={1.5} />
              <Path d="M 190,180 Q 205,175 220,180" strokeWidth={1.5} />
              <Path d="M 145,215 Q 150,220 155,215" strokeWidth={1} />
              <Path d="M 140,260 Q 150,265 160,260" strokeWidth={1} />
            </G>
          )}
        </Svg>
      </View>

      <View style={styles.selectedInfo}>
        <Text style={styles.selectedText}>
          {selectedCount === 0
            ? "No areas selected"
            : `${selectedCount} area${selectedCount !== 1 ? "s" : ""} selected`}
        </Text>
      </View>

      <View style={styles.locationChips}>
        {formData.painLocations.map((regionId) => {
          const region = findPainRegion(regionId);
          return (
            <Pressable
              key={regionId}
              onPress={() => handleRegionToggle(regionId)}
              style={styles.locationChip}
            >
              <Text style={styles.locationChipText}>{region?.name}</Text>
              <Text style={styles.locationChipX}>{"\u00D7"}</Text>
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
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  toggleButtonSelected: {
    backgroundColor: colors.migraineLight,
    borderColor: colors.migraine,
  },
  toggleText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  toggleTextSelected: {
    color: colors.migraine,
  },
  mapContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    maxHeight: 340,
    alignSelf: "center",
  },
  selectedInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  selectedText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
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
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "500",
    color: colors.migraine,
  },
  locationChipX: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 18,
    fontWeight: "400",
    color: colors.migraine,
  },
});
