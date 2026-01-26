import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Pressable,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Svg, { Defs, ClipPath, Ellipse, Rect } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme";
import { useLogSkin } from "./log-skin-provider";
import { useSkinStore } from "@stores/skin-store";

export function PhotoStep() {
  const { formData, updateFormData } = useLogSkin();
  const { width: screenWidth } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | undefined>(formData.photoUri);

  const getPreviousPhotoUri = useSkinStore((state) => state.getPreviousPhotoUri);
  const previousPhoto = getPreviousPhotoUri();

  // Animation values
  const shutterScale = useSharedValue(1);
  const photoScale = useSharedValue(1);
  const photoOpacity = useSharedValue(1);

  const mirrorWidth = Math.min(screenWidth - 60, 280);
  const mirrorHeight = mirrorWidth * 1.4;

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate shutter
    shutterScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        // Animate photo "filing away"
        photoScale.value = 1;
        photoOpacity.value = 1;
        photoScale.value = withTiming(0.1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        photoOpacity.value = withTiming(0, { duration: 400 });

        setTimeout(() => {
          setCapturedPhoto(photo.uri);
          updateFormData({ photoUri: photo.uri });
        }, 400);
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
    }
  };

  const handleRetake = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCapturedPhoto(undefined);
    updateFormData({ photoUri: undefined });
  };

  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.subtitle}>
          To track your skin progress with photos, we need camera permission.
        </Text>
        <Pressable onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </Pressable>
        <Text style={styles.skipText}>You can also skip this step</Text>
      </View>
    );
  }

  // Show captured photo
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Looking good!</Text>
        <Text style={styles.subtitle}>Photo captured for your log</Text>

        <View style={[styles.mirrorContainer, { width: mirrorWidth, height: mirrorHeight }]}>
          <View style={styles.mirrorFrame}>
            <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} />
          </View>
        </View>

        <Pressable onPress={handleRetake} style={styles.retakeButton}>
          <Ionicons name="camera-reverse-outline" size={20} color={colors.skin} />
          <Text style={styles.retakeText}>Retake</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's capture today's progress</Text>
      <Text style={styles.subtitle}>Align your face with the mirror</Text>

      <View style={[styles.mirrorContainer, { width: mirrorWidth, height: mirrorHeight }]}>
        {/* Camera with oval mask */}
        <View style={styles.mirrorFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="front"
          >
            {/* Ghost overlay from previous photo */}
            {previousPhoto && (
              <Image
                source={{ uri: previousPhoto }}
                style={[styles.ghostOverlay]}
              />
            )}
          </CameraView>

          {/* Oval mask overlay */}
          <View style={styles.maskContainer} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <ClipPath id="ovalClip">
                  <Ellipse
                    cx="50%"
                    cy="50%"
                    rx="48%"
                    ry="48%"
                  />
                </ClipPath>
              </Defs>
              {/* Dark overlay with oval cutout */}
              <Rect
                width="100%"
                height="100%"
                fill="rgba(255,255,255,0.95)"
                clipPath="url(#ovalClip)"
              />
            </Svg>
          </View>

          {/* Oval border */}
          <View style={styles.ovalBorder} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Ellipse
                cx="50%"
                cy="50%"
                rx="47%"
                ry="47%"
                fill="none"
                stroke={colors.border}
                strokeWidth={2}
              />
            </Svg>
          </View>
        </View>
      </View>

      {/* Shutter button */}
      <Animated.View style={[styles.shutterContainer, shutterStyle]}>
        <Pressable onPress={handleCapture} style={styles.shutterButton}>
          <View style={styles.shutterInner} />
        </Pressable>
      </Animated.View>

      <Text style={styles.hint}>
        {previousPhoto ? "Ghost overlay shows your last photo" : "Tap to capture"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
  },
  title: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Display" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: "center",
  },
  mirrorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mirrorFrame: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  ghostOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  ovalBorder: {
    ...StyleSheet.absoluteFillObject,
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  shutterContainer: {
    marginTop: 24,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.skin,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.skin,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: colors.skin,
  },
  hint: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 12,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retakeText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 15,
    fontWeight: "500",
    color: colors.skin,
  },
  permissionButton: {
    backgroundColor: colors.skin,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  permissionButtonText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  skipText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 16,
  },
});
