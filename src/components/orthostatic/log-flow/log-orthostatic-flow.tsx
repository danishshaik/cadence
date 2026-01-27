import React from "react";
import { PlatformColor, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors } from "@theme";
import { useOrthostaticStore } from "@stores/orthostatic-store";
import { LogOrthostaticProvider, useLogOrthostatic } from "./log-orthostatic-provider";
import { SeverityStep } from "./severity-step";
import { DurationStep } from "./duration-step";
import { ProdromeStep } from "./prodrome-step";
import { TriggerStep } from "./trigger-step";
import { HydrationStep } from "./hydration-step";

function LogOrthostaticFlowContent() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const addLog = useOrthostaticStore((state) => state.addLog);

  const {
    formData,
    currentStep,
    totalSteps,
    goToNextStep,
    goToPreviousStep,
    canGoBack,
    isLastStep,
  } = useLogOrthostatic();

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
      headerTitle: () => (
        <View style={styles.headerDots}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index + 1 === currentStep;
            return (
              <View
                key={index}
                style={[
                  styles.headerDot,
                  isActive ? styles.headerDotActive : styles.headerDotInactive,
                ]}
              />
            );
          })}
        </View>
      ),
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.orthostaticLight, height: 96 },
      headerTitleContainerStyle: { paddingTop: 6 },
      headerLeftContainerStyle: { paddingLeft: 16, paddingTop: 6 },
      headerRightContainerStyle: { paddingRight: 16, paddingTop: 6 },
      headerLeft: () =>
        canGoBack ? (
          <Pressable onPress={handleHeaderBack} style={styles.headerIconButton}>
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={colors.orthostatic}
              fallback={<Text style={styles.headerIconFallback}>‹</Text>}
            />
          </Pressable>
        ) : null,
      headerRight: () => (
        <Pressable onPress={handleHeaderCancel} style={styles.headerIconButton}>
          <SymbolView
            name="xmark"
            size={18}
            tintColor={colors.orthostatic}
            fallback={<Text style={styles.headerIconFallback}>×</Text>}
          />
        </Pressable>
      ),
    });
  }, [canGoBack, currentStep, handleHeaderBack, handleHeaderCancel, navigation, totalSteps]);

  const handleSave = () => {
    addLog({
      severity: formData.severity,
      durationSeconds: formData.durationSeconds,
      durationMinutes: formData.durationMinutes,
      symptoms: formData.symptoms,
      positionBeforeStanding: formData.positionBeforeStanding,
      sedentaryDuration: formData.sedentaryDuration,
      hydrationFactors: formData.hydrationFactors,
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
        return <SeverityStep />;
      case 2:
        return <DurationStep />;
      case 3:
        return <ProdromeStep />;
      case 4:
        return <TriggerStep />;
      case 5:
        return <HydrationStep />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>{renderStep()}</View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
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

export function LogOrthostaticFlow() {
  return (
    <LogOrthostaticProvider>
      <LogOrthostaticFlowContent />
    </LogOrthostaticProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.orthostaticLight,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIconFallback: {
    fontSize: 20,
    color: colors.orthostatic,
  },
  headerDots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDot: {
    borderRadius: 4,
  },
  headerDotActive: {
    width: 8,
    height: 8,
    backgroundColor: colors.orthostatic,
  },
  headerDotInactive: {
    width: 6,
    height: 6,
    backgroundColor: colors.orthostaticMuted,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    width: 100,
    backgroundColor: colors.orthostaticGreyBlue,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif-medium",
    fontSize: 14,
    fontWeight: "600",
    color: colors.orthostaticSlate,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.orthostatic,
    borderRadius: 12,
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
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif-medium",
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
