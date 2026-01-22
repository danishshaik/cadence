# Task 04: Check-in Widgets (React Native)

## Task Description

Build the check-in form components that render inside the chat flow. These widgets are generated dynamically from JSON schemas produced by the backend Check-in Designer Agent.

## UI Implementation Notes (Override)

Follow the Expo UI skill guidance for this task:
- **Use kebab-case filenames** for check-in components (e.g. `severity-scale.tsx`, `checkin-widget.tsx`).
- **Inline styles only** (no `StyleSheet.create`) unless reuse is clearly faster.
- **Avoid `SafeAreaView`**; use `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` where needed.
- Prefer **`expo-symbols`** for icons instead of `@expo/vector-icons`.
- Use `process.env.EXPO_OS` instead of `Platform.OS` where platform checks are required.
- Prefer `useWindowDimensions` over `Dimensions.get()` for layout sizing.

## Why This Task

Check-in widgets are the core innovation:
- They turn symptom tracking into a ~30 second interaction
- They're tailored to each symptom type
- They enable structured data collection
- They make tracking feel conversational

---

## Components to Build (P0 - Basic)

| Component | Description |
|-----------|-------------|
| `CheckinWidget` | Container that renders a check-in screen from schema |
| `SeverityScale` | Pain/intensity rating (multiple scale types) |
| `YesNo` | Simple yes/no toggle |
| `SingleSelect` | Choose one option |
| `MultiSelect` | Choose multiple options |
| `FreeText` | Open text input |
| `CheckinSummary` | Collapsed view after submission |

---

## Detailed Instructions

### 1. Project Structure

```
src/components/checkin/
├── index.ts
├── types.ts
├── checkin-widget.tsx
├── checkin-summary.tsx
├── basic/
│   ├── index.ts
│   ├── severity-scale.tsx
│   ├── yes-no.tsx
│   ├── single-select.tsx
│   ├── multi-select.tsx
│   └── free-text.tsx
└── component-renderer.tsx
```

### 2. Shared Types (`src/components/checkin/types.ts`)

```typescript
export interface ComponentProps<T = any> {
  id: string;
  prompt: string;
  value: T | undefined;
  onChange: (value: T) => void;
  disabled?: boolean;
  showPrevious?: boolean;
  previousValue?: T;
}

// Re-export from chat types
export type { CheckinScreen, CheckinSection, CheckinComponent } from '@components/chat/types';
```

### 3. SeverityScale Component (`src/components/checkin/basic/SeverityScale.tsx`)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentProps } from '../types';
import { colors, spacing, radius, typography } from '@theme';

type ScaleType = 'numeric_1_10' | 'numeric_1_5' | 'faces' | 'visual_analog' | 'traffic_light' | 'descriptive';

interface SeverityScaleProps extends ComponentProps<number> {
  scale_type: ScaleType;
  min_label: string;
  max_label: string;
  show_previous?: boolean;
}

const FACES = ['😄', '🙂', '😐', '🙁', '😣'];

const TRAFFIC_LIGHT = [
  { value: 1, label: 'Good', color: '#4ADE80' },
  { value: 2, label: 'Okay', color: '#FBBF24' },
  { value: 3, label: 'Bad', color: '#F87171' },
];

const DESCRIPTIVE = ['None', 'Mild', 'Moderate', 'Severe'];

