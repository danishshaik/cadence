import React from "react";
import { PlatformColor, View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, shadows } from "@theme";
import { useArthritisStore } from "@stores/arthritis-store";
import { LogArthritisProvider, useLogArthritis } from "./log-arthritis-provider";
import { SensationStep } from "./sensation-step";
import { LocationStep } from "./location-step";
import { ContextStep } from "./context-step";
import { ActivityStep } from "./activity-step";
import { ManagementStep } from "./management-step";

const isIOS = process.env.EXPO_OS === "ios";

function HeaderDots({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.headerDots}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index + 1 === currentStep;
        return (
          <View
            key={index}
            style={[styles.headerDot, isActive ? styles.headerDotActive : styles.headerDotInactive]}
          />
        );
      })}
    </View>
  );
}

function LogArthritisFlowContent() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
      headerTitle: () => <HeaderDots currentStep={currentStep} totalSteps={totalSteps} />,
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
            <Text style={styles.continueText}>{isLastStep ? "Log It" : "Continue"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: colors.arthritisLight,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 16,
  },
  headerIconFallback: {
    fontSize: 20,
    color: colors.arthritisText,
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
    backgroundColor: colors.arthritis,
  },
  headerDotInactive: {
    width: 6,
    height: 6,
    backgroundColor: colors.arthritisSurface,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
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
    flex: 2,
    backgroundColor: colors.arthritis,
    borderRadius: 16,
    borderCurve: "continuous",
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
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
