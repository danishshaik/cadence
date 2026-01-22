# Task 07: Push Notifications (React Native)

## Task Description

Implement push notification handling for check-in nudges. The backend sends notifications via Expo Push SDK, and the client needs to register, receive, and respond to these notifications.

## Why This Task

Notifications are critical for engagement because:
- They prompt users to log check-ins at optimal times
- They reduce user burden (no need to remember)
- They enable passive data collection
- They drive consistent tracking behavior

---

## Components to Build

| Component | Description |
|-----------|-------------|
| `notifications.ts` | Push notification service with registration |
| `useNotifications` | Hook to handle notification state and actions |
| `NotificationHandler` | Component to process received notifications |

---

## Detailed Instructions

### 1. Project Structure

```
src/
├── services/
│   └── notifications.ts
├── hooks/
│   └── useNotifications.ts
└── components/
    └── NotificationHandler.tsx
```

### 2. Notification Service (`src/services/notifications.ts`)

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

export interface NudgeNotification {
  type: 'nudge';
  threadId: string;
  title: string;
  body: string;
  checkinScreenId?: string;
}

export interface InsightNotification {
  type: 'insight_ready';
  threadId: string;
  title: string;
  body: string;
}

export type CadenceNotification = NudgeNotification | InsightNotification;

/**
 * Register for push notifications and get the token
 */
