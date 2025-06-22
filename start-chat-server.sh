#!/bin/bash

# Install ts-node globally if not already installed
if ! command -v ts-node &> /dev/null; then
    echo "Installing ts-node globally..."
    npm install -g ts-node
fi

# Build the server code
echo "Building server code..."
npm run build:server

# Check if Supabase environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "WARNING: Supabase environment variables are not set."
    echo "Chat will work in file-based mode only."
    echo "To use Supabase for chat storage, please set the following variables in .env.local:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key"
    echo ""
fi

# Start the server with socket.io
echo "Starting the server with Socket.IO..."
ts-node --compiler-options '{"module":"commonjs"}' server/index.ts
