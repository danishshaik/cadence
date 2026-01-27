import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@components/ui";
import { colors } from "@theme";
import { useSkinStore } from "@stores/skin-store";
import { useLogSkin, LogSkinProvider } from "./log-skin-provider";
import { ProgressBar } from "./progress-bar";
import { StepHeader } from "./step-header";
import { PhotoStep } from "./photo-step";
import { BreakoutTypeStep } from "./breakout-type-step";
import { SeverityStep } from "./severity-step";
import { TriggersStep } from "./triggers-step";
import { RoutineStep } from "./routine-step";

function LogSkinFlowContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addLog = useSkinStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogSkin();

  const handleCancel = () => {
    router.back();
  };

  const handleSave = () => {
    addLog({
      photoUri: formData.photoUri,
      breakoutTypes: formData.breakoutTypes,
      severity: formData.severity,
      triggers: formData.triggers,
      routineTime: formData.routineTime,
      routineSteps: formData.routineSteps,
      treatmentActives: formData.treatmentActives,
      spotTreatments: formData.spotTreatments,
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
        return <PhotoStep />;
      case 2:
        return <BreakoutTypeStep />;
      case 3:
        return <SeverityStep />;
      case 4:
        return <TriggersStep />;
      case 5:
        return <RoutineStep />;
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
            {isLastStep ? (
              <View style={styles.logItContent}>
                <Icon name="checkmark-circle" size={22} color="#FFFFFF" />
                <Text style={styles.continueText}>Log It</Text>
              </View>
            ) : (
              <Text style={styles.continueText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function LogSkinFlow() {
  return (
    <LogSkinProvider>
      <LogSkinFlowContent />
    </LogSkinProvider>
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
    backgroundColor: colors.skin,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
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
  logItContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
