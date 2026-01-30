import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@theme";
import { useMigraineStore } from "@stores/migraine-store";
import { useLogMigraine, LogMigraineProvider } from "./log-migraine-provider";
import { SeverityStep } from "./severity-step";
import { WhenStep } from "./when-step";
import { DurationStep } from "./duration-step";
import { LocationStep } from "./location-step";
import { TriggersStep } from "./triggers-step";
import { MedicationStep } from "./medication-step";
import { NotesStep } from "./notes-step";
import { useNativeFlowHeader } from "@components/tracking";

function LogMigraineFlowContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addLog = useMigraineStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogMigraine();

  const handleCancel = () => {
    router.back();
  };

  const handleHeaderBack = React.useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleHeaderCancel,
    backgroundColor: colors.background,
    activeColor: colors.migraine,
    inactiveColor: colors.border,
  });

  const handleSave = () => {
    addLog({
      severity: formData.severity,
      severityLabel: formData.severityLabel,
      startedAt: formData.startedAt.toISOString(),
      timeOfDay: formData.timeOfDay,
      isOngoing: formData.isOngoing,
      durationMinutes: formData.durationMinutes,
      painLocations: formData.painLocations,
      triggers: formData.triggers,
      medicationTaken: formData.medicationTaken,
      medications: formData.medications,
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

  const steps = [
    { key: "severity", node: <SeverityStep /> },
    { key: "when", node: <WhenStep /> },
    { key: "duration", node: <DurationStep /> },
    { key: "location", node: <LocationStep /> },
    { key: "triggers", node: <TriggersStep /> },
    { key: "medication", node: <MedicationStep /> },
    { key: "notes", node: <NotesStep /> },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>{steps[currentStep - 1]?.node}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
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

export function LogMigraineFlow() {
  return (
    <LogMigraineProvider>
      <LogMigraineFlowContent />
    </LogMigraineProvider>
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
    backgroundColor: colors.migraine,
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
