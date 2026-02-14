import React from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Icon } from "@components/ui";
import { FieldProps } from "../types";

const isIOS = process.env.EXPO_OS === "ios";
const DEFAULT_MAX_CANVAS_WIDTH = 340;
const DEFAULT_BUBBLE_GAP = 8;
const DEFAULT_BUBBLE_PADDING = 12;
const ICON_SIZE = 24;
const LABEL_LINE_HEIGHT = 13;
const MAX_SIZE_FACTOR = 1;
const MIN_SIZE_FACTOR = 0.82;
const CELL_SLACK_FACTOR = 0.92;
const PENCIL_LAYOUT_BASE_WIDTH = 340;
const PENCIL_LAYOUT_SLOTS = [
  { size: 100, x: 8, y: 5 },
  { size: 86, x: 132, y: 18 },
  { size: 94, x: 242, y: 40 },
  { size: 80, x: 52, y: 122 },
  { size: 76, x: 162, y: 130 },
  { size: 82, x: 255, y: 160 },
  { size: 92, x: 0, y: 225 },
  { size: 82, x: 115, y: 240 },
  { size: 78, x: 220, y: 265 },
  { size: 80, x: 40, y: 340 },
  { size: 88, x: 145, y: 350 },
  { size: 80, x: 255, y: 368 },
] as const;

export interface BubbleChoiceItem {
  id: string;
  label: string;
  icon: string;
}

type BubbleLayoutItem = BubbleChoiceItem & {
  size: number;
  x: number;
  y: number;
};

