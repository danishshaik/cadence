import React from "react";
import { View, Text } from "react-native";
import { SeverityScale, YesNo, SingleSelect, MultiSelect, FreeText } from "./basic";
import { CheckinComponent } from "./types";
import { colors, radius, spacing, typography } from "@theme";

interface ComponentRendererProps {
  component: CheckinComponent;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  previousValue?: unknown;
}

export function ComponentRenderer({
  component,
  value,
  onChange,
  disabled,
  previousValue,
}: ComponentRendererProps) {
  const baseProps = {
    id: component.id,
    prompt: component.prompt,
    disabled,
    previousValue,
  };

  switch (component.type) {
    case "severity_scale":
      return (
        <SeverityScale
          {...baseProps}
          value={value as number | undefined}
          onChange={(next) => onChange(next)}
          scale_type={component.scale_type as "numeric_1_10" | "numeric_1_5" | "faces" | "visual_analog" | "traffic_light" | "descriptive"}
          min_label={component.min_label as string}
          max_label={component.max_label as string}
          show_previous={component.show_previous as boolean | undefined}
        />
      );
    case "yes_no":
      return (
        <YesNo
          {...baseProps}
          value={value as boolean | "maybe" | undefined}
          onChange={(next) => onChange(next)}
          show_maybe={component.show_maybe}
        />
      );
    case "single_select":
      return (
        <SingleSelect
          {...baseProps}
          value={value as string | undefined}
          onChange={(next) => onChange(next)}
          options={component.options as Array<{ value: string; label: string; icon?: string; description?: string }>}
          display={component.display as "buttons" | "chips" | "list" | "cards" | undefined}
        />
      );
    case "multi_select":
      return (
        <MultiSelect
          {...baseProps}
          value={value as string[] | undefined}
          onChange={(next) => onChange(next)}
          options={component.options as Array<{ value: string; label: string; icon?: string }>}
          min_selections={component.min_selections as number | undefined}
          max_selections={component.max_selections as number | undefined}
          display={component.display as "chips" | "checkboxes" | "grid" | undefined}
        />
      );
    case "free_text":
      return (
        <FreeText
          {...baseProps}
          value={value as string | undefined}
          onChange={(next) => onChange(next)}
          placeholder={component.placeholder as string | undefined}
          max_length={component.max_length as number | undefined}
          optional={component.optional as boolean | undefined}
        />
      );
    default:
      return (
        <View
          style={{
            padding: spacing.md,
            backgroundColor: colors.surfaceSecondary,
            borderRadius: radius.md,
            borderCurve: "continuous",
          }}
        >
          <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
            Component type "{component.type}" not implemented yet.
          </Text>
        </View>
      );
  }
}
