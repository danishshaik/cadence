import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useSkinStore } from "@stores/skin-store";
import {
  FlowFooter,
  FlowScaffold,
  StepLayout,
  TrackerFlowProvider,
  TrackerFlowRenderer,
  getAction,
  useNativeFlowHeader,
  useTrackerFlow,
} from "@components/tracking";
import { SkinFormData } from "@/types/skin";
import { normalizeSkinFormData, skinFlowConfig } from "./skin-flow-config";

const isIOS = process.env.EXPO_OS === "ios";

function LogSkinFlowContent() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    isFirstStep,
    canGoBack,
    isLastStep,
    save,
  } = useTrackerFlow<SkinFormData>();

  const handleCancel = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleHeaderBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousStep();
  }, [goToPreviousStep]);

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleCancel,
    backgroundColor: "#F9F9F9",
    activeColor: colors.skin,
    inactiveColor: colors.skinLight,
    iconColor: "#6C7A72",
    iconButtonBackgroundColor: "#FFFFFF",
    headerHorizontalPadding: 16,
  });

  const handleSave = React.useCallback(() => {
    void save();
  }, [save]);

  const handleContinue = React.useCallback(() => {
    if (isLastStep) {
      void save();
    } else {
      goToNextStep();
    }
  }, [goToNextStep, isLastStep, save]);

  const showSecondary = !isFirstStep && !isLastStep;

  return (
    <FlowScaffold
      backgroundColor="#F9F9F9"
      scrollEnabled={false}
      footer={
        <FlowFooter
          primaryAction={{ label: isLastStep ? "Log It" : "Continue", onPress: handleContinue }}
          secondaryAction={showSecondary ? { label: "Save", onPress: handleSave } : undefined}
          containerStyle={styles.footer}
          buttonRowStyle={styles.buttonRow}
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
      <StepLayout style={styles.stepLayout}>
        <TrackerFlowRenderer config={skinFlowConfig} />
      </StepLayout>
    </FlowScaffold>
  );
}

export function LogSkinFlow() {
  const router = useRouter();
  const addLog = useSkinStore((state) => state.addLog);

  return (
    <TrackerFlowProvider
      initialData={skinFlowConfig.initialData}
      totalSteps={skinFlowConfig.steps.length}
      onSave={(data) => {
        const saveAction = getAction("skin.save");
        saveAction(data, {
          addLog,
          onComplete: () => router.back(),
        });
      }}
      onCancel={() => router.back()}
      onFormDataChange={normalizeSkinFormData}
    >
      <LogSkinFlowContent />
    </TrackerFlowProvider>
  );
}

const styles = StyleSheet.create({
  stepLayout: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  buttonRow: {
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
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
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