export function SeverityScale({
  id,
  prompt,
  value,
  onChange,
  scale_type,
  min_label,
  max_label,
  show_previous,
  previousValue,
  disabled,
}: SeverityScaleProps) {
  const renderNumericScale = (min: number, max: number) => {
    const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
      <View style={styles.numericContainer}>
        <View style={styles.numericRow}>
          {numbers.map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => onChange(num)}
              disabled={disabled}
              style={[
                styles.numericButton,
                value === num && styles.numericButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.numericText,
                  value === num && styles.numericTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.labelsRow}>
          <Text style={styles.labelText}>{min_label}</Text>
          <Text style={styles.labelText}>{max_label}</Text>
        </View>
      </View>
    );
  };

  const renderFaces = () => (
    <View style={styles.facesContainer}>
      {FACES.map((face, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onChange(index + 1)}
          disabled={disabled}
          style={[
            styles.faceButton,
            value === index + 1 && styles.faceButtonSelected,
          ]}
        >
          <Text style={styles.faceEmoji}>{face}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTrafficLight = () => (
    <View style={styles.trafficContainer}>
      {TRAFFIC_LIGHT.map(({ value: v, label, color }) => (
        <TouchableOpacity
          key={v}
          onPress={() => onChange(v)}
          disabled={disabled}
          style={[
            styles.trafficButton,
            { backgroundColor: color },
            value === v && styles.trafficButtonSelected,
          ]}
        >
          <Text style={styles.trafficText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDescriptive = () => (
    <View style={styles.descriptiveContainer}>
      {DESCRIPTIVE.map((label, index) => (
        <TouchableOpacity
          key={label}
          onPress={() => onChange(index)}
          disabled={disabled}
          style={[
            styles.descriptiveButton,
            value === index && styles.descriptiveButtonSelected,
          ]}
        >
          <Text
            style={[
              styles.descriptiveText,
              value === index && styles.descriptiveTextSelected,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderScale = () => {
    switch (scale_type) {
      case 'numeric_1_10':
        return renderNumericScale(1, 10);
      case 'numeric_1_5':
        return renderNumericScale(1, 5);
      case 'faces':
        return renderFaces();
      case 'traffic_light':
        return renderTrafficLight();
      case 'descriptive':
        return renderDescriptive();
      default:
        return renderNumericScale(1, 10);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      {renderScale()}
      {show_previous && previousValue !== undefined && (
        <Text style={styles.previousValue}>Previous: {previousValue}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },

  // Numeric scale
  numericContainer: {
    gap: spacing.xs,
  },
  numericRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  numericButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericButtonSelected: {
    backgroundColor: colors.primary,
  },
  numericText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  numericTextSelected: {
    color: colors.surface,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelText: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Faces
  facesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faceButton: {
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  faceButtonSelected: {
    backgroundColor: colors.primaryLight,
    transform: [{ scale: 1.1 }],
  },
  faceEmoji: {
    fontSize: 28,
  },

  // Traffic light
  trafficContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trafficButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  trafficButtonSelected: {
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  trafficText: {
    ...typography.bodyMedium,
    color: colors.surface,
  },

  // Descriptive
  descriptiveContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  descriptiveButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  descriptiveButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  descriptiveText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  descriptiveTextSelected: {
    color: colors.surface,
  },

  previousValue: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
```

### 4. YesNo Component (`src/components/checkin/basic/YesNo.tsx`)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentProps } from '../types';
import { colors, spacing, radius, typography } from '@theme';

interface YesNoProps extends ComponentProps<boolean | 'maybe'> {
  show_maybe?: boolean;
}

export function YesNo({
  id,
  prompt,
  value,
  onChange,
  show_maybe = false,
  disabled,
}: YesNoProps) {
  const options = show_maybe
    ? [
        { value: true, label: 'Yes' },
        { value: 'maybe' as const, label: 'Maybe' },
        { value: false, label: 'No' },
      ]
    : [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={[
              styles.button,
              value === option.value && styles.buttonSelected,
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                value === option.value && styles.buttonTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: colors.primary,
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

### 5. SingleSelect Component (`src/components/checkin/basic/SingleSelect.tsx`)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentProps } from '../types';
import { colors, spacing, radius, typography } from '@theme';

interface Option {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SingleSelectProps extends ComponentProps<string> {
  options: Option[];
  display?: 'buttons' | 'chips' | 'list' | 'cards';
}

export function SingleSelect({
  id,
  prompt,
  value,
  onChange,
  options,
  display = 'buttons',
  disabled,
}: SingleSelectProps) {
  const renderButtons = () => (
    <View style={styles.buttonsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          disabled={disabled}
          style={[
            styles.button,
            value === option.value && styles.buttonSelected,
          ]}
        >
          {option.icon && <Text style={styles.icon}>{option.icon}</Text>}
          <Text
            style={[
              styles.buttonText,
              value === option.value && styles.buttonTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChips = () => (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          disabled={disabled}
          style={[
            styles.chip,
            value === option.value && styles.chipSelected,
          ]}
        >
          {option.icon && <Text>{option.icon}</Text>}
          <Text
            style={[
              styles.chipText,
              value === option.value && styles.chipTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderList = () => (
    <View style={styles.listContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          disabled={disabled}
          style={[
            styles.listItem,
            value === option.value && styles.listItemSelected,
          ]}
        >
          <View style={styles.listItemContent}>
            {option.icon && <Text style={styles.listIcon}>{option.icon}</Text>}
            <View>
              <Text style={styles.listLabel}>{option.label}</Text>
              {option.description && (
                <Text style={styles.listDescription}>{option.description}</Text>
              )}
            </View>
          </View>
          {value === option.value && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCards = () => (
    <View style={styles.cardsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          disabled={disabled}
          style={[
            styles.card,
            value === option.value && styles.cardSelected,
          ]}
        >
          {option.icon && <Text style={styles.cardIcon}>{option.icon}</Text>}
          <Text
            style={[
              styles.cardLabel,
              value === option.value && styles.cardLabelSelected,
            ]}
          >
            {option.label}
          </Text>
          {option.description && (
            <Text style={styles.cardDescription}>{option.description}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOptions = () => {
    switch (display) {
      case 'chips':
        return renderChips();
      case 'list':
        return renderList();
      case 'cards':
        return renderCards();
      default:
        return renderButtons();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      {renderOptions()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },

  // Buttons
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    gap: spacing.xs,
  },
  buttonSelected: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  buttonTextSelected: {
    color: colors.surface,
  },
  icon: {
    fontSize: 16,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.surface,
  },

  // List
  listContainer: {
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listItemSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  listIcon: {
    fontSize: 20,
  },
  listLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  listDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  checkmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
  },

  // Cards
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  cardSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  cardLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: colors.primary,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
```

### 6. MultiSelect Component (`src/components/checkin/basic/MultiSelect.tsx`)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ComponentProps } from '../types';
import { colors, spacing, radius, typography } from '@theme';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface MultiSelectProps extends ComponentProps<string[]> {
  options: Option[];
  min_selections?: number;
  max_selections?: number;
  display?: 'chips' | 'checkboxes' | 'grid';
}

export function MultiSelect({
  id,
  prompt,
  value = [],
  onChange,
  options,
  min_selections = 0,
  max_selections,
  display = 'chips',
  disabled,
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    const currentValues = value || [];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      onChange(currentValues.filter((v) => v !== optionValue));
    } else {
      if (max_selections && currentValues.length >= max_selections) {
        return;
      }
      onChange([...currentValues, optionValue]);
    }
  };

  const isSelected = (optionValue: string) => (value || []).includes(optionValue);

  const renderChips = () => (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => toggleOption(option.value)}
          disabled={disabled}
          style={[
            styles.chip,
            isSelected(option.value) && styles.chipSelected,
          ]}
        >
          {option.icon && <Text>{option.icon}</Text>}
          <Text
            style={[
              styles.chipText,
              isSelected(option.value) && styles.chipTextSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCheckboxes = () => (
    <View style={styles.checkboxContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => toggleOption(option.value)}
          disabled={disabled}
          style={[
            styles.checkbox,
            isSelected(option.value) && styles.checkboxSelected,
          ]}
        >
          <View
            style={[
              styles.checkboxBox,
              isSelected(option.value) && styles.checkboxBoxSelected,
            ]}
          >
            {isSelected(option.value) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          {option.icon && <Text style={styles.checkboxIcon}>{option.icon}</Text>}
          <Text style={styles.checkboxLabel}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGrid = () => (
    <View style={styles.gridContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => toggleOption(option.value)}
          disabled={disabled}
          style={[
            styles.gridItem,
            isSelected(option.value) && styles.gridItemSelected,
          ]}
        >
          {option.icon && <Text style={styles.gridIcon}>{option.icon}</Text>}
          <Text
            style={[
              styles.gridLabel,
              isSelected(option.value) && styles.gridLabelSelected,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOptions = () => {
    switch (display) {
      case 'checkboxes':
        return renderCheckboxes();
      case 'grid':
        return renderGrid();
      default:
        return renderChips();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>
        {prompt}
        {max_selections && (
          <Text style={styles.hint}> (Select up to {max_selections})</Text>
        )}
      </Text>
      {renderOptions()}
      {min_selections > 0 && (value || []).length < min_selections && (
        <Text style={styles.warning}>
          Please select at least {min_selections} option{min_selections > 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  chipTextSelected: {
    color: colors.surface,
  },

  // Checkboxes
  checkboxContainer: {
    gap: spacing.sm,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    gap: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.primaryLight,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  checkboxIcon: {
    fontSize: 16,
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    width: '48%',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
  },
  gridItemSelected: {
    backgroundColor: colors.primary,
  },
  gridIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  gridLabel: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gridLabelSelected: {
    color: colors.surface,
  },
});
```

### 7. FreeText Component (`src/components/checkin/basic/FreeText.tsx`)

```tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ComponentProps } from '../types';
import { colors, spacing, radius, typography } from '@theme';

interface FreeTextProps extends ComponentProps<string> {
  placeholder?: string;
  max_length?: number;
  optional?: boolean;
}

export function FreeText({
  id,
  prompt,
  value = '',
  onChange,
  placeholder,
  max_length = 500,
  optional = true,
  disabled,
}: FreeTextProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>
        {prompt}
        {optional && <Text style={styles.optional}> (Optional)</Text>}
      </Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        maxLength={max_length}
        editable={!disabled}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>
        {(value || '').length}/{max_length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  optional: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    color: colors.textPrimary,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
  },
});
```

### 8. Basic Index (`src/components/checkin/basic/index.ts`)

```typescript
export { SeverityScale } from './SeverityScale';
export { YesNo } from './YesNo';
export { SingleSelect } from './SingleSelect';
export { MultiSelect } from './MultiSelect';
export { FreeText } from './FreeText';
```

### 9. ComponentRenderer (`src/components/checkin/ComponentRenderer.tsx`)

```tsx
import React from 'react';
import { View } from 'react-native';
import { SeverityScale, YesNo, SingleSelect, MultiSelect, FreeText } from './basic';
import { CheckinComponent } from './types';

interface ComponentRendererProps {
  component: CheckinComponent;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  previousValue?: any;
}

export function ComponentRenderer({
  component,
  value,
  onChange,
  disabled,
  previousValue,
}: ComponentRendererProps) {
  const commonProps = {
    id: component.id,
    prompt: component.prompt,
    value,
    onChange,
    disabled,
    previousValue,
  };

  switch (component.type) {
    case 'severity_scale':
      return (
        <SeverityScale
          {...commonProps}
          scale_type={component.scale_type}
          min_label={component.min_label}
          max_label={component.max_label}
          show_previous={component.show_previous}
        />
      );

    case 'yes_no':
      return (
        <YesNo
          {...commonProps}
          show_maybe={component.show_maybe}
        />
      );

    case 'single_select':
      return (
        <SingleSelect
          {...commonProps}
          options={component.options}
          display={component.display}
        />
      );

    case 'multi_select':
      return (
        <MultiSelect
          {...commonProps}
          options={component.options}
          min_selections={component.min_selections}
          max_selections={component.max_selections}
          display={component.display}
        />
      );

    case 'free_text':
      return (
        <FreeText
          {...commonProps}
          placeholder={component.placeholder}
          max_length={component.max_length}
          optional={component.optional}
        />
      );

    // Placeholder for P1/P2 components
    default:
      return (
        <View style={{ padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
          {/* Component type "{component.type}" not yet implemented */}
        </View>
      );
  }
}
```

### 10. CheckinWidget (`src/components/checkin/CheckinWidget.tsx`)

```tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, H2, Body } from '@components/shared';
import { ComponentRenderer } from './ComponentRenderer';
import { CheckinScreen, CheckinSection } from './types';
import { colors, spacing, radius, typography } from '@theme';

interface CheckinWidgetProps {
  screen: CheckinScreen;
  onSubmit: (answers: Record<string, any>) => void;
  onSkip?: () => void;
  initialValues?: Record<string, any>;
  previousValues?: Record<string, any>;
  disabled?: boolean;
}

export function CheckinWidget({
  screen,
  onSubmit,
  onSkip,
  initialValues = {},
  previousValues = {},
  disabled = false,
}: CheckinWidgetProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(initialValues);

  const updateAnswer = useCallback((componentId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [componentId]: value }));
  }, []);

  const shouldShowSection = (section: CheckinSection): boolean => {
    if (!section.show_if) return true;

    const { component_id, condition, value: targetValue } = section.show_if;
    const currentValue = answers[component_id];

    switch (condition) {
      case 'equals':
        return currentValue === targetValue;
      case 'not_equals':
        return currentValue !== targetValue;
      case 'contains':
        return Array.isArray(currentValue) && currentValue.includes(targetValue);
      case 'gt':
        return typeof currentValue === 'number' && currentValue > targetValue;
      case 'lt':
        return typeof currentValue === 'number' && currentValue < targetValue;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <Card variant="elevated" padding="none" style={styles.container}>
      <View style={styles.header}>
        <H2>{screen.title}</H2>
        {screen.subtitle && (
          <Body color="secondary">{screen.subtitle}</Body>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {screen.sections.map((section) =>
          shouldShowSection(section) ? (
            <View key={section.id} style={styles.section}>
              {section.title && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              {section.description && (
                <Text style={styles.sectionDescription}>{section.description}</Text>
              )}
              <View style={styles.components}>
                {section.components.map((component) => (
                  <ComponentRenderer
                    key={component.id}
                    component={component}
                    value={answers[component.id]}
                    onChange={(value) => updateAnswer(component.id, value)}
                    disabled={disabled}
                    previousValue={previousValues[component.id]}
                  />
                ))}
              </View>
            </View>
          ) : null
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={screen.submit_label}
          onPress={handleSubmit}
          disabled={disabled}
          fullWidth
        />
        {screen.allow_skip && onSkip && (
          <Button
            title="Skip for now"
            variant="ghost"
            onPress={onSkip}
            disabled={disabled}
          />
        )}
        <Text style={styles.estimate}>
          ~{screen.estimated_time_seconds}s to complete
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    maxHeight: '60%',
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollView: {
    maxHeight: 300,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  components: {
    gap: spacing.md,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    alignItems: 'center',
  },
  estimate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
```

### 11. CheckinSummary (`src/components/checkin/CheckinSummary.tsx`)

```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@theme';

interface CheckinSummaryProps {
  title: string;
  summary: string;
  submittedAt: string;
  onPress?: () => void;
}

export function CheckinSummary({
  title,
  summary,
  submittedAt,
  onPress,
}: CheckinSummaryProps) {
  const formattedTime = new Date(submittedAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.icon}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>
        <Text style={styles.summary} numberOfLines={1}>
          {summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  summary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
```

### 12. Main Index (`src/components/checkin/index.ts`)

```typescript
export { CheckinWidget } from './CheckinWidget';
export { CheckinSummary } from './CheckinSummary';
export { ComponentRenderer } from './ComponentRenderer';
export * from './basic';
export * from './types';
```

---

## Acceptance Criteria

- [ ] SeverityScale supports all 6 scale types
- [ ] YesNo supports optional "maybe" option
- [ ] SingleSelect supports all 4 display modes
- [ ] MultiSelect respects min/max selection constraints
- [ ] FreeText shows character count
- [ ] CheckinWidget renders sections with conditional visibility
- [ ] CheckinSummary shows collapsed completed state
- [ ] All components handle disabled state

---

## Files to Create

```
src/components/checkin/
├── index.ts
├── types.ts
├── CheckinWidget.tsx
├── CheckinSummary.tsx
├── ComponentRenderer.tsx
└── basic/
    ├── index.ts
    ├── SeverityScale.tsx
    ├── YesNo.tsx
    ├── SingleSelect.tsx
    ├── MultiSelect.tsx
    └── FreeText.tsx
```

---

## Next Task

After completing the check-in widgets, proceed to **Task 05: Drawer** to build the thread list navigation.
