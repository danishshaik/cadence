import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors, mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { FlowContentBlock, TrackerFlowConfig } from "./flow-config";
import { FormDataConstraint } from "./types";
import {
  AnatomyHotspotField,
  AxisGridField,
  CategorizedChipField,
  BubbleChoiceField,
  ChoiceField,
  DayPartDurationField,
  HeroScaleField,
  HotspotMapField,
  IconGridField,
  JointMapField,
  LinearScaleField,
  MultiSelectCardField,
  RadialDurationField,
  RegionMapField,
  SegmentedSelectionField,
  SelectionField,
  StiffnessField,
  SwatchSelectionField,
  ToggleField,
} from "./fields";
import { useTrackerFlow } from "./tracker-flow-provider";
import { getVisualization } from "./registries/visualization-registry";
import type { VisualizationKey } from "./registries/visualization-registry";
import {
  ActivityPill,
  ManagementCard,
  WeatherConfirmationPill,
  WeatherIcon,
} from "./visuals/arthritis-visuals";
import {
  IllustratedOptionCard,
  SittingIllustration,
  SupineIllustration,
} from "./visuals/illustrated-option-card";
import {
  IconTileOptionCard,
} from "./visuals/icon-tile-option-card";
import {
  OrthostaticFactorCard,
} from "./visuals/orthostatic-visuals";
import { WeatherConfirmationId } from "@/types/arthritis";
import { getMigraineSeverityLabel } from "@/types/migraine";
import { getOrthostaticSeverityLabel } from "@/types/orthostatic";
import { Icon } from "@components/ui";
import type { SegmentedSelectionFieldProps } from "./fields/segmented-selection-field";

const isIOS = process.env.EXPO_OS === "ios";

function getSimulatedWeather() {
  const pressures = ["rising", "falling", "stable"] as const;
  const temps = [42, 48, 55, 62, 68];
  const humidities = [45, 58, 65, 72, 80];

  return {
    pressure: pressures[Math.floor(Math.random() * pressures.length)],
    temperature: temps[Math.floor(Math.random() * temps.length)],
    humidity: humidities[Math.floor(Math.random() * humidities.length)],
  };
}

type SegmentedSelectionStyleOverrides = Omit<
  Partial<SegmentedSelectionFieldProps>,
  "value" | "onChange" | "options" | "label" | "description"
>;

function getSegmentedSelectionStyle(
  visualizationKey?: VisualizationKey,
  accentOverride?: string
): SegmentedSelectionStyleOverrides | undefined {
  if (visualizationKey === "orthostatic.segmented-duration") {
    return {
      accentColor: accentOverride ?? "#6C5CE7",
      cardColor: "#FFFFFF",
      segmentSurfaceColor: "#F3F4F6",
      textPrimaryColor: "#2F3A34",
      textSecondaryColor: "#9AA2A0",
      segmentSelectedTextColor: "#FFFFFF",
      showDividers: true,
      containerRadius: 12,
      segmentRadius: 10,
      segmentMinHeight: 40,
      cardShadow: "0 12px 24px rgba(108, 92, 231, 0.1)",
    };
  }

  return undefined;
}

interface TrackerFlowRendererProps<TFormData extends FormDataConstraint> {
  config: TrackerFlowConfig<TFormData>;
}

