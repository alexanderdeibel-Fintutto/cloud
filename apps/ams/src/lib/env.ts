const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredEnvVars) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] Missing required environment variables: ${missing.join(', ')}.\n` +
      'Please check your .env file or deployment configuration.'
    );
  }

  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  };
}

export const env = validateEnv();
