import { AnthropicAdapter } from './adapters/anthropicAdapter.js'
import { OpenAIAdapter } from './adapters/openAIAdapter.js'
import type { UniversalLLMProvider } from './universalProvider.js'

let activeProvider: UniversalLLMProvider | null = null;

export function getActiveProvider(): UniversalLLMProvider {
  if (activeProvider) return activeProvider;
  
  const providerType = process.env.AI_PROVIDER || 'anthropic';
  
  if (providerType === 'openai') {
    activeProvider = new OpenAIAdapter();
  } else {
    activeProvider = new AnthropicAdapter();
  }
  return activeProvider;
}

export function setActiveProvider(provider: UniversalLLMProvider) {
  activeProvider = provider;
}
