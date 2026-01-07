#!/bin/bash
echo "$(date): Script started with args: $@" >> /tmp/neon_debug.log
export PATH=/Users/joeltorres/.nvm/versions/node/v24.12.0/bin:$PATH

# Get API Key from Env or First Argument
API_KEY="${NEON_API_KEY:-$1}"

if [ -z "$API_KEY" ]; then
  echo "Error: NEON_API_KEY is missing."
  echo "Usage: NEON_API_KEY=<key> $0"
  echo "   Or: $0 <key>"
  exit 1
fi

exec /Users/joeltorres/.nvm/versions/node/v24.12.0/bin/npx -y @neondatabase/mcp-server-neon start "$API_KEY"
