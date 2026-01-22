# Task 03: Chat Screen (React Native)

## Task Description

Build the main chat interface - the heart of the Cadence app. This includes the message list, text input, and the structure for embedding check-in widgets.

## UI Implementation Notes (Override)

Follow the Expo UI skill guidance for this task:
- **Use kebab-case filenames** for chat components (e.g. `agent-message.tsx`, `chat-input.tsx`).
- **Inline styles only** (no `StyleSheet.create`) unless reuse is clearly faster.
- **Avoid `SafeAreaView`**; use `ScrollView`/`FlatList` with `contentInsetAdjustmentBehavior="automatic"`.
- Prefer **`expo-symbols`** for icons instead of `@expo/vector-icons`.
- Use `process.env.EXPO_OS` instead of `Platform.OS` where platform checks are required.

## Why This Task

The chat screen is central because:
- It's the primary user interface
- All interactions happen through chat
- Check-in widgets are embedded in the chat flow
- Sets the foundation for the entire UX

---

## Components to Build

| Component | Description |
|-----------|-------------|
| `ChatScreen` | Main screen container with message list and input |
| `MessageList` | Scrollable list of messages and widgets |
| `AgentMessage` | Agent's chat bubble |
| `UserMessage` | User's chat bubble |
| `ChatInput` | Bottom text input with send button |
| `TypingIndicator` | Shows when agent is "thinking" |
| `QuickReplyMessage` | Tappable options for clarification questions |

---

## Detailed Instructions

### 1. Project Structure

```
src/
├── components/
│   └── chat/
│       ├── index.ts
│       ├── message-list.tsx
│       ├── agent-message.tsx
│       ├── user-message.tsx
│       ├── chat-input.tsx
│       ├── typing-indicator.tsx
│       ├── quick-reply-message.tsx
│       └── types.ts
└── screens/
    └── ChatScreen.tsx
```

### 2. Message Types (`src/components/chat/types.ts`)

```typescript
export type MessageRole = 'user' | 'assistant';

export interface BaseMessage {
  id: string;
  timestamp: string;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  role: MessageRole;
  content: string;
}

export interface CheckinWidgetMessage extends BaseMessage {
  type: 'checkin_widget';
  role: 'assistant';
  screen: CheckinScreen; // From API
  status: 'active' | 'completed' | 'skipped';
  answers?: Record<string, any>;
}

export interface CheckinSummaryMessage extends BaseMessage {
  type: 'checkin_summary';
  role: 'assistant';
  summary: string;
  submittedAt: string;
}

export interface InsightMessage extends BaseMessage {
  type: 'insight';
  role: 'assistant';
  insights: Array<{
    title: string;
    observation: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
}

export interface QuickReplyMessage extends BaseMessage {
  type: 'quick_reply';
  role: 'assistant';
  content: string; // The question prompt
  answerType: 'yes_no' | 'single_select';
  options: Array<{
    id: string;
    label: string;
  }>;
}

export type ChatMessage =
  | TextMessage
  | CheckinWidgetMessage
  | CheckinSummaryMessage
  | InsightMessage
  | QuickReplyMessage;

// Check-in screen type (matches backend schema)
export interface CheckinScreen {
  screen_id: string;
  title: string;
  subtitle?: string;
  sections: CheckinSection[];
  estimated_time_seconds: number;
  allow_skip: boolean;
  submit_label: string;
  tracks_dimensions: string[];
}

export interface CheckinSection {
  id: string;
  title?: string;
  description?: string;
  components: CheckinComponent[];
  show_if?: {
    component_id: string;
    condition: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt';
    value: any;
  };
}

export interface CheckinComponent {
  type: string;
  id: string;
  prompt: string;
  [key: string]: any;
}
```

### 3. AgentMessage Component (`src/components/chat/AgentMessage.tsx`)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '@components/shared';
import { colors, spacing, radius, typography } from '@theme';

interface AgentMessageProps {
  content: string;
  timestamp?: string;
  showAvatar?: boolean;
}

