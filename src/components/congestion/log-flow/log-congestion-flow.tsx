import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useCongestionStore } from "@stores/congestion-store";
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
import { CongestionFormData } from "@/types/congestion";
import {
  congestionFlowConfig,
  normalizeCongestionFormData,
} from "./congestion-flow-config";

const isIOS = process.env.EXPO_OS === "ios";

interface LogCongestionFlowContentProps {
  onClose: () => void;
  closing: boolean;
}

function LogCongestionFlowContent({ onClose, closing }: LogCongestionFlowContentProps) {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
    isFirstStep,
    save,
  } = useTrackerFlow<CongestionFormData>();

  const handleHeaderBack = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPreviousStep();
  }, [goToPreviousStep]);

  const handleHeaderCancel = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: handleHeaderBack,
    onCancel: handleHeaderCancel,
    backgroundColor: "#F9F9F9",
    activeColor: colors.restorativeSage,
    inactiveColor: "rgba(108, 122, 114, 0.25)",
    iconColor: "#2F3A34",
    headerHorizontalPadding: 16,
    iconButtonBackgroundColor: "#FFFFFF",
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

  const showSecondary = !isFirstStep;

  return (
    <FlowScaffold
      backgroundColor="#F9F9F9"
      scrollEnabled={false}
      footer={
        <FlowFooter
          primaryAction={{
            label: isLastStep ? "Save Entry" : "Continue",
            onPress: handleContinue,
          }}
          secondaryAction={showSecondary ? { label: "Save", onPress: handleSave } : undefined}
          containerStyle={styles.footer}
          buttonRowStyle={styles.buttonRow}
          primaryButtonStyle={styles.continueButton}
          primaryPressedStyle={styles.buttonPressed}
          primaryTextStyle={styles.continueText}
          secondaryButtonStyle={styles.saveButton}
          secondaryPressedStyle={styles.buttonPressed}
          secondaryTextStyle={styles.saveButtonText}
          fullWidthPrimaryWhenSolo={!showSecondary}
        />
      }
    >
      <StepLayout style={styles.stepLayout}>
        <TrackerFlowRenderer config={congestionFlowConfig} />
      </StepLayout>
    </FlowScaffold>
  );
}

export function LogCongestionFlow() {
  const router = useRouter();
  const addLog = useCongestionStore((state) => state.addLog);
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
      initialData={congestionFlowConfig.initialData}
      totalSteps={congestionFlowConfig.steps.length}
      onSave={(data) => {
        const saveAction = getAction("congestion.save");
        saveAction(data, {
          addLog,
          onComplete: closeFlow,
        });
      }}
      onCancel={closeFlow}
      onFormDataChange={normalizeCongestionFormData}
    >
      <LogCongestionFlowContent onClose={closeFlow} closing={closing} />
    </TrackerFlowProvider>
  );
}

const styles = StyleSheet.create({
  stepLayout: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "transparent",
    width: "100%",
    alignSelf: "stretch",
  },
  buttonRow: {
    gap: 12,
    width: "100%",
    alignItems: "center",
  },
  saveButton: {
    flex: 0,
    minWidth: 96,
    paddingHorizontal: 20,
    paddingVertical: 0,
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    fontWeight: "600",
    color: "#2F3A34",
  },
  continueButton: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: colors.restorativeSage,
    alignItems: "center",
    justifyContent: "center",
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
