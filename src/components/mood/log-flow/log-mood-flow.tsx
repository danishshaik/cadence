import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@theme";
import { useMoodStore } from "@stores/mood-store";
import { useLogMood, LogMoodProvider } from "./log-mood-provider";
import { ProgressBar } from "./progress-bar";
import { StepHeader } from "./step-header";
import { CoreStateStep } from "./core-state-step";
import { EmotionsStep } from "./emotions-step";
import { TriggersStep } from "./triggers-step";
import { SelfCareStep } from "./selfcare-step";

function LogMoodFlowContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
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
  };

  const handleContinue = () => {
    if (isLastStep) {
      handleSave();
    } else {
      goToNextStep();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CoreStateStep />;
      case 2:
        return <EmotionsStep />;
      case 3:
        return <TriggersStep />;
      case 4:
        return <SelfCareStep />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View>
        <StepHeader
          onBack={canGoBack ? goToPreviousStep : undefined}
          onCancel={handleCancel}
          showBack={canGoBack}
        />

        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      <View style={styles.stepContainer}>{renderStep()}</View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              currentStep === 1 && styles.continueButtonFull,
              pressed && styles.continuePressed,
            ]}
          >
            <Text style={styles.continueText}>{isLastStep ? "Done" : "Continue"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
    backgroundColor: colors.background,
    justifyContent: "space-between",
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  continueButton: {
    flex: 2,
    backgroundColor: colors.mood,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonFull: {
    flex: 1,
  },
  continuePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
