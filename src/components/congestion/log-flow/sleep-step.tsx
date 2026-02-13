import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { HeroScaleField } from "@components/tracking/fields";
import { useLogCongestion } from "./log-congestion-provider";
import { ResonanceStepHeader } from "./resonance-step-header";

const isIOS = process.env.EXPO_OS === "ios";

export function SleepStep() {
  const { formData, updateFormData } = useLogCongestion();
  const wokeDuringNight = formData.wokeDuringNight;

  const handleToggle = () => {
    Haptics.selectionAsync();
    updateFormData({ wokeDuringNight: !wokeDuringNight });
  };

  return (
    <View style={styles.container}>
      <ResonanceStepHeader
        title="How was your rest last night?"
        subtitle="Slide to show your sleep quality"
        titleGap={6}
        horizontalPadding={0}
        subtitleWeight="500"
      />

      <HeroScaleField
        value={formData.sleepQuality}
        onChange={(next) => updateFormData({ sleepQuality: next })}
        min={0}
        max={3}
        step={1}
        leftLabel="Unbroken"
        rightLabel="Restless"
        heroVariant="orb"
        orbAnimation="shake"
        valueLabel={formData.sleepLabel}
        orbSize={180}
        orbGradientColors={["#DFF7EE", "#88D8B0", "#4DB6AC"]}
        orbHotGradientColors={["#BEEBDD", "#5CC8AF", "#2F9D8F"]}
        orbShadow="0 10px 28px rgba(77, 182, 172, 0.28)"
        accentColor="#4DB6AC"
        textPrimaryColor="#2F3A34"
        textSecondaryColor="#7B857F"
        textMutedColor="#6C7A72"
        pillBackgroundColor="#E0F2F1"
        tickInactiveColor="#D6DED9"
        tickActiveColor="#4DB6AC"
        gradientColors={["#E0F2F1", "#88D8B0", "#4DB6AC"]}
        cardGradientColors={["#FFFFFF", "#F4F8F6"]}
        cardShadow="0 12px 24px rgba(136, 216, 176, 0.12)"
      />

      <View style={styles.toggleCard}>
        <View style={styles.toggleRow}>
          <Text selectable style={styles.toggleText}>
            Woke during the night
          </Text>
          <Pressable
            onPress={handleToggle}
            accessibilityRole="switch"
            accessibilityState={{ checked: wokeDuringNight }}
            style={[styles.toggleTrack, wokeDuringNight && styles.toggleTrackOn]}
          >
            <View style={[styles.toggleThumb, wokeDuringNight && styles.toggleThumbOn]} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
    paddingBottom: 12,
  },
  toggleRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  toggleCard: {
    width: "100%",
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    boxShadow: "0 4px 16px rgba(77, 182, 172, 0.08)",
  },
  toggleText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: "#2F3A34",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 100,
    borderCurve: "continuous",
    padding: 2,
    backgroundColor: "#D6DED9",
    justifyContent: "center",
  },
  toggleTrackOn: {
    backgroundColor: "#4DB6AC",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
  },
});
