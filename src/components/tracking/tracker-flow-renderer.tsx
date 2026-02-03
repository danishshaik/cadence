import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors } from "@theme";
import { FlowContentBlock, TrackerFlowConfig } from "./flow-config";
import { FormDataConstraint } from "./types";
import {
  BubbleChoiceField,
  ChoiceField,
  DayPartDurationField,
  HeroScaleField,
  IconGridField,
  JointMapField,
  LinearScaleField,
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

  if (!step) {
    return null;
  }

  const cardSize = Math.min((width - 60) / 2, 150);

  const renderContentBlock = (block: FlowContentBlock, index: number) => {
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
        <Text key={`note-${index}`} style={styles.footerNote}>
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
        <Text key={`note-${index}`} style={styles.footerNote}>
          {text}
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
          accentColor={bubbleTheme === "migraine.bubbles" ? colors.migraine : undefined}
          textPrimaryColor={bubbleTheme === "migraine.bubbles" ? "#2F3A34" : undefined}
          textSecondaryColor={bubbleTheme === "migraine.bubbles" ? "#7B857F" : undefined}
          textMutedColor={bubbleTheme === "migraine.bubbles" ? "#4A5A52" : undefined}
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
    <View style={styles.container}>
      {(step.title || step.subtitle) && (
        <View style={styles.header}>
          {step.title && <Text style={styles.title}>{step.title}</Text>}
          {step.subtitle && <Text style={styles.subtitle}>{step.subtitle}</Text>}
        </View>
      )}

      {primaryContent.map(renderContentBlock)}

      <View style={styles.fields}>{step.fields.map(renderField)}</View>

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
