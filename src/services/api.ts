import { config } from "./config";
import { useUserStore } from "@stores/user-store";
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
} from "@/types/api";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, code?: string, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const baseHeaders = {
  "Content-Type": "application/json",
};

const getJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T;
  }
};

const toApiError = async (response: Response) => {
  const data = await getJson<APIError>(response);
  const message = data?.error || `Request failed (${response.status})`;
  const code = data?.code || "HTTP_ERROR";
  return new ApiError(message, response.status, code, data?.details);
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  retryUnauthorized = true
): Promise<T> => {
  const { userId } = useUserStore.getState();
  const headers = {
    ...baseHeaders,
    ...(options.headers || {}),
    ...(userId ? { "X-User-Id": userId } : {}),
  };

  if (__DEV__) {
    const method = options.method ?? "GET";
    const body = typeof options.body === "string" ? options.body : undefined;
    console.log("apiFetch request", {
      url: `${config.apiUrl}${path}`,
      method,
      headers,
      body,
    });
  }

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError("Network error", 0, "NETWORK_ERROR");
  }

  const issuedUserId = response.headers.get("x-user-id");
  if (!useUserStore.getState().userId && issuedUserId) {
    useUserStore.getState().setUserId(issuedUserId);
  }

  if (!response.ok) {
    if (response.status === 401 && retryUnauthorized) {
      useUserStore.getState().clearUser();
      return apiFetch<T>(path, options, false);
    }
    throw await toApiError(response);
  }

  return getJson<T>(response);
};

function normalizeNudgePlan(plan: NudgePlanResponse | null): NudgePlan | null {
  if (!plan) return null;
  if ("preferred_times" in plan) {
    return {
      frequency: plan.frequency,
      preferredTimes: plan.preferred_times,
      rationale: plan.rationale,
    };
  }
  return plan;
}

export const cadenceApi = {
  sendMessage: async (data: MessageRequest): Promise<MessageResponse> => {
    return apiFetch<MessageResponse>("/api/message", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getThreads: async (
    status?: "active" | "paused" | "completed"
  ): Promise<{ threads: Thread[] }> => {
    const query = status ? `?${new URLSearchParams({ status }).toString()}` : "";
    return apiFetch<{ threads: Thread[] }>(`/api/thread${query}`);
  },

  getThread: async (threadId: string): Promise<ThreadDetail> => {
    const data = await apiFetch<ThreadDetail>(`/api/thread/${threadId}`);
    return {
      ...data,
      nudgePlan: normalizeNudgePlan(data.nudgePlan),
    };
  },

  submitCheckin: async (data: CheckinRequest): Promise<CheckinResponse> => {
    return apiFetch<CheckinResponse>("/api/checkin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getInsights: async (threadId: string): Promise<InsightsResponse> => {
    return apiFetch<InsightsResponse>(`/api/thread/${threadId}/insights`);
  },

  healthCheck: async (): Promise<{ status: string }> => {
    return apiFetch<{ status: string }>("/health");
  },
};

export default cadenceApi;
