import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@theme";
import { useMigraineStore } from "@stores/migraine-store";
import { useLogMigraine, LogMigraineProvider } from "./log-migraine-provider";
import { SeverityStep } from "./severity-step";
import { LocationStep } from "./location-step";
import { TriggersStep } from "./triggers-step";
import { MedicationStep } from "./medication-step";
import { WhenStep } from "./when-step";
import { useNativeFlowHeader } from "@components/tracking";

function LogMigraineFlowContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addLog = useMigraineStore((state) => state.addLog);
  const [closing, setClosing] = React.useState(false);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogMigraine();

  const closeFlow = React.useCallback(() => {
    setClosing(true);
    requestAnimationFrame(() => {
      if (router.canGoBack()) {
        router.dismiss();
      } else {
        router.replace("/");
      }
    });
  }, [router]);

  const handleCancel = React.useCallback(() => {
    closeFlow();
  }, [closeFlow]);

  const handleHeaderBack = React.useCallback(() => {
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    handleCancel();
  }, [handleCancel]);

  const steps = [
    { key: "severity", node: <SeverityStep /> },
    { key: "location", node: <LocationStep /> },
    { key: "triggers", node: <TriggersStep /> },
    { key: "when", node: <WhenStep /> },
    { key: "medication", node: <MedicationStep /> },
  ];
  const currentStepConfig = steps[currentStep - 1];
  const isMedicationStep = currentStepConfig?.key === "medication";
  const isSeverityStep = currentStepConfig?.key === "severity";

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleHeaderCancel,
    backgroundColor: isSeverityStep ? "#FFF7FB" : colors.migraineLight,
    activeColor: colors.migraine,
    inactiveColor: "#F3E8F0",
    iconColor: "#4A5A52",
    headerHorizontalPadding: 24,
    disabled: closing,
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
    closeFlow();
  };

  const handleContinue = () => {
    if (isLastStep) {
      handleSave();
    } else {
      goToNextStep();
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleSave();
      return;
    }
    goToNextStep();
  };

  return (
    <View style={styles.container}>
      {isSeverityStep && (
        <LinearGradient
          colors={["#FFF7FB", "#FDE7F2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.severityBackground}
          pointerEvents="none"
        />
      )}
      <View style={styles.stepContainer}>{currentStepConfig?.node}</View>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              isMedicationStep && styles.skipButtonMedication,
              pressed && styles.skipButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.skipButtonText,
                isMedicationStep && styles.skipButtonTextMedication,
              ]}
            >
              Skip
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              isMedicationStep && styles.continueButtonMedication,
              pressed && styles.continuePressed,
            ]}
          >
            <Text
              style={[
                styles.continueText,
                isMedicationStep && styles.continueTextMedication,
              ]}
            >
              Continue
            </Text>
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
    backgroundColor: colors.migraineLight,
  },
  severityBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  skipButtonMedication: {
    flex: 0,
    width: 100,
    height: 48,
  },
  skipButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  skipButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5A52",
  },
  skipButtonTextMedication: {
    fontSize: 14,
  },
  continueButton: {
    backgroundColor: colors.migraine,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    flex: 1,
  },
  continueButtonMedication: {
    height: 48,
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
  continueTextMedication: {
    fontSize: 14,
  },
});
