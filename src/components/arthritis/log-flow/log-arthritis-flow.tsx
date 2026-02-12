import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";
import { TrackerFlowProvider, useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import {
  FlowFooter,
  FlowScaffold,
  StepLayout,
  getAction,
  getValidation,
  useNativeFlowHeader,
} from "@components/tracking";
import { TrackerFlowRenderer } from "@components/tracking/tracker-flow-renderer";
import {
  arthritisFlowConfig,
  normalizeArthritisFormData,
} from "./arthritis-flow-config";
import { ArthritisFormData } from "@/types/arthritis";

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
    goToStep,
    canGoBack,
    isLastStep,
    isFirstStep,
    validateStep,
    validateAllSteps,
    save,
  } = useTrackerFlow<ArthritisFormData>();

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
    const validation = validateAllSteps();
    if (!validation.isValid) {
      if (validation.stepIndex) {
        goToStep(validation.stepIndex);
      }
      return;
    }
    const saveAction = getAction("arthritis.save");
    saveAction(formData, {
      addLog,
      onComplete: () => router.back(),
    });
  };

  const handleContinue = () => {
    if (isLastStep) {
      save();
      return;
    }
    const validation = validateStep();
    if (validation.isValid) {
      goToNextStep();
    }
  };
  const showSecondary = !isFirstStep && !isLastStep;

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
            showSecondary
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
          fullWidthPrimaryWhenSolo={!showSecondary}
        />
      }
    >
      <StepLayout>
        <TrackerFlowRenderer config={arthritisFlowConfig} />
      </StepLayout>
    </FlowScaffold>
  );
}

export function LogArthritisFlow() {
  const router = useRouter();
  const addLog = useArthritisStore((state) => state.addLog);

  return (
    <TrackerFlowProvider
      initialData={arthritisFlowConfig.initialData}
      totalSteps={arthritisFlowConfig.steps.length}
      onSave={(data) => {
        const saveAction = getAction("arthritis.save");
        saveAction(data, {
          addLog,
          onComplete: () => router.back(),
        });
      }}
      onCancel={() => router.back()}
      onFormDataChange={normalizeArthritisFormData}
      validator={(data, stepIndex) => {
        const step = arthritisFlowConfig.steps[stepIndex];
        if (step?.validationKey) {
          return getValidation(step.validationKey)(data as any);
        }
        return { isValid: true, errors: {} };
      }}
    >
      <LogArthritisFlowContent />
    </TrackerFlowProvider>
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
