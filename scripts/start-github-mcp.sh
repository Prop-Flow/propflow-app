#!/bin/bash

# Add common Docker paths to PATH
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Applications/Docker.app/Contents/Resources/bin

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: 'docker' executable not found in PATH."
    echo "Please install Docker Desktop (https://www.docker.com/products/docker-desktop/) or ensure it is in your PATH."
    echo "Current PATH: $PATH"
    # We don't exit here to let npx try anyway, in case it's found via some other mechanism, 
    # but the error above will be visible in logs if it fails.
else
    echo "Docker found at: $(command -v docker)"
fi

export PATH=/Users/joeltorres/.nvm/versions/node/v24.12.0/bin:$PATH
exec npx -y @modelcontextprotocol/server-github "$@"
