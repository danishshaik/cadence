import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { colors, shadows } from "@theme";
import { RELIEF_MEASURES, ReliefMeasureId } from "@/types/congestion";
import { useLogCongestion } from "./log-congestion-provider";
import { ResonanceStepHeader } from "./resonance-step-header";

const isIOS = process.env.EXPO_OS === "ios";

const DISPLAY_ORDER: ReliefMeasureId[] = [
  "tea",
  "steam",
  "lozenge",
  "inhaler",
  "chest_rub",
  "propped",
];

const REMEDY_META: Record<
  ReliefMeasureId,
  { title: string; subtitle: string; icon: string }
> = {
  tea: {
    title: "Hot Tea / Honey",
    subtitle: "Warm soothing drink.",
    icon: "coffee",
  },
  steam: {
    title: "Steam / Shower",
    subtitle: "Hot steam inhalation.",
    icon: "cloud-outline",
  },
  lozenge: {
    title: "Cough Drop",
    subtitle: "Lozenge or throat drop.",
    icon: "pill",
  },
  inhaler: {
    title: "Inhaler",
    subtitle: "Prescribed inhaler.",
    icon: "wind",
  },
  chest_rub: {
    title: "Chest Rub",
    subtitle: "Vapor rub or balm.",
    icon: "hand-left-outline",
  },
  propped: {
    title: "Rest",
    subtitle: "Lying down, sleeping.",
    icon: "bed-outline",
  },
};

export function ReliefStep() {
  const { formData, updateFormData } = useLogCongestion();

  const handleToggle = (id: ReliefMeasureId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = formData.reliefMeasures.includes(id)
      ? formData.reliefMeasures.filter((item) => item !== id)
      : [...formData.reliefMeasures, id];
    updateFormData({ reliefMeasures: updated });
  };

  const optionsById = RELIEF_MEASURES.reduce((acc, option) => {
    acc[option.id] = option;
    return acc;
  }, {} as Record<ReliefMeasureId, (typeof RELIEF_MEASURES)[number]>);

  return (
    <View style={styles.container}>
      <ResonanceStepHeader title="What helped you settle?" subtitle="Select all that apply" />

      <View style={styles.list}>
        {DISPLAY_ORDER.map((id) => {
          const option = optionsById[id];
          if (!option) return null;

          const meta = REMEDY_META[id];
          const selected = formData.reliefMeasures.includes(id);

          return (
            <Pressable
              key={option.id}
              onPress={() => handleToggle(id)}
              style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.iconWrap}>
                <Icon name={meta.icon} size={20} color={colors.restorativeSage} />
              </View>

              <View style={styles.info}>
                <Text selectable style={styles.titleText}>
                  {meta.title}
                </Text>
                <Text selectable style={styles.subtitleText}>
                  {meta.subtitle}
                </Text>
              </View>

              <View style={[styles.check, selected && styles.checkSelected]}>
                {selected ? <Icon name="checkmark" size={14} color="#FFFFFF" /> : null}
              </View>
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
    gap: 20,
  },
  list: {
    width: "100%",
    gap: 10,
    paddingBottom: 8,
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderCurve: "continuous",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5EBE5",
    paddingVertical: 14,
    paddingHorizontal: 16,
    ...shadows.sm,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: colors.restorativeSage,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  titleText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3A34",
  },
  subtitleText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "400",
    color: "#6C7A72",
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1.5,
    borderColor: "#E5EBE5",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkSelected: {
    borderColor: colors.restorativeSage,
    backgroundColor: colors.restorativeSage,
  },
});
