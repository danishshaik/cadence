import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { ExpoSlider } from "@components/ui";
import { colors } from "@theme";
import { useLogOrthostatic } from "./log-orthostatic-provider";
import { OrthostaticPosition, OrthostaticSedentaryDuration } from "@/types/orthostatic";

const isIOS = process.env.EXPO_OS === "ios";

const durationMap: OrthostaticSedentaryDuration[] = [
  "under_10_min",
  "thirty_min",
  "one_hour_plus",
];

const durationLabels: Record<OrthostaticSedentaryDuration, string> = {
  under_10_min: "< 10 min",
  thirty_min: "30 min",
  one_hour_plus: "1 hour+",
};

export function TriggerStep() {
  const { formData, updateFormData } = useLogOrthostatic();

  const setPosition = (position: OrthostaticPosition) =>
    updateFormData({ positionBeforeStanding: position });

  const currentIndex = durationMap.indexOf(formData.sedentaryDuration);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What position were you in before standing?</Text>
      <Text style={styles.subtitle}>Choose supine or sitting, then estimate time</Text>

      <View style={styles.cardRow}>
        {(["supine", "sitting"] as OrthostaticPosition[]).map((position) => {
          const selected = formData.positionBeforeStanding === position;
          return (
            <Pressable
              key={position}
              onPress={() => setPosition(position)}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.cardIcon}>
                {position === "supine" ? (
                  <>
                    <View style={styles.bedBase} />
                    <View style={styles.bedPillow} />
                    <View style={styles.personDot} />
                  </>
                ) : (
                  <>
                    <View style={styles.chairBack} />
                    <View style={styles.chairSeat} />
                    <View style={styles.personDot} />
                  </>
                )}
              </View>
              <Text style={styles.cardLabel}>
                {position === "supine" ? "Supine" : "Sitting"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sliderBlock}>
        <ExpoSlider
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          step={1}
          value={currentIndex}
          onValueChange={(value) =>
            updateFormData({ sedentaryDuration: durationMap[value] })
          }
          minimumTrackTintColor={colors.orthostatic}
          maximumTrackTintColor={colors.orthostaticMuted}
          thumbTintColor={colors.orthostatic}
        />
        <View style={styles.sliderLabels}>
          {durationMap.map((key) => (
            <Text key={key} style={styles.sliderLabel}>
              {durationLabels[key]}
            </Text>
          ))}
        </View>
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
    fontSize: 24,
    fontWeight: "700",
    color: "#2F355B",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: "rgba(102,126,234,0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(102,126,234,0.2)",
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  cardSelected: {
    borderColor: colors.orthostatic,
    shadowColor: colors.orthostatic,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(102,126,234,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  bedBase: {
    width: 36,
    height: 16,
    borderRadius: 6,
    backgroundColor: colors.orthostaticMuted,
  },
  bedPillow: {
    position: "absolute",
    width: 20,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(102,126,234,0.35)",
    top: 14,
    left: 10,
  },
  chairBack: {
    width: 18,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.orthostaticMuted,
  },
  chairSeat: {
    position: "absolute",
    width: 26,
    height: 10,
    borderRadius: 6,
    backgroundColor: "rgba(102,126,234,0.35)",
    top: 28,
  },
  personDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orthostatic,
    bottom: 10,
  },
  cardLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 13,
    fontWeight: "600",
    color: "#2F355B",
  },
  sliderBlock: {
    gap: 8,
  },
  slider: {
    width: "100%",
    height: 36,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.textSecondary,
  },
});
