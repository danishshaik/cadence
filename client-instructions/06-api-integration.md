# Task 06: API Integration (React Native)

## Task Description

Connect the React Native app to the Cadence backend API. This includes setting up the HTTP client, React Query hooks, and handling authentication.

## UI + Data Fetching Notes (Override)

Follow the Expo UI and native-data-fetching skills for this task:
- **Use fetch**, not axios (avoid axios entirely).
- **Use kebab-case filenames** for hooks and stores (e.g. `use-threads.ts`, `user-store.ts`).
- **Inline styles only** (no `StyleSheet.create`) unless reuse is clearly faster.
- **Avoid `SafeAreaView`**; use `ScrollView`/`FlatList` with `contentInsetAdjustmentBehavior="automatic"` where needed.
- Use `process.env.EXPO_OS` instead of `Platform.OS`.
- Prefer **EXPO_PUBLIC_** env vars for API base URL (with `.env` files).

## Why This Task

API integration is critical because:
- All data flows from the backend
- Real-time updates improve UX
- Proper error handling prevents frustration
- Caching improves performance

---

## Components to Build

| Component | Description |
|-----------|-------------|
| `api.ts` | Fetch client with auth header + error handling |
| `useThreads` | Hook to fetch and manage threads |
| `useMessages` | Hook to send and receive messages |
| `useCheckin` | Hook to submit check-ins |
| `useInsights` | Hook to fetch insights |
| `userStore.ts` | User ID and auth state management |

---

## Detailed Instructions

### 1. Project Structure

```
src/
├── services/
│   ├── api.ts
│   └── config.ts
├── hooks/
│   ├── use-threads.ts
│   ├── use-messages.ts
│   ├── use-checkin.ts
│   └── use-insights.ts
├── stores/
│   ├── thread-store.ts
│   └── user-store.ts
└── types/
    └── api.ts
```

### 2. API Types (`src/types/api.ts`)

```typescript
export type SessionPhase =
  | 'intake'
  | 'clarifying'
  | 'tracking'
  | 'insight_ready'
  | 'designing'   // Internal backend phases (you may briefly see these)
  | 'scheduling'; // Internal backend phases (you may briefly see these)

// Thread types
export interface Thread {
  id: string;
  symptomSummary: string | null;
  // Not returned by GET /api/thread; hydrate from GET /api/thread/:threadId
  symptomCategory?: string | null;
  phase: SessionPhase;
  status: 'active' | 'paused' | 'completed';
  lastCheckinAt: string | null;
  createdAt: string;
}

export interface ThreadDetail {
  threadId: string; // Note: API uses threadId (not id)
  symptomSummary: string | null;
  symptomCategory: string | null;
  phase: SessionPhase;
  status: 'active' | 'paused' | 'completed';
  checkinScreen: CheckinScreen | null;
  nudgePlan: NudgePlanResponse | null;
  checkins: Checkin[];
  insights: InsightResult | null;
  createdAt: string;
}

// Message types
export interface MessageRequest {
  threadId?: string;
  message: string;
}

export interface MessageResponse {
  threadId: string;
  phase: SessionPhase;
  messages: Array<{
    role: 'assistant';
    content: string;
  }>;
  clarificationQuestions?: ClarificationQuestion[];
  checkinScreen?: CheckinScreen;
  nudgePlan?: NudgePlan;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  answerType: 'free_text' | 'yes_no' | 'single_select';
  options?: string[];
}

// Check-in types
export interface CheckinRequest {
  threadId: string;
  answers: Record<string, any>;
}

export interface CheckinResponse {
  ack: true;
  message: string;
  checkinCount: number;
  insightsReady?: boolean;
  insights?: Insight[];
}

export interface Checkin {
  id: string;
  answers: Record<string, any>;
  loggedAt: string;
}

// Check-in screen types (matches backend schema)
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

// Nudge plan types
export type NudgeFrequency = 'once_daily' | 'twice_daily' | 'every_other_day';

// Returned by POST /api/message
export interface NudgePlan {
  frequency: NudgeFrequency;
  preferredTimes: string[];
  rationale: string;
}

// Returned by GET /api/thread/:threadId (stored shape)
export interface StoredNudgePlan {
  frequency: NudgeFrequency;
  preferred_times: string[];
  time_window_minutes: number;
  suppression_rules?: {
    pause_after_ignored: number;
    skip_if_logged_today: boolean;
    max_thread_age_days: number;
  };
  rationale: string;
}

export type NudgePlanResponse = NudgePlan | StoredNudgePlan;

// Insight types
export interface Insight {
  title: string;
  observation: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface InsightResult {
  insights: Insight[];
  suggestion: string | null;
  generatedAt: string;
}

export interface InsightsResponse {
  ready: boolean;
  insights?: Insight[];
  suggestion?: string | null;
  message?: string;
  checkinCount?: number;
  checkinsNeeded?: number;
}

// Error types
export interface APIError {
  error: string;
  code: string;
  details?: Array<{ path: string; message: string }>;
}
```

