# Task 05: Drawer Navigation (React Native)

## Task Description

Build the drawer navigation that allows users to switch between symptom threads. This is the primary navigation pattern for managing multiple tracking sessions.

## UI Implementation Notes (Override)

Follow the Expo UI skill guidance for this task:
- **Use kebab-case filenames** for navigation components (e.g. `drawer-content.tsx`).
- **Inline styles only** (no `StyleSheet.create`) unless reuse is clearly faster.
- **Avoid `SafeAreaView`**; use `ScrollView` with `contentInsetAdjustmentBehavior="automatic"` where needed.
- Prefer **`expo-symbols`** for icons instead of `@expo/vector-icons`.
- Use `process.env.EXPO_OS` instead of `Platform.OS` where platform checks are required.

## Why This Task

The drawer is essential because:
- Users may track multiple symptoms simultaneously
- Quick switching between threads improves UX
- Shows tracking progress at a glance
- Provides access to settings

---

## Components to Build

| Component | Description |
|-----------|-------------|
| `DrawerContent` | Custom drawer content with thread list |
| `ThreadListItem` | Individual thread in the drawer |
| `ThreadSection` | Grouped threads (active, paused, completed) |
| `NewThreadButton` | Button to start a new symptom thread |

---

## Detailed Instructions

### 1. Project Structure

```
src/
├── components/
│   └── navigation/
│       ├── index.ts
│       ├── drawer-content.tsx
│       ├── thread-list-item.tsx
│       ├── thread-section.tsx
│       └── new-thread-button.tsx
└── stores/
    └── thread-store.ts
```

### 2. Thread Store (`src/stores/threadStore.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Thread {
  id: string;
  symptomSummary: string | null;
  symptomCategory?: string;
  phase: 'intake' | 'clarifying' | 'tracking' | 'insight_ready';
  status: 'active' | 'paused' | 'completed';
  lastCheckinAt: string | null;
  checkinCount: number;
  createdAt: string;
  hasUnreadInsights?: boolean;
}

interface ThreadStore {
  threads: Thread[];
  activeThreadId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setThreads: (threads: Thread[]) => void;
  setActiveThread: (threadId: string | null) => void;
  addThread: (thread: Thread) => void;
  updateThread: (threadId: string, updates: Partial<Thread>) => void;
  removeThread: (threadId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markInsightsRead: (threadId: string) => void;
}

export const useThreadStore = create<ThreadStore>()(
  persist(
    (set, get) => ({
      threads: [],
      activeThreadId: null,
      isLoading: false,
      error: null,

      setThreads: (threads) => set({ threads }),

      setActiveThread: (threadId) => set({ activeThreadId: threadId }),

      addThread: (thread) =>
        set((state) => ({
          threads: [thread, ...state.threads],
          activeThreadId: thread.id,
        })),

      updateThread: (threadId, updates) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId ? { ...t, ...updates } : t
          ),
        })),

      removeThread: (threadId) =>
        set((state) => ({
          threads: state.threads.filter((t) => t.id !== threadId),
          activeThreadId:
            state.activeThreadId === threadId
              ? state.threads[0]?.id ?? null
              : state.activeThreadId,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      markInsightsRead: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId ? { ...t, hasUnreadInsights: false } : t
          ),
        })),
    }),
    {
      name: 'cadence-threads',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        threads: state.threads,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);

// Selectors
export const useActiveThread = () =>
  useThreadStore((state) =>
    state.threads.find((t) => t.id === state.activeThreadId)
  );

export const useThreadsByStatus = () =>
  useThreadStore((state) => ({
    active: state.threads.filter((t) => t.status === 'active'),
    paused: state.threads.filter((t) => t.status === 'paused'),
    completed: state.threads.filter((t) => t.status === 'completed'),
  }));
```

### 3. ThreadListItem Component (`src/components/navigation/ThreadListItem.tsx`)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@components/shared';
import { Thread } from '@stores/threadStore';
import { colors, spacing, radius, typography } from '@theme';

interface ThreadListItemProps {
  thread: Thread;
  isActive: boolean;
  onPress: () => void;
}

const STATUS_ICONS = {
  intake: 'chatbubble-outline',
  clarifying: 'help-circle-outline',
  tracking: 'pulse-outline',
  insight_ready: 'bulb-outline',
} as const;

const CATEGORY_ICONS: Record<string, string> = {
  pain: '🩹',
  skin: '🔬',
  digestive: '🍽️',
  respiratory: '🫁',
  sleep: '😴',
  fatigue: '⚡',
  default: '📋',
};

export function ThreadListItem({ thread, isActive, onPress }: ThreadListItemProps) {
  const icon = CATEGORY_ICONS[thread.symptomCategory || 'default'] || CATEGORY_ICONS.default;
  const statusIcon = STATUS_ICONS[thread.phase];

  const formatLastCheckin = () => {
    if (!thread.lastCheckinAt) return null;

    const date = new Date(thread.lastCheckinAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.categoryIcon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>
            {thread.symptomSummary || 'New symptom'}
          </Text>
          {thread.hasUnreadInsights && (
            <View style={styles.unreadDot} />
          )}
        </View>

        <View style={styles.meta}>
          <Ionicons
            name={statusIcon}
            size={12}
            color={isActive ? colors.primary : colors.textTertiary}
          />
          <Text style={styles.metaText}>
            {thread.phase === 'tracking'
              ? `${thread.checkinCount} check-in${thread.checkinCount !== 1 ? 's' : ''}`
              : thread.phase.replace('_', ' ')}
          </Text>
          {formatLastCheckin() && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{formatLastCheckin()}</Text>
            </>
          )}
        </View>
      </View>

      {thread.phase === 'insight_ready' && (
        <Badge label="Insights" variant="info" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 4,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.xs / 2,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  containerActive: {
    backgroundColor: colors.primaryLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  titleActive: {
    color: colors.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  metaText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
```