export function AgentMessage({
  content,
  timestamp,
  showAvatar = true,
}: AgentMessageProps) {
  return (
    <View style={styles.container}>
      {showAvatar ? (
        <Avatar name="Cadence" size="sm" />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      <View style={styles.bubble}>
        <Text style={styles.text}>{content}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 32,
  },
  bubble: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: '80%',
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
```

### 4. UserMessage Component (`src/components/chat/UserMessage.tsx`)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '@theme';

interface UserMessageProps {
  content: string;
  timestamp?: string;
}

export function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{content}</Text>
        {timestamp && (
          <Text style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  bubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    maxWidth: '80%',
  },
  text: {
    ...typography.body,
    color: colors.surface,
  },
  timestamp: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
```

### 5. TypingIndicator Component (`src/components/chat/TypingIndicator.tsx`)

```tsx
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Avatar } from '@components/shared';
import { colors, spacing, radius } from '@theme';

export function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animation = withRepeat(
      withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1,
      false
    );

    dot1.value = animation;
    dot2.value = withDelay(150, animation);
    dot3.value = withDelay(300, animation);
  }, []);

  const animatedDot1 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot1.value * 0.6,
    transform: [{ translateY: -dot1.value * 4 }],
  }));

  const animatedDot2 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot2.value * 0.6,
    transform: [{ translateY: -dot2.value * 4 }],
  }));

  const animatedDot3 = useAnimatedStyle(() => ({
    opacity: 0.4 + dot3.value * 0.6,
    transform: [{ translateY: -dot3.value * 4 }],
  }));

  return (
    <View style={styles.container}>
      <Avatar name="Cadence" size="sm" />
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <Animated.View style={[styles.dot, animatedDot1]} />
          <Animated.View style={[styles.dot, animatedDot2]} />
          <Animated.View style={[styles.dot, animatedDot3]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  bubble: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
});
```

### 6. QuickReplyMessage Component (`src/components/chat/QuickReplyMessage.tsx`)

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Chip } from '@components/shared';
import { colors, spacing, typography } from '@theme';

interface QuickReplyMessageProps {
  prompt: string;
  options: Array<{ id: string; label: string }>;
  onSelect: (option: { id: string; label: string }) => void;
  disabled?: boolean;
}

export function QuickReplyMessage({
  prompt,
  options,
  onSelect,
  disabled = false,
}: QuickReplyMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            onPress={() => onSelect(option)}
            disabled={disabled}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  prompt: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
```

### 7. ChatInput Component (`src/components/chat/ChatInput.tsx`)

```tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Message Cadence...',
}: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
      Keyboard.dismiss();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={2000}
          editable={!disabled}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons
            name="arrow-up"
            size={20}
            color={canSend ? colors.surface : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
```

### 8. MessageList Component (`src/components/chat/MessageList.tsx`)

```tsx
import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View, ListRenderItem } from 'react-native';
import { AgentMessage } from './AgentMessage';
import { UserMessage } from './UserMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatMessage } from './types';
import { colors, spacing } from '@theme';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  onScrollToBottom?: () => void;
  renderWidget?: (message: ChatMessage) => React.ReactNode;
}

export function MessageList({
  messages,
  isTyping = false,
  renderWidget,
}: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  const renderMessage: ListRenderItem<ChatMessage> = ({ item, index }) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar =
      item.role === 'assistant' &&
      (!prevMessage || prevMessage.role !== 'assistant');

    switch (item.type) {
      case 'text':
        if (item.role === 'user') {
          return <UserMessage content={item.content} timestamp={item.timestamp} />;
        }
        return (
          <AgentMessage
            content={item.content}
            timestamp={item.timestamp}
            showAvatar={showAvatar}
          />
        );

      case 'checkin_widget':
      case 'checkin_summary':
      case 'insight':
      case 'quick_reply':
        // Delegate to parent for custom widget rendering
        if (renderWidget) {
          return <>{renderWidget(item)}</>;
        }
        return null;

      default:
        return null;
    }
  };

  const ListFooter = () => (
    <>
      {isTyping && <TypingIndicator />}
      <View style={styles.bottomPadding} />
    </>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListFooterComponent={ListFooter}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      inverted={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.md,
    flexGrow: 1,
  },
  bottomPadding: {
    height: spacing.lg,
  },
});
```

### 9. ChatScreen (`src/screens/ChatScreen.tsx`)

```tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageList } from '@components/chat/MessageList';
import { ChatInput } from '@components/chat/ChatInput';
import { ChatMessage } from '@components/chat/types';
import { colors } from '@theme';

// Placeholder for actual data - will be replaced with API integration
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'text',
    role: 'assistant',
    content: "Hi! I'm Cadence, your symptom tracking assistant. Tell me about what you've been experiencing.",
    timestamp: new Date().toISOString(),
  },
];

export function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async (text: string) => {
    if (isSending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'text',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    setIsTyping(true);

    // Simulate API call - replace with actual API integration
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        role: 'assistant',
        content: "Thanks for sharing. I'm here to help track your symptoms. Can you tell me more about when this started?",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
      setIsSending(false);
    }, 1500);
  }, [isSending]);

  const renderWidget = useCallback((message: ChatMessage) => {
    // Will be implemented in Task 04 (Check-in Widgets)
    return null;
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <MessageList
          messages={messages}
          isTyping={isTyping}
          renderWidget={renderWidget}
        />
        <ChatInput onSend={handleSend} disabled={isSending} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});
```

### 10. Index Export (`src/components/chat/index.ts`)

```typescript
export { MessageList } from './MessageList';
export { AgentMessage } from './AgentMessage';
export { UserMessage } from './UserMessage';
export { ChatInput } from './ChatInput';
export { TypingIndicator } from './TypingIndicator';
export { QuickReplyMessage } from './QuickReplyMessage';
export * from './types';
```

---

## Acceptance Criteria

- [ ] MessageList displays messages in chronological order
- [ ] AgentMessage shows avatar on first message in sequence
- [ ] UserMessage is right-aligned with primary color
- [ ] ChatInput supports multiline input
- [ ] Send button only active when text is entered
- [ ] TypingIndicator animates with bouncing dots
- [ ] QuickReplyMessage renders tappable options
- [ ] Keyboard avoidance works on iOS and Android
- [ ] Auto-scroll to bottom on new messages

---

## Files to Create

```
src/
├── components/
│   └── chat/
│       ├── index.ts
│       ├── types.ts
│       ├── MessageList.tsx
│       ├── AgentMessage.tsx
│       ├── UserMessage.tsx
│       ├── ChatInput.tsx
│       ├── TypingIndicator.tsx
│       └── QuickReplyMessage.tsx
└── screens/
    └── ChatScreen.tsx
```

---

## Next Task

After completing the chat screen, proceed to **Task 04: Check-in Widgets** to build the interactive check-in form components.
