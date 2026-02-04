import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "@theme";
import { FieldProps } from "../types";
import { FieldWrapper } from "./field-wrapper";

const isIOS = process.env.EXPO_OS === "ios";

interface ToggleFieldProps extends FieldProps<boolean> {
  labelPlacement?: "row" | "stack";
}

export function ToggleField({
  value,
  onChange,
  disabled,
  required,
  error,
  label,
  description,
  labelPlacement = "row",
}: ToggleFieldProps) {
  return (
    <FieldWrapper
      label={labelPlacement === "stack" ? label : undefined}
      description={labelPlacement === "stack" ? description : undefined}
      required={required}
      error={error}
      disabled={disabled}
    >
      <View style={[styles.row, labelPlacement === "stack" && styles.rowStack]}>
        {labelPlacement === "row" && label ? (
          <View style={styles.textBlock}>
            <Text selectable style={styles.label}>
              {label}
              {required ? " *" : ""}
            </Text>
            {description ? (
              <Text selectable style={styles.description}>
                {description}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Switch
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          trackColor={{ false: colors.arthritisBorder, true: colors.arthritisMuted }}
          thumbColor={value ? colors.arthritis : "#FFFFFF"}
          ios_backgroundColor={colors.arthritisBorder}
        />
      </View>
    </FieldWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowStack: {
    alignItems: "flex-start",
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: colors.arthritisText,
  },
  description: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: colors.arthritisTextSecondary,
  },
});
