# Standalone AI Coding Assistant (E2E)

This repository contains a fully functional, standalone end-to-end AI coding assistant derived from the proprietary `claude-code` codebase. It has been refactored to be model-agnostic, decoupled from internal enterprise infrastructure, and optimized for local execution.

## Features

- **Provider Agnostic**: Seamlessly swap between LLM providers (currently supporting Anthropic and OpenAI). The system dynamically translates Anthropic's AST and Tool-use schemas into native OpenAI function calling and streaming formats.
- **Privacy First**: All upstream telemetry, GrowthBook metrics tracking, and internal OAuth mechanisms have been eradicated or stubbed. Your code and analytics remain local.
- **High-Performance Search**: Integrates native robust file-system operations using a bundled musl-compiled `ripgrep` (rg) binary for instantaneous code indexing and AST retrieval.
- **No Internal Dependencies**: Stubbed out missing internal dependencies (like `TungstenTool`, `WorkflowTool`, and specific sandbox runtimes) to allow the CLI to boot cleanly via standard Node/Bun environments.

## Quickstart

### Prerequisites
Make sure you have [Bun](https://bun.sh/) installed on your machine.
```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation
Clone the repository and install the dependencies:
```bash
bun install
```

### Usage
Run the assistant securely via the CLI. Define your desired LLM Provider along with the corresponding API key as environment variables.

**Using OpenAI (GPT-4o)**:
```bash
export AI_PROVIDER="openai"
export OPENAI_API_KEY="sk-your-openai-api-key"

bun run main.tsx -p "hello, who are you?"
```

**Using Anthropic (Claude 3.5 Sonnet)**:
```bash
export AI_PROVIDER="anthropic"
export ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key"

bun run main.tsx -p "hello, who are you?"
```

*Note: You can also use `bun link` to bind the executable globally as `claude`.*

## System Design & Architecture Workflow

The system operates strictly as a CLI-based REPL loop. Upon execution, the workflow follows this path:

1. **Bootstrapping & Configuration**:
   The entry point (`main.tsx`) bootstraps the React/Ink terminal UI. It loads environmental configurations to establish the active model provider via `adapterManager.ts`.
   
2. **Proxy Interception**:
   Every traditional Anthropic API call issued by the system's core orchestrator (`QueryEngine`) is intercepted by a custom Proxy located in `services/api/client.ts`.

3. **Universal LLM Abstraction**:
   The intercepted request is routed into the `UniversalLLMProvider` interface. 
   - If using **OpenAI**, the adapter (`openAIAdapter.ts`) translates system prompts, message history, and Tool descriptors into OpenAI's native format. It also mimics Anthropic's event stream payload shapes during asynchronous completion resolution, keeping the core engine unaware of the switch.
   - If using **Anthropic**, the adapter forwards the request natively while preserving Prompt Caching hooks.

4. **Tool Execution (Agentic Loop)**:
   The LLM reasoning generates Tool Calls (e.g., `Bash`, `ReadFile`, `GrepSearch`). These requests iterate through the local `AgentTool` definitions. The resulting standard output (`stdout`/`stderr`) is fed back into the message history array to complete the turn.

5. **State Persistance**:
   Conversation history and internal workspace summaries are locally managed and serialized into `.claude.json` artifacts inside your working directory for strict session persistence across boots.