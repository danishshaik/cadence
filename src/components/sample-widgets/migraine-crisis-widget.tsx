/**
 * Migraine Crisis Widget
 *
 * A specialized health tracking widget designed for users experiencing migraine attacks.
 * Features accessibility-first design with vantablack theme, haptic feedback,
 * and tremor-tolerant touch targets.
 *
 * Design Philosophy:
 * - Absolute Zero Black (#000000) background - device bezel vanishes
 * - No drop shadows (causes visual blur for migraineurs) - uses rim lighting instead
 * - Variable resistance haptics for tactile navigation
 * - Voronoi-based hit testing for tremor tolerance
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle, G, Defs, RadialGradient, Stop } from "react-native-svg";

// ============================================================================
// TYPES
// ============================================================================

export interface MigraineMetrics {
  attack_session_id: string;
  timestamp_last_modified: string;
  metrics: {
    pain_level: number;
    medication_taken: boolean;
    medication_time: string | null;
    locations: string[];
    sensory_triggers: {
      light: boolean;
      sound: boolean;
      smell: boolean;
      nausea: boolean;
    };
    functional_status: "HIGH" | "MED" | "LOW";
  };
}

interface MigraineCrisisWidgetProps {
  onMetricsChange?: (metrics: MigraineMetrics) => void;
  initialMetrics?: Partial<MigraineMetrics["metrics"]>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  // Light Gray Theme
  background: "#F5F5F7",
  surface: "#FFFFFF",
  rim: "#E5E5EA",
  rimLight: "#D1D1D6",

  // Pain Gradient (softer)
  painCalm: "#34C759",       // Soft Green
  painDiscomfort: "#FF9500", // Soft Orange
  painAgony: "#FF3B30",      // Soft Red

  // Text & Accents
  text: "#1C1C1E",
  textSecondary: "#8E8E93",
  textTertiary: "#AEAEB2",

  // Interactions
  activeBackground: "#007AFF",
  activeForeground: "#FFFFFF",

  // Triggers
  triggerActive: "#007AFF",
  triggerInactive: "#F2F2F7",

  // Body map
  painGlow: "rgba(255,59,48,0.4)",
};

const PAIN_LOCATIONS = [
  { id: "left_frontal", label: "Left Front", cx: 35, cy: 30 },
  { id: "right_frontal", label: "Right Front", cx: 65, cy: 30 },
  { id: "left_temple", label: "Left Temple", cx: 18, cy: 45 },
  { id: "right_temple", label: "Right Temple", cx: 82, cy: 45 },
  { id: "occipital", label: "Back of Head", cx: 50, cy: 15 },
  { id: "cervical", label: "Neck", cx: 50, cy: 85 },
  { id: "left_eye", label: "Left Eye", cx: 38, cy: 42 },
  { id: "right_eye", label: "Right Eye", cx: 62, cy: 42 },
] as const;

const SENSORY_TRIGGERS = [
  { id: "light", icon: "☀", label: "Light" },
  { id: "sound", icon: "🔊", label: "Sound" },
  { id: "smell", icon: "👃", label: "Smell" },
  { id: "nausea", icon: "🤢", label: "Nausea" },
] as const;

const FUNCTIONAL_LEVELS = [
  { id: "HIGH", label: "Functioning" },
  { id: "MED", label: "Impaired" },
  { id: "LOW", label: "Down" },
] as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateSessionId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const interpolateColor = (percentage: number): string => {
  if (percentage <= 30) {
    return COLORS.painCalm;
  } else if (percentage <= 70) {
    const t = (percentage - 30) / 40;
    return lerpColor(COLORS.painCalm, COLORS.painDiscomfort, t);
  } else {
    const t = (percentage - 70) / 30;
    return lerpColor(COLORS.painDiscomfort, COLORS.painAgony, t);
  }
};

const lerpColor = (color1: string, color2: string, t: number): string => {
  const hex = (c: string) => parseInt(c, 16);
  const r1 = hex(color1.slice(1, 3));
  const g1 = hex(color1.slice(3, 5));
  const b1 = hex(color1.slice(5, 7));
  const r2 = hex(color2.slice(1, 3));
  const g2 = hex(color2.slice(3, 5));
  const b2 = hex(color2.slice(5, 7));

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const triggerHaptic = (type: "light" | "medium" | "heavy" | "click") => {
  if (Platform.OS === "ios") {
    switch (type) {
      case "light":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "click":
        Haptics.selectionAsync();
        break;
    }
  }
};

// ============================================================================
// MORPHING FACE SVG
// ============================================================================

interface MorphingFaceProps {
  percentage: number;
}

const MorphingFace: React.FC<MorphingFaceProps> = ({ percentage }) => {
  // Interpolate facial features based on pain level
  // 0% = smiling, 50% = neutral, 100% = wincing/screaming

  const eyeOpenness = Math.max(0.3, 1 - percentage / 100 * 0.7);
  const mouthCurve = percentage <= 50
    ? 10 - (percentage / 50) * 20  // 10 to -10 (smile to frown)
    : -10 - ((percentage - 50) / 50) * 5; // -10 to -15 (deeper frown)

  const browAngle = (percentage / 100) * 15; // 0 to 15 degrees
  const eyeSquint = percentage > 70 ? (percentage - 70) / 30 * 5 : 0;

  return (
    <Svg width={40} height={40} viewBox="0 0 40 40">
      <Defs>
        <RadialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={COLORS.text} stopOpacity={0.08} />
          <Stop offset="100%" stopColor={COLORS.text} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Face circle with subtle glow */}
      <Circle cx={20} cy={20} r={18} fill="url(#faceGlow)" />
      <Circle cx={20} cy={20} r={16} fill="none" stroke={COLORS.textSecondary} strokeWidth={1} />

      {/* Left eyebrow */}
      <Path
        d={`M 8 ${14 - browAngle * 0.3} Q 12 ${12 + browAngle * 0.2} 16 ${14}`}
        stroke={COLORS.textSecondary}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Right eyebrow */}
      <Path
        d={`M 24 ${14} Q 28 ${12 + browAngle * 0.2} 32 ${14 - browAngle * 0.3}`}
        stroke={COLORS.textSecondary}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Left eye */}
      <Path
        d={`M 10 ${18 + eyeSquint} Q 13 ${18 - eyeOpenness * 4 + eyeSquint} 16 ${18 + eyeSquint}`}
        stroke={COLORS.text}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Right eye */}
      <Path
        d={`M 24 ${18 + eyeSquint} Q 27 ${18 - eyeOpenness * 4 + eyeSquint} 30 ${18 + eyeSquint}`}
        stroke={COLORS.text}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth */}
      <Path
        d={`M 12 28 Q 20 ${28 + mouthCurve} 28 28`}
        stroke={COLORS.text}
        strokeWidth={percentage > 80 ? 2 : 1.5}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ============================================================================
