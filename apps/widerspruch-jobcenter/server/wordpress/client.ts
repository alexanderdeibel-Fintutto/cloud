// ══════════════════════════════════════════════════════════════
// WordPress REST API Client
// Eine Admin-Verbindung – postet im Namen der Personas
// ══════════════════════════════════════════════════════════════

import type {
  BotConfig,
  WPUser,
  WPPost,
  WPComment,
  WPForumTopic,
  WPForumReply,
} from '../personas/types'

export class WordPressClient {
  private baseUrl: string
  private authHeader: string

  constructor(private config: BotConfig) {
    this.baseUrl = config.wp_rest_url
    this.authHeader = 'Basic ' + Buffer.from(
      `${config.wp_admin_user}:${config.wp_admin_app_password}`
    ).toString('base64')
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
    }
    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `WP API Error ${response.status} ${method} ${endpoint}: ${errorText}`
      )
    }

    return response.json() as Promise<T>
  }

  // ── API Test ──

  async testConnection(): Promise<WPUser> {
    return this.request<WPUser>('GET', '/wp/v2/users/me')
  }

  // ── User Management ──

  async createUser(data: {
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    name: string
    nickname: string
    description?: string
    roles?: string[]
  }): Promise<WPUser> {
    return this.request<WPUser>('POST', '/wp/v2/users', {
      ...data,
      roles: data.roles ?? ['subscriber'],
    })
  }

  async getUsers(params?: { per_page?: number; page?: number }): Promise<WPUser[]> {
    const query = new URLSearchParams()
    if (params?.per_page) query.set('per_page', String(params.per_page))
    if (params?.page) query.set('page', String(params.page))
    const qs = query.toString()
    return this.request<WPUser[]>('GET', `/wp/v2/users${qs ? '?' + qs : ''}`)
  }

  async getUserByUsername(username: string): Promise<WPUser | null> {
    const users = await this.request<WPUser[]>(
      'GET',
      `/wp/v2/users?search=${encodeURIComponent(username)}&per_page=10`
    )
    return users.find(u => u.slug === username.toLowerCase()) ?? null
  }

  // ── Blog Posts ──

  async createPost(data: {
    title: string
    content: string
    author: number           // wp_user_id der Persona
    categories?: number[]
    tags?: number[]
    status?: string
    slug?: string
    excerpt?: string
    comment_status?: string
  }): Promise<WPPost> {
    return this.request<WPPost>('POST', '/wp/v2/posts', {
      ...data,
      status: data.status ?? 'publish',
      comment_status: data.comment_status ?? 'open',
      format: 'standard',
    })
  }

  async getPosts(params?: {
    per_page?: number
    page?: number
    categories?: number[]
    author?: number
    orderby?: string
    order?: string
  }): Promise<WPPost[]> {
    const query = new URLSearchParams()
    if (params?.per_page) query.set('per_page', String(params.per_page))
    if (params?.page) query.set('page', String(params.page))
    if (params?.categories) query.set('categories', params.categories.join(','))
    if (params?.author) query.set('author', String(params.author))
    if (params?.orderby) query.set('orderby', params.orderby)
    if (params?.order) query.set('order', params.order)
    const qs = query.toString()
    return this.request<WPPost[]>('GET', `/wp/v2/posts${qs ? '?' + qs : ''}`)
  }

  // ── Comments ──

  async createComment(data: {
    post: number              // post_id
    author: number            // wp_user_id der Persona
    author_name: string
    author_email: string
    content: string
    parent?: number           // für verschachtelte Antworten
    status?: string
  }): Promise<WPComment> {
    return this.request<WPComment>('POST', '/wp/v2/comments', {
      ...data,
      status: data.status ?? 'approved',
    })
  }

  // ── bbPress Forum Topics ──

  async createForumTopic(data: {
    forum_id: number
    title: string
    content: string
    author: number
  }): Promise<WPForumTopic> {
    // Versuche zuerst den Custom Endpoint
    try {
      return await this.request<WPForumTopic>('POST', '/bgblog/v1/topic', data)
    } catch {
      // Fallback: Standard bbPress REST API
      return this.request<WPForumTopic>('POST', '/wp/v2/topics', {
        title: data.title,
        content: data.content,
        status: 'publish',
        author: data.author,
        bbp_forum_id: data.forum_id,
      })
    }
  }

  // ── bbPress Forum Replies ──

  async createForumReply(data: {
    topic_id: number
    forum_id: number
    content: string
    author: number
  }): Promise<WPForumReply> {
    try {
      return await this.request<WPForumReply>('POST', '/bgblog/v1/reply', data)
    } catch {
      return this.request<WPForumReply>('POST', '/wp/v2/replies', {
        title: '',
        content: data.content,
        status: 'publish',
        author: data.author,
        bbp_topic_id: data.topic_id,
        bbp_forum_id: data.forum_id,
      })
    }
  }

  // ── Forums ──

  async createForum(data: {
    title: string
    content: string
    slug: string
    status?: string
  }): Promise<{ id: number; title: string; slug: string }> {
    return this.request('POST', '/wp/v2/forums', {
      ...data,
      status: data.status ?? 'publish',
    })
  }

  async getForums(): Promise<Array<{ id: number; title: string; slug: string }>> {
    return this.request('GET', '/wp/v2/forums?per_page=100')
  }

  /** Prüft ob der bbPress REST API Endpoint erreichbar ist */
  async checkBbpressRest(): Promise<{ available: boolean; error?: string }> {
    try {
      await this.request('GET', '/wp/v2/forums?per_page=1')
      return { available: true }
    } catch (err) {
      return { available: false, error: err instanceof Error ? err.message : String(err) }
    }
  }

  // ── Categories ──

  async createCategory(data: {
    name: string
    slug: string
    description?: string
    parent?: number
  }): Promise<{ id: number; name: string; slug: string }> {
    return this.request('POST', '/wp/v2/categories', data)
  }

  async getCategories(params?: { per_page?: number }): Promise<Array<{ id: number; name: string; slug: string; count: number }>> {
    const query = params?.per_page ? `?per_page=${params.per_page}` : '?per_page=100'
    return this.request('GET', `/wp/v2/categories${query}`)
  }

  // ── Posts (lesen – für comment-targets) ──

  async getRecentPosts(count = 20): Promise<Array<{ id: number; title: { rendered: string }; author: number }>> {
    return this.request('GET', `/wp/v2/posts?per_page=${count}&orderby=date&order=desc&status=publish`)
  }

  // ── Forum Topics (lesen – für reply-targets) ──

  async getForumTopics(forumId?: number, count = 20): Promise<Array<{ id: number; title: { rendered: string }; author: number }>> {
    try {
      const forumParam = forumId ? `&bbp_forum_id=${forumId}` : ''
      return await this.request('GET', `/wp/v2/topics?per_page=${count}&orderby=date&order=desc${forumParam}`)
    } catch {
      return []
    }
  }

  // ── Tags ──

  async createTag(data: {
    name: string
    slug: string
    description?: string
  }): Promise<{ id: number; name: string; slug: string }> {
    return this.request('POST', '/wp/v2/tags', data)
  }

  async getTags(params?: { per_page?: number }): Promise<Array<{ id: number; name: string; slug: string }>> {
    const query = params?.per_page ? `?per_page=${params.per_page}` : ''
    return this.request('GET', `/wp/v2/tags${query}`)
  }
}