export function TrackerFlowRenderer<TFormData extends FormDataConstraint>({
  config,
}: TrackerFlowRendererProps<TFormData>) {
  const { formData, updateField, errors, currentStep } = useTrackerFlow<TFormData>();
  const { width } = useWindowDimensions();
  const step = config.steps[currentStep - 1];
  const theme = config.theme;
  const headerBadge = step?.headerBadge;
  const headerBadgeGradient = headerBadge?.gradient ?? ["#0F172A", "#334155"];
  const headerBadgeSize = headerBadge?.size ?? 56;
  const headerBadgeRadius = headerBadge?.cornerRadius ?? 16;
  const headerBadgeIconSize = headerBadge?.iconSize ?? 24;
  const headerBadgeIconColor = headerBadge?.iconColor ?? "#FFFFFF";
  const contentBlocks = step?.content ?? [];
  const weatherBlock = contentBlocks.find((block) => block.type === "weather_summary");

  React.useEffect(() => {
    if (!weatherBlock || weatherBlock.type !== "weather_summary") return;

    const pressureValue = (formData as any)[weatherBlock.pressureKey];
    if (pressureValue !== null && pressureValue !== undefined) return;

    const weather = getSimulatedWeather();
    updateField(weatherBlock.pressureKey as any, weather.pressure as any);
    updateField(weatherBlock.temperatureKey as any, weather.temperature as any);
    updateField(weatherBlock.humidityKey as any, weather.humidity as any);
  }, [weatherBlock, formData, updateField]);

  if (!step) {
    return null;
  }

  const hasFillField = step.fields.some((field) => field.fill);
  const cardSize = Math.min((width - 60) / 2, 150);

  const renderContentBlock = (block: FlowContentBlock, index: number) => {
    const noteStyle = [styles.footerNote, theme?.noteStyle];

    if (block.type === "weather_summary") {
      const pressure = (formData as any)[block.pressureKey] as
        | "rising"
        | "falling"
        | "stable"
        | null;
      const temperature = (formData as any)[block.temperatureKey] as number | null;
      const humidity = (formData as any)[block.humidityKey] as number | null;

      const pressureLabel =
        pressure === "falling"
          ? "Low (Falling)"
          : pressure === "rising"
          ? "High (Rising)"
          : "Stable";

      return (
        <View key={`content-${index}`} style={styles.weatherCard}>
          <WeatherIcon pressure={pressure} />
          <Text style={styles.pressureLabel}>Barometric Pressure: {pressureLabel}</Text>
          <Text style={styles.weatherDetails}>
            Temp {temperature ?? "--"}°F | Humidity {humidity ?? "--"}%
          </Text>
        </View>
      );
    }

    if (block.type === "note" && block.variant === "selection_count") {
      const value = (formData as any)[block.fieldKey] as unknown[];
      const count = value?.length ?? 0;
      const singularLabel = block.singularLabel ?? "item";
      const pluralLabel = block.pluralLabel ?? `${singularLabel}s`;
      const text =
        count === 0
          ? block.emptyText ?? "No selections"
          : `${count} ${count === 1 ? singularLabel : pluralLabel} selected`;
      return (
        <Text key={`note-${index}`} style={noteStyle}>
          {text}
        </Text>
      );
    }

    if (block.type === "note" && block.variant === "weather_confirmation") {
      const value = (formData as any)[block.fieldKey] as WeatherConfirmationId | null;
      const text = value
        ? `Weather correlation: ${
            value === "yes" ? "Confirmed" : value === "cold" ? "Cold-related" : "Not related"
          }`
        : "Select an option above";
      return (
        <Text key={`note-${index}`} style={noteStyle}>
          {text}
        </Text>
      );
    }

    if (block.type === "note" && block.variant === "text") {
      return (
        <Text key={`note-${index}`} style={noteStyle}>
          {block.text}
        </Text>
      );
    }

    return null;
  };

  const renderField = (field: (typeof step.fields)[number]) => {
    const isVisible =
      !field.visibility ||
      (field.visibility.type === "before_hour" &&
        new Date().getHours() < field.visibility.hour);

    if (!isVisible) return null;

    const error = errors?.[field.fieldKey];
    const visualization = field.visualizationKey
      ? getVisualization(field.visualizationKey, { cardSize })
      : undefined;

    if (field.type === "axis_grid") {
      if (!field.secondaryKey) {
        return null;
      }
      const dominantKey = field.dominantKey ?? "dominantMood";
      return (
        <AxisGridField
          key={field.id}
          value={{
            energy: (formData as any)[field.fieldKey] as number,
            positivity: (formData as any)[field.secondaryKey] as number,
          }}
          onChange={(next) => {
            updateField(field.fieldKey as any, next.energy as any);
            updateField(field.secondaryKey as any, next.positivity as any);
          }}
          dominantLabel={(formData as any)[dominantKey] as string}
          leftAxisLabel={field.leftLabel}
          rightAxisLabel={field.rightLabel}
          topAxisLabel={field.topLabel}
          bottomAxisLabel={field.bottomLabel}
          cardGradient={field.cardGradient}
        />
      );
    }

    if (field.type === "stiffness") {
      return (
        <StiffnessField
          key={field.id}
          value={(formData as any)[field.fieldKey] as number}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
        />
      );
    }

    if (field.type === "linear_scale") {
      return (
        <LinearScaleField
          key={field.id}
          value={(formData as any)[field.fieldKey] as number}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
          min={field.min ?? 0}
          max={field.max ?? 10}
          step={field.step ?? 1}
          leftLabel={field.leftLabel}
          rightLabel={field.rightLabel}
        />
      );
    }

    if (field.type === "toggle") {
      const toggleTheme = field.visualizationKey;
      return (
        <ToggleField
          key={field.id}
          value={(formData as any)[field.fieldKey] as boolean}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
          variant={toggleTheme === "congestion.sleep" ? "card" : "default"}
          trackOffColor={toggleTheme === "congestion.sleep" ? "#D6DED9" : undefined}
          trackOnColor={toggleTheme === "congestion.sleep" ? "#4DB6AC" : undefined}
          thumbColorOn={toggleTheme === "congestion.sleep" ? "#FFFFFF" : undefined}
          thumbColorOff={toggleTheme === "congestion.sleep" ? "#FFFFFF" : undefined}
          iosBackgroundColor={toggleTheme === "congestion.sleep" ? "#D6DED9" : undefined}
          labelColor={toggleTheme === "congestion.sleep" ? "#2F3A34" : undefined}
          descriptionColor={toggleTheme === "congestion.sleep" ? "#6C7A72" : undefined}
          cardStyle={
            toggleTheme === "congestion.sleep"
              ? {
                  borderRadius: 18,
                  borderCurve: "continuous",
                  backgroundColor: "#FFFFFF",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  boxShadow: "0 4px 16px rgba(77, 182, 172, 0.08)",
                }
              : undefined
          }
        />
      );
    }

    if (field.type === "hero_scale") {
      const heroVariant = field.visualizationKey;
      const heroValue = (formData as any)[field.fieldKey] as number;
      const derivedLabelKey = field.secondaryKey ?? `${field.fieldKey}Label`;
      const isOrbHero =
        heroVariant === "migraine.severity" ||
        heroVariant === "orthostatic.severity" ||
        heroVariant === "congestion.sleep";
      const heroValueLabel =
        heroVariant === "migraine.severity"
          ? `${getMigraineSeverityLabel(heroValue).charAt(0).toUpperCase()}${getMigraineSeverityLabel(heroValue).slice(1)}`
          : heroVariant === "orthostatic.severity"
          ? getOrthostaticSeverityLabel(heroValue)
          : heroVariant === "congestion.sleep"
          ? ((formData as any)[derivedLabelKey] as string | undefined)
          : undefined;

      const heroTheme =
        heroVariant === "migraine.severity"
          ? {
              orbSize: 180,
              orbGradientColors: ["#FFE6F3", "#FFB6DA", "#F48BC9"] as const,
              orbHotGradientColors: ["#FF8AC7", "#F05FA9", "#C2185B"] as const,
              orbShadow: "0 10px 28px rgba(233, 30, 140, 0.28)",
              accentColor: "#E91E8C",
              textPrimaryColor: "#2F3A34",
              textSecondaryColor: "#7B857F",
              textMutedColor: "#6C7A72",
              pillBackgroundColor: "#FFF0F6",
              tickInactiveColor: "#D6DED9",
              tickActiveColor: "#E91E8C",
              gradientColors: ["#8EF2B2", "#FFE082", "#FF8AC7", "#F44336"] as const,
              cardGradientColors: ["#FFFFFF", "#FFF5FA"] as const,
              cardShadow: "0 12px 30px rgba(233, 30, 140, 0.16)",
            }
          : heroVariant === "orthostatic.severity"
          ? {
              orbSize: 180,
              orbGradientColors: ["#E8E5FF", "#CFCBFF", "#A79CFF"] as const,
              orbHotGradientColors: ["#CFCBFF", "#A79CFF", "#6C5CE7"] as const,
              orbShadow: "0 10px 28px rgba(108, 92, 231, 0.22)",
              accentColor: "#6C5CE7",
              textPrimaryColor: "#2F3A34",
              textSecondaryColor: "#7B857F",
              textMutedColor: "#6C7A72",
              pillBackgroundColor: "#F0EDFC",
              tickInactiveColor: "#D6DED9",
              tickActiveColor: "#6C5CE7",
              gradientColors: ["#E8E5FF", "#CFCBFF", "#A79CFF", "#6C5CE7"] as const,
              cardGradientColors: ["#FFFFFF", "#FAF8FF"] as const,
              cardShadow: "0 12px 24px rgba(108, 92, 231, 0.1)",
            }
          : heroVariant === "congestion.sleep"
          ? {
              orbSize: 180,
              orbGradientColors: ["#DFF7EE", "#88D8B0", "#4DB6AC"] as const,
              orbHotGradientColors: ["#BEEBDD", "#5CC8AF", "#2F9D8F"] as const,
              orbShadow: "0 10px 28px rgba(77, 182, 172, 0.28)",
              accentColor: "#4DB6AC",
              textPrimaryColor: "#2F3A34",
              textSecondaryColor: "#7B857F",
              textMutedColor: "#6C7A72",
              pillBackgroundColor: "#E0F2F1",
              tickInactiveColor: "#D6DED9",
              tickActiveColor: "#4DB6AC",
              gradientColors: ["#E0F2F1", "#88D8B0", "#4DB6AC"] as const,
              cardGradientColors: ["#FFFFFF", "#F4F8F6"] as const,
              cardShadow: "0 12px 24px rgba(136, 216, 176, 0.12)",
            }
          : undefined;

      return (
        <HeroScaleField
          key={field.id}
          value={heroValue}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          min={field.min ?? 0}
          max={field.max ?? 10}
          step={field.step ?? 1}
          leftLabel={field.leftLabel}
          rightLabel={field.rightLabel}
          heroVariant={isOrbHero ? "orb" : undefined}
          orbAnimation={heroVariant === "congestion.sleep" ? "shake" : undefined}
          valueLabel={heroValueLabel}
          {...heroTheme}
        />
      );
    }

    if (field.type === "radial_duration") {
      if (!field.unitKey || !field.durationUnits?.length) {
        return null;
      }
      const currentUnitId = (formData as any)[field.unitKey] as string;
      const activeUnit =
        field.durationUnits.find((unit) => unit.id === currentUnitId) ?? field.durationUnits[0];
      const activeValue = (formData as any)[activeUnit.targetKey] as number;
      return (
        <RadialDurationField
          key={field.id}
          label={field.label}
          description={field.description}
          units={field.durationUnits}
          selectedUnitId={activeUnit.id}
          onUnitChange={(nextUnitId) => {
            const nextUnit =
              field.durationUnits?.find((unit) => unit.id === nextUnitId) ?? field.durationUnits?.[0];
            if (!nextUnit) return;
            const nextRaw = (formData as any)[nextUnit.targetKey] as number;
            const nextValue = Number.isFinite(nextRaw)
              ? Math.min(nextUnit.max, Math.max(nextUnit.min, nextRaw))
              : nextUnit.min;
            updateField(field.unitKey as any, nextUnit.id as any);
            updateField(nextUnit.targetKey as any, nextValue as any);
          }}
          value={Number.isFinite(activeValue) ? activeValue : activeUnit.min}
          onChange={(next) =>
            updateField(
              activeUnit.targetKey as any,
              Math.min(activeUnit.max, Math.max(activeUnit.min, next)) as any
            )
          }
          presets={field.durationPresets}
          accentColor="#6C5CE7"
          surfaceColor="#FFFFFF"
          mutedColor="#E6E6F0"
          textPrimaryColor="#2F3A34"
          textSecondaryColor="#9AA2A0"
        />
      );
    }

    if (field.type === "region_map") {
      if (!field.mapConfig) {
        return null;
      }
      const mapTheme = field.visualizationKey;
      return (
        <RegionMapField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string[]}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          frontSilhouette={field.mapConfig.frontSilhouette}
          backSilhouette={field.mapConfig.backSilhouette}
          regions={field.mapConfig.regions}
          accentColor={
            mapTheme === "migraine.map"
              ? colors.migraine
              : mapTheme === "orthostatic.prodrome"
              ? "#6C5CE7"
              : undefined
          }
          accentSoftColor={
            mapTheme === "migraine.map"
              ? "#FCE7F3"
              : mapTheme === "orthostatic.prodrome"
              ? "#F0EDFC"
              : undefined
          }
          cardColor={
            mapTheme === "migraine.map" || mapTheme === "orthostatic.prodrome"
              ? "#FFFFFF"
              : undefined
          }
          surfaceColor={
            mapTheme === "migraine.map" ? "#F3F4F6" : mapTheme === "orthostatic.prodrome" ? "#F3F4F6" : undefined
          }
          textPrimaryColor={
            mapTheme === "migraine.map" || mapTheme === "orthostatic.prodrome" ? "#2F3A34" : undefined
          }
          textSecondaryColor={
            mapTheme === "migraine.map" || mapTheme === "orthostatic.prodrome" ? "#7B857F" : undefined
          }
          mapGradientColors={
            mapTheme === "migraine.map"
              ? ["#FDF2F8", "#F3E8F0"]
              : mapTheme === "orthostatic.prodrome"
              ? ["#F8F5FF", "#F0EDFC"]
              : undefined
          }
          showViewToggle={field.mapShowViewToggle}
          showChips={field.mapShowChips}
        />
      );
    }

    if (field.type === "hotspot_map") {
      if (!field.hotspots) {
        return null;
      }
      return (
        <HotspotMapField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string[]}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          hotspots={field.hotspots}
          accentColor={
            field.visualizationKey === "orthostatic.prodrome" ? "#6C5CE7" : undefined
          }
          accentSoftColor={
            field.visualizationKey === "orthostatic.prodrome"
              ? "rgba(108, 92, 231, 0.12)"
              : undefined
          }
          cardColor="#FFFFFF"
          bodyColor="#F3F4F6"
          borderColor="#E6E6F0"
          textPrimaryColor="#2F3A34"
        />
      );
    }

    if (field.type === "anatomy_hotspot") {
      if (!field.anatomyMapConfig) {
        return null;
      }
      const anatomyTheme = field.visualizationKey;
      return (
        <AnatomyHotspotField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string | null | string[]}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          mapConfig={field.anatomyMapConfig}
          selectionMode={field.anatomySelectionMode}
          maxSelections={field.anatomyMaxSelections}
          accentColor={anatomyTheme === "congestion.source" ? "#88D8B0" : undefined}
          accentSoftColor={
            anatomyTheme === "congestion.source" ? "rgba(136, 216, 176, 0.24)" : undefined
          }
          decorativeDotColor={anatomyTheme === "congestion.source" ? "#E5EBE7" : undefined}
          hotspotIdleColor={anatomyTheme === "congestion.source" ? "#FFFFFF" : undefined}
          hotspotCoreColor={anatomyTheme === "congestion.source" ? "#FFFFFF" : undefined}
          selectionPillBackgroundColor={anatomyTheme === "congestion.source" ? "#E5F3ED" : undefined}
          selectionPillTextColor={anatomyTheme === "congestion.source" ? "#5C7469" : undefined}
          selectionPillIdleBackgroundColor={anatomyTheme === "congestion.source" ? "#F1F4F2" : undefined}
          selectionPillIdleTextColor={anatomyTheme === "congestion.source" ? "#8B948F" : undefined}
          selectionPillTemplate="{label} • Selected"
          selectionCountTemplate="{count} areas selected"
          selectionPlaceholderText="Select a zone"
        />
      );
    }

    if (field.type === "swatch_selection") {
      if (!field.swatchOptions) {
        return null;
      }
      const swatchTheme = field.visualizationKey;
      return (
        <SwatchSelectionField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string | null}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          options={field.swatchOptions}
          insights={field.swatchInsightByValue}
          accentColor={swatchTheme === "congestion.phlegm-swatches" ? colors.restorativeSage : undefined}
          cardColor={swatchTheme === "congestion.phlegm-swatches" ? "#FFFFFF" : undefined}
          cardBorderColor={swatchTheme === "congestion.phlegm-swatches" ? "#E5EBE5" : undefined}
          cardShadow={
            swatchTheme === "congestion.phlegm-swatches"
              ? "0 8px 20px rgba(136, 216, 176, 0.1)"
              : undefined
          }
          labelColor={swatchTheme === "congestion.phlegm-swatches" ? "#6C7A72" : undefined}
          labelSelectedColor={swatchTheme === "congestion.phlegm-swatches" ? "#2F3A34" : undefined}
          insightBackgroundColor={
            swatchTheme === "congestion.phlegm-swatches" ? "rgba(255, 249, 196, 0.18)" : undefined
          }
          insightTextColor={swatchTheme === "congestion.phlegm-swatches" ? "#6C7A72" : undefined}
          insightIconColor={swatchTheme === "congestion.phlegm-swatches" ? "#F9A825" : undefined}
        />
      );
    }

    if (field.type === "bubble_choice") {
      if (!field.bubbleItems) {
        return null;
      }
      const bubbleTheme = field.visualizationKey;
      return (
        <BubbleChoiceField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string[]}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          items={field.bubbleItems}
          layoutPreset={field.bubbleLayoutPreset}
          accentColor={
            bubbleTheme === "migraine.bubbles"
              ? colors.migraine
              : bubbleTheme === "mood.bubbles"
              ? mentalWeatherColors.accent
              : undefined
          }
          textPrimaryColor={
            bubbleTheme === "migraine.bubbles"
              ? "#2F3A34"
              : bubbleTheme === "mood.bubbles"
              ? mentalWeatherColors.textPrimary
              : undefined
          }
          textSecondaryColor={
            bubbleTheme === "migraine.bubbles"
              ? "#7B857F"
              : bubbleTheme === "mood.bubbles"
              ? mentalWeatherColors.textSecondary
              : undefined
          }
          textMutedColor={
            bubbleTheme === "migraine.bubbles"
              ? "#4A5A52"
              : bubbleTheme === "mood.bubbles"
              ? mentalWeatherColors.textMuted
              : undefined
          }
        />
      );
    }

    if (field.type === "categorized_chips") {
      if (!field.chipCategories || !field.chipItems) {
        return null;
      }
      const chipTheme = field.visualizationKey;
      return (
        <CategorizedChipField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string[]}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          categories={field.chipCategories}
          items={field.chipItems}
          accentColor={chipTheme === "mood.triggers" ? mentalWeatherColors.accent : undefined}
          accentSoftColor={
            chipTheme === "mood.triggers" ? mentalWeatherColors.accentLight : undefined
          }
          surfaceColor={chipTheme === "mood.triggers" ? mentalWeatherColors.surface : undefined}
          borderColor={chipTheme === "mood.triggers" ? mentalWeatherColors.borderSoft : undefined}
          headerTextColor={
            chipTheme === "mood.triggers" ? "#6C7A72" : undefined
          }
          headerIconColor={
            chipTheme === "mood.triggers" ? mentalWeatherColors.textSecondary : undefined
          }
          chipTextColor={chipTheme === "mood.triggers" ? mentalWeatherColors.textMuted : undefined}
          chipSelectedTextColor={
            chipTheme === "mood.triggers" ? mentalWeatherColors.accent : undefined
          }
          summaryTextColor={
            chipTheme === "mood.triggers" ? mentalWeatherColors.accent : undefined
          }
        />
      );
    }

    if (field.type === "multi_select_card") {
      if (!field.cardOptions) {
        return null;
      }
      const cardTheme = field.visualizationKey;
      const isMoodSelfcare = cardTheme === "mood.selfcare";
      const isCongestionRelief = cardTheme === "congestion.relief-cards";
      const selected = (formData as any)[field.fieldKey] as string[];
      const selectedCount = selected?.length ?? 0;
      const badgeText = field.badgeTemplate
        ? field.badgeTemplate
            .replace("{count}", String(selectedCount))
            .replace("{plural}", selectedCount === 1 ? "" : "s")
        : undefined;
      const showBadge = field.badgeShowWhenEmpty ? true : selectedCount > 0;
      return (
        <MultiSelectCardField
          key={field.id}
          options={field.cardOptions}
          selectedIds={selected ?? []}
          onToggle={(id) => {
            const next = selected?.includes(id)
              ? selected.filter((item) => item !== id)
              : [...(selected ?? []), id];
            updateField(field.fieldKey as any, next as any);
          }}
          badge={
            badgeText
              ? {
                  enabled: showBadge,
                  text: badgeText,
                  icon: field.badgeIcon,
                }
              : undefined
          }
          accentColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          accentSoftColor={
            isMoodSelfcare
              ? mentalWeatherColors.accentLight
              : isCongestionRelief
              ? "#E0F2F1"
              : undefined
          }
          cardBackgroundColor={
            isMoodSelfcare
              ? mentalWeatherColors.surface
              : isCongestionRelief
              ? "#FFFFFF"
              : undefined
          }
          cardBorderColor={
            isMoodSelfcare
              ? mentalWeatherColors.borderSoft
              : isCongestionRelief
              ? "#E5EBE5"
              : undefined
          }
          cardSelectedBorderColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          iconBackgroundColor={
            isMoodSelfcare
              ? mentalWeatherColors.accentLight
              : isCongestionRelief
              ? "#E0F2F1"
              : undefined
          }
          iconMutedColor={
            isMoodSelfcare
              ? mentalWeatherColors.textSecondary
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          iconSelectedColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          textPrimaryColor={
            isMoodSelfcare
              ? mentalWeatherColors.textPrimary
              : isCongestionRelief
              ? "#2F3A34"
              : undefined
          }
          textSecondaryColor={
            isMoodSelfcare
              ? mentalWeatherColors.textSecondary
              : isCongestionRelief
              ? "#6C7A72"
              : undefined
          }
          checkBorderColor={
            isMoodSelfcare
              ? mentalWeatherColors.borderMuted
              : isCongestionRelief
              ? "#E5EBE5"
              : undefined
          }
          checkSelectedColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          badgeBackgroundColor={
            isMoodSelfcare
              ? mentalWeatherColors.accentLight
              : isCongestionRelief
              ? "#E0F2F1"
              : undefined
          }
          badgeTextColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          badgeIconColor={
            isMoodSelfcare
              ? mentalWeatherColors.accent
              : isCongestionRelief
              ? colors.restorativeSage
              : undefined
          }
          titleFontFamily={isMoodSelfcare ? mentalWeatherFonts.text : undefined}
          subtitleFontFamily={isMoodSelfcare ? mentalWeatherFonts.text : undefined}
          badgeFontFamily={isMoodSelfcare ? mentalWeatherFonts.text : undefined}
          containerStyle={
            field.fill ? [styles.fieldFill, styles.fieldFillPinned] : undefined
          }
          badgeStyle={field.fill ? styles.badgePinned : undefined}
        />
      );
    }

    if (field.type === "day_part_duration") {
      const durationKey = field.durationKey ?? "durationMinutes";
      const ongoingKey = field.ongoingKey ?? "isOngoing";
      const startedAtKey = field.startedAtKey ?? "startedAt";
      if (!field.dayParts || !field.durationOptions) {
        return null;
      }
      const dayPartTheme = field.visualizationKey;
      const durationSegmentTheme = getSegmentedSelectionStyle(
        field.durationSegmentVisualizationKey,
        dayPartTheme === "migraine.day-part" ? colors.migraine : undefined
      );
      return (
        <DayPartDurationField
          key={field.id}
          label={field.label}
          description={field.description}
          hintText={field.hintText}
          dayParts={field.dayParts}
          durationOptions={field.durationOptions}
          timeOfDay={(formData as any)[field.fieldKey] as string}
          isOngoing={(formData as any)[ongoingKey] as boolean}
          durationMinutes={(formData as any)[durationKey] as number | null}
          onTimeOfDayChange={(next) => updateField(field.fieldKey as any, next as any)}
          onStartedAtChange={(next) => updateField(startedAtKey as any, next as any)}
          onIsOngoingChange={(next) => updateField(ongoingKey as any, next as any)}
          onDurationMinutesChange={(next) => updateField(durationKey as any, next as any)}
          accentColor={dayPartTheme === "migraine.day-part" ? colors.migraine : undefined}
          accentSoftColor={dayPartTheme === "migraine.day-part" ? "#FCE4F1" : undefined}
          cardColor={dayPartTheme === "migraine.day-part" ? "#FFFFFF" : undefined}
          textPrimaryColor={dayPartTheme === "migraine.day-part" ? "#2F3A34" : undefined}
          textSecondaryColor={dayPartTheme === "migraine.day-part" ? "#7B857F" : undefined}
          textMutedColor={dayPartTheme === "migraine.day-part" ? "#4A5A52" : undefined}
          hintColor={dayPartTheme === "migraine.day-part" ? "#E91E8C90" : undefined}
          dayPartShadow={
            dayPartTheme === "migraine.day-part"
              ? "0 4px 16px rgba(233, 30, 140, 0.06)"
              : undefined
          }
          durationShadow={
            dayPartTheme === "migraine.day-part"
              ? "0 6px 20px rgba(233, 30, 140, 0.06)"
              : undefined
          }
          durationSegmentOverrides={durationSegmentTheme}
        />
      );
    }

    if (field.type === "icon_grid") {
      if (!field.iconItems) {
        return null;
      }
      const noneSelectedKey = field.noneSelectedKey ?? "noneSelected";
      const valueType = field.iconValueType ?? "string";
      const currentValue = (formData as any)[field.fieldKey] as
        | { name: string; takenAt: string }[]
        | string[]
        | undefined;
      const currentList = Array.isArray(currentValue) ? currentValue : [];
      const selectedIds = currentList.map((item) =>
        valueType === "object" ? (item as { name: string }).name : (item as string)
      );
      const iconTheme = field.visualizationKey;
      return (
        <IconGridField
          key={field.id}
          label={field.label}
          description={field.description}
          showBadge={field.showBadge}
          items={field.iconItems}
          selectedIds={selectedIds}
          onToggle={(id) => {
            const alreadySelected = selectedIds.includes(id);
            const next = alreadySelected
              ? currentList.filter((item) =>
                  valueType === "object"
                    ? (item as { name: string }).name !== id
                    : (item as string) !== id
                )
              : valueType === "object"
              ? [
                  ...(currentList as { name: string; takenAt: string }[]),
                  { name: id, takenAt: new Date().toISOString() },
                ]
              : [...(currentList as string[]), id];
            updateField(field.fieldKey as any, next as any);
            if ((formData as any)[noneSelectedKey]) {
              updateField(noneSelectedKey as any, false as any);
            }
          }}
          noneOption={
            field.noneOptionLabel
              ? {
                  label: field.noneOptionLabel,
                  selected: Boolean((formData as any)[noneSelectedKey]),
                  onPress: () => {
                    const nextNoneSelected = !(formData as any)[noneSelectedKey];
                    updateField(noneSelectedKey as any, nextNoneSelected as any);
                    if (nextNoneSelected) {
                      updateField(field.fieldKey as any, [] as any);
                    }
                  },
                }
              : undefined
          }
          accentColor={iconTheme === "migraine.icon-grid" ? colors.migraine : undefined}
          accentSoftColor={iconTheme === "migraine.icon-grid" ? "#FCE4F1" : undefined}
          textPrimaryColor={iconTheme === "migraine.icon-grid" ? "#2F3A34" : undefined}
          textSecondaryColor={iconTheme === "migraine.icon-grid" ? "#7B857F" : undefined}
          textMutedColor={iconTheme === "migraine.icon-grid" ? "#4A5A52" : undefined}
          iconMutedColor={iconTheme === "migraine.icon-grid" ? "#C0C6C2" : undefined}
          badgeGradient={
            iconTheme === "migraine.icon-grid" ? [colors.migraine, "#FF8CCB"] : undefined
          }
          badgeIcon={iconTheme === "migraine.icon-grid" ? "pill" : undefined}
        />
      );
    }

    if (field.type === "joint_map") {
      return (
        <JointMapField
          key={field.id}
          value={(formData as any)[field.fieldKey] as any}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          bilateralSymmetry={
            field.bilateralKey ? (formData as any)[field.bilateralKey] : false
          }
          onBilateralChange={
            field.bilateralKey
              ? (next) => updateField(field.bilateralKey as any, next as any)
              : undefined
          }
          error={error}
        />
      );
    }

    if (field.type === "selection") {
      const currentValue = (formData as any)[field.fieldKey];
      return (
        <SelectionField
          key={field.id}
          value={(formData as any)[field.fieldKey] as any}
          onChange={(next) => {
            if (field.allowDeselect && currentValue === next) {
              updateField(field.fieldKey as any, null as any);
              return;
            }
            updateField(field.fieldKey as any, next as any);
          }}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
          options={field.options ?? []}
          variant={visualization?.variant}
          listStyle={visualization?.listStyle}
          renderOption={
            field.visualizationKey === "weather.pill"
              ? ({ option, selected, onPress }) => (
                  <WeatherConfirmationPill
                    key={option.value}
                    id={option.value as WeatherConfirmationId}
                    label={option.label}
                    selected={selected}
                    onPress={() => onPress()}
                  />
                )
              : field.visualizationKey === "orthostatic.position"
              ? ({ option, selected, onPress }) => (
                  <IllustratedOptionCard
                    key={option.value}
                    label={option.label}
                    selected={selected}
                    onPress={() => onPress()}
                    illustration={
                      option.value === "supine" ? (
                        <SupineIllustration />
                      ) : option.value === "sitting" ? (
                        <SittingIllustration />
                      ) : null
                    }
                  />
                )
              : visualization?.renderOption
          }
        />
      );
    }

    if (field.type === "segmented_selection") {
      const segmentedTheme = getSegmentedSelectionStyle(field.visualizationKey);
      return (
        <SegmentedSelectionField
          key={field.id}
          value={(formData as any)[field.fieldKey] as string}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          options={field.options ?? []}
          label={field.label}
          description={field.description}
          disabled={false}
          {...segmentedTheme}
        />
      );
    }

    if (field.type === "choice") {
      return (
        <ChoiceField
          key={field.id}
          value={(formData as any)[field.fieldKey] as any}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
          options={field.options ?? []}
          listStyle={visualization?.listStyle}
          renderOption={
            field.visualizationKey === "activity.pill"
              ? ({ option, selected, onPress }) => (
                  <ActivityPill
                    key={option.value}
                    id={option.value as any}
                    label={option.label}
                    icon={option.description ?? "circle.fill"}
                    selected={selected}
                    onPress={() => onPress()}
                  />
                )
              : field.visualizationKey === "management.card"
              ? ({ option, selected, onPress }) => (
                  <ManagementCard
                    key={option.value}
                    id={option.value as any}
                    label={option.label}
                    icon={option.description ?? "circle.fill"}
                    selected={selected}
                    onPress={() => onPress()}
                    size={cardSize}
                  />
                )
              : field.visualizationKey === "orthostatic.hydration-cards"
              ? ({ option, selected, onPress }) => {
                  const [icon, subtitle] = (option.description ?? "").split("|");
                  return (
                    <OrthostaticFactorCard
                      key={option.value}
                      label={option.label}
                      subtitle={subtitle}
                      icon={icon || "help-circle-outline"}
                      selected={selected}
                      onPress={() => onPress()}
                    />
                  );
                }
              : field.visualizationKey === "choice.icon-tiles"
              ? ({ option, selected, onPress }) => (
                  <IconTileOptionCard
                    key={option.value}
                    label={option.label}
                    subtitle={option.subtitle ?? option.description}
                    icon={option.icon}
                    selected={selected}
                    onPress={() => onPress()}
                    width={cardSize}
                    height={150}
                    accentColor={option.accentColor ?? colors.restorativeSage}
                    iconBackgroundColor={option.iconBackgroundColor ?? "#E8F5F2"}
                    selectedBackgroundColor={option.selectedBackgroundColor ?? "#FFFFFF"}
                    glowColor={option.glowColor ?? "rgba(136, 216, 176, 0.18)"}
                    textColor="#2F3A34"
                    subtitleColor="rgba(123, 133, 127, 0.6)"
                  />
                )
              : visualization?.renderOption
          }
        />
      );
    }

    return null;
  };

  const primaryContent = contentBlocks.filter((block) => block.type !== "note");
  const noteContent = contentBlocks.filter((block) => block.type === "note");

  return (
    <View style={[styles.container, theme?.containerStyle]}>
      {(step.title || step.subtitle || headerBadge) && (
        <View style={[styles.header, theme?.headerStyle]}>
          {headerBadge ? (
            <View
              style={[
                styles.headerBadge,
                {
                  width: headerBadgeSize,
                  height: headerBadgeSize,
                  borderRadius: headerBadgeRadius,
                },
              ]}
            >
              <Svg width={headerBadgeSize} height={headerBadgeSize} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="headerBadgeGradient" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={headerBadgeGradient[0]} />
                    <Stop offset="100%" stopColor={headerBadgeGradient[1]} />
                  </RadialGradient>
                </Defs>
                <Rect
                  width={headerBadgeSize}
                  height={headerBadgeSize}
                  rx={headerBadgeRadius}
                  fill="url(#headerBadgeGradient)"
                />
              </Svg>
              <Icon name={headerBadge.icon} size={headerBadgeIconSize} color={headerBadgeIconColor} />
            </View>
          ) : null}
          {step.title && <Text style={[styles.title, theme?.titleStyle]}>{step.title}</Text>}
          {step.subtitle && (
            <Text style={[styles.subtitle, theme?.subtitleStyle]}>{step.subtitle}</Text>
          )}
        </View>
      )}

      {primaryContent.map(renderContentBlock)}

      <View
        style={[
          styles.fields,
          hasFillField ? styles.fieldsFill : null,
          theme?.fieldsStyle,
        ]}
      >
        {step.fields.map((field) => {
          const rendered = renderField(field);
          if (!rendered) return null;
          if (!field.fill) return rendered;
          return (
            <View key={`${field.id}-fill`} style={styles.fieldFill}>
              {rendered}
            </View>
          );
        })}
      </View>

      {noteContent.map(renderContentBlock)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 16,
    paddingBottom: 8,
  },
  header: {
    alignItems: "center",
    width: "100%",
  },
  headerBadge: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 10,
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
  fields: {
    width: "100%",
    gap: 16,
  },
  fieldsFill: {
    flex: 1,
  },
  fieldFill: {
    flex: 1,
    alignSelf: "stretch",
  },
  fieldFillPinned: {
    justifyContent: "flex-start",
  },
  badgePinned: {
    marginTop: "auto",
  },
  weatherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderCurve: "continuous",
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
    gap: 12,
    shadowColor: "rgba(0, 0, 0, 0.12)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  pressureLabel: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.arthritisText,
    textAlign: "center",
  },
  weatherDetails: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  footerNote: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.arthritisTextSecondary,
    textAlign: "center",
  },
  heroStack: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  heroValue: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 56,
    fontWeight: "700",
    color: "#E91E8C",
    fontVariant: ["tabular-nums"],
  },
  heroPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderCurve: "continuous",
    backgroundColor: "#FFF0F6",
  },
  heroPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    color: "#E91E8C",
  },
});
