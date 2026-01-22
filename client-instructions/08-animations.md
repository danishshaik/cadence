# Task 08: Animations & Polish (React Native)

## Task Description

Add animations and micro-interactions to make the app feel fluid and responsive. This includes message animations, widget transitions, and haptic feedback.

## Why This Task

Animations matter because:
- They provide feedback and reduce perceived latency
- They guide attention to important elements
- They make the app feel premium and polished
- They improve user confidence in interactions

---

## Animations to Implement

| Animation | Component | Description |
|-----------|-----------|-------------|
| Message slide-in | AgentMessage, UserMessage | Messages slide up when added |
| Widget expand | CheckinWidget | Smooth expand from message |
| Selection feedback | Chips, Buttons | Scale and haptic on press |
| Typing dots | TypingIndicator | Bouncing dot animation |
| Progress ring | Severity scales | Animated fill |
| Page transitions | Navigation | Shared element transitions |

---

## Detailed Instructions

### 1. Project Structure

```
src/
├── utils/
│   └── haptics.ts
├── components/
│   └── animated/
│       ├── index.ts
│       ├── AnimatedMessage.tsx
│       ├── AnimatedWidget.tsx
│       ├── PressableScale.tsx
│       └── FadeIn.tsx
```

### 2. Haptics Utility (`src/utils/haptics.ts`)

```typescript
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  /**
   * Light tap feedback - use for selections
   */
  light: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  /**
   * Medium tap feedback - use for confirmations
   */
  medium: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  /**
   * Heavy tap feedback - use for important actions
   */
  heavy: () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /**
   * Success feedback
   */
  success: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  /**
   * Warning feedback
   */
  warning: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  /**
   * Error feedback
   */
  error: () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  /**
   * Selection change feedback
   */
  selection: () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  },
};

// Install expo-haptics: npx expo install expo-haptics
```

### 3. PressableScale Component (`src/components/animated/PressableScale.tsx`)

```tsx
import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { haptics } from '@utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  scale?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
  style?: StyleProp<ViewStyle>;
}

export function PressableScale({
  children,
  scale = 0.97,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...props
}: PressableScaleProps) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = useCallback(
    (event: any) => {
      scaleValue.value = withSpring(scale, {
        damping: 15,
        stiffness: 300,
      });

      if (haptic !== 'none') {
        haptics[haptic]();
      }

      onPressIn?.(event);
    },
    [scale, haptic, onPressIn]
  );

  const handlePressOut = useCallback(
    (event: any) => {
      scaleValue.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });

      onPressOut?.(event);
    },
    [onPressOut]
  );

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
```

### 4. FadeIn Component (`src/components/animated/FadeIn.tsx`)

```tsx
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  style?: ViewStyle;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 300,
  direction = 'up',
  distance = 20,
  style,
}: FadeInProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === 'left' ? distance : direction === 'right' ? -distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);

  useEffect(() => {
    const timing = {
      duration,
      easing: Easing.out(Easing.cubic),
    };

    opacity.value = withDelay(delay, withTiming(1, timing));
    translateX.value = withDelay(delay, withTiming(0, timing));
    translateY.value = withDelay(delay, withTiming(0, timing));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
```

### 5. AnimatedMessage Component (`src/components/animated/AnimatedMessage.tsx`)

```tsx
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedMessageProps {
  children: React.ReactNode;
  index: number;
  isNew?: boolean;
  style?: ViewStyle;
}

export function AnimatedMessage({
  children,
  index,
  isNew = true,
  style,
}: AnimatedMessageProps) {
  const progress = useSharedValue(isNew ? 0 : 1);

  useEffect(() => {
    if (isNew) {
      progress.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
        mass: 0.5,
      });
    }
  }, [isNew]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [20, 0]),
        },
        {
          scale: interpolate(progress.value, [0, 1], [0.95, 1]),
        },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
```

### 6. AnimatedWidget Component (`src/components/animated/AnimatedWidget.tsx`)

```tsx
import React, { useState, useEffect } from 'react';
import { LayoutAnimation, Platform, UIManager, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AnimatedWidgetProps {
  children: React.ReactNode;
  isExpanded: boolean;
  onAnimationComplete?: () => void;
  style?: ViewStyle;
}

export function AnimatedWidget({
  children,
  isExpanded,
  onAnimationComplete,
  style,
}: AnimatedWidgetProps) {
  const scale = useSharedValue(isExpanded ? 1 : 0.9);
  const opacity = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    if (isExpanded) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 200 }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    } else {
      scale.value = withSpring(0.9, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Layout animation presets for widget expansion
export const widgetLayoutAnimation = {
  expand: () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        250,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.scaleY
      )
    );
  },
  collapse: () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeOut,
        LayoutAnimation.Properties.scaleY
      )
    );
  },
};
```

