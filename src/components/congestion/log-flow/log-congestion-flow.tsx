import React from "react";
import { PlatformColor, View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useCongestionStore } from "@stores/congestion-store";
import { LogCongestionProvider, useLogCongestion } from "./log-congestion-provider";
import { StepHeader } from "./step-header";
import { SleepStep } from "./sleep-step";
import { CoughCharacterStep } from "./cough-character-step";
import { SourceStep } from "./source-step";
import { ProductionStep } from "./production-step";
import { ReliefStep } from "./relief-step";

const isIOS = process.env.EXPO_OS === "ios";

function LogCongestionFlowContent() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const addLog = useCongestionStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogCongestion();

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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: "center",
      headerTitle: () => <StepHeader currentStep={currentStep} totalSteps={totalSteps} />,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.vaporWhite, height: 96 },
      headerTitleContainerStyle: { paddingTop: 6 },
      headerLeftContainerStyle: { paddingLeft: 16, paddingTop: 6 },
      headerRightContainerStyle: { paddingRight: 16, paddingTop: 6 },
      headerLeft: () =>
        canGoBack ? (
          <Pressable onPress={handleHeaderBack} style={styles.headerIconButton}>
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={PlatformColor("label")}
              fallback={<Text style={styles.headerIconFallback}>‹</Text>}
            />
          </Pressable>
        ) : null,
      headerRight: () => (
        <Pressable onPress={handleHeaderCancel} style={styles.headerIconButton}>
          <SymbolView
            name="xmark"
            size={18}
            tintColor={PlatformColor("label")}
            fallback={<Text style={styles.headerIconFallback}>×</Text>}
          />
        </Pressable>
      ),
    });
  }, [canGoBack, currentStep, handleHeaderBack, handleHeaderCancel, navigation, totalSteps]);

  const handleSave = () => {
    addLog({
      sleepQuality: formData.sleepQuality,
      coughCharacters: formData.coughCharacters,
      congestionSource: formData.congestionSource,
      phlegmColor: formData.phlegmColor,
      reliefMeasures: formData.reliefMeasures,
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
        return <SleepStep />;
      case 2:
        return <CoughCharacterStep />;
      case 3:
        return <SourceStep />;
      case 4:
        return <ProductionStep />;
      case 5:
        return <ReliefStep />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}> 
      <View style={styles.stepContainer}>{renderStep()}</View>

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
            <Text style={styles.continueText}>{isLastStep ? "Save Entry" : "Continue"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function LogCongestionFlow() {
  return (
    <LogCongestionProvider>
      <LogCongestionFlowContent />
    </LogCongestionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.vaporWhite,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 16,
  },
  headerIconFallback: {
    fontSize: 20,
    color: colors.midnightBlue,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderCurve: "continuous",
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...shadows.sm,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  continueButton: {
    flex: 2,
    backgroundColor: colors.restorativeSage,
    borderRadius: 28,
    borderCurve: "continuous",
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "rgba(136, 216, 176, 0.4)", // #88D8B040
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  continueButtonFull: {
    flex: 1,
  },
  continuePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
