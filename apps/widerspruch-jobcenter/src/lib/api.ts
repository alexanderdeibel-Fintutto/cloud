// API Client für den Bot-Server
const API_BASE = 'http://localhost:3001/api'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API Error ${res.status}: ${text}`)
  }
  return res.json()
}

export const api = {
  getStatus: () => apiFetch<any>('/status'),
  getConfig: () => apiFetch<any>('/config'),

  // Personas
  getPersonas: (page = 1, perPage = 50, opts?: { q?: string; type?: string; sort?: string }) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    if (opts?.q) params.set('q', opts.q)
    if (opts?.type) params.set('type', opts.type)
    if (opts?.sort) params.set('sort', opts.sort)
    return apiFetch<any>(`/personas?${params}`)
  },
  getPersona: (id: string) => apiFetch<any>(`/personas/${id}`),
  searchPersonas: (q: string) => apiFetch<any>(`/personas/search?q=${encodeURIComponent(q)}`),
  createPersona: (data: any) =>
    apiFetch<any>('/personas', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePersona: (id: string, data: any) =>
    apiFetch<any>(`/personas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePersona: (id: string) =>
    apiFetch<any>(`/personas/${id}`, { method: 'DELETE' }),
  generatePersonas: (count = 500, seed = 42) =>
    apiFetch<any>('/personas/generate', {
      method: 'POST',
      body: JSON.stringify({ count, seed }),
    }),
  bulkUpdatePersonas: (data: any) =>
    apiFetch<any>('/personas/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getBbStats: () => apiFetch<any>('/personas/bb-stats'),

  // Schedule
  getSchedule: () => apiFetch<any>('/schedule'),
  getScheduleToday: () => apiFetch<any>('/schedule/today'),
  getScheduleByDate: (date: string) => apiFetch<any>(`/schedule/history?date=${date}`),
  getScheduleDates: () => apiFetch<string[]>('/schedule/dates'),
  generateSchedule: () =>
    apiFetch<any>('/bot/generate-schedule', { method: 'POST' }),

  // Bot Controls
  startBot: () => apiFetch<any>('/bot/start', { method: 'POST' }),
  stopBot: () => apiFetch<any>('/bot/stop', { method: 'POST' }),
  setupWpUsers: () => apiFetch<any>('/bot/setup-wp-users', { method: 'POST' }),
  getWpSetupProgress: () => apiFetch<any>('/bot/setup-wp-users/progress'),

  // Manual Posting
  postAsPersona: (data: {
    persona_id: string
    action_type: string
    content: { title?: string; body: string }
    target?: { forum_id?: string; post_id?: number; topic_id?: number; comment_id?: number; category_id?: number }
  }) => apiFetch<any>('/bot/post-as-persona', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // WordPress Content
  getWpPosts: () => apiFetch<any>('/wp/posts'),
  getWpTopics: (forumId?: string) =>
    apiFetch<any>(`/wp/topics${forumId ? `?forum_id=${forumId}` : ''}`),

  // Activity
  getActivity: (limit = 200, opts?: { persona?: string; type?: string; date?: string; status?: string; q?: string }) => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (opts?.persona) params.set('persona', opts.persona)
    if (opts?.type) params.set('type', opts.type)
    if (opts?.date) params.set('date', opts.date)
    if (opts?.status) params.set('status', opts.status)
    if (opts?.q) params.set('q', opts.q)
    return apiFetch<any>(`/activity?${params}`)
  },

  // WordPress Test
  testWp: () => apiFetch<any>('/wp/test'),

  // Starter Threads
  getStarterThreads: () => apiFetch<any[]>('/starter-threads'),
  postStarterThread: (data: { thread_index: number; persona_id: string; title_override?: string; body_override?: string }) =>
    apiFetch<any>('/starter-threads/post', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Organik-Check
  getOrganikCheck: () => apiFetch<any>('/bot/organik-check'),

  // KI-Textgenerator
  generateText: (data: { persona_id: string; stichpunkte: string; forum_id?: string; kontext?: string }) =>
    apiFetch<{ text: string; persona: string; tokens: any }>('/bot/generate-text', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Konversations-Planer
  planConversation: (data: {
    forum_id: string
    topic_title: string
    persona_ids: string[]
    start_delay_minutes?: number
  }) => apiFetch<any>('/bot/plan-conversation', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
}
