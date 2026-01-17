#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting deployment workflow..."
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "❌ Deployment aborted: You have uncommitted changes."
  echo "   Please commit or stash your changes before deploying."
  echo ""
  echo "   Uncommitted files:"
  git status --short
  exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Deployment aborted: You are not on the main branch."
  echo "   Current branch: $CURRENT_BRANCH"
  echo "   Please switch to main before deploying."
  exit 1
fi

# Show current commit
CURRENT_SHA=$(git rev-parse HEAD)
SHORT_SHA=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)

echo "📋 Deployment Details:"
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $SHORT_SHA"
echo "   Message: $COMMIT_MSG"
echo ""

# Confirmation prompt
read -p "⚠️  Deploy to production? This will trigger GitHub Actions. (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Deployment cancelled by user."
  exit 0
fi

echo ""
echo "🚀 Pushing to origin/main..."

if ! git push origin main; then
  echo "❌ Push failed. Please check your network connection and permissions."
  exit 1
fi

echo ""
echo "✅ Deployment initiated!"
echo "   GitHub Actions will now build and deploy your changes."
echo "   Monitor progress: https://github.com/Prop-Flow/propflow-app/actions"
