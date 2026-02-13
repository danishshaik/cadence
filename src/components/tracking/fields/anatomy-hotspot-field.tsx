import React from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import {
  AnatomyMapConfig,
  AnatomyMapCornerRadii,
  AnatomyMapLayer,
  AnatomyMapPoint,
} from "../flow-config";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";

interface AnatomyHotspotFieldProps extends FieldProps<string | null | string[]> {
  mapConfig: AnatomyMapConfig;
  selectionMode?: "single" | "multiple";
  maxSelections?: number;
  allowDeselect?: boolean;
  accentColor?: string;
  accentSoftColor?: string;
  decorativeDotColor?: string;
  hotspotIdleColor?: string;
  hotspotCoreColor?: string;
  selectionPillBackgroundColor?: string;
  selectionPillTextColor?: string;
  selectionPillIdleBackgroundColor?: string;
  selectionPillIdleTextColor?: string;
  selectionPillTemplate?: string;
  selectionPlaceholderText?: string;
  selectionCountTemplate?: string;
  showSelectionPill?: boolean;
}

function getCornerStyle(cornerRadii: AnatomyMapCornerRadii | undefined, scale: number) {
  if (!cornerRadii) return null;
  return {
    borderTopLeftRadius: cornerRadii.topLeft ? cornerRadii.topLeft * scale : 0,
    borderTopRightRadius: cornerRadii.topRight ? cornerRadii.topRight * scale : 0,
    borderBottomRightRadius: cornerRadii.bottomRight ? cornerRadii.bottomRight * scale : 0,
    borderBottomLeftRadius: cornerRadii.bottomLeft ? cornerRadii.bottomLeft * scale : 0,
  };
}

function renderLayer(
  layer: AnatomyMapLayer,
  mapX: (value: number) => number,
  mapY: (value: number) => number,
  mapScale: number
) {
  const cornerStyle = getCornerStyle(layer.cornerRadii, mapScale);
  return (
    <View
      key={layer.id}
      style={[
        styles.layer,
        {
          left: mapX(layer.x),
          top: mapY(layer.y),
          width: layer.width * mapScale,
          height: layer.height * mapScale,
          backgroundColor: layer.fill,
          borderRadius: layer.borderRadius ? layer.borderRadius * mapScale : 0,
        },
        cornerStyle,
      ]}
    />
  );
}

function renderDecorativePoint(
  point: AnatomyMapPoint,
  mapX: (value: number) => number,
  mapY: (value: number) => number,
  mapScale: number,
  fallbackColor: string
) {
  const radius = (point.radius ?? 12) * mapScale;
  const left = mapX(point.x);
  const top = mapY(point.y);

  return (
    <View
      key={point.id}
      style={[
        styles.decorativeDot,
        {
          left: left - radius,
          top: top - radius,
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          backgroundColor: point.fill ?? fallbackColor,
        },
      ]}
    />
  );
}

