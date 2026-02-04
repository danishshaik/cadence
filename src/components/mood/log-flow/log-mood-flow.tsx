import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMoodStore } from "@stores/mood-store";
import { TrackerFlowProvider, useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import { FlowFooter, FlowScaffold, TrackerFlowRenderer, useNativeFlowHeader } from "@components/tracking";
import * as Haptics from "expo-haptics";
import { mentalWeatherColors, mentalWeatherFonts, shadows } from "@theme";
import { getInitialMoodFormData, normalizeMoodFormData, type MoodFormData } from "./mood-flow-types";
import { moodFlowConfig } from "./mood-flow-config";

function LogMoodFlowContent() {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
    isFirstStep,
    save,
    cancel,
  } = useTrackerFlow<MoodFormData>();

  const currentStepConfig = moodFlowConfig.steps[currentStep - 1];

  const handleContinue = React.useCallback(() => {
    if (isLastStep) {
      void save();
    } else {
      goToNextStep();
    }
  }, [goToNextStep, isLastStep, save]);

  const handleSaveAndExit = React.useCallback(() => {
    void save();
  }, [save]);

  const primaryLabel = isLastStep ? "Complete" : "Continue";
  const showSecondary = !isFirstStep && !isLastStep;
  const isSelfCareStep = currentStepConfig?.id === "selfcare";

  const handleHeaderBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancel();
  }, [cancel]);

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleHeaderCancel,
    backgroundColor: mentalWeatherColors.background[0],
    activeColor: mentalWeatherColors.accent,
    inactiveColor: mentalWeatherColors.accentLight,
    iconColor: mentalWeatherColors.textMuted,
    headerHorizontalPadding: 24,
  });

  return (
    <LinearGradient
      colors={mentalWeatherColors.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <FlowScaffold
        scrollEnabled={!isSelfCareStep}
        contentContainerStyle={styles.contentContainer}
        footer={
          <FlowFooter
            primaryAction={{ label: primaryLabel, onPress: handleContinue }}
            secondaryAction={
              showSecondary ? { label: "Save", onPress: handleSaveAndExit } : undefined
            }
            primaryButtonStyle={styles.primaryButton}
            primaryPressedStyle={styles.buttonPressed}
            primaryTextStyle={styles.primaryText}
            secondaryButtonStyle={styles.secondaryButton}
            secondaryPressedStyle={styles.buttonPressed}
            secondaryTextStyle={styles.secondaryText}
            fullWidthPrimaryWhenSolo={!showSecondary}
            containerStyle={styles.footerContainer}
            buttonRowStyle={styles.footerRow}
          />
        }
      >
        <TrackerFlowRenderer config={moodFlowConfig} />
      </FlowScaffold>
    </LinearGradient>
  );
}

export function LogMoodFlow() {
  const router = useRouter();
  const addLog = useMoodStore((state) => state.addLog);

  return (
    <TrackerFlowProvider
      initialData={getInitialMoodFormData()}
      totalSteps={moodFlowConfig.steps.length}
      onSave={(data) => {
        addLog({
          energy: data.energy,
          positivity: data.positivity,
          dominantMood: data.dominantMood,
          emotions: data.emotions,
          somaticSymptoms: data.somaticSymptoms,
          triggers: data.triggers,
          selfCare: data.selfCare,
          loggedAt: data.loggedAt.toISOString(),
        });
        router.back();
      }}
      onCancel={() => router.back()}
      onFormDataChange={normalizeMoodFormData}
    >
      <LogMoodFlowContent />
    </TrackerFlowProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: mentalWeatherColors.accent,
    borderRadius: 14,
    borderCurve: "continuous",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    width: 100,
    flex: 0,
    backgroundColor: mentalWeatherColors.buttonMuted,
    borderRadius: 14,
    borderCurve: "continuous",
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: mentalWeatherColors.borderMuted,
    ...shadows.sm,
  },
  primaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryText: {
    fontFamily: mentalWeatherFonts.text,
    fontSize: 16,
    fontWeight: "600",
    color: mentalWeatherColors.textMuted,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  footerContainer: {
    paddingHorizontal: 24,
  },
  footerRow: {
    gap: 12,
  },
});
