#!/bin/bash
echo "-----------------------------------"
echo "  Propflow Database Setup Helper"
echo "-----------------------------------"
echo ""
echo "Please paste your PostgreSQL Connection String below and press ENTER:"
echo "(Example: postgresql://user:password@localhost:5432/propflow)"
echo ""
read -r DB_URL

if [ -z "$DB_URL" ]; then
  echo "Error: No URL provided. Exiting."
  exit 1
fi

# Create back up if exists
if [ -f .env ]; then
  cp .env .env.bak
fi

# Write to .env
# We'll append it or replace it. For safety let's just append or create new if simple.
# But we need to make sure we don't have duplicate DATABASE_URL.

# Simple approach: Read .env, remove DATABASE_URL lines, append new one.
grep -v "DATABASE_URL" .env > .env.tmp 2>/dev/null
echo "DATABASE_URL=\"$DB_URL\"" >> .env.tmp
mv .env.tmp .env

echo ""
echo "✅ Success! Updated .env with your connection string."
echo "You can now return to the AI agent."