export function AnatomyHotspotField({
  value,
  onChange,
  mapConfig,
  selectionMode = "single",
  maxSelections,
  disabled,
  allowDeselect = false,
  accentColor = "#88D8B0",
  accentSoftColor = "rgba(136, 216, 176, 0.24)",
  decorativeDotColor = "#E8EEEA",
  hotspotIdleColor = "#FFFFFF",
  hotspotCoreColor = "#FFFFFF",
  selectionPillBackgroundColor = "#E5F3ED",
  selectionPillTextColor = "#2F3A34",
  selectionPillIdleBackgroundColor = "#F1F4F2",
  selectionPillIdleTextColor = "#8B948F",
  selectionPillTemplate = "{label} • Selected",
  selectionPlaceholderText = "Select a zone",
  selectionCountTemplate = "{count} selected",
  showSelectionPill = true,
}: AnatomyHotspotFieldProps) {
  const { width } = useWindowDimensions();
  const selectedValueIds = React.useMemo(() => {
    if (selectionMode === "multiple") {
      if (Array.isArray(value)) return value;
      return value ? [value] : [];
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? [value[0]] : [];
    }
    return value ? [value] : [];
  }, [selectionMode, value]);
  const getHotspotValueId = React.useCallback(
    (hotspotId: string, hotspotValueId?: string) => hotspotValueId ?? hotspotId,
    []
  );

  const cardHeight = mapConfig.cardHeight ?? mapConfig.canvasHeight;
  const maxCardWidth = mapConfig.maxCardWidth ?? mapConfig.canvasWidth;
  const screenPadding = mapConfig.screenPadding ?? 48;
  const cardWidth = Math.max(220, Math.min(maxCardWidth, width - screenPadding));

  const mapScale = Math.min(cardWidth / mapConfig.canvasWidth, cardHeight / mapConfig.canvasHeight);
  const mapOffsetX = (cardWidth - mapConfig.canvasWidth * mapScale) / 2;
  const mapOffsetY = (cardHeight - mapConfig.canvasHeight * mapScale) / 2;
  const mapX = (valueX: number) => mapOffsetX + valueX * mapScale;
  const mapY = (valueY: number) => mapOffsetY + valueY * mapScale;

  const selectedHotspot =
    mapConfig.hotspots.find(
      (hotspot) => getHotspotValueId(hotspot.id, hotspot.valueId) === selectedValueIds[0]
    ) ?? null;
  const selectedCount = selectedValueIds.length;
  const selectedLabel = selectedHotspot?.label;
  const selectedPillText =
    selectedCount === 0
      ? selectionPlaceholderText
      : selectedCount === 1 && selectedLabel
      ? selectionPillTemplate.replace("{label}", selectedLabel)
      : selectionCountTemplate.replace("{count}", String(selectedCount));

  const handleHotspotPress = (hotspotId: string, hotspotValueId?: string) => {
    if (disabled) return;
    Haptics.selectionAsync();
    const nextValueId = getHotspotValueId(hotspotId, hotspotValueId);

    if (selectionMode === "multiple") {
      const isSelected = selectedValueIds.includes(nextValueId);
      if (isSelected) {
        const next = selectedValueIds.filter((id) => id !== nextValueId);
        onChange(next);
        return;
      }
      if (maxSelections && selectedValueIds.length >= maxSelections) {
        return;
      }
      onChange([...selectedValueIds, nextValueId]);
      return;
    }

    const currentSingleId = selectedValueIds[0] ?? null;
    if (allowDeselect && nextValueId === currentSingleId) {
      onChange(null);
      return;
    }
    onChange(nextValueId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              height: cardHeight,
              backgroundColor: mapConfig.cardBackgroundColor ?? "#FFFFFF",
              borderColor: mapConfig.cardBorderColor ?? "#E5EBE5",
              boxShadow: mapConfig.cardShadow ?? "0 8px 20px rgba(47, 58, 52, 0.06)",
            },
          ]}
        >
          <View style={StyleSheet.absoluteFill}>
            {mapConfig.layers.map((layer) => renderLayer(layer, mapX, mapY, mapScale))}
          </View>

          {(mapConfig.decorativePoints ?? []).map((point) =>
            renderDecorativePoint(point, mapX, mapY, mapScale, decorativeDotColor)
          )}

          {mapConfig.hotspots.map((hotspot) => {
            const radius = (hotspot.radius ?? 12) * mapScale;
            const ringRadius = (hotspot.ringRadius ?? (hotspot.radius ?? 12) * 2) * mapScale;
            const left = mapX(hotspot.x);
            const top = mapY(hotspot.y);
            const hotspotValueId = getHotspotValueId(hotspot.id, hotspot.valueId);
            const isSelected = selectedValueIds.includes(hotspotValueId);

            return (
              <View key={hotspot.id} style={[styles.hotspotWrap, { left, top }]}>
                {isSelected ? (
                  <View
                    style={[
                      styles.pulseRing,
                      {
                        left: -ringRadius,
                        top: -ringRadius,
                        width: ringRadius * 2,
                        height: ringRadius * 2,
                        borderRadius: ringRadius,
                        borderColor: accentColor,
                        backgroundColor: accentSoftColor,
                      },
                    ]}
                  />
                ) : null}
                <Pressable
                  onPress={() => handleHotspotPress(hotspot.id, hotspot.valueId)}
                  disabled={disabled}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.hotspotDot,
                    {
                      width: radius * 2,
                      height: radius * 2,
                      borderRadius: radius,
                      transform: [{ translateX: -radius }, { translateY: -radius }],
                      borderColor: isSelected ? accentColor : "#D6DED9",
                      backgroundColor: isSelected ? accentColor : hotspotIdleColor,
                    },
                    pressed && styles.hotspotPressed,
                  ]}
                >
                  {isSelected ? (
                    <View
                      style={[
                        styles.hotspotCore,
                        {
                          width: Math.max(4, radius * 0.55),
                          height: Math.max(4, radius * 0.55),
                          borderRadius: Math.max(2, radius * 0.28),
                          backgroundColor: hotspotCoreColor,
                        },
                      ]}
                    />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {showSelectionPill ? (
        <View
          style={[
            styles.selectionPill,
            {
              backgroundColor: selectedLabel
                ? selectionPillBackgroundColor
                : selectionPillIdleBackgroundColor,
            },
          ]}
        >
          <Text
            selectable
            style={[
              styles.selectionPillText,
              {
                color: selectedCount > 0 ? selectionPillTextColor : selectionPillIdleTextColor,
              },
            ]}
          >
            {selectedPillText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },
  mapWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  card: {
    borderRadius: 22,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  layer: {
    position: "absolute",
  },
  decorativeDot: {
    position: "absolute",
    borderCurve: "continuous",
  },
  hotspotWrap: {
    position: "absolute",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1.5,
  },
  hotspotDot: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  hotspotPressed: {
    opacity: 0.92,
  },
  hotspotCore: {
    borderCurve: "continuous",
  },
  selectionPill: {
    borderRadius: 999,
    borderCurve: "continuous",
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 30,
    justifyContent: "center",
  },
  selectionPillText: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
