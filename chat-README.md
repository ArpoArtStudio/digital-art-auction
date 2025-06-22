# Digital Art Auction Platform - Chat System

This document provides instructions for setting up and using the chat functionality for the Digital Art Auction Platform.

## Features

- Real-time messaging between users using Socket.IO
- Web3 wallet integration for authentication
- Message moderation with profanity filtering
- Rate limiting and spam protection
- Admin moderation features (message deletion, user muting)
- Persistent chat history using Supabase
- Automatic cleanup of messages after 7 days

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Get your project URL and anon key from the Supabase dashboard
3. Run the setup script:

```bash
npm run setup:supabase
```

4. Follow the instructions provided by the setup script
5. Update your `.env.local` with the correct Supabase credentials:

```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the Development Server

```bash
# In one terminal - start the Socket.IO server
npm run chat

# In another terminal - start the Next.js app
npm run dev:next
```

## Admin Features

Admin users have additional capabilities:
- Delete any message
- Mute users for specified durations
- Export chat history to CSV
- See chat statistics

## Implementation Details

### Database Schema

The chat system uses two main tables in Supabase:

#### Chat Messages

```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  uuid TEXT NOT NULL UNIQUE
);
```

#### User Mutes

```sql
CREATE TABLE user_mutes (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  muted_until TIMESTAMPTZ NOT NULL,
  muted_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Message Cleanup

Messages are automatically deleted after 7 days using a scheduled function in Supabase.

## Client Integration

The chat system exposes the following components:

- `<ChatButton />` - Floating button that opens the chat window
- `<ChatWindow />` - Main chat interface
- `<ChatHistory />` - Admin component for viewing and managing chat history

All components are connected through the `ChatContext` provider.

## License

This project is proprietary and confidential.
