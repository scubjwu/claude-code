import type {
  BetaMessageParam,
  BetaToolUnion,
  BetaMessage,
  BetaToolChoiceAuto,
  BetaToolChoiceTool,
  BetaOutputConfig
} from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'
import type { SystemPrompt } from '../systemPromptType.js'

export interface UniversalCompletionRequest {
  messages: BetaMessageParam[]
  systemPrompt?: SystemPrompt
  tools?: BetaToolUnion[]
  toolChoice?: BetaToolChoiceTool | BetaToolChoiceAuto
  model: string
  maxTokens?: number
  temperature?: number
  topP?: number
  /**
   * If true, the provider adapter should attempt to apply cache control hints.
   * If false or not supported, should be gracefully ignored by the adapter.
   */
  enablePromptCaching?: boolean
  /** Any extra custom provider configuration */
  extraParams?: Record<string, unknown>
  signal?: AbortSignal
  outputConfig?: BetaOutputConfig
}

export interface UniversalCompletionResponse {
  message: BetaMessage
  usage: {
    inputTokens: number
    outputTokens: number
    cacheCreationInputTokens?: number
    cacheReadInputTokens?: number
  }
}

export interface UniversalLLMProvider {
  /** The unique identifier of the provider */
  id: string
  
  /** True if the provider natively supports prompt caching via headers/directives */
  supportsPromptCaching(): boolean
  
  /** Execute a structured LLM completion request */
  createCompletion(request: UniversalCompletionRequest): Promise<UniversalCompletionResponse>
  
  /** Execute a structured LLM completion request with streaming support */
  streamCompletion?(request: UniversalCompletionRequest): AsyncGenerator<any, void, unknown>
}
