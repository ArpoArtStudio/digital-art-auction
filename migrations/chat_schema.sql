-- Table for chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  uuid TEXT NOT NULL UNIQUE
);

-- Index for efficient queries and ordering
CREATE INDEX IF NOT EXISTS chat_messages_timestamp_idx ON chat_messages(timestamp DESC);

-- Index for wallet address based queries
CREATE INDEX IF NOT EXISTS chat_messages_wallet_address_idx ON chat_messages(wallet_address);

-- RLS (Row Level Security) Policies
-- We'll set basic security policies later

-- Table for user mute status
CREATE TABLE IF NOT EXISTS user_mutes (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  muted_until TIMESTAMPTZ NOT NULL,
  muted_by TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for checking mute status efficiently
CREATE INDEX IF NOT EXISTS user_mutes_wallet_address_idx ON user_mutes(wallet_address);

-- Automatic cleanup function that runs daily to delete messages older than 7 days
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_messages
  WHERE timestamp < NOW() - INTERVAL '7 days'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add the cleanup as a scheduled job
-- Note: In Supabase, you would typically set this up in the Supabase Dashboard under "Database" > "Functions" > "Scheduled Functions"
