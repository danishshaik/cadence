import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, mentalWeatherColors, mentalWeatherFonts } from "@theme";
import { FlowContentBlock, TrackerFlowConfig } from "./flow-config";
import { FormDataConstraint } from "./types";
import {
  AxisGridField,
  CategorizedChipField,
  BubbleChoiceField,
  ChoiceField,
  DayPartDurationField,
  HeroScaleField,
  IconGridField,
  JointMapField,
  LinearScaleField,
  MultiSelectCardField,
  RegionMapField,
  SelectionField,
  StiffnessField,
  ToggleField,
} from "./fields";
import { useTrackerFlow } from "./tracker-flow-provider";
import { getVisualization } from "./registries/visualization-registry";
import {
  ActivityPill,
  ManagementCard,
  WeatherConfirmationPill,
  WeatherIcon,
} from "./visuals/arthritis-visuals";
import { WeatherConfirmationId } from "@/types/arthritis";
import { getMigraineSeverityLabel } from "@/types/migraine";
import { SeverityCircle } from "@components/migraine/severity-circle";

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
      return (
        <ToggleField
          key={field.id}
          value={(formData as any)[field.fieldKey] as boolean}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          required={field.required}
          error={error}
        />
      );
    }

    if (field.type === "hero_scale") {
      const heroVariant = field.visualizationKey;
      const hero =
        heroVariant === "migraine.severity"
          ? (value: number) => {
              const severityLabel = getMigraineSeverityLabel(value);
              const label =
                severityLabel.charAt(0).toUpperCase() + severityLabel.slice(1);
              return (
                <View style={styles.heroStack}>
                  <SeverityCircle severity={value} size={180} />
                  <Text selectable style={styles.heroValue}>
                    {value}
                  </Text>
                  <View style={styles.heroPill}>
                    <Text selectable style={styles.heroPillText}>
                      {label}
                    </Text>
                  </View>
                </View>
              );
            }
          : undefined;

      return (
        <HeroScaleField
          key={field.id}
          value={(formData as any)[field.fieldKey] as number}
          onChange={(next) => updateField(field.fieldKey as any, next as any)}
          label={field.label}
          description={field.description}
          min={field.min ?? 0}
          max={field.max ?? 10}
          step={field.step ?? 1}
          leftLabel={field.leftLabel}
          rightLabel={field.rightLabel}
          hero={hero}
          gradientColors={
            heroVariant === "migraine.severity"
              ? ["#8EF2B2", "#FFE082", "#FF8AC7", "#F44336"]
              : undefined
          }
          cardGradientColors={
            heroVariant === "migraine.severity" ? ["#FFFFFF", "#FFF5FA"] : undefined
          }
          accentColor={heroVariant === "migraine.severity" ? "#E91E8C" : undefined}
          textPrimaryColor={heroVariant === "migraine.severity" ? "#2F3A34" : undefined}
          textSecondaryColor={heroVariant === "migraine.severity" ? "#7B857F" : undefined}
          textMutedColor={heroVariant === "migraine.severity" ? "#6C7A72" : undefined}
          pillBackgroundColor={heroVariant === "migraine.severity" ? "#FFF0F6" : undefined}
          tickInactiveColor={heroVariant === "migraine.severity" ? "#D6DED9" : undefined}
          tickActiveColor={heroVariant === "migraine.severity" ? "#E91E8C" : undefined}
          cardShadow={
            heroVariant === "migraine.severity"
              ? "0 12px 30px rgba(233, 30, 140, 0.16)"
              : undefined
          }
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
          accentColor={mapTheme === "migraine.map" ? colors.migraine : undefined}
          accentSoftColor={mapTheme === "migraine.map" ? "#FCE7F3" : undefined}
          cardColor={mapTheme === "migraine.map" ? "#FFFFFF" : undefined}
          surfaceColor={mapTheme === "migraine.map" ? "#F3F4F6" : undefined}
          textPrimaryColor={mapTheme === "migraine.map" ? "#2F3A34" : undefined}
          textSecondaryColor={mapTheme === "migraine.map" ? "#7B857F" : undefined}
          mapGradientColors={mapTheme === "migraine.map" ? ["#FDF2F8", "#F3E8F0"] : undefined}
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
          accentColor={cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined}
          accentSoftColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accentLight : undefined
          }
          cardBackgroundColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.surface : undefined
          }
          cardBorderColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.borderSoft : undefined
          }
          cardSelectedBorderColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined
          }
          iconBackgroundColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accentLight : undefined
          }
          iconMutedColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.textSecondary : undefined
          }
          iconSelectedColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined
          }
          textPrimaryColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.textPrimary : undefined
          }
          textSecondaryColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.textSecondary : undefined
          }
          checkBorderColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.borderMuted : undefined
          }
          checkSelectedColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined
          }
          badgeBackgroundColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accentLight : undefined
          }
          badgeTextColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined
          }
          badgeIconColor={
            cardTheme === "mood.selfcare" ? mentalWeatherColors.accent : undefined
          }
          titleFontFamily={cardTheme === "mood.selfcare" ? mentalWeatherFonts.text : undefined}
          subtitleFontFamily={cardTheme === "mood.selfcare" ? mentalWeatherFonts.text : undefined}
          badgeFontFamily={cardTheme === "mood.selfcare" ? mentalWeatherFonts.text : undefined}
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
              : visualization?.renderOption
          }
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
              : visualization?.renderOption
          }
        />
      );
    }

    return null;
  };

  const contentBlocks = step.content ?? [];
  const primaryContent = contentBlocks.filter((block) => block.type !== "note");
  const noteContent = contentBlocks.filter((block) => block.type === "note");
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

  return (
    <View style={[styles.container, theme?.containerStyle]}>
      {(step.title || step.subtitle) && (
        <View style={[styles.header, theme?.headerStyle]}>
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
