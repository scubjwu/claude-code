import Anthropic, { type ClientOptions } from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'
import { getUserAgent } from 'src/utils/http.js'
import { getSmallFastModel } from 'src/utils/model/model.js'
import {
  getAPIProvider,
  isFirstPartyAnthropicBaseUrl,
} from 'src/utils/model/providers.js'
import { getProxyFetchOptions } from 'src/utils/proxy.js'
import {
  getIsNonInteractiveSession,
  getSessionId,
} from '../../bootstrap/state.js'
import { getActiveProvider } from '../../utils/model/adapterManager.js'
import type { UniversalCompletionRequest } from '../../utils/model/universalProvider.js'

function createStderrLogger(): ClientOptions['logger'] {
  return {
    error: (msg, ...args) => console.error('[SDK ERROR]', msg, ...args),
    warn: (msg, ...args) => console.error('[SDK WARN]', msg, ...args),
    info: (msg, ...args) => console.error('[SDK INFO]', msg, ...args),
    debug: (msg, ...args) => console.error('[SDK DEBUG]', msg, ...args),
  }
}

export async function getAnthropicClient({
  apiKey,
  maxRetries,
  model,
  fetchOverride,
  source,
}: {
  apiKey?: string
  maxRetries: number
  model?: string
  fetchOverride?: ClientOptions['fetch']
  source?: string
}): Promise<Anthropic> {
  const provider = getActiveProvider();

  // If using Anthropic, return the actual client
  if (provider.id === 'anthropic' || provider.id === 'bedrock') {
    const resolvedApiKey = apiKey || process.env.ANTHROPIC_API_KEY || 'fake-key';
    const clientConfig: ConstructorParameters<typeof Anthropic>[0] = {
      apiKey: resolvedApiKey,
      maxRetries,
    };
    return new Anthropic(clientConfig);
  }

  // Otherwise, return a Proxy object that translates to UniversalLLMProvider Interface
  return {
    beta: {
      messages: {
        create: (params: any, options: any) => {
          const uReq: UniversalCompletionRequest = {
            model: params.model,
            messages: params.messages,
            systemPrompt: params.system,
            tools: params.tools,
            toolChoice: params.tool_choice,
            maxTokens: params.max_tokens,
            temperature: params.temperature,
            topP: params.top_p,
            outputConfig: params.output_config,
            extraParams: params, 
          } as any;

          return {
            withResponse: async () => {
               if (params.stream) {
                 if (!provider.streamCompletion) {
                    throw new Error(`Provider ${provider.id} does not support streamCompletion()`);
                 }
                 const asyncGen = provider.streamCompletion(uReq);
                 return { data: asyncGen, response: { body: { cancel: async () => {} } } };
               } else {
                 const res = await provider.createCompletion(uReq);
                 return { data: res.message, response: { body: { cancel: async () => {} } } };
               }
            }
          }
        }
      }
    }
  } as unknown as Anthropic;
}

export const CLIENT_REQUEST_ID_HEADER = 'x-client-request-id'
