import type { UniversalLLMProvider, UniversalCompletionRequest, UniversalCompletionResponse } from '../universalProvider.js'
import { getAnthropicClient } from '../../../services/api/client.js'

export class AnthropicAdapter implements UniversalLLMProvider {
  id = 'anthropic';

  supportsPromptCaching() {
    return true;
  }

  async createCompletion(req: UniversalCompletionRequest): Promise<UniversalCompletionResponse> {
    const client = getAnthropicClient({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    // We send the request exactly as is, except Anthropic's SDK handles the stream logic 
    // elsewhere or directly. Since this adapter replaces the raw client.beta.messages.create
    // we just bridge it here.
    const response = await client.beta.messages.create({
      model: req.model,
      messages: req.messages as any,
      system: req.systemPrompt,
      max_tokens: req.maxTokens ?? 1000,
      tools: req.tools,
      tool_choice: req.toolChoice,
      temperature: req.temperature,
      top_p: req.topP,
      // Metadata and betas can be derived from extraParams
      ...(req.extraParams || {})
    });

    return {
      message: response,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationInputTokens: (response.usage as any).cache_creation_input_tokens || 0,
        cacheReadInputTokens: (response.usage as any).cache_read_input_tokens || 0,
      }
    };
  }
}