// PAIN THERMOMETER COMPONENT
// ============================================================================

interface PainThermometerProps {
  value: number;
  onChange: (value: number) => void;
  height: number;
}

const PainThermometer: React.FC<PainThermometerProps> = ({ value, onChange, height }) => {
  const percentage = (value / 10) * 100;
  const fillHeight = (height - 40) * (percentage / 100);
  const animatedFill = useRef(new Animated.Value(fillHeight)).current;
  const trackRef = useRef<View>(null);

  useEffect(() => {
    Animated.spring(animatedFill, {
      toValue: fillHeight,
      damping: 20,
      stiffness: 150,
      useNativeDriver: false,
    }).start();
  }, [fillHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationY);
        // Gradient friction haptic - more resistance at higher values
        const currentPercentage = 100 - (evt.nativeEvent.locationY / (height - 40)) * 100;
        if (currentPercentage > 70) {
          triggerHaptic("medium");
        } else if (currentPercentage > 30) {
          triggerHaptic("light");
        }
      },
      onPanResponderRelease: () => {
        triggerHaptic("click");
      },
    })
  ).current;

  const handleTouch = (y: number) => {
    const trackHeight = height - 40;
    const clampedY = Math.max(0, Math.min(y, trackHeight));
    const newPercentage = 100 - (clampedY / trackHeight) * 100;
    const newValue = Math.round((newPercentage / 100) * 10 * 10) / 10; // Round to 1 decimal
    onChange(Math.max(0, Math.min(10, newValue)));
  };

  const fillColor = interpolateColor(percentage);

  return (
    <View style={[styles.thermometerContainer, { height }]}>
      {/* Track */}
      <View
        ref={trackRef}
        style={[styles.thermometerTrack, { height: height - 40 }]}
        {...panResponder.panHandlers}
      >
        {/* Rim lighting effect */}
        <View style={styles.thermometerRim} />

        {/* Fill */}
        <Animated.View
          style={[
            styles.thermometerFill,
            {
              height: animatedFill,
              backgroundColor: fillColor,
            },
          ]}
        >
          {/* Inner glow */}
          <LinearGradient
            colors={["rgba(255,255,255,0.3)", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        {/* Morphing face positioned in the fill */}
        <Animated.View
          style={[
            styles.faceContainer,
            {
              bottom: Animated.add(animatedFill, new Animated.Value(-20)),
            },
          ]}
        >
          <MorphingFace percentage={percentage} />
        </Animated.View>
      </View>

      {/* Value display */}
      <View style={styles.thermometerValueContainer}>
        <Text style={styles.thermometerValue}>{value.toFixed(1)}</Text>
        <Text style={styles.thermometerLabel}>/ 10</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MEDICATION BUTTON COMPONENT
// ============================================================================

interface MedicationButtonProps {
  taken: boolean;
  timestamp: string | null;
  onToggle: () => void;
}

const MedicationButton: React.FC<MedicationButtonProps> = ({ taken, timestamp, onToggle }) => {
  const [undoWindow, setUndoWindow] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (taken && undoWindow) {
      // Cancel - within undo window
      triggerHaptic("click");
      onToggle();
      setUndoWindow(false);
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    } else if (!taken) {
      // Take medication
      triggerHaptic("heavy");
      onToggle();
      setUndoWindow(true);

      // Animate
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      // Start undo timer
      undoTimerRef.current = setTimeout(() => {
        setUndoWindow(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.medButton,
          taken && styles.medButtonActive,
          pressed && styles.medButtonPressed,
        ]}
      >
        <View style={styles.medButtonInner}>
          {/* Pill icon */}
          <Text style={[styles.medIcon, taken && styles.medIconActive]}>
            💊
          </Text>

          <View style={styles.medTextContainer}>
            <Text style={[styles.medLabel, taken && styles.medLabelActive]}>
              {taken ? "TAKEN" : "LOG MED"}
            </Text>
            {taken && timestamp && (
              <Text style={styles.medTimestamp}>
                {undoWindow ? "Tap to undo" : formatTime(timestamp)}
              </Text>
            )}
          </View>
        </View>

        {/* Rim lighting */}
        <View style={[styles.medButtonRim, taken && styles.medButtonRimActive]} />
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// BODY MAP COMPONENT
// ============================================================================

interface BodyMapProps {
  selectedLocations: string[];
  onToggleLocation: (locationId: string) => void;
}

const BodyMap: React.FC<BodyMapProps> = ({ selectedLocations, onToggleLocation }) => {
  const handleLocationPress = (locationId: string) => {
    triggerHaptic("medium");
    onToggleLocation(locationId);
  };

  return (
    <View style={styles.bodyMapContainer}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <Defs>
          {/* Pain glow gradient */}
          <RadialGradient id="painGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.painAgony} stopOpacity={0.6} />
            <Stop offset="70%" stopColor={COLORS.painAgony} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={COLORS.painAgony} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Head outline - simplified silhouette */}
        <Path
          d="M 50 5
             C 75 5 85 25 85 45
             C 85 65 75 75 65 78
             L 65 95
             L 35 95
             L 35 78
             C 25 75 15 65 15 45
             C 15 25 25 5 50 5 Z"
          fill="none"
          stroke={COLORS.rimLight}
          strokeWidth={1.5}
        />

        {/* Inner detail lines */}
        <Path
          d="M 35 45 Q 40 48 45 45"
          fill="none"
          stroke={COLORS.rim}
          strokeWidth={0.5}
        />
        <Path
          d="M 55 45 Q 60 48 65 45"
          fill="none"
          stroke={COLORS.rim}
          strokeWidth={0.5}
        />

        {/* Pain location hit areas (Voronoi-expanded) */}
        {PAIN_LOCATIONS.map((location) => {
          const isSelected = selectedLocations.includes(location.id);
          return (
            <G key={location.id}>
              {/* Expanded hit area (invisible) */}
              <Circle
                cx={location.cx}
                cy={location.cy}
                r={15}
                fill="transparent"
                onPress={() => handleLocationPress(location.id)}
              />

              {/* Visible glow when selected */}
              {isSelected && (
                <Circle
                  cx={location.cx}
                  cy={location.cy}
                  r={12}
                  fill="url(#painGlow)"
                />
              )}

              {/* Core indicator */}
              <Circle
                cx={location.cx}
                cy={location.cy}
                r={isSelected ? 5 : 3}
                fill={isSelected ? COLORS.painAgony : COLORS.rimLight}
                opacity={isSelected ? 1 : 0.4}
              />
            </G>
          );
        })}
      </Svg>

      {/* Touch overlay for React Native */}
      {PAIN_LOCATIONS.map((location) => (
        <Pressable
          key={`touch-${location.id}`}
          onPress={() => handleLocationPress(location.id)}
          style={[
            styles.bodyMapTouchTarget,
            {
              left: `${location.cx - 15}%`,
              top: `${location.cy - 15}%`,
              width: "30%",
              height: "30%",
            },
          ]}
        />
      ))}
    </View>
  );
};

// ============================================================================
// SENSORY TRIGGER GRID COMPONENT
// ============================================================================

interface SensoryTriggerGridProps {
  triggers: Record<string, boolean>;
  onToggle: (triggerId: string) => void;
}

const SensoryTriggerGrid: React.FC<SensoryTriggerGridProps> = ({ triggers, onToggle }) => {
  const handleToggle = (triggerId: string, currentState: boolean) => {
    // Haptic feedback based on state change
    if (currentState) {
      triggerHaptic("click"); // Light click for turning off
    } else {
      triggerHaptic("heavy"); // Heavy thud for turning on
    }
    onToggle(triggerId);
  };

  return (
    <View style={styles.triggerGrid}>
      {SENSORY_TRIGGERS.map((trigger) => {
        const isActive = triggers[trigger.id] ?? false;
        return (
          <Pressable
            key={trigger.id}
            onPressIn={() => handleToggle(trigger.id, isActive)}
            style={({ pressed }) => [
              styles.triggerTile,
              isActive && styles.triggerTileActive,
              pressed && styles.triggerTilePressed,
            ]}
          >
            <Text style={[styles.triggerIcon, isActive && styles.triggerIconActive]}>
              {trigger.icon}
            </Text>
            <Text style={[styles.triggerLabel, isActive && styles.triggerLabelActive]}>
              {trigger.label}
            </Text>

            {/* Rim lighting */}
            <View style={[styles.triggerRim, isActive && styles.triggerRimActive]} />
          </Pressable>
        );
      })}
    </View>
  );
};

// ============================================================================
// FUNCTIONAL CAPACITY SLIDER COMPONENT
// ============================================================================

interface FunctionalSliderProps {
  value: "HIGH" | "MED" | "LOW";
  onChange: (value: "HIGH" | "MED" | "LOW") => void;
}

const FunctionalSlider: React.FC<FunctionalSliderProps> = ({ value, onChange }) => {
  const selectedIndex = FUNCTIONAL_LEVELS.findIndex((l) => l.id === value);
  const indicatorAnim = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: selectedIndex,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex]);

  const handleSelect = (level: typeof FUNCTIONAL_LEVELS[number]) => {
    triggerHaptic("medium");
    onChange(level.id as "HIGH" | "MED" | "LOW");
  };

  const slotWidth = (SCREEN_WIDTH - 64) / 3;

  return (
    <View style={styles.functionalContainer}>
      <Text style={styles.functionalTitle}>STATUS</Text>

      <View style={styles.functionalTrack}>
        {/* Magnetic indicator */}
        <Animated.View
          style={[
            styles.functionalIndicator,
            {
              width: slotWidth - 8,
              transform: [
                {
                  translateX: indicatorAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [4, slotWidth + 4, slotWidth * 2 + 4],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Slots */}
        {FUNCTIONAL_LEVELS.map((level, index) => {
          const isSelected = value === level.id;
          return (
            <Pressable
              key={level.id}
              onPress={() => handleSelect(level)}
              style={[styles.functionalSlot, { width: slotWidth }]}
            >
              <Text style={[styles.functionalLabel, isSelected && styles.functionalLabelActive]}>
                {level.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// PAGE INDICATOR
// ============================================================================

interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ currentPage, totalPages }) => {
  return (
    <View style={styles.pageIndicator}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicatorDot,
            index === currentPage && styles.pageIndicatorDotActive,
          ]}
        />
      ))}
    </View>
  );
};

// ============================================================================
// MAIN WIDGET COMPONENT
// ============================================================================

export const MigraineCrisisWidget: React.FC<MigraineCrisisWidgetProps> = ({
  onMetricsChange,
  initialMetrics,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [sessionId] = useState(() => generateSessionId());

  // Metrics state
  const [painLevel, setPainLevel] = useState(initialMetrics?.pain_level ?? 0);
  const [medicationTaken, setMedicationTaken] = useState(initialMetrics?.medication_taken ?? false);
  const [medicationTime, setMedicationTime] = useState<string | null>(
    initialMetrics?.medication_time ?? null
  );
  const [painLocations, setPainLocations] = useState<string[]>(initialMetrics?.locations ?? []);
  const [sensoryTriggers, setSensoryTriggers] = useState(
    initialMetrics?.sensory_triggers ?? {
      light: false,
      sound: false,
      smell: false,
      nausea: false,
    }
  );
  const [functionalStatus, setFunctionalStatus] = useState<"HIGH" | "MED" | "LOW">(
    initialMetrics?.functional_status ?? "HIGH"
  );

  // Swipe handling
  const panX = useRef(new Animated.Value(0)).current;
  const pageAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        panX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 && currentPage < 1) {
          // Swipe left - go to page 2
          setCurrentPage(1);
          triggerHaptic("light");
        } else if (gestureState.dx > 50 && currentPage > 0) {
          // Swipe right - go to page 1
          setCurrentPage(0);
          triggerHaptic("light");
        }

        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(pageAnim, {
      toValue: currentPage,
      damping: 20,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  }, [currentPage]);

  // Emit metrics on change (debounced)
  const emitMetrics = useCallback(() => {
    const metrics: MigraineMetrics = {
      attack_session_id: sessionId,
      timestamp_last_modified: new Date().toISOString(),
      metrics: {
        pain_level: painLevel,
        medication_taken: medicationTaken,
        medication_time: medicationTime,
        locations: painLocations,
        sensory_triggers: sensoryTriggers,
        functional_status: functionalStatus,
      },
    };
    onMetricsChange?.(metrics);
  }, [
    sessionId,
    painLevel,
    medicationTaken,
    medicationTime,
    painLocations,
    sensoryTriggers,
    functionalStatus,
    onMetricsChange,
  ]);

  useEffect(() => {
    const timer = setTimeout(emitMetrics, 500);
    return () => clearTimeout(timer);
  }, [emitMetrics]);

  // Handlers
  const handleMedicationToggle = () => {
    if (medicationTaken) {
      setMedicationTaken(false);
      setMedicationTime(null);
    } else {
      setMedicationTaken(true);
      setMedicationTime(new Date().toISOString());
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setPainLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId]
    );
  };

  const handleTriggerToggle = (triggerId: string) => {
    setSensoryTriggers((prev) => ({
      ...prev,
      [triggerId]: !prev[triggerId as keyof typeof prev],
    }));
  };

  const pageWidth = SCREEN_WIDTH - 32;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MIGRAINE CRISIS</Text>
        <PageIndicator currentPage={currentPage} totalPages={2} />
      </View>

      {/* Page container */}
      <View style={styles.pageContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.pagesWrapper,
            {
              transform: [
                {
                  translateX: Animated.add(
                    panX,
                    pageAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -pageWidth],
                    })
                  ),
                },
              ],
            },
          ]}
        >
          {/* Page 1: Crisis Console */}
          <View style={[styles.page, { width: pageWidth }]}>
            <View style={styles.crisisLayout}>
              {/* Left column: Pain Thermometer */}
              <View style={styles.thermometerColumn}>
                <PainThermometer
                  value={painLevel}
                  onChange={setPainLevel}
                  height={280}
                />
              </View>

              {/* Right column */}
              <View style={styles.rightColumn}>
                {/* Medication Button */}
                <MedicationButton
                  taken={medicationTaken}
                  timestamp={medicationTime}
                  onToggle={handleMedicationToggle}
                />

                {/* Body Map */}
                <View style={styles.bodyMapWrapper}>
                  <BodyMap
                    selectedLocations={painLocations}
                    onToggleLocation={handleLocationToggle}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Page 2: Sensory Shield */}
          <View style={[styles.page, { width: pageWidth }]}>
            <View style={styles.sensoryLayout}>
              {/* Trigger Grid */}
              <SensoryTriggerGrid
                triggers={sensoryTriggers}
                onToggle={handleTriggerToggle}
              />

              {/* Functional Capacity Slider */}
              <FunctionalSlider
                value={functionalStatus}
                onChange={setFunctionalStatus}
              />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Swipe hint */}
      <Text style={styles.swipeHint}>
        {currentPage === 0 ? "Swipe for triggers →" : "← Swipe for pain"}
      </Text>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 24,
    overflow: "hidden",
    paddingTop: 20,
    paddingBottom: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.rim,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 2,
    color: COLORS.textSecondary,
  },

  // Page indicator
  pageIndicator: {
    flexDirection: "row",
    gap: 6,
  },
  pageIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.rim,
  },
  pageIndicatorDotActive: {
    backgroundColor: COLORS.text,
    width: 18,
  },

  // Pages
  pageContainer: {
    overflow: "hidden",
  },
  pagesWrapper: {
    flexDirection: "row",
  },
  page: {
    paddingHorizontal: 16,
  },

  // Crisis Layout (Page 1)
  crisisLayout: {
    flexDirection: "row",
    gap: 16,
    height: 320,
  },
  thermometerColumn: {
    width: "30%",
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },

  // Thermometer
  thermometerContainer: {
    alignItems: "center",
  },
  thermometerTrack: {
    width: 60,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    overflow: "hidden",
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: COLORS.rim,
  },
  thermometerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  thermometerFill: {
    width: "100%",
    borderRadius: 30,
  },
  faceContainer: {
    position: "absolute",
    left: 10,
    alignItems: "center",
  },
  thermometerValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 12,
  },
  thermometerValue: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "800",
    fontSize: 28,
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
  },
  thermometerLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "600",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },

  // Medication Button
  medButton: {
    height: 80,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    justifyContent: "center",
    overflow: "hidden",
  },
  medButtonActive: {
    backgroundColor: COLORS.activeBackground,
  },
  medButtonPressed: {
    opacity: 0.8,
  },
  medButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  medButtonRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.rim,
  },
  medButtonRimActive: {
    borderColor: COLORS.activeBackground,
  },
  medIcon: {
    fontSize: 28,
    opacity: 0.5,
  },
  medIconActive: {
    opacity: 1,
  },
  medTextContainer: {
    flex: 1,
  },
  medLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
    color: COLORS.textSecondary,
  },
  medLabelActive: {
    color: COLORS.activeForeground,
  },
  medTimestamp: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "600",
    fontSize: 12,
    color: COLORS.activeForeground,
    marginTop: 2,
  },

  // Body Map
  bodyMapWrapper: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.rim,
  },
  bodyMapContainer: {
    flex: 1,
    padding: 8,
  },
  bodyMapTouchTarget: {
    position: "absolute",
  },

  // Sensory Layout (Page 2)
  sensoryLayout: {
    gap: 24,
    paddingTop: 8,
  },

  // Trigger Grid
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  triggerTile: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  triggerTileActive: {
    backgroundColor: COLORS.activeBackground,
  },
  triggerTilePressed: {
    transform: [{ scale: 0.98 }],
  },
  triggerRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.rim,
  },
  triggerRimActive: {
    borderColor: COLORS.activeBackground,
  },
  triggerIcon: {
    fontSize: 36,
    opacity: 0.5,
  },
  triggerIconActive: {
    opacity: 1,
  },
  triggerLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "700",
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  triggerLabelActive: {
    color: COLORS.activeForeground,
  },

  // Functional Slider
  functionalContainer: {
    gap: 12,
  },
  functionalTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 2,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  functionalTrack: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    height: 56,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.rim,
  },
  functionalIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    backgroundColor: COLORS.activeBackground,
    borderRadius: 12,
  },
  functionalSlot: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  functionalLabel: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "700",
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  functionalLabelActive: {
    color: COLORS.activeForeground,
  },

  // Swipe hint
  swipeHint: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "600",
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginTop: 16,
    letterSpacing: 0.5,
  },
});

export default MigraineCrisisWidget;
