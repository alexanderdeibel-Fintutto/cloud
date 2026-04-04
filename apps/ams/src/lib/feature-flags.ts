/**
 * Simple feature flags system.
 * Flags can be toggled via environment variables (VITE_FF_*) or defaults.
 */

const flags = {
  REALTIME_SUBSCRIPTIONS: true,
  CSV_EXPORT: true,
  COMMAND_PALETTE: true,
  AI_CENTER: true,
  COMMUNITY_MODULE: true,
  DEVOPS_MODULE: true,
} as const;

type FlagKey = keyof typeof flags;

export function isFeatureEnabled(flag: FlagKey): boolean {
  // Check environment variable override first
  const envKey = `VITE_FF_${flag}`;
  const envValue = import.meta.env[envKey];

  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }

  return flags[flag];
}

export function getAllFlags(): Record<FlagKey, boolean> {
  const result = {} as Record<FlagKey, boolean>;
  for (const key of Object.keys(flags) as FlagKey[]) {
    result[key] = isFeatureEnabled(key);
  }
  return result;
}
