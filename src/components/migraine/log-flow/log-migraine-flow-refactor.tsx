import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { colors } from "@theme";
import { useMigraineStore } from "@stores/migraine-store";
import { TrackerFlowProvider, useTrackerFlow } from "@components/tracking/tracker-flow-provider";
import {
  FlowFooter,
  FlowScaffold,
  StepLayout,
  getAction,
  useNativeFlowHeader,
} from "@components/tracking";
import { TrackerFlowRenderer } from "@components/tracking/tracker-flow-renderer";
import { MigraineFormData } from "@/types/migraine";
import { migraineFlowConfig, normalizeMigraineFormData } from "./migraine-flow-config";

const isIOS = process.env.EXPO_OS === "ios";

interface LogMigraineFlowContentProps {
  onClose: () => void;
  closing: boolean;
}

function LogMigraineFlowContent({ onClose, closing }: LogMigraineFlowContentProps) {
  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
    save,
  } = useTrackerFlow<MigraineFormData>();

  const step = migraineFlowConfig.steps[currentStep - 1];
  const isMedicationStep = step?.id === "medication";
  const isSeverityStep = step?.id === "severity";

  useNativeFlowHeader({
    currentStep,
    totalSteps,
    canGoBack,
    onBack: goToPreviousStep,
    onCancel: onClose,
    backgroundColor: isSeverityStep ? "#FFF7FB" : colors.migraineLight,
    activeColor: colors.migraine,
    inactiveColor: "#F3E8F0",
    iconColor: "#4A5A52",
    headerHorizontalPadding: 24,
    disabled: closing,
  });

  const handleContinue = () => {
    if (isLastStep) {
      save();
    } else {
      goToNextStep();
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      save();
      return;
    }
    goToNextStep();
  };

  return (
    <FlowScaffold
      backgroundColor={colors.migraineLight}
      scrollEnabled={false}
      footer={
        <FlowFooter
          primaryAction={{
            label: "Continue",
            onPress: handleContinue,
          }}
          secondaryAction={{
            label: "Skip",
            onPress: handleSkip,
          }}
          containerStyle={styles.footer}
          buttonRowStyle={styles.buttonRow}
          primaryButtonStyle={[
            styles.continueButton,
            isMedicationStep && styles.continueButtonMedication,
          ]}
          primaryTextStyle={[
            styles.continueText,
            isMedicationStep && styles.continueTextMedication,
          ]}
          secondaryButtonStyle={[
            styles.skipButton,
            isMedicationStep && styles.skipButtonMedication,
          ]}
          secondaryTextStyle={[
            styles.skipButtonText,
            isMedicationStep && styles.skipButtonTextMedication,
          ]}
          fullWidthPrimaryWhenSolo={false}
        />
      }
    >
      <View style={styles.content}>
        {isSeverityStep && (
          <LinearGradient
            colors={["#FFF7FB", "#FDE7F2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.severityBackground}
            pointerEvents="none"
          />
        )}
        <StepLayout style={styles.stepLayout}>
          <TrackerFlowRenderer config={migraineFlowConfig} />
        </StepLayout>
      </View>
    </FlowScaffold>
  );
}

export function LogMigraineFlowRefactor() {
  const router = useRouter();
  const addLog = useMigraineStore((state) => state.addLog);
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
      initialData={migraineFlowConfig.initialData}
      totalSteps={migraineFlowConfig.steps.length}
      onSave={(data) => {
        const saveAction = getAction("migraine.save");
        saveAction(data, {
          addLog,
          onComplete: closeFlow,
        });
      }}
      onCancel={closeFlow}
      onFormDataChange={normalizeMigraineFormData}
    >
      <LogMigraineFlowContent onClose={closeFlow} closing={closing} />
    </TrackerFlowProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    position: "relative",
  },
  severityBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  stepLayout: {
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
  skipButtonText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
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
  continueText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  continueTextMedication: {
    fontSize: 14,
  },
});
