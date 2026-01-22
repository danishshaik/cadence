# Task 02: Design System (React Native)

## Task Description

Build the core reusable UI components that form the foundation of the Cadence app. These components enforce consistent styling and behavior across the entire application.

## UI Implementation Notes (Override)

Follow the Expo UI skill guidance for this task:
- **Use kebab-case filenames** for shared components (e.g. `card.tsx`, `text-input.tsx`).
- **Inline styles only** (no `StyleSheet.create`) unless reuse is clearly faster.
- **Use `boxShadow`** styles (not legacy RN shadow/elevation).
- **Avoid `SafeAreaView`**; wrap root screens with `ScrollView` and use `contentInsetAdjustmentBehavior="automatic"`.
- Prefer **`expo-image`** for images in shared components.

## Why This Task

The design system is critical because:
- All screens and widgets use these components
- Consistent styling improves user experience
- Reusable components speed up development
- Makes future design changes easier

---

## Components to Build

| Component | Description |
|-----------|-------------|
| `Card` | Container with shadow and rounded corners |
| `Button` | Primary, secondary, and outline variants |
| `Chip` | Selectable pill-shaped buttons |
| `TextInput` | Styled text input with label |
| `Typography` | Text components with preset styles |
| `Avatar` | User avatar placeholder |
| `LoadingSpinner` | Activity indicator |
| `Badge` | Small status indicators |

---

## Detailed Instructions

### 1. Project Structure

```
src/components/shared/
├── index.ts
├── card.tsx
├── button.tsx
├── chip.tsx
├── text-input.tsx
├── typography.tsx
├── avatar.tsx
├── loading-spinner.tsx
├── badge.tsx
└── __tests__/
    └── shared.test.tsx
```

### 2. Card Component (`src/components/shared/Card.tsx`)

```tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  return (
    <View style={[styles.base, styles[variant], styles[`padding_${padding}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  default: {
    ...shadows.sm,
  },
  elevated: {
    ...shadows.widget,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: spacing.sm,
  },
  padding_md: {
    padding: spacing.md,
  },
  padding_lg: {
    padding: spacing.lg,
  },
});
```

### 3. Button Component (`src/components/shared/Button.tsx`)

```tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
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
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
  },
  size_md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },

  // Text styles
  text: {
    ...typography.bodyMedium,
  },
  text_primary: {
    color: colors.surface,
  },
  text_secondary: {
    color: colors.textPrimary,
  },
  text_outline: {
    color: colors.textPrimary,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
});
```

### 4. Chip Component (`src/components/shared/Chip.tsx`)

```tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  icon,
  style,
}: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {icon && <>{icon}</>}
      <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.caption,
    fontWeight: '500',
  },
  textSelected: {
    color: colors.surface,
  },
  textUnselected: {
    color: colors.textPrimary,
  },
});
```

### 5. TextInput Component (`src/components/shared/TextInput.tsx`)

```tsx
import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, radius, spacing, typography } from '@theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextInput({
  label,
  error,
  hint,
  style,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.borderFocused,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
