import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@theme";
import { useGIStore } from "@stores/gi-store";
import { useLogGI, LogGIProvider } from "./log-gi-provider";
import { ProgressBar } from "./progress-bar";
import { StepHeader } from "./step-header";
import { TimingStep } from "./timing-step";
import { SeverityStep } from "./severity-step";
import { LocationStep } from "./location-step";
import { SymptomsStep } from "./symptoms-step";
import { BristolStep } from "./bristol-step";
import { TriggersStep } from "./triggers-step";

function LogGIFlowContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addLog = useGIStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogGI();

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    addLog({
      severity: formData.severity,
      severityLabel: formData.severityLabel,
      startedAt: formData.startedAt.toISOString(),
      context: formData.context,
      painLocations: formData.painLocations,
      symptoms: formData.symptoms,
      bowelMovement: formData.bowelMovement,
      triggers: formData.triggers,
      notes: formData.notes,
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
        return <TimingStep />;
      case 2:
        return <SeverityStep />;
      case 3:
        return <LocationStep />;
      case 4:
        return <SymptomsStep />;
      case 5:
        return <BristolStep />;
      case 6:
        return <TriggersStep />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StepHeader
        onBack={canGoBack ? goToPreviousStep : undefined}
        onCancel={handleCancel}
        showBack={canGoBack}
      />

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <View style={styles.stepContainer}>{renderStep()}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.buttonRow}>
          {/* Save & Exit button - always visible after first step */}
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

export function LogGIFlow() {
  return (
    <LogGIProvider>
      <LogGIFlowContent />
    </LogGIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
    backgroundColor: colors.gi,
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
