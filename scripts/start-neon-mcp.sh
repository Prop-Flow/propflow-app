#!/bin/bash
export PATH=/Users/joeltorres/.nvm/versions/node/v24.12.0/bin:$PATH
exec npx -y @neondatabase/mcp-server-neon "$@"