```

### 6. Typography Components (`src/components/shared/Typography.tsx`)

```tsx
import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { colors, typography } from '@theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = 'primary',
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) {
  return (
    <Text
      style={[
        styles[variant],
        styles[`color_${color}`],
        { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Convenience components
export function H1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" {...props} />;
}

export function H2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function Body(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props} />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props} />;
}

const styles = StyleSheet.create({
  h1: typography.h1,
  h2: typography.h2,
  h3: typography.h3,
  body: typography.body,
  bodyMedium: typography.bodyMedium,
  caption: typography.caption,
  label: typography.label,

  color_primary: { color: colors.textPrimary },
  color_secondary: { color: colors.textSecondary },
  color_tertiary: { color: colors.textTertiary },
  color_error: { color: colors.error },
  color_success: { color: colors.success },
});
```

### 7. Avatar Component (`src/components/shared/Avatar.tsx`)

```tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { colors, radius, typography } from '@theme';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ source, name, size = 'md' }: AvatarProps) {
  const sizeValue = sizes[size];

  if (source) {
    return (
      <Image
        source={source}
        style={[styles.image, { width: sizeValue, height: sizeValue }]}
      />
    );
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <View style={[styles.placeholder, { width: sizeValue, height: sizeValue }]}>
      <Text style={[styles.initials, { fontSize: sizeValue * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

const styles = StyleSheet.create({
  image: {
    borderRadius: radius.full,
  },
  placeholder: {
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '600',
  },
});
```

### 8. LoadingSpinner Component (`src/components/shared/LoadingSpinner.tsx`)

```tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  message,
  overlay = false,
}: LoadingSpinnerProps) {
  const content = (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (overlay) {
    return <View style={styles.overlay}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
```

### 9. Badge Component (`src/components/shared/Badge.tsx`)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  text: {
    ...typography.label,
    fontWeight: '500',
  },

  // Variants
  default: {
    backgroundColor: colors.surfaceSecondary,
  },
  text_default: {
    color: colors.textSecondary,
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  text_success: {
    color: '#065F46',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  text_warning: {
    color: '#92400E',
  },
  error: {
    backgroundColor: '#FEE2E2',
  },
  text_error: {
    color: '#991B1B',
  },
  info: {
    backgroundColor: colors.primaryLight,
  },
  text_info: {
    color: colors.primary,
  },
});
```

### 10. Index Export (`src/components/shared/index.ts`)

```typescript
export { Card } from './Card';
export { Button } from './Button';
export { Chip } from './Chip';
export { TextInput } from './TextInput';
export { Typography, H1, H2, H3, Body, Caption } from './Typography';
export { Avatar } from './Avatar';
export { LoadingSpinner } from './LoadingSpinner';
export { Badge } from './Badge';
```

---

## Testing Instructions

### Visual Testing

Create a test screen to preview all components:

```tsx
// src/screens/DesignSystemScreen.tsx
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Button,
  Chip,
  TextInput,
  H1,
  H2,
  Body,
  Caption,
  Avatar,
  LoadingSpinner,
  Badge,
} from '@components/shared';
import { colors, spacing } from '@theme';

export function DesignSystemScreen() {
  const [selected, setSelected] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <H1>Design System</H1>

        <Section title="Typography">
          <H1>Heading 1</H1>
          <H2>Heading 2</H2>
          <Body>Body text</Body>
          <Caption color="secondary">Caption text</Caption>
        </Section>

        <Section title="Buttons">
          <Button title="Primary" onPress={() => {}} />
          <Button title="Secondary" variant="secondary" onPress={() => {}} />
          <Button title="Outline" variant="outline" onPress={() => {}} />
          <Button title="Loading" loading onPress={() => {}} />
          <Button title="Disabled" disabled onPress={() => {}} />
        </Section>

        <Section title="Chips">
          <View style={styles.row}>
            <Chip label="Unselected" onPress={() => setSelected(!selected)} />
            <Chip label="Selected" selected onPress={() => {}} />
            <Chip label="With Icon" icon={<Text>🔥</Text>} />
          </View>
        </Section>

        <Section title="Cards">
          <Card variant="default">
            <Body>Default card</Body>
          </Card>
          <Card variant="elevated">
            <Body>Elevated card</Body>
          </Card>
          <Card variant="outlined">
            <Body>Outlined card</Body>
          </Card>
        </Section>

        <Section title="Input">
          <TextInput label="Email" placeholder="Enter email" />
          <TextInput label="With Error" error="Invalid input" />
        </Section>

        <Section title="Badges">
          <View style={styles.row}>
            <Badge label="Default" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Error" variant="error" />
          </View>
        </Section>

        <Section title="Avatar">
          <View style={styles.row}>
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane" size="md" />
            <Avatar name="A B" size="lg" />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <H2>{title}</H2>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
```

---

## Acceptance Criteria

- [ ] All 8 core components implemented
- [ ] Components use theme tokens consistently
- [ ] Button supports all variants (primary, secondary, outline, ghost)
- [ ] Chip supports selected/unselected states
- [ ] TextInput shows focus, error, and hint states
- [ ] Components have proper TypeScript types
- [ ] Visual test screen demonstrates all components

---

## Files to Create

```
src/components/shared/
├── index.ts
├── Card.tsx
├── Button.tsx
├── Chip.tsx
├── TextInput.tsx
├── Typography.tsx
├── Avatar.tsx
├── LoadingSpinner.tsx
└── Badge.tsx
```

---

## Next Task

After completing the design system, proceed to **Task 03: Chat Screen** to build the main chat interface.
