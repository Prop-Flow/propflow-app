#!/bin/bash
set -e

# Directory for tools
mkdir -p tools
cd tools

# Download SDK if not present
if [ ! -d "google-cloud-sdk" ]; then
    echo "Downloading Google Cloud SDK for Mac ARM64..."
    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-darwin-arm.tar.gz
    
    echo "Extracting..."
    tar -xf google-cloud-cli-darwin-arm.tar.gz
    
    # Clean up archive
    rm google-cloud-cli-darwin-arm.tar.gz
fi

# Install SDK non-interactively
echo "Installing SDK..."
./google-cloud-sdk/install.sh --usage-reporting=false --path-update=false --command-completion=false --quiet

# Install Python packages
echo "Installing Python dependencies..."
pip3 install google-cloud-aiplatform google-cloud-storage google-auth requests

echo "
======================================================
Success! 
To use gcloud, run this command in your terminal:
source tools/env.sh
======================================================
"
