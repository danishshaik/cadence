import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors } from "@theme";
import { FlowContentBlock, TrackerFlowConfig } from "./flow-config";
import { FormDataConstraint } from "./types";
import {
  ChoiceField,
  JointMapField,
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
});
