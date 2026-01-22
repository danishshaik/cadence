import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { ThreadSection } from "./thread-section";
import { NewThreadButton } from "./new-thread-button";
import { LoadingSpinner } from "@components/shared";
import { useThreads } from "@hooks/use-threads";
import { useThreadStore, useThreadsByStatus, Thread } from "@stores/thread-store";
import { colors, spacing, typography } from "@theme";

interface DrawerContentProps {
  navigation: { closeDrawer: () => void };
}

export function DrawerContent({ navigation }: DrawerContentProps) {
  const insets = useSafeAreaInsets();
  const { activeThreadId, setActiveThread } = useThreadStore();
  const threadsByStatus = useThreadsByStatus();
  const { isLoading, error } = useThreads();

  const handleThreadPress = (thread: Thread) => {
    setActiveThread(thread.id);
    navigation.closeDrawer();
  };

  const handleNewThread = () => {
    setActiveThread(null);
    navigation.closeDrawer();
  };

  const hasThreads =
    threadsByStatus.active.length > 0 ||
    threadsByStatus.paused.length > 0 ||
    threadsByStatus.completed.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.drawerBackground }}>
      <View
        style={{
          padding: spacing.md,
          paddingTop: spacing.sm + insets.top,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 2,
        }}
      >
        <Text selectable style={{ ...typography.h2, color: colors.textPrimary }}>
          Cadence
        </Text>
        <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
          Your symptom tracker
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <NewThreadButton onPress={handleNewThread} />

        {isLoading && !hasThreads && (
          <LoadingSpinner size="small" message="Loading threads..." />
        )}

        {error && !isLoading && (
          <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text selectable style={{ ...typography.caption, color: colors.error }}>
              Unable to load threads right now.
            </Text>
          </View>
        )}

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

        {!hasThreads && (
          <View style={{ padding: spacing.lg, alignItems: "center" }}>
            <Text selectable style={{ ...typography.body, color: colors.textTertiary, textAlign: "center" }}>
              Start tracking your first symptom
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingVertical: spacing.sm,
          paddingBottom: spacing.sm + insets.bottom,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: spacing.sm,
            gap: spacing.xs,
          }}
        >
          <SymbolView
            name="gearshape"
            size={18}
            tintColor={colors.textSecondary}
            fallback={<Text selectable style={{ color: colors.textSecondary }}>⚙️</Text>}
          />
          <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
            Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: spacing.sm,
            gap: spacing.xs,
          }}
        >
          <SymbolView
            name="questionmark.circle"
            size={18}
            tintColor={colors.textSecondary}
            fallback={<Text selectable style={{ color: colors.textSecondary }}>?</Text>}
          />
          <Text selectable style={{ ...typography.caption, color: colors.textSecondary }}>
            Help
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