**API shape notes (important):**
- `GET /api/thread/:threadId` returns `threadId` (not `id`). Map it to your store's `id`.
- `nudgePlan` is **camelCase** in `POST /api/message` but **snake_case** in `GET /api/thread/:threadId`. Normalize to a single shape in `services/api.ts`.
- `clarificationQuestions.answerType` values are `free_text`, `yes_no`, `single_select`.

### 3. User Store (`src/stores/userStore.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

interface UserStore {
  userId: string | null;
  pushToken: string | null;

  // Actions
  initializeUser: () => Promise<string>;
  setPushToken: (token: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: null,
      pushToken: null,

      initializeUser: async () => {
        let { userId } = get();

        if (!userId) {
          // Generate a random UUID for anonymous user
          userId = Crypto.randomUUID();
          set({ userId });
        }

        return userId;
      },

      setPushToken: (pushToken) => set({ pushToken }),

      clearUser: () => set({ userId: null, pushToken: null }),
    }),
    {
      name: 'cadence-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 4. API Client (`src/services/api.ts`)

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from './config';
import { useUserStore } from '@stores/userStore';
import type {
  MessageRequest,
  MessageResponse,
  CheckinRequest,
  CheckinResponse,
  Thread,
  ThreadDetail,
  NudgePlan,
  NudgePlanResponse,
  InsightsResponse,
  APIError,
} from '@/types/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000, // 30 seconds for LLM responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth header
api.interceptors.request.use(
  async (config) => {
    const userId = useUserStore.getState().userId;
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIError>) => {
    // Log error for debugging
    console.error('API Error:', error.response?.data || error.message);

    // Transform error for consistent handling
    const apiError: APIError = error.response?.data || {
      error: error.message || 'Network error',
      code: 'NETWORK_ERROR',
    };

    return Promise.reject(apiError);
  }
);

function normalizeNudgePlan(plan: NudgePlanResponse | null): NudgePlan | null {
  if (!plan) return null;
  if ('preferred_times' in plan) {
    return {
      frequency: plan.frequency,
      preferredTimes: plan.preferred_times,
      rationale: plan.rationale,
    };
  }
  return plan;
}

// API methods
export const cadenceApi = {
  // Messages
  sendMessage: async (data: MessageRequest): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/message', data);
    return response.data;
  },

  // Threads
  getThreads: async (status?: 'active' | 'paused' | 'completed'): Promise<{ threads: Thread[] }> => {
    const response = await api.get('/api/thread', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  getThread: async (threadId: string): Promise<ThreadDetail> => {
    const response = await api.get<ThreadDetail>(`/api/thread/${threadId}`);
    return {
      ...response.data,
      nudgePlan: normalizeNudgePlan(response.data.nudgePlan),
    };
  },

  // Check-ins
  submitCheckin: async (data: CheckinRequest): Promise<CheckinResponse> => {
    const response = await api.post<CheckinResponse>('/api/checkin', data);
    return response.data;
  },

  // Insights
  getInsights: async (threadId: string): Promise<InsightsResponse> => {
    const response = await api.get<InsightsResponse>(`/api/thread/${threadId}/insights`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
```

### 5. useThreads Hook (`src/hooks/useThreads.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cadenceApi } from '@services/api';
import { useThreadStore } from '@stores/threadStore';
import type { Thread, ThreadDetail } from '@/types/api';

// Query keys
export const threadKeys = {
  all: ['threads'] as const,
  lists: () => [...threadKeys.all, 'list'] as const,
  list: (status?: string) => [...threadKeys.lists(), { status }] as const,
  details: () => [...threadKeys.all, 'detail'] as const,
  detail: (id: string) => [...threadKeys.details(), id] as const,
};

// Fetch all threads
export function useThreads(status?: 'active' | 'paused' | 'completed') {
  const setThreads = useThreadStore((state) => state.setThreads);

  return useQuery({
    queryKey: threadKeys.list(status),
    queryFn: async () => {
      const data = await cadenceApi.getThreads(status);
      // Update store with fetched threads
      setThreads(data.threads.map(threadToStoreThread));
      return data.threads;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch single thread detail
export function useThread(threadId: string | null) {
  const updateThread = useThreadStore((state) => state.updateThread);

  return useQuery({
    queryKey: threadKeys.detail(threadId ?? ''),
    queryFn: async () => {
      if (!threadId) throw new Error('No thread ID');
      const data = await cadenceApi.getThread(threadId);
      const lastCheckinAt = data.checkins.length
        ? data.checkins[data.checkins.length - 1].loggedAt
        : null;
      // Update store with detailed info
      updateThread(threadId, {
        symptomSummary: data.symptomSummary,
        symptomCategory: data.symptomCategory ?? undefined,
        phase: data.phase,
        status: data.status,
        checkinCount: data.checkins.length,
        lastCheckinAt,
      });
      return data;
    },
    enabled: !!threadId,
  });
}

// Refresh threads
export function useRefreshThreads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// Helper to convert API thread to store thread
function threadToStoreThread(thread: Thread) {
  return {
    id: thread.id,
    symptomSummary: thread.symptomSummary,
    symptomCategory: thread.symptomCategory ?? undefined,
    phase: thread.phase,
    status: thread.status,
    lastCheckinAt: thread.lastCheckinAt,
    checkinCount: 0, // Will be updated from detail
    createdAt: thread.createdAt,
  };
}
```

### 6. useMessages Hook (`src/hooks/useMessages.ts`)

```typescript
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadenceApi } from '@services/api';
import { useThreadStore } from '@stores/threadStore';
import { threadKeys } from './useThreads';
import type { MessageRequest, MessageResponse, CheckinScreen, NudgePlan } from '@/types/api';
import type { ChatMessage } from '@components/chat/types';

interface UseMessagesReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (text: string) => Promise<void>;
  appendMessages: (next: ChatMessage | ChatMessage[]) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  checkinScreen: CheckinScreen | null;
  nudgePlan: NudgePlan | null;
}

export function useMessages(threadId: string | null): UseMessagesReturn {
  const queryClient = useQueryClient();
  const { addThread, updateThread, setActiveThread } = useThreadStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'text',
      role: 'assistant',
      content: "Hi! I'm Cadence, your symptom tracking assistant. Tell me about what you've been experiencing.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [checkinScreen, setCheckinScreen] = useState<CheckinScreen | null>(null);
  const [nudgePlan, setNudgePlan] = useState<NudgePlan | null>(null);

  const appendMessages = useCallback((next: ChatMessage | ChatMessage[]) => {
    const nextList = Array.isArray(next) ? next : [next];
    setMessages((prev) => [...prev, ...nextList]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)));
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: MessageRequest) => {
      return cadenceApi.sendMessage(data);
    },
    onSuccess: (response, variables) => {
      // Handle new thread creation
      if (!variables.threadId && response.threadId) {
        addThread({
          id: response.threadId,
          symptomSummary: null,
          phase: response.phase as any,
          status: 'active',
          lastCheckinAt: null,
          checkinCount: 0,
          createdAt: new Date().toISOString(),
        });
        setActiveThread(response.threadId);
      }

      // Add assistant response messages
      response.messages.forEach((msg, index) => {
        const newMessage: ChatMessage = {
          id: `${Date.now()}-${index}`,
          type: 'text',
          role: 'assistant',
          content: msg.content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      });

      // Handle clarification questions
      if (response.clarificationQuestions && response.clarificationQuestions.length > 0) {
        const clarificationMessages: ChatMessage[] = [];

        response.clarificationQuestions.forEach((q, index) => {
          if (q.answerType === 'free_text') {
            clarificationMessages.push({
              id: `clarify-${Date.now()}-${index}`,
              type: 'text',
              role: 'assistant',
              content: q.question,
              timestamp: new Date().toISOString(),
            });
            return;
          }

          const options =
            q.options?.length
              ? q.options
              : q.answerType === 'yes_no'
                ? ['Yes', 'No']
                : [];

          clarificationMessages.push({
            id: `qr-${Date.now()}-${index}`,
            type: 'quick_reply',
            role: 'assistant',
            content: q.question,
            answerType: q.answerType,
            options: options.map((option) => ({
              id: option,
              label: option,
            })),
            timestamp: new Date().toISOString(),
          });
        });

        setMessages((prev) => [...prev, ...clarificationMessages]);
      }

      // Handle check-in screen
      if (response.checkinScreen) {
        setCheckinScreen(response.checkinScreen);

        // Add widget message
        const widgetMessage: ChatMessage = {
          id: `widget-${Date.now()}`,
          type: 'checkin_widget',
          role: 'assistant',
          screen: response.checkinScreen,
          status: 'active',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, widgetMessage]);
      }

      // Handle nudge plan
      if (response.nudgePlan) {
        setNudgePlan(response.nudgePlan);
      }

      // Update thread phase
      if (response.threadId) {
        updateThread(response.threadId, { phase: response.phase as any });
      }

      // Invalidate thread queries
      queryClient.invalidateQueries({ queryKey: threadKeys.all });
    },
  });

  const sendMessage = useCallback(
    async (text: string) => {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'text',
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to API
      await mutation.mutateAsync({
        threadId: threadId ?? undefined,
        message: text,
      });
    },
    [threadId, mutation]
  );

  return {
    messages,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    sendMessage,
    appendMessages,
    updateMessage,
    checkinScreen,
    nudgePlan,
  };
}
```

### 7. useCheckin Hook (`src/hooks/useCheckin.ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cadenceApi } from '@services/api';
import { useThreadStore } from '@stores/threadStore';
import { threadKeys } from './useThreads';
import type { CheckinRequest, CheckinResponse, Insight } from '@/types/api';

interface UseCheckinReturn {
  submitCheckin: (answers: Record<string, any>) => Promise<CheckinResponse>;
  isSubmitting: boolean;
  error: Error | null;
  lastResponse: CheckinResponse | null;
}

export function useCheckin(threadId: string): UseCheckinReturn {
  const queryClient = useQueryClient();
  const updateThread = useThreadStore((state) => state.updateThread);

  const mutation = useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      const data: CheckinRequest = {
        threadId,
        answers,
      };
      return cadenceApi.submitCheckin(data);
    },
    onSuccess: (response) => {
      // Update thread with new check-in count
      updateThread(threadId, {
        checkinCount: response.checkinCount,
        lastCheckinAt: new Date().toISOString(),
      });

      // Mark insights ready if applicable
      if (response.insightsReady) {
        updateThread(threadId, {
          phase: 'insight_ready',
          hasUnreadInsights: true,
        });
      }

      // Invalidate thread queries
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });

  return {
    submitCheckin: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error as Error | null,
    lastResponse: mutation.data ?? null,
  };
}
```

### 8. useInsights Hook (`src/hooks/useInsights.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { cadenceApi } from '@services/api';
import { useThreadStore } from '@stores/threadStore';
import type { InsightsResponse } from '@/types/api';