export async function registerForPushNotifications(): Promise<PushToken | null> {
  // Only works on physical devices
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted');
    return null;
  }

  // Get Expo push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return {
      token: tokenData.data,
      type: 'expo',
    };
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Configure Android notification channel
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('check-in-nudges', {
      name: 'Check-in Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });

    await Notifications.setNotificationChannelAsync('insights', {
      name: 'Insights',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/**
 * Parse notification data into typed object
 */
export function parseNotificationData(
  data: Record<string, any> | undefined
): CadenceNotification | null {
  if (!data || !data.type) {
    return null;
  }

  switch (data.type) {
    case 'nudge':
      return {
        type: 'nudge',
        threadId: data.threadId,
        title: data.title || 'Time to check in',
        body: data.body || 'How are you feeling?',
        checkinScreenId: data.checkinScreenId,
      };

    case 'insight_ready':
      return {
        type: 'insight_ready',
        threadId: data.threadId,
        title: data.title || 'Insights Ready',
        body: data.body || "We've found some patterns in your data",
      };

    default:
      return null;
  }
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: Record<string, any>,
  delaySeconds: number = 5
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: {
      seconds: delaySeconds,
    },
  });

  return id;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get badge count
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

/**
 * Set badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear badge
 */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
```

### 3. useNotifications Hook (`src/hooks/useNotifications.ts`)

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  registerForPushNotifications,
  setupNotificationChannel,
  parseNotificationData,
  clearBadge,
  CadenceNotification,
  PushToken,
} from '@services/notifications';
import { useUserStore } from '@stores/userStore';
import { useThreadStore } from '@stores/threadStore';

interface UseNotificationsReturn {
  pushToken: PushToken | null;
  isRegistered: boolean;
  lastNotification: CadenceNotification | null;
  registerPushToken: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const setPushToken = useUserStore((state) => state.setPushToken);
  const setActiveThread = useThreadStore((state) => state.setActiveThread);

  const [pushToken, setPushTokenState] = useState<PushToken | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [lastNotification, setLastNotification] = useState<CadenceNotification | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Handle received notification (while app is open)
  const handleNotification = useCallback((notification: Notifications.Notification) => {
    const data = notification.request.content.data;
    const parsed = parseNotificationData(data);

    if (parsed) {
      setLastNotification(parsed);
      console.log('Notification received:', parsed);
    }
  }, []);

  // Handle notification response (user tapped notification)
  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const parsed = parseNotificationData(data);

      if (!parsed) return;

      // Clear badge when user interacts
      clearBadge();

      // Navigate based on notification type
      switch (parsed.type) {
        case 'nudge':
          // Switch to the thread and show check-in
          setActiveThread(parsed.threadId);
          router.push('/');
          break;

        case 'insight_ready':
          // Switch to thread and highlight insights
          setActiveThread(parsed.threadId);
          router.push('/');
          break;
      }
    },
    [router, setActiveThread]
  );

  // Register for push notifications
  const registerPushToken = useCallback(async () => {
    try {
      // Setup Android channel first
      await setupNotificationChannel();

      // Get push token
      const token = await registerForPushNotifications();

      if (token) {
        setPushTokenState(token);
        setPushToken(token.token);
        setIsRegistered(true);

        // TODO: Send token to backend
        // await cadenceApi.registerPushToken(token.token);

        console.log('Push token registered:', token.token);
      }
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }, [setPushToken]);

  // Setup listeners on mount
  useEffect(() => {
    // Register for push notifications
    registerPushToken();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotification
    );

    // Listen for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Clear badge on app open
    clearBadge();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [handleNotification, handleNotificationResponse, registerPushToken]);

  // Check for notification that launched the app
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });
  }, [handleNotificationResponse]);

  return {
    pushToken,
    isRegistered,
    lastNotification,
    registerPushToken,
  };
}
```

### 4. NotificationHandler Component (`src/components/NotificationHandler.tsx`)

```tsx
import React, { useEffect } from 'react';
import { useNotifications } from '@hooks/useNotifications';
import { useThreadStore } from '@stores/threadStore';

interface NotificationHandlerProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that handles push notification side effects
 * Should be placed near the root of the app
 */
export function NotificationHandler({ children }: NotificationHandlerProps) {
  const { lastNotification, isRegistered } = useNotifications();
  const updateThread = useThreadStore((state) => state.updateThread);

  // Handle nudge notification effects
  useEffect(() => {
    if (!lastNotification) return;

    switch (lastNotification.type) {
      case 'nudge':
        // Could show an in-app banner or highlight
        console.log('Nudge received for thread:', lastNotification.threadId);
        break;

      case 'insight_ready':
        // Mark thread as having new insights
        updateThread(lastNotification.threadId, {
          hasUnreadInsights: true,
          phase: 'insight_ready',
        });
        break;
    }
  }, [lastNotification, updateThread]);

  return <>{children}</>;
}
```

### 5. Update Root Layout (`app/_layout.tsx`)

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NotificationHandler } from '@components/NotificationHandler';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <QueryClientProvider client={queryClient}>
        <NotificationHandler>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(drawer)" />
          </Stack>
        </NotificationHandler>
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

### 6. In-App Notification Banner (Optional)

```tsx
// src/components/shared/NotificationBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '@theme';

interface NotificationBannerProps {
  title: string;
  body: string;
  onPress?: () => void;
  onDismiss?: () => void;
  duration?: number; // Auto-dismiss after ms
}

export function NotificationBanner({
  title,
  body,
  onPress,
  onDismiss,
  duration = 5000,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const translateY = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    // Slide in
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Auto dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={20} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
        <TouchableOpacity onPress={handleDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // Below status bar
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.widget,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  body: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
```

---

## Testing Instructions

### Test on Physical Device

Push notifications only work on physical devices, not simulators.

### Schedule Test Notification

Add a dev-only button to test notifications:

```tsx
// In ChatScreen or a debug screen
import { scheduleLocalNotification } from '@services/notifications';

const handleTestNotification = async () => {
  await scheduleLocalNotification(
    'Time to check in',
    'How are you feeling today?',
    {
      type: 'nudge',
      threadId: activeThread?.id,
    },
    5 // 5 seconds delay
  );
};
```

### Verify Registration

```tsx
const { pushToken, isRegistered } = useNotifications();
console.log('Push token:', pushToken);
console.log('Is registered:', isRegistered);
```

---

## Acceptance Criteria

- [ ] App requests notification permissions on first launch
- [ ] Push token is obtained and stored
- [ ] Nudge notifications open the correct thread
- [ ] Insight notifications navigate to insights view
- [ ] Badge is cleared when app is opened
- [ ] In-app notifications shown when app is foregrounded
- [ ] Android notification channels configured

---

## Files to Create

```
src/
├── services/
│   └── notifications.ts
├── hooks/
│   └── useNotifications.ts
└── components/
    ├── NotificationHandler.tsx
    └── shared/
        └── NotificationBanner.tsx
```

---

## Backend Integration Notes

The backend sends push notifications in this format:

```typescript
// Nudge notification
{
  to: "ExponentPushToken[xxx]",
  title: "Time to check in",
  body: "How are you feeling?",
  data: {
    type: "nudge",
    threadId: "uuid",
    checkinScreenId: "screen-id"
  }
}

// Insight notification
{
  to: "ExponentPushToken[xxx]",
  title: "Insights Ready",
  body: "We've found some patterns in your data",
  data: {
    type: "insight_ready",
    threadId: "uuid"
  }
}
```

---

## Next Task

After completing notifications, proceed to **Task 08: Animations** to polish transitions and interactions.
