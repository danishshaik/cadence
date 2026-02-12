import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOrthostaticStore } from "@stores/orthostatic-store";
import {
  FlowFooter,
  FlowScaffold,
  StepLayout,
  TrackerFlowRenderer,
  TrackerFlowProvider,
  getAction,
  useNativeFlowHeader,
  useTrackerFlow,
} from "@components/tracking";
import { orthostaticFlowConfig, OrthostaticFlowFormData } from "./orthostatic-flow-config";

const isIOS = process.env.EXPO_OS === "ios";

interface LogOrthostaticFlowContentProps {
  onClose: () => void;
  closing: boolean;
}

function LogOrthostaticFlowContent({ onClose, closing }: LogOrthostaticFlowContentProps) {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
    isFirstStep,
    save,
  } = useTrackerFlow<OrthostaticFlowFormData>();

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: goToPreviousStep,
    onCancel: onClose,
    backgroundColor: "#F9F7FF",
    activeColor: "#6C5CE7",
    inactiveColor: "#6C5CE740",
    iconColor: "#6C5CE7",
    headerHorizontalPadding: 24,
    disabled: closing,
  });

  const handleContinue = React.useCallback(() => {
    if (isLastStep) {
      void save();
      return;
    }
    goToNextStep();
  }, [goToNextStep, isLastStep, save]);

  const handleSave = React.useCallback(() => {
    void save();
  }, [save]);
  const showSecondary = !isFirstStep && !isLastStep;

  return (
    <FlowScaffold
      backgroundColor="#F9F7FF"
      scrollEnabled={false}
      footer={
        <FlowFooter
          primaryAction={{ label: isLastStep ? "Done" : "Continue", onPress: handleContinue }}
          secondaryAction={showSecondary ? { label: "Save", onPress: handleSave } : undefined}
          containerStyle={styles.footer}
          buttonRowStyle={styles.footerRow}
          primaryButtonStyle={styles.continueButton}
          primaryTextStyle={styles.continueText}
          secondaryButtonStyle={styles.saveButton}
          secondaryTextStyle={styles.saveText}
          primaryPressedStyle={styles.buttonPressed}
          secondaryPressedStyle={styles.buttonPressed}
          fullWidthPrimaryWhenSolo={!showSecondary}
        />
      }
    >
      <StepLayout style={styles.stepLayout}>
        <TrackerFlowRenderer config={orthostaticFlowConfig} />
      </StepLayout>
    </FlowScaffold>
  );
}

export function LogOrthostaticFlowRefactor() {
  const router = useRouter();
  const addLog = useOrthostaticStore((state) => state.addLog);
  const [closing, setClosing] = React.useState(false);

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

  return (
    <TrackerFlowProvider
      initialData={orthostaticFlowConfig.initialData}
      totalSteps={orthostaticFlowConfig.steps.length}
      onSave={(data) => {
        const saveAction = getAction("orthostatic.save");
        saveAction(data, {
          addLog,
          onComplete: closeFlow,
        });
      }}
      onCancel={closeFlow}
    >
      <LogOrthostaticFlowContent onClose={closeFlow} closing={closing} />
    </TrackerFlowProvider>
  );
}

const styles = StyleSheet.create({
  stepLayout: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "transparent",
  },
  footerRow: {
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  saveText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: "#9AA2A0",
  },
  continueButton: {
    flex: 1,
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  continueText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
