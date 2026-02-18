// pm2 Konfiguration für den Board-Bot Server
// Start:   npx pm2 start ecosystem.config.cjs
// Status:  npx pm2 status
// Logs:    npx pm2 logs board-bot
// Stop:    npx pm2 stop board-bot
// Restart: npx pm2 restart board-bot

module.exports = {
  apps: [{
    name: 'board-bot',
    script: 'npx',
    args: 'tsx server/index.ts',
    cwd: __dirname,

    // Auto-Restart bei Crash
    autorestart: true,
    max_restarts: 50,
    min_uptime: '10s',
    restart_delay: 5000,

    // Watchdog: Restart wenn Prozess nicht mehr reagiert
    max_memory_restart: '500M',

    // Logging
    error_file: './logs/bot-error.log',
    out_file: './logs/bot-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',

    // Environment
    env: {
      NODE_ENV: 'production',
      BOT_AUTOSTART: 'true',
    },
  }],
}
