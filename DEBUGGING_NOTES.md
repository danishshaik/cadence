# Cadence Debugging Context (Jan 22, 2026)

## Problem summary
- App showed: “Sorry — I couldn’t reach the server.”
- Curl to backend works on the developer machine.
- Later: 401s from backend due to auth behavior changes.
- Now: API requests succeed but assistant messages sometimes render empty.

## Environment
- Expo Go on iOS simulator.
- Backend reachable at `http://localhost:3000` on the dev machine.
- Health check works: `GET /health` returns `{ "status": "ok" }`.

## Key findings
- The client **is** sending `threadId` in the `POST /api/message` body.
- The backend sometimes returns an empty assistant message:
  ```json
  {"messages": [{"content": "", "role": "assistant"}], "phase": "intake", "threadId": "..."}
  ```
  → UI is blank because `content` is empty.
- A valid response example exists with proper content and clarification questions, so backend behavior is inconsistent.
- We verified the outbound request shape via logs (see below).

## Logged requests / responses (from Expo console)
**Request**
```
apiFetch request { 
  "method": "POST",
  "url": "http://localhost:3000/api/message",
  "headers": {"Content-Type":"application/json","X-User-Id":"e0cba930-38f6-45c8-9a22-89d26e55c8a1"},
  "body": "{\"threadId\":\"698f3014-83ae-4b4a-83fe-bb41c8acca66\",\"message\":\"Hello\"}"
}
```

**Response (empty content)**
```
{"messages": [{"content": "", "role": "assistant"}], "phase": "intake", "threadId": "698f3014-83ae-4b4a-83fe-bb41c8acca66"}
```

**Response (valid content)**
```
{
  "messages": [{"content": "Hey—welcome...", "role": "assistant"}],
  "phase": "clarifying",
  "threadId": "698f3014-83ae-4b4a-83fe-bb41c8acca66",
  "clarificationQuestions": [ ... ]
}
```

## Code changes made
### 1) API base URL selection
- `src/services/config.ts`: Use `Platform.OS` for Android emulator fallback (10.0.2.2). This fixes the common localhost issue on Android.

### 2) API error handling
- `src/services/api.ts`:
  - Wrapped `fetch` with try/catch; throw `ApiError("Network error")` on network failure.
  - Exported `ApiError` class as a value (was type-only), fixing `instanceof` crash.
  - Added dev logging of request shape (method/url/headers/body).
  - Capture `X-User-Id` from response headers if missing on client.
  - On 401, clear user id and retry once (no /auth/anonymous route now).

### 3) Auth wiring changes (per updated instructions)
- `src/stores/user-store.ts`:
  - Removed client-side UUID generation.
  - `initializeUser` now just returns stored id (or null).
  - Added `setUserId` to persist server-issued id.
- `src/services/api.ts`:
  - Removed `/api/auth/anonymous` bootstrap route (not in use).
  - Only uses response header `X-User-Id` to set user id.

### 4) Message handling changes
- `src/hooks/use-messages.ts`:
  - Log raw `sendMessage` response in dev.
  - Prevent resetting messages when threadId changes on first response (fixes messages disappearing when new thread created).
  - Robust message extraction (supports `content`, `message`, `text`, and nested `content.text`).
  - If message content is empty, skip render; in dev, append a debug bubble: “Debug: assistant message content was empty.”

## Outstanding issue
- Backend returns empty `messages[0].content` for certain requests.
- Frontend request payload is correct; if backend expects different shape (e.g., `thread_id`), it may be ignoring thread context.

## Suggested next steps
- Check backend logs for the empty-response requests (trace against `threadId` and user id shown above).
- Verify backend expects `threadId` vs `thread_id` vs nested structure; if different, update client payload.
- Confirm the backend is consistently returning assistant content in `messages[0].content`.

## Files touched
- `src/services/config.ts`
- `src/services/api.ts`
- `src/stores/user-store.ts`
- `src/hooks/use-messages.ts`

