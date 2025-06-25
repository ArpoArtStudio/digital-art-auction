#!/bin/bash

# Kill any existing processes
pkill -f "next\|node.*3000\|npm.*dev" 2>/dev/null || true

# Clear any cached data
rm -rf .next 2>/dev/null || true

# Set environment variables to avoid networking issues
export NODE_OPTIONS="--dns-result-order=ipv4first --max-http-header-size=16384"
export HOSTNAME="localhost"
export PORT=3000

# Start the development server with localhost binding
echo "Starting Next.js development server on localhost:3000..."
npx next dev --hostname localhost --port 3000
