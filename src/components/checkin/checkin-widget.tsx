import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { Card, Button, H2, Body } from "@components/shared";
import { ComponentRenderer } from "./component-renderer";
import { CheckinScreen, CheckinSection } from "./types";
import { colors, spacing, typography } from "@theme";

interface CheckinWidgetProps {
  screen: CheckinScreen;
  onSubmit: (answers: Record<string, unknown>) => void;
  onSkip?: () => void;
  initialValues?: Record<string, unknown>;
  previousValues?: Record<string, unknown>;
  disabled?: boolean;
}

export function CheckinWidget({
  screen,
  onSubmit,
  onSkip,
  initialValues = {},
  previousValues = {},
  disabled = false,
}: CheckinWidgetProps) {
  const { height } = useWindowDimensions();
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialValues);
  const maxHeight = height * 0.5;
  const bodyMaxHeight = Math.max(maxHeight - 160, 120);

  const updateAnswer = useCallback((componentId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [componentId]: value }));
  }, []);

  const shouldShowSection = (section: CheckinSection) => {
    if (!section.show_if) return true;

    const { component_id, condition, value: targetValue } = section.show_if;
    const currentValue = answers[component_id];

    switch (condition) {
      case "equals":
        return currentValue === targetValue;
      case "not_equals":
        return currentValue !== targetValue;
      case "contains":
        return Array.isArray(currentValue) && currentValue.includes(targetValue);
      case "gt":
        return typeof currentValue === "number" && typeof targetValue === "number" && currentValue > targetValue;
      case "lt":
        return typeof currentValue === "number" && typeof targetValue === "number" && currentValue < targetValue;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      style={{ marginHorizontal: spacing.md, marginVertical: spacing.sm, maxHeight }}
    >
      <View
        style={{
          padding: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: spacing.xs,
        }}
      >
        <H2>{screen.title}</H2>
        {screen.subtitle && <Body color="secondary">{screen.subtitle}</Body>}
      </View>

      <ScrollView
        style={{ maxHeight: bodyMaxHeight }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {screen.sections.map((section) =>
          shouldShowSection(section) ? (
            <View key={section.id} style={{ gap: spacing.sm }}>
              {section.title && (
                <Text selectable style={{ ...typography.h3, color: colors.textPrimary }}>
                  {section.title}
                </Text>
              )}
              {section.description && (
                <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
                  {section.description}
                </Text>
              )}
              <View style={{ gap: spacing.md }}>
                {section.components.map((component) => (
                  <ComponentRenderer
                    key={component.id}
                    component={component}
                    value={answers[component.id]}
                    onChange={(value) => updateAnswer(component.id, value)}
                    disabled={disabled}
                    previousValue={previousValues[component.id]}
                  />
                ))}
              </View>
            </View>
          ) : null
        )}
      </ScrollView>

      <View
        style={{
          padding: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: spacing.sm,
          alignItems: "center",
        }}
      >
        <Button title={screen.submit_label} onPress={handleSubmit} disabled={disabled} fullWidth />
        {screen.allow_skip && onSkip && (
          <Button title="Skip for now" variant="ghost" onPress={onSkip} disabled={disabled} />
        )}
        <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
          ~{screen.estimated_time_seconds}s to complete
        </Text>
      </View>
    </Card>
  );
}
