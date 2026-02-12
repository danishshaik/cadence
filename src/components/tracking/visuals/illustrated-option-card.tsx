import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const isIOS = process.env.EXPO_OS === "ios";

interface IllustratedOptionCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  illustration: React.ReactNode;
}

export function IllustratedOptionCard({
  label,
  selected,
  onPress,
  illustration,
}: IllustratedOptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      {illustration}
      <Text selectable style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SupineIllustration() {
  return (
    <View style={styles.supineIllustration}>
      <View style={styles.supineBed} />
      <View style={styles.supineHead} />
      <View style={styles.supineTorso} />
      <View style={styles.supineLegs} />
      <View style={styles.supineArm} />
    </View>
  );
}

export function SittingIllustration() {
  return (
    <View style={styles.sittingIllustration}>
      <View style={styles.sitChairBack} />
      <View style={styles.sitChairSeat} />
      <View style={styles.sitChairLegLeft} />
      <View style={styles.sitChairLegRight} />
      <View style={styles.sitHead} />
      <View style={styles.sitTorso} />
      <View style={styles.sitThighs} />
      <View style={styles.sitLowerLeg} />
      <View style={styles.sitArm} />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  card: {
    flex: 1,
    height: 180,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "#E6E6F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.06)",
  },
  cardSelected: {
    borderColor: "#6C5CE7",
    backgroundColor: "#F7F4FF",
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: "#2F3A34",
    textAlign: "center",
  },
  labelSelected: {
    color: "#6C5CE7",
  },
  supineIllustration: {
    width: 110,
    height: 60,
  },
  supineBed: {
    position: "absolute",
    left: 0,
    top: 42,
    width: 110,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#E0E7FF",
  },
  supineHead: {
    position: "absolute",
    left: 8,
    top: 24,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#6C5CE7",
  },
  supineTorso: {
    position: "absolute",
    left: 24,
    top: 27,
    width: 44,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6C5CE7",
  },
  supineLegs: {
    position: "absolute",
    left: 62,
    top: 29,
    width: 36,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
  },
  supineArm: {
    position: "absolute",
    left: 32,
    top: 21,
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
  sittingIllustration: {
    width: 80,
    height: 84,
  },
  sitChairBack: {
    position: "absolute",
    left: 8,
    top: 16,
    width: 10,
    height: 48,
    borderRadius: 5,
    backgroundColor: "#E0E7FF",
  },
  sitChairSeat: {
    position: "absolute",
    left: 8,
    top: 52,
    width: 40,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E7FF",
  },
  sitChairLegLeft: {
    position: "absolute",
    left: 10,
    top: 62,
    width: 6,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#E8E5FF",
  },
  sitChairLegRight: {
    position: "absolute",
    left: 40,
    top: 62,
    width: 6,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#E8E5FF",
  },
  sitHead: {
    position: "absolute",
    left: 30,
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#6C5CE7",
  },
  sitTorso: {
    position: "absolute",
    left: 34,
    top: 18,
    width: 10,
    height: 34,
    borderRadius: 5,
    backgroundColor: "#6C5CE7",
  },
  sitThighs: {
    position: "absolute",
    left: 34,
    top: 50,
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
  },
  sitLowerLeg: {
    position: "absolute",
    left: 54,
    top: 56,
    width: 8,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
  },
  sitArm: {
    position: "absolute",
    left: 44,
    top: 26,
    width: 6,
    height: 18,
    borderRadius: 3,
    backgroundColor: "#818CF8",
  },
});
