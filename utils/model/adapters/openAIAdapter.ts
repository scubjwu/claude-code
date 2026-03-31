import type { UniversalLLMProvider, UniversalCompletionRequest, UniversalCompletionResponse } from '../universalProvider.js'
import OpenAI from 'openai'
import type { BetaMessage, BetaRawMessageStreamEvent } from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'

function anthropicASTToOpenAI(req: UniversalCompletionRequest): any {
  const mappedMessages = req.messages.map(msg => {
    const oMsg: any = { role: msg.role };
    const blocks: any[] = Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }];
    
    let oaiContent = '';
    let toolCalls: any[] = [];
    let toolCllsRes: any[] = [];
    
    for (const block of blocks) {
      if (block.type === 'text') oaiContent += block.text + '\n';
      if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          type: 'function',
          function: { name: block.name, arguments: JSON.stringify(block.input || {}) }
        });
      }
      if (block.type === 'tool_result') {
         toolCllsRes.push({
           role: 'tool',
           tool_call_id: block.tool_use_id,
           content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
         });
      }
    }

    if (oMsg.role === 'user' && toolCllsRes.length > 0) return toolCllsRes;
    if (oaiContent.trim()) oMsg.content = oaiContent.trim();
    if (toolCalls.length > 0) oMsg.tool_calls = toolCalls;

    return [oMsg];
  }).flat();

  if (req.systemPrompt) {
    const spText = Array.isArray(req.systemPrompt) ? req.systemPrompt.map((b: any) => typeof b === 'string' ? b : b.text).join('') : req.systemPrompt;
    mappedMessages.unshift({ role: 'system', content: spText as string });
  }

  const mappedTools = req.tools?.map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.input_schema }
  }));

  return { mappedMessages, mappedTools };
}

export class OpenAIAdapter implements UniversalLLMProvider {
  id = 'openai';

  supportsPromptCaching() {
    return false;
  }

  async createCompletion(req: UniversalCompletionRequest): Promise<UniversalCompletionResponse> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { mappedMessages, mappedTools } = anthropicASTToOpenAI(req);

    const response = await openai.chat.completions.create({
      model: req.model,
      messages: mappedMessages,
      max_tokens: req.maxTokens ?? 1000,
      tools: mappedTools?.length ? mappedTools : undefined,
      temperature: req.temperature,
      top_p: req.topP,
    });

    const choice = response.choices[0];
    const responseAst: any = { id: response.id, role: 'assistant', model: response.model, content: [] };

    if (choice.message.content) responseAst.content.push({ type: 'text', text: choice.message.content });
    if (choice.message.tool_calls) {
      for (const tc of choice.message.tool_calls) {
        responseAst.content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments || "{}") });
      }
    }
    
    responseAst.stop_reason = choice.finish_reason === 'tool_calls' ? 'tool_use' : (choice.finish_reason === 'length' ? 'max_tokens' : 'end_turn');

    return {
      message: responseAst as BetaMessage,
      usage: { inputTokens: response.usage?.prompt_tokens ?? 0, outputTokens: response.usage?.completion_tokens ?? 0 }
    };
  }

  async streamCompletion(req: UniversalCompletionRequest): Promise<any> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { mappedMessages, mappedTools } = anthropicASTToOpenAI(req);

    const stream = await openai.chat.completions.create({
      model: req.model,
      messages: mappedMessages,
      max_tokens: req.maxTokens ?? 1000,
      tools: mappedTools?.length ? mappedTools : undefined,
      temperature: req.temperature,
      top_p: req.topP,
      stream: true
    });

    const generator = (async function* () {
      yield { type: 'message_start', message: { id: 'msg_temp', role: 'assistant', type: 'message', model: req.model, content: [], usage: { input_tokens: 0, output_tokens: 0 } as any } };
      yield { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } };

      let textIndex = 0;
      let toolIndexStart = 1;
      let currentToolId = '';
      let currentToolName = '';
      let isToolMode = false;

      for await (const chunk of stream as any) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          yield { type: 'content_block_delta', index: textIndex, delta: { type: 'text_delta', text: delta.content } };
        }

        if (delta.tool_calls && delta.tool_calls.length > 0) {
          for (const tc of delta.tool_calls) {
            if (tc.id) {
              if (isToolMode) yield { type: 'content_block_stop', index: toolIndexStart - 1 };
              
              isToolMode = true;
              currentToolId = tc.id;
              currentToolName = tc.function?.name || '';
              yield { type: 'content_block_start', index: toolIndexStart, content_block: { type: 'tool_use', id: currentToolId, name: currentToolName, input: {} } as any };
              toolIndexStart++;
            }
            if (tc.function?.arguments) {
              yield { type: 'content_block_delta', index: toolIndexStart - 1, delta: { type: 'input_json_delta', partial_json: tc.function.arguments } as any };
            }
          }
        }
      }

      if (isToolMode) {
        yield { type: 'content_block_stop', index: toolIndexStart - 1 };
      } else {
        yield { type: 'content_block_stop', index: textIndex };
      }

      yield { type: 'message_delta', delta: { stop_reason: isToolMode ? 'tool_use' : 'end_turn' } as any };
      yield { type: 'message_stop' };
    })();

    (generator as any).body = { cancel: async () => {} };
    return generator;
  }
}
