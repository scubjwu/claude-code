export type ModelKey = string;
export type ModelStrings = Record<ModelKey, string>;

export function resolveOverriddenModel(modelId: string): string {
  return 'claude-3-5-sonnet-20241022';
}

export function getModelStrings(): ModelStrings {
  return new Proxy({}, {
    get(target, prop) {
      return 'claude-3-5-sonnet-20241022';
    }
  });
}

export async function ensureModelStringsInitialized(): Promise<void> {
  return Promise.resolve();
}
