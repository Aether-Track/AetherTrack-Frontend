import type { PaginatedResponse, Shipment, ShipmentEvent, User } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('aethertrack_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    challenge: (publicKey: string) =>
      request<{ message: string }>('/auth/challenge', {
        method: 'POST',
        body: JSON.stringify({ publicKey }),
      }),

    login: (publicKey: string, signature: string) =>
      request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ publicKey, signature }),
      }),

    me: () => request<User>('/auth/me'),

    updateProfile: (data: Partial<Pick<User, 'displayName' | 'email' | 'avatarUrl'>>) =>
      request<User>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  shipments: {
    list: (params?: {
      role?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      const qs = new URLSearchParams(
        Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
      ).toString();
      return request<PaginatedResponse<Shipment>>(`/shipments${qs ? `?${qs}` : ''}`);
    },

    get: (id: string) => request<Shipment>(`/shipments/${id}`),

    create: (data: unknown) =>
      request<Shipment>('/shipments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    updateLocation: (
      id: string,
      data: { latitude: number; longitude: number; altitudeM?: number; metadata?: Record<string, unknown>; txHash?: string },
    ) =>
      request<unknown>(`/shipments/${id}/location`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    confirmMilestone: (id: string, milestoneIndex: number) =>
      request<unknown>(`/shipments/${id}/milestones/${milestoneIndex}/confirm`, {
        method: 'POST',
      }),

    updateStatus: (id: string, status: string) =>
      request<Shipment>(`/shipments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getEvents: (id: string, page = 1) =>
      request<ShipmentEvent[]>(`/shipments/${id}/events?page=${page}`),
  },
};
