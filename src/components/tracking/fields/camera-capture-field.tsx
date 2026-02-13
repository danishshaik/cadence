import React from "react";
import { Alert, Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Svg, { Ellipse } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@components/ui";
import { colors } from "@theme";
import { FieldProps } from "../types";

interface CameraCaptureFieldProps extends FieldProps<string | undefined> {
  previousPhotoUri?: string;
  onCaptureComplete?: (uri: string) => void;
  onPrimaryAction?: () => void;
  autoTriggerPrimaryOnCapture?: boolean;
  tipText?: string;
  showGuideOverlay?: boolean;
  cameraFacing?: "front" | "back";
  accentColor?: string;
  accentMutedColor?: string;
  backgroundColor?: string;
  heroBackgroundColor?: string;
  sideButtonBackgroundColor?: string;
  sideButtonDisabledColor?: string;
  tipBackgroundColor?: string;
  tipTextColor?: string;
  guideStrokeColor?: string;
  cornerStrokeColor?: string;
  permissionTitle?: string;
  permissionDescription?: string;
  permissionButtonLabel?: string;
  permissionSkipLabel?: string;
  permissionButtonColor?: string;
  contentGap?: number;
  captureBarMinHeight?: number;
  captureBarTopPadding?: number;
  captureBarBottomPadding?: number;
  captureBarHorizontalPadding?: number;
  captureBarGap?: number;
  shutterOuterWidth?: number;
  shutterOuterHeight?: number;
  shutterOuterBorderWidth?: number;
  shutterInnerWidth?: number;
  shutterInnerHeight?: number;
}

const isIOS = process.env.EXPO_OS === "ios";

export function CameraCaptureField({
  value,
  onChange,
  disabled,
  previousPhotoUri,
  onCaptureComplete,
  onPrimaryAction,
  autoTriggerPrimaryOnCapture = false,
  tipText = "Even lighting works best",
  showGuideOverlay = true,
  cameraFacing = "front",
  accentColor = colors.skin,
  accentMutedColor = colors.skinMuted,
  backgroundColor = "#F9F9F9",
  heroBackgroundColor = "#F0F0F0",
  sideButtonBackgroundColor = colors.skinLight,
  sideButtonDisabledColor = "#B2C2BC",
  tipBackgroundColor = colors.skinLight,
  tipTextColor = "#6C7A72",
  guideStrokeColor = "#D0D0D0",
  cornerStrokeColor = "#B8B8B8",
  permissionTitle = "Camera access needed",
  permissionDescription = "To keep your log complete, we need camera permission.",
  permissionButtonLabel = "Grant Access",
  permissionSkipLabel,
  permissionButtonColor = colors.skin,
  contentGap = 12,
  captureBarMinHeight = 112,
  captureBarTopPadding = 12,
  captureBarBottomPadding,
  captureBarHorizontalPadding = 24,
  captureBarGap = 24,
  shutterOuterWidth = 72,
  shutterOuterHeight = 72,
  shutterOuterBorderWidth = 3,
  shutterInnerWidth = 60,
  shutterInnerHeight = 60,
}: CameraCaptureFieldProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [currentFacing, setCurrentFacing] = React.useState<"front" | "back">(cameraFacing);
  const [heroLayout, setHeroLayout] = React.useState({ width: 0, height: 0 });
  const shutterScale = useSharedValue(1);

  const resolvedCaptureBarBottomPadding = captureBarBottomPadding ?? Math.max(insets.bottom, 24);

  const hasPhoto = Boolean(value);
  const canCapture = !disabled && !isCapturing;
  const canRetake = !disabled && hasPhoto;
  const canSwitchCamera = !disabled && !hasPhoto;
  const canOpenGallery = !disabled && !isCapturing;

  React.useEffect(() => {
    setCurrentFacing(cameraFacing);
  }, [cameraFacing]);

  const runPrimaryAction = React.useCallback(() => {
    if (disabled) return;
    onPrimaryAction?.();
  }, [disabled, onPrimaryAction]);

  const applyPhoto = React.useCallback(
    (uri: string) => {
      onChange(uri);
      onCaptureComplete?.(uri);
      if (autoTriggerPrimaryOnCapture) {
        setTimeout(() => {
          runPrimaryAction();
        }, 160);
      }
    },
    [autoTriggerPrimaryOnCapture, onCaptureComplete, onChange, runPrimaryAction]
  );

  const handleCapture = React.useCallback(async () => {
    if (!cameraRef.current || !canCapture) return;

    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    shutterScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        applyPhoto(photo.uri);
      }
    } catch (error) {
      console.error("Failed to capture photo:", error);
    } finally {
      setIsCapturing(false);
    }
  }, [applyPhoto, canCapture, shutterScale]);

  const handleRetake = React.useCallback(() => {
    if (!canRetake) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(undefined);
  }, [canRetake, onChange]);

  const handleUsePrevious = React.useCallback(() => {
    if (!previousPhotoUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    applyPhoto(previousPhotoUri);
  }, [applyPhoto, previousPhotoUri]);

  const handleSwitchCamera = React.useCallback(() => {
    if (!canSwitchCamera) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentFacing((previous) => (previous === "front" ? "back" : "front"));
  }, [canSwitchCamera]);

  const handlePickFromGallery = React.useCallback(async () => {
    if (!canOpenGallery) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Photo library access needed",
          "Please allow photo library access to select an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      if (selectedAsset?.uri) {
        applyPhoto(selectedAsset.uri);
      }
      return;
    } catch (error) {
      console.error("Failed to pick photo from gallery:", error);
    }

    if (previousPhotoUri) {
      handleUsePrevious();
      return;
    }

    Alert.alert("Could not open gallery", "Try again in a moment.");
  }, [applyPhoto, canOpenGallery, handleUsePrevious, previousPhotoUri]);

  const handlePrimaryPress = React.useCallback(() => {
    if (hasPhoto) {
      runPrimaryAction();
      return;
    }
    handleCapture();
  }, [hasPhoto, handleCapture, runPrimaryAction]);

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  const handleHeroLayout = React.useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setHeroLayout((previous) => {
      if (previous.width === width && previous.height === height) {
        return previous;
      }
      return { width, height };
    });
  }, []);

  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.permissionTitle}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.permissionTitle}>{permissionTitle}</Text>
        <Text style={styles.permissionSubtitle}>{permissionDescription}</Text>
        <Pressable
          onPress={requestPermission}
          style={[styles.permissionButton, { backgroundColor: permissionButtonColor }]}
        >
          <Text style={styles.permissionButtonText}>{permissionButtonLabel}</Text>
        </Pressable>
        {permissionSkipLabel ? <Text style={styles.permissionSkip}>{permissionSkipLabel}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, gap: contentGap }]}>
      <View style={[styles.hero, { backgroundColor: heroBackgroundColor }]} onLayout={handleHeroLayout}>
        {hasPhoto ? (
          <Image source={{ uri: value }} style={styles.camera} />
        ) : (
          <CameraView ref={cameraRef} style={styles.camera} facing={currentFacing} />
        )}

        {!hasPhoto && previousPhotoUri ? (
          <Image source={{ uri: previousPhotoUri }} style={styles.ghostOverlay} />
        ) : null}

        {showGuideOverlay ? (
          <View pointerEvents="none" style={styles.guideContainer}>
            {heroLayout.width > 0 && heroLayout.height > 0 ? (
              <Svg width={heroLayout.width} height={heroLayout.height} style={styles.faceGuideSvg}>
                <Ellipse
                  cx={heroLayout.width / 2}
                  cy={heroLayout.height / 2}
                  rx={heroLayout.width * 0.39}
                  ry={heroLayout.height * 0.46}
                  fill="none"
                  stroke={guideStrokeColor}
                  strokeWidth={2}
                />
              </Svg>
            ) : null}

            <View style={[styles.corner, styles.cornerTopLeft, { borderColor: cornerStrokeColor }]} />
            <View style={[styles.corner, styles.cornerTopRight, { borderColor: cornerStrokeColor }]} />
            <View
              style={[styles.corner, styles.cornerBottomLeft, { borderColor: cornerStrokeColor }]}
            />
            <View
              style={[styles.corner, styles.cornerBottomRight, { borderColor: cornerStrokeColor }]}
            />
          </View>
        ) : null}

        {tipText ? (
          <View style={[styles.tip, { backgroundColor: tipBackgroundColor }]}>
            <Icon name="sparkles" size={14} color={accentColor} />
            <Text style={[styles.tipText, { color: tipTextColor }]}>{tipText}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.captureBar,
          {
            minHeight: captureBarMinHeight,
            paddingTop: captureBarTopPadding,
            paddingBottom: resolvedCaptureBarBottomPadding,
            paddingHorizontal: captureBarHorizontalPadding,
            gap: captureBarGap,
          },
        ]}
      >
        <Pressable
          onPress={hasPhoto ? handleRetake : handleSwitchCamera}
          disabled={hasPhoto ? !canRetake : !canSwitchCamera}
          style={[styles.sideButton, { backgroundColor: sideButtonBackgroundColor }]}
        >
          <Icon
            name={hasPhoto ? "rotate-ccw" : "camera-reverse-outline"}
            size={20}
            color={(hasPhoto ? canRetake : canSwitchCamera) ? accentColor : sideButtonDisabledColor}
          />
        </Pressable>

        <Animated.View style={shutterStyle}>
          <Pressable
            onPress={handlePrimaryPress}
            disabled={disabled}
            style={[
              styles.shutterButton,
              {
                borderColor: accentColor,
                width: shutterOuterWidth,
                height: shutterOuterHeight,
                borderRadius: shutterOuterHeight / 2,
                borderWidth: shutterOuterBorderWidth,
              },
            ]}
          >
            <View
              style={[
                styles.shutterInner,
                {
                  backgroundColor: accentMutedColor,
                  width: shutterInnerWidth,
                  height: shutterInnerHeight,
                  borderRadius: shutterInnerHeight / 2,
                },
              ]}
            />
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={handlePickFromGallery}
          disabled={!canOpenGallery}
          style={[styles.sideButton, { backgroundColor: sideButtonBackgroundColor }]}
        >
          <Icon name="image" size={20} color={canOpenGallery ? accentColor : sideButtonDisabledColor} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    flex: 1,
    minHeight: 340,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  ghostOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },
  guideContainer: {
    ...StyleSheet.absoluteFillObject,
    position: "relative",
  },
  faceGuideSvg: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    width: 30,
    height: 30,
    position: "absolute",
  },
  cornerTopLeft: {
    top: 12,
    left: 18,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerTopRight: {
    top: 12,
    right: 18,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  cornerBottomLeft: {
    bottom: 12,
    left: 18,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  cornerBottomRight: {
    bottom: 12,
    right: 18,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  tip: {
    position: "absolute",
    left: "50%",
    bottom: 16,
    transform: [{ translateX: -69 }],
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tipText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "500",
  },
  captureBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterButton: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permissionTitle: {
    fontFamily: isIOS ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  permissionSubtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  permissionButtonText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  permissionSkip: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 16,
  },
});
