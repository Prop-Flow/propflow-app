#!/bin/bash
set -e  # Exit on any error

echo "🔄 Starting sync workflow..."
echo ""

# Pull latest changes from main
echo "📥 Pulling latest changes from origin/main..."
if ! git pull origin main; then
  echo "❌ Git pull failed. Please resolve conflicts manually."
  exit 1
fi

# Check for merge conflicts
if git ls-files -u | grep -q .; then
  echo "❌ Merge conflicts detected. Please resolve them manually."
  exit 1
fi

echo "✅ Pull successful"
echo ""

# Run type check
echo "🔍 Running TypeScript type check..."
if ! npm run type-check; then
  echo "❌ Type check failed. Please fix type errors before syncing."
  exit 1
fi

echo "✅ Type check passed"
echo ""

# Run build validation
echo "🏗️  Running build validation..."
if ! npm run build; then
  echo "❌ Build failed. Please fix build errors before syncing."
  exit 1
fi

echo "✅ Build successful"
echo ""

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
  echo "ℹ️  No changes to commit. Sync complete."
  exit 0
fi

# Stage all changes
echo "📝 Staging changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
if ! git commit -m "chore: sync with remote"; then
  echo "⚠️  Commit failed (possibly no changes after staging)."
  exit 0
fi

# Push to current branch (not main)
CURRENT_BRANCH=$(git branch --show-current)
echo "🚀 Pushing to origin/$CURRENT_BRANCH..."
if ! git push origin HEAD; then
  echo "❌ Push failed. You may need to set upstream or resolve conflicts."
  exit 1
fi

echo ""
echo "✅ Sync workflow complete!"
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $(git rev-parse --short HEAD)"