// Query keys
export const insightKeys = {
  all: ['insights'] as const,
  thread: (threadId: string) => [...insightKeys.all, threadId] as const,
};

export function useInsights(threadId: string | null) {
  const markInsightsRead = useThreadStore((state) => state.markInsightsRead);

  return useQuery({
    queryKey: insightKeys.thread(threadId ?? ''),
    queryFn: async () => {
      if (!threadId) throw new Error('No thread ID');
      const data = await cadenceApi.getInsights(threadId);

      // Mark insights as read in store
      if (data.ready && data.insights) {
        markInsightsRead(threadId);
      }

      return data;
    },
    enabled: !!threadId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### 9. Hooks Index (`src/hooks/index.ts`)

```typescript
export { useThreads, useThread, useRefreshThreads, threadKeys } from './useThreads';
export { useMessages } from './useMessages';
export { useCheckin } from './useCheckin';
export { useInsights, insightKeys } from './useInsights';
```

### 10. Update ChatScreen to Use Hooks

```tsx
// src/screens/ChatScreen.tsx
import React, { useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageList } from '@components/chat/MessageList';
import { ChatInput } from '@components/chat/ChatInput';
import { QuickReplyMessage } from '@components/chat/QuickReplyMessage';
import { CheckinWidget } from '@components/checkin/CheckinWidget';
import { CheckinSummary } from '@components/checkin/CheckinSummary';
import { LoadingSpinner } from '@components/shared';
import { useMessages } from '@hooks/useMessages';
import { useCheckin } from '@hooks/useCheckin';
import { useThreadStore, useActiveThread } from '@stores/threadStore';
import { useUserStore } from '@stores/userStore';
import { ChatMessage } from '@components/chat/types';
import { colors } from '@theme';

export function ChatScreen() {
  const activeThread = useActiveThread();
  const initializeUser = useUserStore((state) => state.initializeUser);

  // Initialize user on mount
  useEffect(() => {
    initializeUser();
  }, []);

  const { messages, isLoading, sendMessage, appendMessages, updateMessage } = useMessages(
    activeThread?.id ?? null
  );

  const { submitCheckin, isSubmitting } = useCheckin(activeThread?.id ?? '');

  const handleCheckinSubmit = async (
    messageId: string,
    answers: Record<string, any>
  ) => {
    if (!activeThread) return;
    const response = await submitCheckin(answers);

    // Mark widget as completed
    updateMessage(messageId, { status: 'completed', answers });

    // Add summary message
    appendMessages({
      id: `summary-${Date.now()}`,
      type: 'checkin_summary',
      role: 'assistant',
      summary: response.message,
      submittedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });

    // Add insights if returned
    if (response.insights && response.insights.length > 0) {
      appendMessages({
        id: `insight-${Date.now()}`,
        type: 'insight',
        role: 'assistant',
        insights: response.insights,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const renderWidget = (message: ChatMessage) => {
    if (message.type === 'checkin_widget') {
      if (message.status === 'completed') {
        return (
          <CheckinSummary
            title={message.screen.title}
            summary="Check-in completed"
            submittedAt={message.timestamp}
          />
        );
      }

      return (
        <CheckinWidget
          screen={message.screen}
          onSubmit={(answers) => handleCheckinSubmit(message.id, answers)}
          disabled={isSubmitting}
        />
      );
    }

    if (message.type === 'quick_reply') {
      return (
        <QuickReplyMessage
          prompt={message.content}
          options={message.options}
          onSelect={(option) => sendMessage(option.label)}
          disabled={isLoading}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <MessageList
          messages={messages}
          isTyping={isLoading}
          renderWidget={renderWidget}
        />
        <ChatInput onSend={sendMessage} disabled={isLoading} />
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

---

## Acceptance Criteria

- [ ] API client sends X-User-Id header with all requests
- [ ] useThreads fetches and caches thread list
- [ ] useMessages handles conversation flow
- [ ] useCheckin submits answers and updates counts
- [ ] useInsights fetches pattern analysis
- [ ] Error handling shows user-friendly messages
- [ ] Loading states shown during API calls
- [ ] React Query caching reduces redundant requests

---

## Files to Create/Update

```
src/
├── services/
│   └── api.ts
├── hooks/
│   ├── index.ts
│   ├── useThreads.ts
│   ├── useMessages.ts
│   ├── useCheckin.ts
│   └── useInsights.ts
├── stores/
│   └── userStore.ts
├── types/
│   └── api.ts
└── screens/
    └── ChatScreen.tsx (update)
```

---

## Next Task

After completing API integration, proceed to **Task 07: Notifications** to implement push notification handling.
