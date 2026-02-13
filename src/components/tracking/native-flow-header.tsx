import React from "react";
import { PlatformColor, Pressable, Text } from "react-native";
import { useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import { ProgressIndicator } from "./progress-indicator";

interface NativeFlowHeaderOptions {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  onBack: () => void;
  onCancel: () => void;
  backgroundColor: string;
  activeColor: string;
  inactiveColor: string;
  iconColor?: string;
  height?: number;
  headerHorizontalPadding?: number;
  disabled?: boolean;
  iconButtonBackgroundColor?: string;
  iconButtonBorderColor?: string;
  iconButtonBorderWidth?: number;
  iconButtonSize?: number;
  iconButtonRadius?: number;
}

const isIOS = process.env.EXPO_OS === "ios";

export function useNativeFlowHeader({
  currentStep,
  totalSteps,
  canGoBack,
  onBack,
  onCancel,
  backgroundColor,
  activeColor,
  inactiveColor,
  iconColor,
  height = 96,
  headerHorizontalPadding = 16,
  disabled = false,
  iconButtonBackgroundColor,
  iconButtonBorderColor,
  iconButtonBorderWidth = 0,
  iconButtonSize = 40,
  iconButtonRadius = 20,
}: NativeFlowHeaderOptions) {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    if (disabled) return;
    navigation.setOptions({
      headerShown: true,
      headerTitleAlign: "center",
      headerTitle: () => (
        <ProgressIndicator
          variant="dots"
          currentStep={currentStep}
          totalSteps={totalSteps}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />
      ),
      headerShadowVisible: false,
      headerStyle: { backgroundColor, height },
      headerTitleContainerStyle: { paddingTop: 6 },
      headerLeftContainerStyle: { paddingLeft: headerHorizontalPadding, paddingTop: 6 },
      headerRightContainerStyle: { paddingRight: headerHorizontalPadding, paddingTop: 6 },
      headerLeft: () =>
        canGoBack ? (
          <Pressable
            onPress={onBack}
            style={[
              {
                width: iconButtonSize,
                height: iconButtonSize,
                borderRadius: iconButtonRadius,
                alignItems: "center",
                justifyContent: "center",
              },
              iconButtonBackgroundColor
                ? {
                    backgroundColor: iconButtonBackgroundColor,
                  }
                : {
                    padding: 8,
                  },
              iconButtonBorderColor
                ? {
                    borderColor: iconButtonBorderColor,
                    borderWidth: iconButtonBorderWidth,
                  }
                : null,
            ]}
          >
            <SymbolView
              name="chevron.left"
              size={20}
              tintColor={iconColor ?? PlatformColor("label")}
              fallback={
                <Text style={{ fontFamily: isIOS ? "SF Pro Text" : "sans-serif", fontSize: 20 }}>
                  ‹
                </Text>
              }
            />
          </Pressable>
        ) : null,
      headerRight: () => (
        <Pressable
          onPress={onCancel}
          style={[
            {
              width: iconButtonSize,
              height: iconButtonSize,
              borderRadius: iconButtonRadius,
              alignItems: "center",
              justifyContent: "center",
            },
            iconButtonBackgroundColor
              ? {
                  backgroundColor: iconButtonBackgroundColor,
                }
              : {
                  padding: 8,
                },
            iconButtonBorderColor
              ? {
                  borderColor: iconButtonBorderColor,
                  borderWidth: iconButtonBorderWidth,
                }
              : null,
          ]}
        >
          <SymbolView
            name="xmark"
            size={18}
            tintColor={iconColor ?? PlatformColor("label")}
            fallback={
              <Text style={{ fontFamily: isIOS ? "SF Pro Text" : "sans-serif", fontSize: 20 }}>
                ×
              </Text>
            }
          />
        </Pressable>
      ),
    });
  }, [
    navigation,
    currentStep,
    totalSteps,
    canGoBack,
    onBack,
    onCancel,
    backgroundColor,
    activeColor,
    inactiveColor,
    iconColor,
    height,
    headerHorizontalPadding,
    disabled,
    iconButtonBackgroundColor,
    iconButtonBorderColor,
    iconButtonBorderWidth,
    iconButtonSize,
    iconButtonRadius,
  ]);
}
