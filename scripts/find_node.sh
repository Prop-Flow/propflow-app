#!/bin/bash

echo "--- Capturing Node Environment ---"
echo "USER: $(whoami)"
echo "SHELL: $SHELL"
echo "PATH: $PATH"

NODE_PATH=$(which node)
NPX_PATH=$(which npx)

echo "Found Node at: $NODE_PATH"
echo "Found NPX at: $NPX_PATH"

# Save to file
echo "NODE_PATH=$NODE_PATH" > node_paths.txt
echo "NPX_PATH=$NPX_PATH" >> node_paths.txt

echo "----------------------------------"
echo "Success! Paths saved to node_paths.txt"
