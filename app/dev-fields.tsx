import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { colors } from "@theme";
import {
  ChoiceField,
  FlowHeader,
  LinearScaleField,
  SelectionField,
  getVisualization,
} from "@components/tracking";

export default function DevFieldsScreen() {
  const [selection, setSelection] = useState<string | null>("morning");
  const [choices, setChoices] = useState<string[]>(["heat"]);
  const [scale, setScale] = useState<number>(4);
  const selectionViz = getVisualization("selection.compact");

  return (
    <View style={{ flex: 1, backgroundColor: colors.arthritisLight }}>
      <FlowHeader
        currentStep={2}
        totalSteps={5}
        progressVariant="dots"
        showBack={true}
        onBack={() => {}}
        onCancel={() => {}}
        backgroundColor={colors.arthritisLight}
        activeColor={colors.arthritis}
        inactiveColor={colors.arthritisSurface}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
          paddingTop: 20,
          gap: 28,
        }}
        style={{ flex: 1 }}
      >
        <View style={{ gap: 12 }}>
          <Text selectable style={{ fontSize: 20, fontWeight: "700", color: colors.arthritisText }}>
            Field Primitives
          </Text>
          <Text selectable style={{ fontSize: 13, color: colors.arthritisTextSecondary }}>
            Dev-only screen for validating the new tracking fields.
          </Text>
        </View>

      <SelectionField
        label="When do you feel it most?"
        description="Pick a single option"
        value={selection}
        onChange={setSelection}
        variant={selectionViz.variant}
        options={[
          { value: "morning", label: "Morning", description: "After waking up" },
          { value: "afternoon", label: "Afternoon", description: "Mid-day" },
          { value: "evening", label: "Evening", description: "End of day" },
        ]}
      />

      <ChoiceField
        label="What helped today?"
        description="Select all that apply"
        value={choices}
        onChange={setChoices}
        options={[
          { value: "heat", label: "Heat", description: "Heating pad" },
          { value: "movement", label: "Movement", description: "Gentle stretch" },
          { value: "rest", label: "Rest", description: "Reduced activity" },
        ]}
      />

        <LinearScaleField
          label="Stiffness right now"
          description="0 = flexible, 10 = locked"
          value={scale}
          onChange={setScale}
          min={0}
          max={10}
          step={1}
          leftLabel="Flexible"
          rightLabel="Rigid"
        />
      </ScrollView>
    </View>
  );
}
