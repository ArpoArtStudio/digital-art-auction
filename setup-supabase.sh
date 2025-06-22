#!/bin/bash

# This script helps set up the Supabase database for the chat functionality
# It assumes you have the Supabase CLI installed and configured

# Display instructions
echo "===== Supabase Chat Setup Script ====="
echo "This script will help you set up the Supabase database for the chat functionality."
echo "Before running this script, make sure you have:"
echo "1. Created a Supabase project at https://supabase.com"
echo "2. Installed the Supabase CLI (npm install -g supabase)"
echo "3. Logged in to the CLI (supabase login)"
echo ""

# Check if schema file exists
if [ ! -f "./migrations/chat_schema.sql" ]; then
  echo "Error: chat_schema.sql not found in migrations directory!"
  exit 1
fi

# Ask for Supabase project information
read -p "Enter your Supabase project reference ID: " PROJECT_ID
read -p "Enter your Supabase database password: " DB_PASSWORD

# Set up environment variables
echo "Setting up environment variables..."
echo "NEXT_PUBLIC_SUPABASE_URL=https://$PROJECT_ID.supabase.co" > .env.local.supabase
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=ask-for-anon-key" >> .env.local.supabase
echo ""
echo "Note: You need to replace 'ask-for-anon-key' with your actual anon key"
echo "You can find this in your Supabase project dashboard under Settings > API"
echo ""

# Apply database migrations
echo "Applying database migrations..."
echo "This will execute the schema in migrations/chat_schema.sql"
read -p "Continue? (y/n): " CONTINUE

if [ "$CONTINUE" = "y" ]; then
  # If Supabase CLI is installed, try to use it
  if command -v supabase &> /dev/null; then
    echo "Running migration with Supabase CLI..."
    supabase db push --db-url "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_ID.supabase.co:5432/postgres" ./migrations/chat_schema.sql
  else
    echo "Supabase CLI not found!"
    echo "Please manually import the SQL file using the Supabase dashboard:"
    echo "1. Go to https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo "2. Copy and paste the contents of migrations/chat_schema.sql"
    echo "3. Run the query"
  fi
else
  echo "Migration skipped."
fi

echo ""
echo "===== Setup Instructions ====="
echo "1. Update your .env.local file with the Supabase URL and anon key"
echo "2. Verify that the tables 'chat_messages' and 'user_mutes' were created"
echo "3. Set up a database trigger for message cleanup (see below)"
echo ""
echo "For automatic cleanup, create a scheduled function in Supabase dashboard:"
echo "SQL Editor > New query > Paste and run:"
echo ""
echo "SELECT cron.schedule("
echo "  'daily-chat-cleanup',"
echo "  '0 3 * * *',"
echo "  'SELECT cleanup_old_messages();'"
echo ");"
echo ""

echo "Setup complete! Remember to update your .env.local file with the proper Supabase credentials."
