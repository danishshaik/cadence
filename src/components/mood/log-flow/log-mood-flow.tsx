import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMoodStore } from "@stores/mood-store";
import { useLogMood, LogMoodProvider } from "./log-mood-provider";
import { CoreStateStep } from "./core-state-step";
import { EmotionsStep } from "./emotions-step";
import { TriggersStep } from "./triggers-step";
import { SelfCareStep } from "./selfcare-step";
import { mentalWeatherColors } from "./mental-weather-theme";
import { FlowFooter, FlowScaffold, useNativeFlowHeader } from "@components/tracking";
import * as Haptics from "expo-haptics";
import { shadows } from "@theme";

const STEP_CONFIG = [
  {
    key: "core",
    title: "Mental Weather",
    component: CoreStateStep,
    gap: 24,
  },
  {
    key: "emotions",
    title: "Emotions",
    component: EmotionsStep,
    gap: 24,
  },
  {
    key: "triggers",
    title: "Triggers",
    component: TriggersStep,
    gap: 16,
  },
  {
    key: "selfcare",
    title: "Self Care",
    component: SelfCareStep,
    gap: 16,
  },
] as const;

function LogMoodFlowContent() {
  const router = useRouter();
  const addLog = useMoodStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogMood();

  const currentStepConfig = STEP_CONFIG[currentStep - 1];
  const gap = currentStepConfig?.gap ?? 16;
  const StepComponent = currentStepConfig?.component;

  const handleClose = React.useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = React.useCallback(() => {
    addLog({
      energy: formData.energy,
      positivity: formData.positivity,
      dominantMood: formData.dominantMood,
      emotions: formData.emotions,
      somaticSymptoms: formData.somaticSymptoms,
      triggers: formData.triggers,
      selfCare: formData.selfCare,
      loggedAt: formData.loggedAt.toISOString(),
    });
    router.back();
  }, [addLog, formData, router]);

  const handleContinue = React.useCallback(() => {
    if (isLastStep) {
      handleSave();
    } else {
      goToNextStep();
    }
  }, [goToNextStep, handleSave, isLastStep]);

  const handleSecondary = React.useCallback(() => {
    if (currentStep <= 2) {
      goToNextStep();
      return;
    }
    handleSave();
  }, [currentStep, goToNextStep, handleSave]);

  const secondaryLabel = currentStep <= 2 ? "Skip" : "Save";
  const primaryLabel = isLastStep ? "Done" : "Continue";
  const isCompactFooter = currentStep <= 2;
  const isSelfCareStep = currentStepConfig?.key === "selfcare";

  const handleHeaderBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
  }, [handleClose]);

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
        contentContainerStyle={[styles.contentContainer, { gap }]}
        footer={
          <FlowFooter
            primaryAction={{ label: primaryLabel, onPress: handleContinue }}
            secondaryAction={{ label: secondaryLabel, onPress: handleSecondary }}
            primaryButtonStyle={isCompactFooter ? styles.primaryButtonCompact : styles.primaryButton}
            primaryPressedStyle={styles.buttonPressed}
            primaryTextStyle={styles.primaryText}
            secondaryButtonStyle={isCompactFooter ? styles.secondaryButtonCompact : styles.secondaryButton}
            secondaryPressedStyle={styles.buttonPressed}
            secondaryTextStyle={styles.secondaryText}
            fullWidthPrimaryWhenSolo={false}
            containerStyle={styles.footerContainer}
            buttonRowStyle={styles.footerRow}
          />
        }
      >
        {StepComponent ? <StepComponent /> : null}
      </FlowScaffold>
    </LinearGradient>
  );
}

export function LogMoodFlow() {
  return (
    <LogMoodProvider>
      <LogMoodFlowContent />
    </LogMoodProvider>
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
  primaryButtonCompact: {
    flex: 1,
    backgroundColor: mentalWeatherColors.accent,
    borderRadius: 12,
    borderCurve: "continuous",
    height: 50,
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
  secondaryButtonCompact: {
    flex: 1,
    backgroundColor: mentalWeatherColors.buttonMuted,
    borderRadius: 12,
    borderCurve: "continuous",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    fontFamily: process.env.EXPO_OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryText: {
    fontFamily: process.env.EXPO_OS === "ios" ? "SF Pro Text" : "sans-serif",
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
