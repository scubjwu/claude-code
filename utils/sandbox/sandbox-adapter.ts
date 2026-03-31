export type SandboxAskCallback = any;
export type SandboxDependencyCheck = any;
export type FsReadRestrictionConfig = any;
export type FsWriteRestrictionConfig = any;
export type NetworkRestrictionConfig = any;
export type NetworkHostPattern = any;
export type SandboxViolationEvent = any;
export type SandboxRuntimeConfig = any;
export type IgnoreViolationsConfig = any;
export const SandboxViolationStore = {} as any;
export const SandboxRuntimeConfigSchema = {} as any;

export function resolvePathPatternForSandbox() { return ''; }
export function resolveSandboxFilesystemPath() { return ''; }
export function shouldAllowManagedSandboxDomainsOnly() { return false; }
export function convertToSandboxRuntimeConfig() { return {} as any; }
export function addToExcludedCommands() {}

export interface ISandboxManager {
  initialize(sandboxAskCallback?: SandboxAskCallback): Promise<void>
  isSupportedPlatform(): boolean
  isPlatformInEnabledList(): boolean
  getSandboxUnavailableReason(): string | undefined
  isSandboxingEnabled(): boolean
  isSandboxEnabledInSettings(): boolean
  checkDependencies(): SandboxDependencyCheck
  isAutoAllowBashIfSandboxedEnabled(): boolean
  areUnsandboxedCommandsAllowed(): boolean
  isSandboxRequired(): boolean
  areSandboxSettingsLockedByPolicy(): boolean
  setSandboxSettings(options: any): Promise<void>
  getFsReadConfig(): FsReadRestrictionConfig
  getFsWriteConfig(): FsWriteRestrictionConfig
  getNetworkRestrictionConfig(): NetworkRestrictionConfig
  getAllowUnixSockets(): string[] | undefined
  getAllowLocalBinding(): boolean | undefined
  getIgnoreViolations(): IgnoreViolationsConfig | undefined
  getEnableWeakerNestedSandbox(): boolean | undefined
  getExcludedCommands(): string[]
  getProxyPort(): number | undefined
  getSocksProxyPort(): number | undefined
  getLinuxHttpSocketPath(): string | undefined
  getLinuxSocksSocketPath(): string | undefined
  waitForNetworkInitialization(): Promise<boolean>
  wrapWithSandbox(
    command: string,
    binShell?: string,
    customConfig?: Partial<SandboxRuntimeConfig>,
    abortSignal?: AbortSignal,
  ): Promise<string>
  cleanupAfterCommand(): void
  getSandboxViolationStore(): any
  annotateStderrWithSandboxFailures(command: string, stderr: string): string
  getLinuxGlobPatternWarnings(): string[]
  refreshConfig(): void
  reset(): Promise<void>
}

export const SandboxManager: ISandboxManager = {
  initialize: async () => {},
  isSupportedPlatform: () => false,
  isPlatformInEnabledList: () => false,
  getSandboxUnavailableReason: () => undefined,
  isSandboxingEnabled: () => false,
  isSandboxEnabledInSettings: () => false,
  checkDependencies: () => ({ errors: [], warnings: [] }),
  isAutoAllowBashIfSandboxedEnabled: () => true,
  areUnsandboxedCommandsAllowed: () => true,
  isSandboxRequired: () => false,
  areSandboxSettingsLockedByPolicy: () => false,
  setSandboxSettings: async () => {},
  getFsReadConfig: () => ({}),
  getFsWriteConfig: () => ({}),
  getNetworkRestrictionConfig: () => ({}),
  getAllowUnixSockets: () => undefined,
  getAllowLocalBinding: () => undefined,
  getIgnoreViolations: () => undefined,
  getEnableWeakerNestedSandbox: () => undefined,
  getExcludedCommands: () => [],
  getProxyPort: () => undefined,
  getSocksProxyPort: () => undefined,
  getLinuxHttpSocketPath: () => undefined,
  getLinuxSocksSocketPath: () => undefined,
  waitForNetworkInitialization: async () => true,
  wrapWithSandbox: async (cmd: string) => cmd,
  cleanupAfterCommand: () => {},
  getSandboxViolationStore: () => ({}),
  annotateStderrWithSandboxFailures: (c, e) => e,
  getLinuxGlobPatternWarnings: () => [],
  refreshConfig: () => {},
  reset: async () => {},
};
