# Task 01: Project Setup (React Native / Expo)

## Task Description

Initialize the React Native project using Expo, configure dependencies, set up the folder structure, and establish development tooling.

## Why This Task First

Every other client task depends on:
- Expo project being initialized
- Navigation configured
- Dependencies installed
- TypeScript properly configured

---

## Detailed Instructions

### 1. Create Expo Project

```bash
# Create new Expo project with TypeScript template
npx create-expo-app@latest cadence-mobile --template expo-template-blank-typescript

cd cadence-mobile
```

### 2. Install Dependencies

```bash
# Navigation
npx expo install expo-router react-native-screens react-native-safe-area-context

# Drawer navigation
npx expo install @react-navigation/drawer react-native-gesture-handler react-native-reanimated

# State management
npm install zustand

# Data fetching
npm install @tanstack/react-query

# HTTP client
npm install axios

# Notifications
npx expo install expo-notifications expo-device expo-constants

# Storage
npx expo install @react-native-async-storage/async-storage

# Animations (already included with drawer, but ensure latest)
npx expo install react-native-reanimated

# Development
npm install -D @types/react @types/react-native
```

### 3. Configure app.json

```json
{
  "expo": {
    "name": "Cadence",
    "slug": "cadence-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.cadence.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.cadence.mobile"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#3B82F6"
        }
      ]
    ],
    "scheme": "cadence"
  }
}
```

### 4. Configure TypeScript (tsconfig.json)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@stores/*": ["src/stores/*"],
      "@services/*": ["src/services/*"],
      "@utils/*": ["src/utils/*"],
      "@theme/*": ["src/theme/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### 5. Configure babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@stores': './src/stores',
            '@services': './src/services',
            '@utils': './src/utils',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
```

Install module-resolver:
```bash
npm install -D babel-plugin-module-resolver
```

### 6. Create Directory Structure

```bash
mkdir -p src/{components,screens,hooks,stores,services,utils,theme,types}
mkdir -p src/components/{checkin,insights,chat,shared}
mkdir -p src/components/checkin/{basic,body-maps,time,context,anatomical}
```

Final structure:

```
cadence-mobile/
├── src/
│   ├── components/
│   │   ├── checkin/           # Check-in widget components
│   │   │   ├── basic/         # SeverityScale, YesNo, etc.
│   │   │   ├── body-maps/     # BodyMap, PainMap
│   │   │   ├── time/          # TimeSelector, DurationInput
│   │   │   ├── context/       # TriggerChecklist, ContextCapture
│   │   │   └── anatomical/    # AnatomicalSelector
│   │   ├── insights/          # InsightCard, Charts
│   │   ├── chat/              # Message bubbles, input
│   │   └── shared/            # Card, Button, Chip, etc.
│   ├── screens/
│   │   ├── ChatScreen.tsx
│   │   └── ThreadListScreen.tsx
│   ├── hooks/
│   │   ├── useThread.ts
│   │   ├── useCheckin.ts
│   │   └── useNotifications.ts
│   ├── stores/
│   │   ├── threadStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── notifications.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── types/
│       ├── api.ts
│       └── components.ts
├── app/
│   ├── _layout.tsx            # Root layout with providers
│   ├── index.tsx              # Entry point -> ChatScreen
│   └── (drawer)/
│       ├── _layout.tsx        # Drawer layout
│       └── index.tsx          # Main chat
├── assets/
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

### 7. Configure Expo Router

Create `app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

Create `app/(drawer)/_layout.tsx`:

```tsx
import { Drawer } from 'expo-router/drawer';
import { colors } from '@theme';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerTitle: 'Cadence',
        headerTitleAlign: 'center',
        drawerStyle: {
          backgroundColor: colors.drawerBackground,
          width: 280,
        },
        drawerActiveTintColor: colors.primary,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Chat',
          title: 'Cadence',
        }}
      />
    </Drawer>
  );
}
```

Create `app/(drawer)/index.tsx`:

```tsx
import { ChatScreen } from '@screens/ChatScreen';

export default function Home() {
  return <ChatScreen />;
}
```

### 8. Create Theme Files

Create `src/theme/colors.ts`:

```typescript
export const colors = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',

  // Text
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Accents
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Severity gradient
  severityLow: '#4ADE80',
  severityMid: '#FBBF24',
  severityHigh: '#F87171',

  // Borders
  border: '#E5E7EB',
  borderFocused: '#3B82F6',

  // Drawer
  drawerBackground: '#F9FAFB',
  drawerOverlay: 'rgba(0,0,0,0.3)',
} as const;

export type ColorKey = keyof typeof colors;
```

Create `src/theme/spacing.ts`:

```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;
```

Create `src/theme/typography.ts`:

```typescript
import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
} as const;

export type TypographyKey = keyof typeof typography;
```

Create `src/theme/index.ts`:

```typescript
export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  widget: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;
```

### 9. Create Environment Config

Create `src/services/config.ts`:

```typescript
// For development, use your local machine's IP address
// In production, this would be your actual API URL
const DEV_API_URL = 'http://192.168.1.XXX:3000'; // Replace with your local IP

export const config = {
  apiUrl: __DEV__ ? DEV_API_URL : 'https://api.cadence.health',
} as const;
```

### 10. Create Placeholder Screen

Create `src/screens/ChatScreen.tsx`:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@theme';

export function ChatScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadence</Text>
        <Text style={styles.subtitle}>
          Your symptom tracking assistant
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
```

---

## Testing Instructions

### Verify Setup

```bash
# Start the dev server
npx expo start

# Test on iOS Simulator
npx expo run:ios

# Test on Android Emulator
npx expo run:android

# Or scan QR code with Expo Go app on physical device
```

### Verify TypeScript

```bash
# Type check
npx tsc --noEmit
```

### Verify Path Aliases

Try importing from path aliases in any file:
```typescript
import { colors } from '@theme';
import { ChatScreen } from '@screens/ChatScreen';
```

---

## Acceptance Criteria

- [ ] Expo project initialized with TypeScript
- [ ] All dependencies installed
- [ ] Directory structure created
- [ ] Theme files with design tokens configured
- [ ] Expo Router configured with drawer navigation
- [ ] Path aliases working
- [ ] App runs on simulator/device
- [ ] TypeScript compiles without errors

---

## Files to Create

```
cadence-mobile/
├── app/
│   ├── _layout.tsx
│   └── (drawer)/
│       ├── _layout.tsx
│       └── index.tsx
├── src/
│   ├── screens/
│   │   └── ChatScreen.tsx
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   └── services/
│       └── config.ts
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## Next Task

After completing the project setup, proceed to **Task 02: Design System** to build the core UI components.