interface BubbleChoiceFieldProps extends FieldProps<string[]> {
  items: BubbleChoiceItem[];
  accentColor?: string;
  textPrimaryColor?: string;
  textSecondaryColor?: string;
  textMutedColor?: string;
  maxCanvasWidth?: number;
  minBubbleSize?: number;
  maxBubbleSize?: number;
  bubbleGap?: number;
  bubblePadding?: number;
  layoutPreset?: "pencil";
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const estimateMinBubbleSize = (label: string) => {
  const words = label.split(/[\s/]+/).filter(Boolean);
  const longestWord = words.reduce((max, word) => Math.max(max, word.length), 0);
  const lineCount = words.length > 1 ? 2 : 1;
  const minByWidth = 22 + longestWord * 7;
  const minByHeight = 14 + ICON_SIZE + 4 + LABEL_LINE_HEIGHT * lineCount;
  return Math.max(minByWidth, minByHeight);
};

const computeBubbleSizes = (
  items: BubbleChoiceItem[],
  maxSize: number,
  minFactor: number,
  maxFactor: number
) => {
  const count = items.length;
  const denom = Math.max(1, count - 1);
  const baseSizes = items.map(
    (_, index) => maxSize * (maxFactor - (index / denom) * (maxFactor - minFactor))
  );
  const minByLabel = items.map((item) => estimateMinBubbleSize(item.label));
  return baseSizes.map((size, index) => Math.max(size, minByLabel[index]));
};

const layoutPresetBubbles = (
  items: BubbleChoiceItem[],
  width: number,
  padding: number
) => {
  if (!items.length || width <= 0) {
    return { layoutItems: [], height: 0 };
  }

  const maxSlotSize = Math.max(...PENCIL_LAYOUT_SLOTS.map((slot) => slot.size));
  let inset = Math.max(padding, width * 0.04);
  let scale = (width - inset * 2) / PENCIL_LAYOUT_BASE_WIDTH;
  const maxBubble = maxSlotSize * scale;
  inset = Math.max(inset, maxBubble * 0.28);
  scale = (width - inset * 2) / PENCIL_LAYOUT_BASE_WIDTH;
  const count = Math.min(items.length, PENCIL_LAYOUT_SLOTS.length);
  const layoutItems: BubbleLayoutItem[] = [];
  let maxY = 0;

  for (let index = 0; index < count; index += 1) {
    const slot = PENCIL_LAYOUT_SLOTS[index];
    const size = slot.size * scale;
    const x = slot.x * scale + inset;
    const y = slot.y * scale + inset;
    layoutItems.push({
      ...items[index],
      size,
      x,
      y,
    });
    maxY = Math.max(maxY, y + size);
  }

  const height = Math.max(
    maxY + inset,
    inset + (layoutItems[0]?.size ?? 0) + padding * 2
  );
  return { layoutItems, height };
};

const layoutBubbles = (
  items: BubbleChoiceItem[],
  width: number,
  {
    padding,
    gap,
    minSize,
    maxSize,
  }: {
    padding: number;
    gap: number;
    minSize: number;
    maxSize: number;
  }
) => {
  if (!items.length || width <= 0) {
    return { layoutItems: [], height: 0 };
  }

  const usableWidth = Math.max(0, width - padding * 2);
  const count = items.length;
  const baseColumns = count <= 6 ? 2 : count <= 12 ? 3 : 4;
  const minLabelSize = Math.max(...items.map((item) => estimateMinBubbleSize(item.label)));
  const minCellSize = Math.max(minSize, minLabelSize);
  let columns = Math.min(baseColumns, count);

  while (columns > 1) {
    const rawCell = (usableWidth - gap * (columns - 1)) / columns;
    const effectiveCell = rawCell * CELL_SLACK_FACTOR;
    if (effectiveCell >= minCellSize) {
      break;
    }
    columns -= 1;
  }

  while (columns > 1 && Math.ceil(count / columns) === 1 && count > 2) {
    const nextColumns = columns - 1;
    const rawCell = (usableWidth - gap * (nextColumns - 1)) / nextColumns;
    const effectiveCell = rawCell * CELL_SLACK_FACTOR;
    if (effectiveCell < minCellSize) {
      break;
    }
    columns = nextColumns;
  }

  const rawCell = (usableWidth - gap * (columns - 1)) / columns;
  const cellSize = Math.max(minCellSize, Math.min(rawCell, maxSize) * CELL_SLACK_FACTOR);
  const sizes = computeBubbleSizes(items, cellSize, MIN_SIZE_FACTOR, MAX_SIZE_FACTOR).map(
    (size) => Math.min(size, cellSize)
  );

  const rows = Math.ceil(count / columns);
  const rowCounts = Array.from({ length: rows }, (_, rowIndex) =>
    rowIndex === rows - 1 ? count - rowIndex * columns : columns
  );

  const layoutItems: BubbleLayoutItem[] = [];
  const diagonalOffset = Math.round(cellSize * 0.28);
  const slantStep = Math.round(cellSize * 0.16);
  const rowStride =
    cellSize + gap + slantStep * Math.max(0, columns - 1) * 0.5;

  rowCounts.forEach((rowCount, rowIndex) => {
    const startIndex = rowIndex * columns;
    const rowWidth = rowCount * cellSize + gap * (rowCount - 1);
    const baseX = padding + (usableWidth - rowWidth) / 2;
    const shiftedX = baseX + diagonalOffset * rowIndex;
    const startX = clamp(shiftedX, padding, width - padding - rowWidth);
    const midIndex = (rowCount - 1) / 2;
    const rowY = padding + rowIndex * rowStride;

    for (let colIndex = 0; colIndex < rowCount; colIndex += 1) {
      const itemIndex = startIndex + colIndex;
      const size = sizes[itemIndex];
      const offsetY = (colIndex - midIndex) * slantStep;
      const x = startX + colIndex * (cellSize + gap) + (cellSize - size) / 2;
      const y = rowY + offsetY + (cellSize - size) / 2;
      layoutItems.push({
        ...items[itemIndex],
        size,
        x,
        y,
      });
    }
  });

  const height = Math.max(
    padding + rowStride * (rows - 1) + cellSize + padding,
    cellSize + padding * 2
  );
  return { layoutItems, height };
};

const BubbleItem = React.memo(function BubbleItem({
  bubble,
  selected,
  disabled,
  accentColor,
  textMutedColor,
  onPress,
}: {
  bubble: BubbleLayoutItem;
  selected: boolean;
  disabled?: boolean;
  accentColor: string;
  textMutedColor: string;
  onPress: (id: string) => void;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [selected, scale]);

  return (
    <Pressable
      onPress={() => onPress(bubble.id)}
      style={({ pressed }) => [
        styles.bubbleSlot,
        {
          width: bubble.size,
          height: bubble.size,
          left: bubble.x,
          top: bubble.y,
        },
        pressed && styles.bubblePressed,
      ]}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor: selected ? accentColor : "#FFFFFF",
            transform: [{ scale }],
          },
          selected && styles.bubbleSelected,
        ]}
      >
        <Icon
          name={bubble.icon}
          size={ICON_SIZE}
          color={selected ? "#FFFFFF" : accentColor}
        />
        <Text
          selectable
          style={[
            styles.bubbleLabel,
            { color: textMutedColor },
            selected && styles.bubbleLabelSelected,
          ]}
        >
          {bubble.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

export function BubbleChoiceField({
  value,
  onChange,
  disabled,
  label,
  description,
  items,
  accentColor = "#0F172A",
  textPrimaryColor = "#111827",
  textSecondaryColor = "#6B7280",
  textMutedColor = "#4B5563",
  maxCanvasWidth = DEFAULT_MAX_CANVAS_WIDTH,
  minBubbleSize,
  maxBubbleSize,
  bubbleGap = DEFAULT_BUBBLE_GAP,
  bubblePadding = DEFAULT_BUBBLE_PADDING,
  layoutPreset,
}: BubbleChoiceFieldProps) {
  const selectedItems = React.useMemo(() => value ?? [], [value]);
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = React.useState<number | null>(null);
  const canvasWidth = Math.max(
    0,
    Math.min(containerWidth ?? windowWidth, maxCanvasWidth)
  );
  const handleContainerLayout = React.useCallback(
    (event: { nativeEvent: { layout: { width: number } } }) => {
      const nextWidth = event.nativeEvent.layout.width;
      if (nextWidth > 0 && nextWidth !== containerWidth) {
        setContainerWidth(nextWidth);
      }
    },
    [containerWidth]
  );
  const resolvedMaxSize =
    maxBubbleSize ?? Math.min(112, Math.max(88, canvasWidth * 0.3));
  const resolvedMinSize =
    minBubbleSize ?? Math.max(64, resolvedMaxSize * 0.68);

  const { layoutItems, height } = React.useMemo(() => {
    if (layoutPreset === "pencil") {
      return layoutPresetBubbles(items, canvasWidth, bubblePadding);
    }
    return layoutBubbles(items, canvasWidth, {
      padding: bubblePadding,
      gap: bubbleGap,
      minSize: resolvedMinSize,
      maxSize: resolvedMaxSize,
    });
  }, [
    layoutPreset,
    items,
    canvasWidth,
    bubblePadding,
    bubbleGap,
    resolvedMinSize,
    resolvedMaxSize,
  ]);

  const handleToggle = React.useCallback((id: string) => {
    if (disabled) return;
    if (isIOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const next = selectedItems.includes(id)
      ? selectedItems.filter((item) => item !== id)
      : [...selectedItems, id];
    onChange(next);
  }, [disabled, onChange, selectedItems]);

  return (
    <View style={styles.container}>
      {(label || description) && (
        <>
          {label ? (
            <Text selectable style={[styles.title, { color: textPrimaryColor }]}
            >
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text selectable style={[styles.subtitle, { color: textSecondaryColor }]}
            >
              {description}
            </Text>
          ) : null}
        </>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.canvasWrap} onLayout={handleContainerLayout}>
          <View
            style={[
              styles.bubbleCanvas,
              { width: canvasWidth, height },
            ]}
          >
            {layoutItems.map((bubble) => (
              <BubbleItem
                key={bubble.id}
                bubble={bubble}
                selected={selectedItems.includes(bubble.id)}
                disabled={disabled}
                accentColor={accentColor}
                textMutedColor={textMutedColor}
                onPress={handleToggle}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: isIOS ? "SF Pro Rounded" : "sans-serif",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  canvasWrap: {
    width: "100%",
    alignItems: "center",
  },
  bubbleCanvas: {
    position: "relative",
    alignSelf: "center",
    overflow: "visible",
  },
  bubbleSlot: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  bubble: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  bubblePressed: {
    transform: [{ scale: 0.97 }],
  },
  bubbleSelected: {
    boxShadow: "0 12px 26px rgba(108, 92, 231, 0.35)",
  },
  bubbleLabel: {
    fontFamily: isIOS ? "SF Pro Text" : "sans-serif",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: LABEL_LINE_HEIGHT,
  },
  bubbleLabelSelected: {
    color: "#FFFFFF",
  },
});
