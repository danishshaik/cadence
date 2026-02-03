import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { FieldProps } from "../types";

type MapView = "front" | "back";

export interface RegionMapRegion {
  id: string;
  name: string;
  path: string;
}

interface RegionMapFieldProps extends FieldProps<string[]> {
  frontSilhouette: string;
  backSilhouette: string;
  regions: Record<MapView, RegionMapRegion[]>;
  accentColor?: string;
  accentSoftColor?: string;
  cardColor?: string;
  surfaceColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  strokeColor?: string;
  strokeDasharray?: string;
  showChips?: boolean;
  getRegionLabel?: (id: string) => string | undefined;
  mapGradientColors?: [string, string];
}

const isIOS = process.env.EXPO_OS === "ios";

export function RegionMapField({
  value,
  onChange,
  disabled,
  label,
  description,
  frontSilhouette,
  backSilhouette,
  regions,
  accentColor = "#0F172A",
  accentSoftColor = "#EEF2FF",
  cardColor = "#FFFFFF",
  surfaceColor = "#F3F4F6",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  strokeColor = "#8d6e63",
  strokeDasharray = "4,4",
  showChips = true,
  getRegionLabel,
  mapGradientColors = ["#FDF2F8", "#F3E8F0"],
}: RegionMapFieldProps) {
  const [view, setView] = React.useState<MapView>("front");
  const selectedLocations = value ?? [];

  const allRegions = React.useMemo(() => [...regions.front, ...regions.back], [regions]);
  const getLabel = React.useCallback(
    (id: string) => {
      if (getRegionLabel) return getRegionLabel(id);
      return allRegions.find((region) => region.id === id)?.name;
    },
    [allRegions, getRegionLabel]
  );

  const handleRegionToggle = (id: string) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newLocations = selectedLocations.includes(id)
      ? selectedLocations.filter((loc) => loc !== id)
      : [...selectedLocations, id];
    onChange(newLocations);
  };

  const currentRegions = regions[view];

  return (
    <View style={styles.container}>
      {(label || description) && (
        <View style={styles.titleArea}>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      )}

      <View style={[styles.toggleContainer, { backgroundColor: surfaceColor }]}>
        <Pressable
          onPress={() => setView("front")}
          style={[styles.toggleButton, view === "front" && styles.toggleButtonSelected]}
          disabled={disabled}
        >
          <Text
            selectable
            style={[
              styles.toggleText,
              { color: textSecondaryColor },
              view === "front" && styles.toggleTextSelected,
              view === "front" && { color: textPrimaryColor },
            ]}
          >
            Front
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setView("back")}
          style={[styles.toggleButton, view === "back" && styles.toggleButtonSelected]}
          disabled={disabled}
        >
          <Text
            selectable
            style={[
              styles.toggleText,
              { color: textSecondaryColor },
              view === "back" && styles.toggleTextSelected,
              view === "back" && { color: textPrimaryColor },
            ]}
          >
            Back
          </Text>
        </Pressable>
      </View>

      <View style={[styles.mapCard, { backgroundColor: cardColor }]}>
        <Svg width="100%" height="100%" viewBox="0 0 300 400">
          <Defs>
            <LinearGradient id="regionMapSkin" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={mapGradientColors[0]} />
              <Stop offset="100%" stopColor={mapGradientColors[1]} />
            </LinearGradient>
          </Defs>

          <Path
            d={view === "front" ? frontSilhouette : backSilhouette}
            fill="url(#regionMapSkin)"
          />

          <G opacity={0.9} fill="#F3E8F0">
            <Path d="M 52,150 C 42,150 38,170 38,190 C 38,210 48,220 58,210" />
            <Path d="M 248,150 C 258,150 262,170 262,190 C 262,210 252,220 242,210" />
          </G>

          {currentRegions.map((region) => {
            const isSelected = selectedLocations.includes(region.id);
            return (
              <Path
                key={region.id}
                d={region.path}
                fill={isSelected ? accentColor : "transparent"}
                fillOpacity={isSelected ? 0.55 : 0}
                stroke={strokeColor}
                strokeWidth={1.2}
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                strokeLinejoin="round"
                onPress={() => handleRegionToggle(region.id)}
              />
            );
          })}

          {view === "front" && (
            <G opacity={0.4} stroke="#5d4037" fill="none" strokeLinecap="round">
              <Path d="M 80,180 Q 95,175 110,180" strokeWidth={1.5} />
              <Path d="M 190,180 Q 205,175 220,180" strokeWidth={1.5} />
              <Path d="M 145,215 Q 150,220 155,215" strokeWidth={1} />
              <Path d="M 140,260 Q 150,265 160,260" strokeWidth={1} />
            </G>
          )}
        </Svg>
      </View>

      {showChips && selectedLocations.length > 0 && (
        <View style={styles.locationChips}>
          {selectedLocations.map((regionId) => {
            const regionLabel = getLabel(regionId);
            if (!regionLabel) return null;
            return (
              <Pressable
                key={regionId}
                onPress={() => handleRegionToggle(regionId)}
                style={[styles.locationChip, { backgroundColor: accentSoftColor }]}
                disabled={disabled}
              >
                <View style={[styles.locationDot, { backgroundColor: accentColor }]} />
                <Text selectable style={[styles.locationChipText, { color: accentColor }]}
                >
                  {regionLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },
  titleArea: {
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
    textAlign: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 4,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  toggleButtonSelected: {
    backgroundColor: "#FFFFFF",
  },
  toggleText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextSelected: {
    color: "#111827",
  },
  mapCard: {
    width: 300,
    height: 340,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  locationChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationChipText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
  },
});
