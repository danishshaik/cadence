import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { Icon } from "@components/ui";
import { colors } from "@theme";
import { useLogMigraine } from "./log-migraine-provider";

const isIOS = Platform.OS === "ios";

const palette = {
  textPrimary: "#2F3A34",
  textSecondary: "#7B857F",
  textMuted: "#4A5A52",
  card: "#FFFFFF",
  accent: colors.migraine,
  accentSoft: "#FCE4F1",
  iconMuted: "#C0C6C2",
} as const;

const MED_OPTIONS = [
  { id: "ibuprofen", label: "Ibuprofen", icon: "pill" },
  { id: "tylenol", label: "Tylenol", icon: "pill" },
  { id: "excedrin", label: "Excedrin", icon: "zap" },
  { id: "sumatriptan", label: "Sumatriptan", icon: "syringe" },
  { id: "aspirin", label: "Aspirin", icon: "heart-pulse" },
  { id: "other", label: "Other", icon: "plus" },
] as const;

const MED_ROWS = [
  [MED_OPTIONS[0], MED_OPTIONS[1]],
  [MED_OPTIONS[2], MED_OPTIONS[3]],
  [MED_OPTIONS[4], MED_OPTIONS[5]],
] as const;

export function MedicationStep() {
  const { formData, updateFormData } = useLogMigraine();

  const handleToggleMedication = (label: string) => {
    const alreadySelected = formData.medications.some((med) => med.name === label);
    const nextMeds = alreadySelected
      ? formData.medications.filter((med) => med.name !== label)
      : [...formData.medications, { name: label, takenAt: new Date().toISOString() }];
    updateFormData("medications", nextMeds);
    updateFormData("medicationTaken", nextMeds.length > 0);
    updateFormData("medicationNoneSelected", false);
  };

  const handleToggleNone = () => {
    const nextNoneSelected = !formData.medicationNoneSelected;
    updateFormData("medicationNoneSelected", nextNoneSelected);
    if (nextNoneSelected) {
      updateFormData("medications", []);
      updateFormData("medicationTaken", false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <View style={styles.badge}>
          <Svg width={56} height={56} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="medBadgeGradient" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={colors.migraine} />
                <Stop offset="100%" stopColor="#FF8CCB" />
              </RadialGradient>
            </Defs>
            <Rect width={56} height={56} rx={16} fill="url(#medBadgeGradient)" />
          </Svg>
          <Icon name="pill" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Did you take medication?</Text>
        <Text style={styles.subtitle}>Tap all that apply</Text>
      </View>

      <View style={styles.medGrid}>
        {MED_ROWS.map((row) => (
          <View key={row.map((item) => item.id).join("-")} style={styles.medRow}>
            {row.map((med) => {
              const isSelected = formData.medications.some((item) => item.name === med.label);
              return (
                <Pressable
                  key={med.id}
                  onPress={() => handleToggleMedication(med.label)}
                  style={[
                    styles.medTile,
                    isSelected && styles.medTileSelected,
                  ]}
                >
                  <Icon
                    name={med.icon}
                    size={32}
                    color={isSelected ? palette.accent : palette.iconMuted}
                  />
                  <Text
                    style={[
                      styles.medLabel,
                      isSelected && styles.medLabelSelected,
                    ]}
                  >
                    {med.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={styles.noneRow}>
          <Pressable
            onPress={handleToggleNone}
            style={[
              styles.noneTile,
              formData.medicationNoneSelected && styles.noneTileSelected,
            ]}
          >
            <Icon
              name="x"
              size={20}
              color={formData.medicationNoneSelected ? palette.accent : palette.iconMuted}
            />
            <Text
              style={[
                styles.noneLabel,
                formData.medicationNoneSelected && styles.noneLabelSelected,
              ]}
            >
              No medication taken
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleArea: {
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: palette.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: "center",
  },
  medGrid: {
    gap: 12,
  },
  medRow: {
    flexDirection: "row",
    gap: 12,
  },
  medTile: {
    flex: 1,
    height: 100,
    backgroundColor: palette.card,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  medTileSelected: {
    backgroundColor: palette.accentSoft,
  },
  medLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: palette.textMuted,
    textAlign: "center",
  },
  medLabelSelected: {
    color: palette.accent,
  },
  noneRow: {
    flexDirection: "row",
    gap: 12,
  },
  noneTile: {
    flex: 1,
    height: 52,
    backgroundColor: palette.card,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  noneTileSelected: {
    backgroundColor: palette.accentSoft,
  },
  noneLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: palette.textMuted,
  },
  noneLabelSelected: {
    color: palette.accent,
  },
});