### 4. ThreadSection Component (`src/components/navigation/ThreadSection.tsx`)

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThreadListItem } from './ThreadListItem';
import { Thread } from '@stores/threadStore';
import { colors, spacing, typography } from '@theme';

interface ThreadSectionProps {
  title: string;
  threads: Thread[];
  activeThreadId: string | null;
  onThreadPress: (thread: Thread) => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function ThreadSection({
  title,
  threads,
  activeThreadId,
  onThreadPress,
  collapsible = false,
  defaultCollapsed = false,
}: ThreadSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (threads.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => collapsible && setIsCollapsed(!isCollapsed)}
        disabled={!collapsible}
      >
        <Text style={styles.title}>
          {title}
          <Text style={styles.count}> ({threads.length})</Text>
        </Text>
        {collapsible && (
          <Ionicons
            name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
            size={16}
            color={colors.textTertiary}
          />
        )}
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.list}>
          {threads.map((thread) => (
            <ThreadListItem
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              onPress={() => onThreadPress(thread)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  count: {
    color: colors.textTertiary,
  },
  list: {
    marginTop: spacing.xs,
  },
});
```

### 5. NewThreadButton Component (`src/components/navigation/NewThreadButton.tsx`)

```tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@theme';

interface NewThreadButtonProps {
  onPress: () => void;
}

export function NewThreadButton({ onPress }: NewThreadButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="add" size={24} color={colors.primary} />
      </View>
      <Text style={styles.text}>New Symptom</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    marginVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
});
```

### 6. DrawerContent Component (`src/components/navigation/DrawerContent.tsx`)

```tsx
import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThreadSection } from './ThreadSection';
import { NewThreadButton } from './NewThreadButton';
import { useThreadStore, useThreadsByStatus, Thread } from '@stores/threadStore';
import { colors, spacing, typography } from '@theme';

interface DrawerContentProps extends DrawerContentComponentProps {}

export function DrawerContent(props: DrawerContentProps) {
  const { navigation } = props;
  const { activeThreadId, setActiveThread } = useThreadStore();
  const threadsByStatus = useThreadsByStatus();

  const handleThreadPress = (thread: Thread) => {
    setActiveThread(thread.id);
    navigation.closeDrawer();
  };

  const handleNewThread = () => {
    setActiveThread(null); // Will create new thread on first message
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadence</Text>
        <Text style={styles.headerSubtitle}>Your symptom tracker</Text>
      </View>

      {/* Thread List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <NewThreadButton onPress={handleNewThread} />

        <ThreadSection
          title="Active"
          threads={threadsByStatus.active}
          activeThreadId={activeThreadId}
          onThreadPress={handleThreadPress}
        />

        <ThreadSection
          title="Paused"
          threads={threadsByStatus.paused}
          activeThreadId={activeThreadId}
          onThreadPress={handleThreadPress}
          collapsible
          defaultCollapsed
        />

        <ThreadSection
          title="Completed"
          threads={threadsByStatus.completed}
          activeThreadId={activeThreadId}
          onThreadPress={handleThreadPress}
          collapsible
          defaultCollapsed
        />

        {/* Empty State */}
        {threadsByStatus.active.length === 0 &&
          threadsByStatus.paused.length === 0 &&
          threadsByStatus.completed.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Start tracking your first symptom
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerItem}>
          <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.footerText}>Help</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.drawerBackground,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
  },
  footerItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
```

### 7. Update Drawer Layout (`app/(drawer)/_layout.tsx`)

```tsx
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '@components/navigation/DrawerContent';
import { colors } from '@theme';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerTitleAlign: 'center',
        drawerStyle: {
          backgroundColor: colors.drawerBackground,
          width: 280,
        },
        drawerType: 'slide',
        overlayColor: colors.drawerOverlay,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Chat',
        }}
      />
    </Drawer>
  );
}
```

### 8. Index Export (`src/components/navigation/index.ts`)

```typescript
export { DrawerContent } from './DrawerContent';
export { ThreadListItem } from './ThreadListItem';
export { ThreadSection } from './ThreadSection';
export { NewThreadButton } from './NewThreadButton';
```

---

## Acceptance Criteria

- [ ] Drawer shows list of symptom threads
- [ ] Threads grouped by status (active, paused, completed)
- [ ] Active thread is highlighted
- [ ] Thread items show summary, phase, and check-in count
- [ ] "New Symptom" button creates new thread
- [ ] Paused/completed sections are collapsible
- [ ] Thread store persists to AsyncStorage
- [ ] Empty state shows when no threads exist

---

## Files to Create

```
src/
├── components/
│   └── navigation/
│       ├── index.ts
│       ├── DrawerContent.tsx
│       ├── ThreadListItem.tsx
│       ├── ThreadSection.tsx
│       └── NewThreadButton.tsx
└── stores/
    └── threadStore.ts
```

---

## Next Task

After completing the drawer, proceed to **Task 06: API Integration** to connect the app to the backend.
