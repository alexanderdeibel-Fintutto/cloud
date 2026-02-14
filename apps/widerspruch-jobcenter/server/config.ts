import type { BotConfig, ForumId } from '../personas/types'

export function loadConfig(): BotConfig {
  const env = (key: string, fallback = ''): string =>
    process.env[key] ?? fallback

  const envInt = (key: string, fallback: number): number =>
    parseInt(process.env[key] ?? '', 10) || fallback

  const envFloat = (key: string, fallback: number): number =>
    parseFloat(process.env[key] ?? '') || fallback

  return {
    wp_base_url: env('WP_BASE_URL', 'https://buergergeld-blog.de'),
    wp_rest_url: env('WP_REST_URL', 'https://buergergeld-blog.de/wp-json'),
    wp_admin_user: env('WP_ADMIN_USER', 'bgblog-bot'),
    wp_admin_app_password: env('WP_ADMIN_APP_PASSWORD'),

    forum_ids: {
      'hilfe-bescheid': envInt('FORUM_ID_HILFE_BESCHEID', 0),
      'widerspruch': envInt('FORUM_ID_WIDERSPRUCH', 0),
      'sanktionen': envInt('FORUM_ID_SANKTIONEN', 0),
      'kdu-miete': envInt('FORUM_ID_KDU_MIETE', 0),
      'zuverdienst': envInt('FORUM_ID_ZUVERDIENST', 0),
      'erfolge': envInt('FORUM_ID_ERFOLGE', 0),
      'auskotzen': envInt('FORUM_ID_AUSKOTZEN', 0),
      'allgemeines': envInt('FORUM_ID_ALLGEMEINES', 0),
    },

    category_ids: {
      aktuelles: envInt('CAT_AKTUELLES', 0),
      widerspruch: envInt('CAT_WIDERSPRUCH', 0),
      mehrbedarf: envInt('CAT_MEHRBEDARF', 0),
      sanktionen: envInt('CAT_SANKTIONEN', 0),
      kdu_miete: envInt('CAT_KDU_MIETE', 0),
      einkommen: envInt('CAT_EINKOMMEN', 0),
      rechte_tipps: envInt('CAT_RECHTE_TIPPS', 0),
      erfahrungen: envInt('CAT_ERFAHRUNGEN', 0),
    },

    bot_min_delay_minutes: envInt('BOT_MIN_DELAY_MINUTES', 15),
    bot_max_delay_minutes: envInt('BOT_MAX_DELAY_MINUTES', 180),
    bot_max_posts_per_day: envInt('BOT_MAX_POSTS_PER_DAY', 8),
    bot_max_comments_per_day: envInt('BOT_MAX_COMMENTS_PER_DAY', 15),
    bot_active_hours_start: envInt('BOT_ACTIVE_HOURS_START', 7),
    bot_active_hours_end: envInt('BOT_ACTIVE_HOURS_END', 23),
    bescheidboxer_mention_rate: envFloat('BESCHEIDBOXER_MENTION_RATE', 0.18),
  }
}
