# Cadence Development Guide

## SwiftUI Integration with Expo

### Critical Rule: Always Wrap SwiftUI Components with `<Host>`

When using SwiftUI components from `@expo/ui/swift-ui`, you **must** wrap them in a `<Host>` component. This is required because SwiftUI views need a bridge to work within React Native's UIView hierarchy.

#### Why This Matters

SwiftUI views cannot be directly inserted as children of standard React Native `<View>` components. Without the `<Host>` wrapper, you'll get this runtime exception:

```
SwiftUIVirtualViewException: A SwiftUI view is inserted as a child of a standard UIView.
Double check that in JSX you have wrapped your component with `<Host>` from '@expo/ui/swift-ui'.
```

#### Pattern to Follow

`<Host>` must wrap the **entire** SwiftUI component tree. It goes on the **outside**, not the inside.

```tsx
import { Host, BottomSheet, Group } from "@expo/ui/swift-ui";

// ✅ CORRECT: Host wraps the entire SwiftUI tree from the outside
<Host>
  <BottomSheet isPresented={isOpen}>
    <Group>
      <View>
        {/* Your React Native content */}
      </View>
    </Group>
  </BottomSheet>
</Host>

// ❌ WRONG: Host only wrapping inner content
<BottomSheet isPresented={isOpen}>
  <Group>
    <Host>
      <View>{/* Layout issues! */}</View>
    </Host>
  </Group>
</BottomSheet>

// ❌ WRONG: React Native content without <Host> wrapper at all
<BottomSheet isPresented={isOpen}>
  <View>{/* This will crash! */}</View>
</BottomSheet>
```

#### Common SwiftUI Components That Require `<Host>`

- `BottomSheet`
- `Group`
- `Slider`
- `DatePicker`
- `NavigationStack`
- `List`
- `Picker`
- Any other component from `@expo/ui/swift-ui`

#### Wrapper Components (Already Fixed)

The following wrapper components in `src/components/ui/` already have `<Host>` correctly implemented:

- `ExpoSlider` (iOS implementation)
- `ExpoDateTimePicker` (iOS implementation)

When using these wrapper components, you don't need to add additional `<Host>` wrappers.

#### Files Using SwiftUI Components

Current files with SwiftUI integration:

1. `src/components/migraine/log-flow/when-step.tsx` - BottomSheet with DatePicker
2. `src/components/ui/expo-slider.ios.tsx` - Slider wrapper
3. `src/components/ui/expo-datetime-picker.ios.tsx` - DatePicker wrapper

#### Best Practices

1. **Always import `Host`** when importing SwiftUI components
2. **`<Host>` wraps the entire SwiftUI tree** - place `<Host>` on the **outside**, wrapping the top-level SwiftUI component (e.g., `<BottomSheet>`, `<Slider>`)
3. **Don't nest multiple `<Host>` wrappers** unnecessarily
4. **Create wrapper components** for reusable SwiftUI components (like ExpoSlider, ExpoDateTimePicker)
5. **Test on iOS** after adding SwiftUI components to ensure no runtime crashes

**Key Rule**: `<Host>` wraps everything. Place it around the outermost SwiftUI component, not around inner React Native content.

#### Example: BottomSheet Implementation

```tsx
import { BottomSheet, Group, Host } from "@expo/ui/swift-ui";
import { presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers";

export function MyComponent() {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <View>
      {/* Standard React Native components */}
      <Pressable onPress={() => setShowSheet(true)}>
        <Text>Open Sheet</Text>
      </Pressable>

      {/* Host wraps the entire SwiftUI tree */}
      {Platform.OS === 'ios' && (
        <Host>
          <BottomSheet
            isPresented={showSheet}
            onIsPresentedChange={setShowSheet}
            fitToContents
          >
            <Group
              modifiers={[
                presentationDetents([{ height: 360 }]),
                presentationDragIndicator("visible"),
              ]}
            >
              <View style={styles.sheetContent}>
                {/* Your React Native sheet content */}
              </View>
            </Group>
          </BottomSheet>
        </Host>
      )}
    </View>
  );
}
```

## React Native Best Practices

### Platform-Specific Code

Use Platform.OS checks or platform-specific files (.ios.tsx, .android.tsx) when implementing platform-specific features.

### Component Organization

- UI components: `src/components/ui/`
- Feature components: `src/components/[feature]/`
- Platform-specific implementations use file extensions: `.ios.tsx`, `.android.tsx`
