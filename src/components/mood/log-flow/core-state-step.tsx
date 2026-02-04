import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import { AxisGridField, type AxisGridValue } from "@components/tracking/fields";
import { FlowTitle } from "./flow-title";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { MoodFormData } from "./mood-flow-types";

export function CoreStateStep() {
  const { formData, setFormData } = useTrackerFlow<MoodFormData>();

  const handleChange = React.useCallback(
    ({ energy, positivity }: AxisGridValue) => {
      setFormData((prev) => ({
        ...prev,
        energy,
        positivity,
      }));
    },
    [setFormData]
  );

  return (
    <View style={styles.container}>
      <FlowTitle
        title={"How does your mind\nfeel right now?"}
        subtitle="Drag the orb to describe your state"
        align="center"
      />

      <AxisGridField
        value={{ energy: formData.energy, positivity: formData.positivity }}
        onChange={handleChange}
        dominantLabel={formData.dominantMood}
        cardGradient={["#FFFFFF", "#FFFFFF"]}
        borderColor={mentalWeatherColors.borderSoft}
        borderWidth={1}
        accentColor={mentalWeatherColors.accent}
        accentLightColor={mentalWeatherColors.accentLight}
        textSoftColor={mentalWeatherColors.textSoft}
        textFontFamily={mentalWeatherFonts.text}
        leftAxisLabel="Unpleasant"
        rightAxisLabel="Pleasant"
        topAxisLabel="High energy"
        bottomAxisLabel="Low energy"
      />

      <Text selectable style={styles.hint}>
        Just go with your gut
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    alignItems: "center",
  },
  hint: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 14,
    fontWeight: "500",
    color: mentalWeatherColors.hint,
    textAlign: "center",
  },
});
