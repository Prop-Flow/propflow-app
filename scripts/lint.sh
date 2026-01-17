#!/bin/bash

echo "🔍 Starting lint workflow..."
echo ""

ERRORS=0

# Run TypeScript type check
echo "📘 Running TypeScript type check..."
if npm run type-check; then
  echo "✅ Type check passed"
else
  echo "❌ Type check failed"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Run ESLint
echo "📋 Running ESLint..."
if npm run lint; then
  echo "✅ ESLint passed"
else
  echo "❌ ESLint failed"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Report results
if [ $ERRORS -eq 0 ]; then
  echo "✅ All lint checks passed!"
  exit 0
else
  echo "❌ $ERRORS lint check(s) failed"
  exit 1
fi
