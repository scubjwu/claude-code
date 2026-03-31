export function hasGrowthBookEnvOverride(feature: string): boolean {
  return false;
}

export function getAllGrowthBookFeatures(): Record<string, unknown> {
  return {};
}

export function getGrowthBookConfigOverrides(): Record<string, unknown> {
  return {};
}

export function setGrowthBookConfigOverride(feature: string, value: unknown): void {}

export function clearGrowthBookConfigOverrides(): void {}

export function getApiBaseUrlHost(): string | undefined {
  return undefined;
}

export async function initializeGrowthBook(): Promise<any> {
  return null;
}

export async function getFeatureValue_DEPRECATED<T>(feature: string, defaultValue: T): Promise<T> {
  return getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue);
}

export function getFeatureValue_CACHED_MAY_BE_STALE<T>(feature: string, defaultValue: T): T {
  // Hard enable experimental features
  const enabledFeatures = [
    'tengu_proactive',
    'tengu_kairos',
    'tengu_buddy',
    'tengu_coordinator_mode',
    'tengu_fast_mode',
    'tengu_dream'
  ];
  if (enabledFeatures.includes(feature) || feature.startsWith('tengu_')) {
    if (typeof defaultValue === 'boolean') return true as unknown as T;
  }
  return defaultValue;
}

export function getFeatureValue_CACHED_WITH_REFRESH<T>(feature: string, defaultValue: T, _refreshIntervalMs: number): T {
  return getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue);
}

export function getFeatureValueForStatsigMigration_CACHED_MAY_BE_STALE<T>(feature: string, defaultValue: T): T {
  return getFeatureValue_CACHED_MAY_BE_STALE(feature, defaultValue);
}

export function onGrowthBookRefresh(listener: any): () => void {
  return () => {};
}

export function refreshGrowthBookAfterAuthChange(): void {}

export function setupPeriodicGrowthBookRefresh(): void {}

export function resetGrowthBook(): void {}

export function checkStatsigFeatureGate_CACHED_MAY_BE_STALE(feature: string): boolean {
  return true;
}

export async function checkGate_CACHED_OR_BLOCKING(feature: string): Promise<boolean> {
  return true;
}

export function getDynamicConfig_CACHED_MAY_BE_STALE<T>(feature: string, defaultValue: T): T {
  return defaultValue;
}

export function getDynamicConfig_BLOCKS_ON_INIT<T>(feature: string, defaultValue: T): T {
  return defaultValue;
}

export async function checkSecurityRestrictionGate(feature: string): Promise<boolean> {
  return false;
}
