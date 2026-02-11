#!/bin/bash

# Build all MCP servers
# This script builds all 64 MCP servers in the packages/mcp-servers directory

set -e

echo "🚀 Building all MCP servers..."
echo ""

# Navigate to mcp-servers directory
cd "$(dirname "$0")/../packages/mcp-servers"

# Counter for successful builds
SUCCESS_COUNT=0
FAIL_COUNT=0
TOTAL_COUNT=0

# Array to store failed builds
FAILED_SERVERS=()

# Get all server directories
SERVERS=$(ls -d */ | sed 's#/##')

for SERVER in $SERVERS; do
  TOTAL_COUNT=$((TOTAL_COUNT + 1))
  
  echo "[$TOTAL_COUNT] Building $SERVER..."
  
  if [ ! -f "$SERVER/package.json" ]; then
    echo "⚠️  Skipping $SERVER (no package.json)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILED_SERVERS+=("$SERVER (no package.json)")
    continue
  fi
  
  # Build the server
  cd "$SERVER"
  
  if pnpm run build > /dev/null 2>&1; then
    echo "✅ $SERVER built successfully"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "❌ $SERVER build failed"
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILED_SERVERS+=("$SERVER")
  fi
  
  cd ..
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Build Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total servers: $TOTAL_COUNT"
echo "✅ Successful: $SUCCESS_COUNT"
echo "❌ Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
  echo "Failed servers:"
  for FAILED in "${FAILED_SERVERS[@]}"; do
    echo "  - $FAILED"
  done
  echo ""
fi

echo "🎉 MCP server build complete!"
