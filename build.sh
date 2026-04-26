#!/usr/bin/env bash
set -e

echo "Building and Linking Standalone Claude Assistant..."

# Ensure dependencies are strictly localized
bun install

# Verify the OpenAI SDK dependency exists globally
if ! grep -q '"openai"' package.json; then
    echo "Adding missing OpenAI SDK to manifest..."
    bun add openai
fi

# We use bun link rather than a monolithic binary compilation because the AST 
# runtime contains dozens of heavily optimized lazy-loaded dynamic imports (e.g., 
# sharp, fflate, aws-sdk) that don't easily statically resolve in Bun compiler.
echo "Linking executable globally..."
bun link

echo ""
echo "======================================"
echo "Successfully installed!"
echo "You can now run the assistant anywhere simply by typing:"
echo "$ claude"
echo ""
echo "Don't forget to configure your ~/.claude_env with your desired AI_PROVIDER!"
echo "======================================"
