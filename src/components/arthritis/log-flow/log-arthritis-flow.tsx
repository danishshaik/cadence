import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";
import { LogArthritisProvider, useLogArthritis } from "./log-arthritis-provider";
import { SensationStep } from "./sensation-step";
import { LocationStep } from "./location-step";
import { ContextStep } from "./context-step";
import { ActivityStep } from "./activity-step";
import { ManagementStep } from "./management-step";
import {
  FlowFooter,
  FlowScaffold,
  StepLayout,
  getAction,
  useNativeFlowHeader,
} from "@components/tracking";

const isIOS = process.env.EXPO_OS === "ios";

function LogArthritisFlowContent() {
  const router = useRouter();
  const addLog = useArthritisStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogArthritis();

  const handleCancel = () => {
    router.back();
  };

  const handleHeaderBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleCancel();
  }, [handleCancel]);

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleHeaderCancel,
    backgroundColor: colors.arthritisLight,
    activeColor: colors.arthritis,
    inactiveColor: colors.arthritisSurface,
  });

  const handleSave = () => {
    const saveAction = getAction("arthritis.save");
    saveAction(formData, {
      addLog,
      onComplete: () => router.back(),
    });
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
        return <SensationStep />;
      case 2:
        return <LocationStep />;
      case 3:
        return <ContextStep />;
      case 4:
        return <ActivityStep />;
      case 5:
        return <ManagementStep />;
      default:
        return null;
    }
  };

  return (
    <FlowScaffold
      backgroundColor={colors.arthritisLight}
      scrollEnabled={false}
      footer={
        <FlowFooter
          primaryAction={{
            label: isLastStep ? "Log It" : "Continue",
            onPress: handleContinue,
          }}
          secondaryAction={
            currentStep > 1
              ? {
                  label: "Save",
                  onPress: handleSave,
                }
              : undefined
          }
          primaryButtonStyle={styles.continueButton}
          primaryPressedStyle={styles.continuePressed}
          primaryTextStyle={styles.continueText}
          secondaryButtonStyle={styles.saveButton}
          secondaryPressedStyle={styles.saveButtonPressed}
          secondaryTextStyle={styles.saveButtonText}
          fullWidthPrimaryWhenSolo={currentStep === 1}
        />
      }
    >
      <StepLayout>{renderStep()}</StepLayout>
    </FlowScaffold>
  );
}

export function LogArthritisFlow() {
  return (
    <LogArthritisProvider>
      <LogArthritisFlowContent />
    </LogArthritisProvider>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.arthritisBorder,
    ...shadows.sm,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.arthritisText,
  },
  continueButton: {
    backgroundColor: colors.arthritis,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 16,
    alignItems: "center",
  },
  continuePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
