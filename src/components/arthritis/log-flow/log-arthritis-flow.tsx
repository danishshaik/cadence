import React from "react";
import { PlatformColor, Pressable, StyleSheet, Text } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";
import { LogArthritisProvider, useLogArthritis } from "./log-arthritis-provider";
import { SensationStep } from "./sensation-step";
import { LocationStep } from "./location-step";
import { ContextStep } from "./context-step";
import { ActivityStep } from "./activity-step";
import { ManagementStep } from "./management-step";
import { FlowFooter, FlowScaffold, ProgressIndicator, StepLayout } from "@components/tracking";

const isIOS = process.env.EXPO_OS === "ios";

function LogArthritisFlowContent() {
  const router = useRouter();
  const navigation = useNavigation();
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: "center",
      headerTitle: () => (
        <ProgressIndicator
          variant="dots"
          currentStep={currentStep}
          totalSteps={totalSteps}
          activeColor={colors.arthritis}
          inactiveColor={colors.arthritisSurface}
        />
      ),
      headerShadowVisible: false,
      headerStyle: { backgroundColor: colors.arthritisLight, height: 96 },
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
      stiffness: formData.stiffness,
      morningStiffness: formData.morningStiffness,
      affectedJoints: formData.affectedJoints,
      bilateralSymmetry: formData.bilateralSymmetry,
      barometricPressure: formData.barometricPressure ?? undefined,
      temperature: formData.temperature ?? undefined,
      humidity: formData.humidity ?? undefined,
      weatherConfirmation: formData.weatherConfirmation ?? undefined,
      activities: formData.activities,
      managementMethods: formData.managementMethods,
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
  headerIconButton: {
    padding: 8,
    borderRadius: 16,
  },
  headerIconFallback: {
    fontSize: 20,
    color: colors.arthritisText,
  },
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