### 7. Animated Severity Scale Enhancement

```tsx
// src/components/checkin/basic/AnimatedSeverityScale.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import { PressableScale } from '@components/animated';
import { haptics } from '@utils/haptics';
import { colors, spacing, radius, typography } from '@theme';

interface AnimatedSeverityButtonProps {
  value: number;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
  index: number;
}

function AnimatedSeverityButton({
  value,
  isSelected,
  onPress,
  disabled,
  index,
}: AnimatedSeverityButtonProps) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
      backgroundColor.value = withSpring(1);
    } else {
      scale.value = withSpring(1);
      backgroundColor.value = withSpring(0);
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundColor.value,
      [0, 1],
      [colors.surfaceSecondary, colors.primary]
    ),
  }));

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <PressableScale
      onPress={handlePress}
      disabled={disabled}
      haptic="none" // We handle haptic manually
    >
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={[styles.buttonText, isSelected && styles.buttonTextSelected]}>
          {value}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

interface AnimatedSeverityScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function AnimatedSeverityScale({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled,
}: AnimatedSeverityScaleProps) {
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <View style={styles.container}>
      {numbers.map((num, index) => (
        <AnimatedSeverityButton
          key={num}
          value={num}
          isSelected={value === num}
          onPress={() => onChange(num)}
          disabled={disabled}
          index={index}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  button: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  buttonTextSelected: {
    color: colors.surface,
  },
});
```

### 8. Skeleton Loading Component

```tsx
// src/components/shared/Skeleton.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { colors, radius } from '@theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);

    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Preset skeleton shapes
export function SkeletonText({ lines = 3, lastLineWidth = '60%' }: { lines?: number; lastLineWidth?: string }) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={14}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
}

export function SkeletonMessage() {
  return (
    <View style={styles.messageContainer}>
      <Skeleton width={32} height={32} borderRadius={16} />
      <View style={styles.messageBubble}>
        <SkeletonText lines={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  textContainer: {
    width: '100%',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 8,
  },
  messageBubble: {
    flex: 1,
    maxWidth: '80%',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: 12,
  },
});
```

### 9. Index Export (`src/components/animated/index.ts`)

```typescript
export { PressableScale } from './PressableScale';
export { FadeIn } from './FadeIn';
export { AnimatedMessage } from './AnimatedMessage';
export { AnimatedWidget, widgetLayoutAnimation } from './AnimatedWidget';
```

### 10. Updated Button with Animation

```tsx
// Update src/components/shared/Button.tsx to use PressableScale
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { PressableScale } from '@components/animated';
import { colors, radius, spacing, typography } from '@theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      haptic={variant === 'primary' ? 'medium' : 'light'}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.surface : colors.primary}
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
          {title}
        </Text>
      )}
    </PressableScale>
  );
}

// ... rest of styles remain the same
```

---

## Acceptance Criteria

- [ ] Messages animate in when added to chat
- [ ] Check-in widgets expand smoothly
- [ ] Buttons and chips have scale feedback
- [ ] Haptic feedback on selections
- [ ] Typing indicator animates smoothly
- [ ] Skeleton loading states for async content
- [ ] No jank or dropped frames
- [ ] Animations respect reduced motion settings

---

## Performance Notes

### Reanimated Best Practices

1. **Use worklets for animations** - All animation logic runs on UI thread
2. **Avoid re-renders** - Use `useAnimatedStyle` instead of style prop
3. **Memoize callbacks** - Prevent unnecessary re-computations
4. **Use native driver** - All transforms and opacity use native driver by default

### Testing Performance

```bash
# Enable performance monitor in development
# React Native Debugger > Performance > Enable Performance Monitor

# Check for dropped frames during animations
# Target: 60 FPS (16ms per frame)
```

---

## Files to Create

```
src/
├── utils/
│   └── haptics.ts
└── components/
    ├── animated/
    │   ├── index.ts
    │   ├── PressableScale.tsx
    │   ├── FadeIn.tsx
    │   ├── AnimatedMessage.tsx
    │   └── AnimatedWidget.tsx
    └── shared/
        └── Skeleton.tsx
```

---

## Dependencies to Install

```bash
npx expo install expo-haptics
```

---

## Completion

This completes the core React Native client implementation. After this task, the MVP includes:

1. **Project setup** with Expo and TypeScript
2. **Design system** with reusable components
3. **Chat screen** with message display
4. **Check-in widgets** for data collection
5. **Drawer navigation** for thread management
6. **API integration** with the backend
7. **Push notifications** for nudges
8. **Animations** for polish

The app is now ready for end-to-end testing with the backend!
