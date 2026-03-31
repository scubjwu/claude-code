#!/bin/bash

# Install Bun if not present
if ! command -v bun &> /dev/null
then
    echo "bun could not be found. Installing..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Install dependencies
bun install
