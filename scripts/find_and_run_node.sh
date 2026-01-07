#!/bin/bash
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
    echo "Source success: $NVM_DIR/nvm.sh"
    node -v
    echo "NVM_SOURCE=$NVM_DIR/nvm.sh"
    exit 0
fi

BREW_NVM="/opt/homebrew/opt/nvm/nvm.sh"
if [ -s "$BREW_NVM" ]; then
    \. "$BREW_NVM"
    echo "Source success: $BREW_NVM"
    node -v
    echo "NVM_SOURCE=$BREW_NVM"
    exit 0
fi

BREW_NVM_INTEL="/usr/local/opt/nvm/nvm.sh"
if [ -s "$BREW_NVM_INTEL" ]; then
    \. "$BREW_NVM_INTEL"
    echo "Source success: $BREW_NVM_INTEL"
    node -v
    echo "NVM_SOURCE=$BREW_NVM_INTEL"
    exit 0
fi

echo "Node lookup failed"
exit 1
