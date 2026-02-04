import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@theme";
import { useLogArthritis } from "./log-arthritis-provider";
import { JointMapField } from "@components/tracking";

const isIOS = process.env.EXPO_OS === "ios";

export function LocationStep() {
  const { formData, updateFormData } = useLogArthritis();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Where is the flare-up centered?</Text>
        <Text style={styles.subtitle}>Tap a joint to place a pulse dot</Text>
      </View>

      <JointMapField
        value={formData.affectedJoints}
        onChange={(next) => updateFormData({ affectedJoints: next })}
        bilateralSymmetry={formData.bilateralSymmetry}
        onBilateralChange={(value) => updateFormData({ bilateralSymmetry: value })}
      />

      <Text style={styles.footerNote}>
        {formData.affectedJoints.length === 0
          ? "No joints selected"
          : `${formData.affectedJoints.length} joint${formData.affectedJoints.length !== 1 ? "s" : ""} selected`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 4,
    gap: 16,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.arthritisText,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
  },
});
