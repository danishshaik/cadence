import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SymbolView } from "expo-symbols";
import { ThreadListItem } from "./thread-list-item";
import { Thread } from "@stores/thread-store";
import { colors, spacing, typography } from "@theme";

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
    <View style={{ marginBottom: spacing.sm }}>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        }}
        onPress={() => collapsible && setIsCollapsed(!isCollapsed)}
        disabled={!collapsible}
      >
        <Text selectable style={{ ...typography.label, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {title}
          <Text selectable style={{ color: colors.textTertiary }}>
            {" "}({threads.length})
          </Text>
        </Text>
        {collapsible && (
          <SymbolView
            name={isCollapsed ? "chevron.forward" : "chevron.down"}
            size={14}
            tintColor={colors.textTertiary}
            fallback={
              <Text selectable style={{ ...typography.caption, color: colors.textTertiary }}>
                {isCollapsed ? ">" : "v"}
              </Text>
            }
          />
        )}
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={{ marginTop: spacing.xs }}>
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
