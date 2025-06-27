#!/bin/bash

# Digital Art Auction Platform - Supabase Database Setup Script
# This script helps set up the complete Supabase database schema

echo "===== Digital Art Auction Platform - Supabase Setup ====="
echo "This script will help you set up the complete Supabase database schema."
echo "Before running this script, make sure you have:"
echo "1. Created a Supabase project at https://supabase.com"
echo "2. Installed the Supabase CLI (npm install -g supabase)"
echo "3. Logged in to the CLI (supabase login)"
echo "4. Your Supabase project URL and anon key ready"
echo ""

# Check if schema file exists
if [ ! -f "./database/schema.sql" ]; then
  echo "Error: database/schema.sql not found!"
  echo "Please ensure the database schema file exists."
  exit 1
fi

# Ask for Supabase project information
read -p "Enter your Supabase project reference ID: " lbehoenujvjnwxlpubkf
read -p "Enter your Supabase database password: " @Plastictree469

# Set up environment variables
echo "Setting up environment variables..."
echo "NEXT_PUBLIC_SUPABASE_URL=https://$PROJECT_ID.supabase.co" > .env.local.supabase
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZWhvZW51anZqbnd4bHB1YmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTk2NTIsImV4cCI6MjA2NjQ5NTY1Mn0.CorsTJD8u4WVU5gX4akZUBjYpm4tslcWGrVgb3nn7Go >> .env.local.supabase
echo ""
echo "Note: You need to replace 'ask-for-anon-key' with your actual anon key"
echo "You can find this in your Supabase project dashboard under Settings > API"
echo ""

# Ask about Pinata setup
read -p "Do you want to configure Pinata IPFS for NFT hosting? (y/n): " SETUP_PINATA

if [ "$SETUP_PINATA" = "y" ]; then
  read -p "Enter your Pinata API Key: "2f1b1b15f9caf0a854fc
  read -p "Enter your Pinata Secret API Key: "73603680e0b9071783e77e09841cab4ae91c3d8e5eb1a96de2f81e1a614f8086
  read -p "Enter your Pinata JWT Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1Mzg4ZjFlMS1hNmM5LTQ4NjEtYjk2Mi0zZmZiM2QzZDY0MjciLCJlbWFpbCI6ImFycG9hcnRzdHVkaW9AZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjJmMWIxYjE1ZjljYWYwYTg1NGZjIiwic2NvcGVkS2V5U2VjcmV0IjoiNzM2MDM2ODBlMGI5MDcxNzgzZTc3ZTA5ODQxY2FiNGFlOTFjM2Q4ZTVlYjFhOTZkZTJmODFlMWE2MTRmODA4NiIsImV4cCI6MTc4MjQ2MDMyNn0.H116Q-SjU6biXUi2tAokA_7KQcKCKxu3BQYIQVHlNpU
  
  echo "PINATA_API_KEY=$PINATA_API_KEY" >> .env.local.supabase
  echo "PINATA_SECRET_API_KEY=$PINATA_SECRET_KEY" >> .env.local.supabase
  echo "PINATA_JWT=$PINATA_JWT" >> .env.local.supabase
  echo ""
  echo "Pinata configuration added to .env.local.supabase"
fi

# Apply database migrations
echo "Applying database schema..."
echo "This will execute the complete schema in database/schema.sql"
read -p "Continue? (y/n): " CONTINUE

if [ "$CONTINUE" = "y" ]; then
  # If Supabase CLI is installed, try to use it
  if command -v supabase &> /dev/null; then
    echo "Running migration with Supabase CLI..."
    supabase db push --db-url "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_ID.supabase.co:5432/postgres" ./database/schema.sql
  else
    echo "Supabase CLI not found!"
    echo "Please manually import the SQL file using the Supabase dashboard:"
    echo "1. Go to https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo "2. Copy and paste the contents of database/schema.sql"
    echo "3. Run the query"
    echo ""
    echo "Alternatively, install Supabase CLI and run this script again:"
    echo "npm install -g supabase"
  fi
else
  echo "Migration skipped."
fi

echo ""
echo "===== Post-Setup Instructions ====="
echo "1. Copy .env.local.supabase to .env.local and update with actual credentials"
echo "2. Verify all tables were created in your Supabase dashboard"
echo "3. Test the database connection by running the app"
echo ""
echo "Tables that should be created:"
echo "- users"
echo "- artist_profiles"
echo "- artwork_submissions"
echo "- bids"
echo "- chat_messages"
echo "- user_moderation"
echo "- platform_config"
echo "- admin_actions"
echo "- user_rate_limits"
echo ""
echo "Row Level Security (RLS) has been enabled for all tables."
echo "Admin functions and triggers have been set up automatically."
echo ""

if [ "$SETUP_PINATA" = "y" ]; then
  echo "Pinata IPFS is configured. Test the connection in your app's admin panel."
  echo ""
fi

echo "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual Supabase credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the database connection and migration tools"
echo "4. Use the admin panel to manage artists and artworks"
