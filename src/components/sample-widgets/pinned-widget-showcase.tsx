/**
 * Pinned Widget Showcase
 *
 * Displays sample widgets as pinned inspirational content at the top of the chat.
 * Users can expand to see the full interactive widget or dismiss to hide.
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  LayoutAnimation,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MigraineCrisisWidget } from "./migraine-crisis-widget";
import { ArthritisDashboardWidget } from "../arthritis/arthritis-dashboard-widget";
import { getPinnedWidgets, type SampleWidget } from "./sample-widget-data";

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = "cadence_dismissed_samples";

const COLORS = {
  // Subtle glass surface
  surface: "rgba(255, 255, 255, 0.85)",
  surfaceDark: "rgba(0, 0, 0, 0.95)",
  border: "rgba(0, 0, 0, 0.08)",
  borderDark: "rgba(255, 255, 255, 0.1)",

  // Text
  text: "#1A1A1A",
  textSecondary: "#666666",
  textDark: "#FFFFFF",
  textSecondaryDark: "rgba(255, 255, 255, 0.6)",

  // Accent
  accent: "#3B82F6",
  accentLight: "rgba(59, 130, 246, 0.1)",
};

// ============================================================================
// PINNED WIDGET CARD
// ============================================================================

interface PinnedWidgetCardProps {
  widget: SampleWidget;
  onDismiss: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const PinnedWidgetCard: React.FC<PinnedWidgetCardProps> = ({
  widget,
  onDismiss,
  isExpanded,
  onToggleExpand,
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      damping: 20,
      stiffness: 150,
      useNativeDriver: false,
    }).start();
  }, [expandAnim, isExpanded]);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggleExpand();
  };

  return (
    <View style={styles.card}>
      {/* Collapsed Header */}
      <Pressable onPress={handleToggle} style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>INSPIRATION</Text>
          </View>
          <Text style={styles.cardTitle}>{widget.title}</Text>
          <Text style={styles.cardDescription} numberOfLines={isExpanded ? undefined : 2}>
            {widget.description}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={onDismiss} style={styles.dismissButton} hitSlop={8}>
            <Text style={styles.dismissIcon}>×</Text>
          </Pressable>
          <View style={[styles.expandIcon, isExpanded && styles.expandIconRotated]}>
            <Text style={styles.expandIconText}>›</Text>
          </View>
        </View>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View style={styles.expandedContent}>
          {/* Feature Pills */}
          <View style={styles.featureList}>
            {widget.features.slice(0, 4).map((feature, index) => (
              <View key={index} style={styles.featurePill}>
                <Text style={styles.featurePillText}>{feature}</Text>
              </View>
            ))}
            {widget.features.length > 4 && (
              <View style={styles.featurePill}>
                <Text style={styles.featurePillText}>+{widget.features.length - 4} more</Text>
              </View>
            )}
          </View>

          {/* Interactive Widget Preview */}
          <View style={styles.widgetPreview}>
            {widget.type === "migraine_crisis" && (
              <MigraineCrisisWidget
                onMetricsChange={(metrics) => {
                  console.log("Sample widget metrics:", metrics);
                }}
              />
            )}
            {widget.type === "arthritis_dashboard" && (
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <ArthritisDashboardWidget />
              </View>
            )}
          </View>

          {/* Design Philosophy */}
          <View style={styles.philosophySection}>
            <Text style={styles.philosophyTitle}>Design Philosophy</Text>
            <Text style={styles.philosophyText}>
              {widget.designPhilosophy.trim().split("\n\n")[0]}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN SHOWCASE COMPONENT
// ============================================================================

interface PinnedWidgetShowcaseProps {
  onMetricsChange?: (widgetId: string, metrics: unknown) => void;
}

export const PinnedWidgetShowcase: React.FC<PinnedWidgetShowcaseProps> = ({ onMetricsChange }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load dismissed state from storage
  React.useEffect(() => {
    const loadDismissed = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setDismissedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Failed to load dismissed widgets:", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadDismissed();
  }, []);

  const handleDismiss = useCallback(async (widgetId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newDismissed = [...dismissedIds, widgetId];
    setDismissedIds(newDismissed);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDismissed));
    } catch (e) {
      console.warn("Failed to save dismissed state:", e);
    }
  }, [dismissedIds]);

  const handleToggleExpand = useCallback((widgetId: string) => {
    setExpandedId((prev) => (prev === widgetId ? null : widgetId));
  }, []);

  // Get visible widgets
  const pinnedWidgets = getPinnedWidgets();
  const visibleWidgets = pinnedWidgets.filter((w) => !dismissedIds.includes(w.id));

  if (!isLoaded || visibleWidgets.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleWidgets.map((widget) => (
        <PinnedWidgetCard
          key={widget.id}
          widget={widget}
          onDismiss={() => handleDismiss(widget.id)}
          isExpanded={expandedId === widget.id}
          onToggleExpand={() => handleToggleExpand(widget.id)}
        />
      ))}
    </View>
  );
};

// ============================================================================
// RESET DISMISSED (for development/testing)
// ============================================================================

export const resetDismissedWidgets = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },

  headerContent: {
    flex: 1,
    gap: 6,
  },

  badge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },

  badgeText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "700",
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.accent,
  },

  cardTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "700",
    fontSize: 17,
    color: COLORS.text,
    marginTop: 4,
  },

  cardDescription: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  headerActions: {
    alignItems: "center",
    gap: 8,
  },

  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  dismissIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  expandIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "90deg" }],
  },

  expandIconRotated: {
    transform: [{ rotate: "-90deg" }],
  },

  expandIconText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },

  featureList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  featurePill: {
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  featurePillText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  widgetPreview: {
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: -8,
  },

  philosophySection: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },

  philosophyTitle: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Rounded" : "sans-serif",
    fontWeight: "600",
    fontSize: 13,
    color: COLORS.text,
  },

  philosophyText: {
    fontFamily: Platform.OS === "ios" ? "SF Pro Text" : "sans-serif",
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
});

export default PinnedWidgetShowcase;
