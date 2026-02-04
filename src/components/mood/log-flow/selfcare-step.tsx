import React from "react";
import { StyleSheet, View } from "react-native";
import { MultiSelectCardField } from "@components/tracking/fields";
import { useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import { SELF_CARE_OPTIONS, SelfCareId } from "@/types/mood";
import { FlowTitle } from "./flow-title";
import { mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { MoodFormData } from "./mood-flow-types";

const SELF_CARE_CARD_CONFIG: Record<
  SelfCareId,
  { title: string; subtitle: string; icon: string }
> = {
  meditation: { title: "Meditation", subtitle: "Calm your mind", icon: "brain" },
  exercise: { title: "Walk", subtitle: "Move your body", icon: "footprints" },
  journaled: { title: "Journaling", subtitle: "Write it out", icon: "pen-line" },
  talked: { title: "Talk to a friend", subtitle: "Connection heals", icon: "message-circle" },
  medication: { title: "Medication", subtitle: "Support your body", icon: "pill" },
  survived: { title: "Just survived", subtitle: "You made it through", icon: "shield" },
};

const SELF_CARE_CARD_OPTIONS = SELF_CARE_OPTIONS.map((option) => {
  const config = SELF_CARE_CARD_CONFIG[option.id];
  return {
    id: option.id,
    title: config.title,
    subtitle: config.subtitle,
    icon: config.icon,
  };
});

export function SelfCareStep() {
  const { formData, updateField } = useTrackerFlow<MoodFormData>();
  const selectedCount = formData.selfCare.length;
  const badgeText = `${selectedCount} thing${selectedCount > 1 ? "s" : ""} - you showed up for yourself.`;

  const handleToggle = React.useCallback(
    (id: SelfCareId) => {
      const current = formData.selfCare;
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      updateField("selfCare", next);
    },
    [formData.selfCare, updateField]
  );

  return (
    <View style={styles.container}>
      <FlowTitle
        title="Did you support yourself?"
        subtitle="Every small step counts"
        align="center"
        subtitleColor={mentalWeatherColors.textSecondary}
      />
      <MultiSelectCardField
        options={SELF_CARE_CARD_OPTIONS}
        selectedIds={formData.selfCare}
        onToggle={handleToggle}
        badge={{
          enabled: selectedCount > 0,
          text: badgeText,
          icon: "sparkles",
        }}
        accentColor={mentalWeatherColors.accent}
        accentSoftColor={mentalWeatherColors.accentLight}
        cardBackgroundColor={mentalWeatherColors.surface}
        cardBorderColor={mentalWeatherColors.borderSoft}
        cardSelectedBorderColor={mentalWeatherColors.accent}
        iconBackgroundColor={mentalWeatherColors.accentLight}
        iconMutedColor={mentalWeatherColors.textSecondary}
        iconSelectedColor={mentalWeatherColors.accent}
        textPrimaryColor={mentalWeatherColors.textPrimary}
        textSecondaryColor={mentalWeatherColors.textSecondary}
        checkBorderColor={mentalWeatherColors.borderMuted}
        checkSelectedColor={mentalWeatherColors.accent}
        badgeBackgroundColor={mentalWeatherColors.accentLight}
        badgeTextColor={mentalWeatherColors.accent}
        badgeIconColor={mentalWeatherColors.accent}
        titleFontFamily={mentalWeatherFonts.text}
        subtitleFontFamily={mentalWeatherFonts.text}
        badgeFontFamily={mentalWeatherFonts.text}
        containerStyle={styles.field}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
  },
  field: {
    flex: 1,
  },
});
