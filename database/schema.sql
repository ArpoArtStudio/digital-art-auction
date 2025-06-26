-- Digital Art Auction Platform - Supabase PostgreSQL Schema
-- Designed by Senior Database Architect for Production Environment
-- Optimized for Performance, Security, and Scalability

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types for better type safety
CREATE TYPE user_level AS ENUM (
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6'
);

CREATE TYPE artwork_status AS ENUM (
  'pending', 'approved', 'rejected', 'live', 'sold', 'cancelled'
);

CREATE TYPE bid_status AS ENUM (
  'pending', 'active', 'winning', 'outbid', 'won', 'lost', 'cancelled', 'failed'
);

CREATE TYPE payment_status AS ENUM (
  'not_required', 'pending', 'completed', 'refunded', 'expired', 'failed'
);

CREATE TYPE display_name_option AS ENUM (
  'first_5', 'last_5', 'ens'
);

CREATE TYPE artist_badge_tier AS ENUM (
  'none', 'blue', 'red', 'gold', 'platinum'
);

CREATE TYPE scheduling_type AS ENUM (
  'standard', 'custom'
);

-- ================================
-- CORE USER MANAGEMENT TABLES
-- ================================

-- Users table (wallet-based authentication)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  display_name_option display_name_option DEFAULT 'first_5',
  selected_ens_name TEXT,
  has_set_username BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- ENS names tracking
CREATE TABLE ens_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  ens_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  
  -- Constraints
  UNIQUE(wallet_address, ens_name),
  CONSTRAINT valid_ens_name CHECK (ens_name ~* '^[a-z0-9-]+\.eth$')
);

-- Username change requests
CREATE TABLE username_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  current_display_name TEXT NOT NULL,
  requested_display_option display_name_option NOT NULL,
  requested_ens_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_wallet_address TEXT,
  admin_action_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- ================================
-- ARTIST SYSTEM TABLES
-- ================================

-- Artist profiles
CREATE TABLE artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  email TEXT,
  location TEXT,
  specialization TEXT,
  experience TEXT CHECK (experience IN ('beginner', 'intermediate', 'expert')),
  
  -- Social media links
  website TEXT,
  twitter TEXT,
  instagram TEXT,
  facebook TEXT,
  portfolio TEXT,
  
  -- Profile media
  avatar_url TEXT,
  
  -- Status and verification
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  badge_tier artist_badge_tier DEFAULT 'none',
  
  -- Metrics (calculated fields, updated via triggers)
  total_artworks INTEGER DEFAULT 0,
  total_sales DECIMAL(20, 8) DEFAULT 0,
  
  -- Timestamps
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$' OR email IS NULL),
  CONSTRAINT valid_website CHECK (website ~* '^https?://' OR website IS NULL),
  CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- ================================
-- ARTWORK & NFT MANAGEMENT
-- ================================

-- Artwork submissions
CREATE TABLE artwork_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_wallet_address TEXT NOT NULL,
  
  -- Artwork details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  
  -- NFT details
  contract_address TEXT,
  token_id TEXT,
  
  -- Auction configuration
  starting_price DECIMAL(20, 8) NOT NULL CHECK (starting_price > 0),
  duration_days INTEGER DEFAULT 1 CHECK (duration_days BETWEEN 1 AND 14),
  royalty_percentage DECIMAL(5, 2) DEFAULT 5.0 CHECK (royalty_percentage BETWEEN 0 AND 20),
  
  -- Scheduling
  scheduling_type scheduling_type DEFAULT 'standard',
  preferred_date DATE,
  preferred_time TIME,
  custom_duration INTEGER,
  
  -- Contact and metadata
  artist_email TEXT,
  submission_type TEXT CHECK (submission_type IN ('upload', 'existing-nft')),
  
  -- Status tracking
  status artwork_status DEFAULT 'pending',
  queue_position INTEGER,
  admin_notes TEXT,
  
  -- IPFS and blockchain data
  ipfs_hash TEXT,
  metadata_ipfs_hash TEXT,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  auction_start_time TIMESTAMPTZ,
  auction_end_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (artist_wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  
  -- Indexes for performance
  CONSTRAINT unique_active_submission_per_artist 
    EXCLUDE (artist_wallet_address WITH =) 
    WHERE (status IN ('live', 'approved'))
);

-- Auction queue management
CREATE TABLE auction_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artwork_submission_id UUID NOT NULL UNIQUE,
  position INTEGER NOT NULL,
  scheduled_start_time TIMESTAMPTZ,
  estimated_end_time TIMESTAMPTZ,
  priority_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (artwork_submission_id) REFERENCES artwork_submissions(id) ON DELETE CASCADE,
  
  -- Ensure unique positions
  UNIQUE(position)
);

-- ================================
-- BIDDING SYSTEM TABLES
-- ================================

-- User bidding data and levels
CREATE TABLE user_bidding_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  total_bid_count INTEGER DEFAULT 0,
  user_level user_level DEFAULT 'L1',
  total_spent DECIMAL(20, 8) DEFAULT 0,
  auctions_won INTEGER DEFAULT 0,
  last_bid_at TIMESTAMPTZ,
  level_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id TEXT NOT NULL, -- Maps to artwork submission or external auction system
  bidder_wallet_address TEXT NOT NULL,
  
  -- Bid amounts
  bid_amount DECIMAL(20, 8) NOT NULL CHECK (bid_amount > 0),
  deposit_amount DECIMAL(20, 8) DEFAULT 0.01 CHECK (deposit_amount > 0),
  
  -- Status tracking
  bid_status bid_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'not_required',
  
  -- Blockchain transaction data
  bid_transaction_hash TEXT,
  deposit_transaction_hash TEXT,
  payment_transaction_hash TEXT,
  
  -- Timing
  bid_timestamp TIMESTAMPTZ DEFAULT NOW(),
  payment_deadline TIMESTAMPTZ,
  payment_completed_at TIMESTAMPTZ,
  
  -- Escrow tracking
  escrow_locked BOOLEAN DEFAULT FALSE,
  escrow_released_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (bidder_wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_bids_auction_id (auction_id),
  INDEX idx_bids_bidder (bidder_wallet_address),
  INDEX idx_bids_status (bid_status),
  INDEX idx_bids_timestamp (bid_timestamp DESC)
);

-- Auction settings (admin configurable)
CREATE TABLE auction_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_name TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key for updated_by
  FOREIGN KEY (updated_by) REFERENCES users(wallet_address) ON DELETE SET NULL
);

-- ================================
-- CHAT SYSTEM TABLES
-- ================================

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id TEXT NOT NULL UNIQUE, -- Client-generated ID for real-time sync
  wallet_address TEXT NOT NULL,
  display_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  user_level user_level DEFAULT 'L1',
  bid_count INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by TEXT,
  deleted_at TIMESTAMPTZ,
  deletion_reason TEXT,
  
  -- Rate limiting data
  client_timestamp TIMESTAMPTZ,
  server_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  FOREIGN KEY (deleted_by) REFERENCES users(wallet_address) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT message_length CHECK (char_length(message_text) <= 42),
  
  -- Indexes for chat performance
  INDEX idx_chat_messages_timestamp (server_timestamp DESC),
  INDEX idx_chat_messages_wallet (wallet_address),
  INDEX idx_chat_messages_not_deleted (server_timestamp DESC) WHERE NOT is_deleted
);

-- User muting and moderation
CREATE TABLE user_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  muted_until TIMESTAMPTZ,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  violation_count INTEGER DEFAULT 0,
  last_violation_at TIMESTAMPTZ,
  
  -- Moderation actions
  muted_by TEXT,
  banned_by TEXT,
  muted_at TIMESTAMPTZ,
  banned_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign keys
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  FOREIGN KEY (muted_by) REFERENCES users(wallet_address) ON DELETE SET NULL,
  FOREIGN KEY (banned_by) REFERENCES users(wallet_address) ON DELETE SET NULL,
  
  -- Unique constraint
  UNIQUE(wallet_address)
);

-- Rate limiting tracking
CREATE TABLE rate_limiting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  violations INTEGER DEFAULT 0,
  reset_time TIMESTAMPTZ DEFAULT NOW() + INTERVAL '20 seconds',
  
  -- Foreign key
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(wallet_address)
);

-- ================================
-- PLATFORM CONFIGURATION
-- ================================

-- Feature flags and platform settings
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (updated_by) REFERENCES users(wallet_address) ON DELETE SET NULL
);

-- Admin wallets configuration
CREATE TABLE admin_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL UNIQUE,
  permissions JSONB DEFAULT '{"full_admin": true}'::jsonb,
  added_by TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Foreign keys
  FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE,
  FOREIGN KEY (added_by) REFERENCES users(wallet_address) ON DELETE SET NULL,
  
  -- Constraints
  CONSTRAINT valid_admin_wallet CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$')
);

-- ================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================

-- User table indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Artist profiles indexes
CREATE INDEX idx_artist_profiles_status ON artist_profiles(status);
CREATE INDEX idx_artist_profiles_badge ON artist_profiles(badge_tier);
CREATE INDEX idx_artist_profiles_registered ON artist_profiles(registered_at DESC);

-- Artwork submissions indexes
CREATE INDEX idx_artwork_status ON artwork_submissions(status);
CREATE INDEX idx_artwork_artist ON artwork_submissions(artist_wallet_address);
CREATE INDEX idx_artwork_submitted ON artwork_submissions(submitted_at DESC);
CREATE INDEX idx_artwork_queue ON artwork_submissions(queue_position) WHERE queue_position IS NOT NULL;

-- Bidding indexes
CREATE INDEX idx_user_bidding_level ON user_bidding_profiles(user_level);
CREATE INDEX idx_user_bidding_count ON user_bidding_profiles(total_bid_count DESC);

-- Full-text search indexes
CREATE INDEX idx_artist_name_search ON artist_profiles USING gin(to_tsvector('english', name));
CREATE INDEX idx_artwork_title_search ON artwork_submissions USING gin(to_tsvector('english', title));
CREATE INDEX idx_chat_message_search ON chat_messages USING gin(to_tsvector('english', message_text));

-- ================================
-- FUNCTIONS AND TRIGGERS
-- ================================

-- Function to update artist badge based on submission count
CREATE OR REPLACE FUNCTION update_artist_badge()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE artist_profiles 
  SET badge_tier = CASE 
    WHEN total_artworks >= 30 THEN 'platinum'
    WHEN total_artworks >= 20 THEN 'gold'
    WHEN total_artworks >= 10 THEN 'red'
    WHEN total_artworks >= 5 THEN 'blue'
    ELSE 'none'
  END,
  updated_at = NOW()
  WHERE wallet_address = NEW.artist_wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update user bidding level
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_bidding_profiles 
  SET user_level = CASE 
    WHEN total_bid_count >= 50 THEN 'L6'
    WHEN total_bid_count >= 40 THEN 'L5'
    WHEN total_bid_count >= 30 THEN 'L4'
    WHEN total_bid_count >= 20 THEN 'L3'
    WHEN total_bid_count >= 10 THEN 'L2'
    ELSE 'L1'
  END,
  level_updated_at = NOW(),
  updated_at = NOW()
  WHERE wallet_address = NEW.bidder_wallet_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- TRIGGERS
-- ================================

-- Update timestamps triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_profiles_updated_at 
  BEFORE UPDATE ON artist_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_submissions_updated_at 
  BEFORE UPDATE ON artwork_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bidding_profiles_updated_at 
  BEFORE UPDATE ON user_bidding_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at 
  BEFORE UPDATE ON bids 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER trigger_update_artist_badge 
  AFTER INSERT OR UPDATE ON artwork_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_artist_badge();

CREATE TRIGGER trigger_update_user_level 
  AFTER INSERT OR UPDATE ON bids 
  FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_moderation ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (wallet_address = current_setting('app.current_user', true));

CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (wallet_address = current_setting('app.current_user', true));

-- Artist profile policies
CREATE POLICY "Anyone can view approved artist profiles" ON artist_profiles 
  FOR SELECT USING (status = 'active');

CREATE POLICY "Artists can manage their own profiles" ON artist_profiles 
  FOR ALL USING (wallet_address = current_setting('app.current_user', true));

-- Artwork submission policies
CREATE POLICY "Artists can manage their own submissions" ON artwork_submissions 
  FOR ALL USING (artist_wallet_address = current_setting('app.current_user', true));

CREATE POLICY "Anyone can view approved artworks" ON artwork_submissions 
  FOR SELECT USING (status IN ('approved', 'live', 'sold'));

-- Bidding policies
CREATE POLICY "Users can view and manage their own bids" ON bids 
  FOR ALL USING (bidder_wallet_address = current_setting('app.current_user', true));

-- Chat policies
CREATE POLICY "Anyone can view non-deleted messages" ON chat_messages 
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY "Users can insert their own messages" ON chat_messages 
  FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user', true));

-- Admin policies (bypasses all restrictions)
CREATE POLICY "Admins have full access" ON users 
  FOR ALL USING (
    current_setting('app.current_user', true) IN (
      SELECT wallet_address FROM admin_wallets WHERE is_active = true
    )
  );

-- Apply admin policy to all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('admin_wallets', 'platform_settings')
  LOOP
    EXECUTE format('
      CREATE POLICY "admin_full_access_%s" ON %s 
        FOR ALL USING (
          current_setting(''app.current_user'', true) IN (
            SELECT wallet_address FROM admin_wallets WHERE is_active = true
          )
        )', table_name, table_name);
  END LOOP;
END $$;

-- ================================
-- INITIAL DATA AND CONFIGURATION
-- ================================

-- Insert default admin wallet
INSERT INTO users (wallet_address, is_admin) 
VALUES ('0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0', true)
ON CONFLICT (wallet_address) DO UPDATE SET is_admin = true;

INSERT INTO admin_wallets (wallet_address, permissions, added_by) 
VALUES ('0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0', '{"full_admin": true}'::jsonb, '0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, description, is_public) VALUES
('enableCuratedMode', 'false', 'Only allow admin-approved artwork submissions', true),
('enablePublicArtistProfiles', 'false', 'Allow public viewing of artist profile pages', true),
('enableAdvancedSearch', 'false', 'Enable advanced search and filtering features', true),
('enableQueueNotifications', 'true', 'Send notifications for queue position updates', true),
('platformFee', '0.10', 'Platform fee percentage (10%)', false),
('minimumBidIncrement', '0.01', 'Minimum bid increment percentage (1%)', true),
('maximumBidIncrement', '0.10', 'Maximum bid increment percentage (10%)', true),
('chatMessageLimit', '42', 'Maximum characters per chat message', true),
('rateLimitMessages', '10', 'Maximum messages per 20 seconds', true),
('auctionDurationDays', '1', 'Default auction duration in days', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default auction settings
INSERT INTO auction_settings (setting_name, setting_value, data_type, description) VALUES
('min_bid_increment_percentage', '1', 'number', 'Minimum bid increment as percentage'),
('max_bid_increment_percentage', '10', 'number', 'Maximum bid increment as percentage'),
('default_auction_duration', '24', 'number', 'Default auction duration in hours'),
('deposit_amount_eth', '0.01', 'number', 'Required deposit amount in ETH'),
('payment_deadline_hours', '24', 'number', 'Hours to complete payment after winning')
ON CONFLICT (setting_name) DO NOTHING;

-- ================================
-- PERFORMANCE OPTIMIZATION FUNCTIONS
-- ================================

-- Function to get artist statistics efficiently
CREATE OR REPLACE FUNCTION get_artist_stats(artist_wallet TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_submissions', COUNT(*),
    'pending_submissions', COUNT(*) FILTER (WHERE status = 'pending'),
    'approved_submissions', COUNT(*) FILTER (WHERE status = 'approved'),
    'live_auctions', COUNT(*) FILTER (WHERE status = 'live'),
    'sold_artworks', COUNT(*) FILTER (WHERE status = 'sold'),
    'total_sales', COALESCE(SUM(starting_price) FILTER (WHERE status = 'sold'), 0)
  ) INTO result
  FROM artwork_submissions 
  WHERE artist_wallet_address = artist_wallet;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_artists', (SELECT COUNT(*) FROM artist_profiles WHERE status = 'active'),
    'total_artworks', (SELECT COUNT(*) FROM artwork_submissions),
    'active_auctions', (SELECT COUNT(*) FROM artwork_submissions WHERE status = 'live'),
    'total_bids', (SELECT COUNT(*) FROM bids),
    'total_chat_messages', (SELECT COUNT(*) FROM chat_messages WHERE NOT is_deleted),
    'platform_volume', (SELECT COALESCE(SUM(bid_amount), 0) FROM bids WHERE bid_status = 'won')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ================================

-- Leaderboard view for top bidders
CREATE MATERIALIZED VIEW user_leaderboard AS
SELECT 
  u.wallet_address,
  u.display_name_option,
  u.selected_ens_name,
  ubp.user_level,
  ubp.total_bid_count,
  ubp.total_spent,
  ubp.auctions_won,
  RANK() OVER (ORDER BY ubp.total_bid_count DESC) as bid_rank,
  RANK() OVER (ORDER BY ubp.total_spent DESC) as spending_rank
FROM user_bidding_profiles ubp
JOIN users u ON u.wallet_address = ubp.wallet_address
ORDER BY ubp.total_bid_count DESC;

-- Top artists view
CREATE MATERIALIZED VIEW top_artists AS
SELECT 
  ap.*,
  COUNT(aws.id) as submission_count,
  COALESCE(SUM(aws.starting_price) FILTER (WHERE aws.status = 'sold'), 0) as total_sales
FROM artist_profiles ap
LEFT JOIN artwork_submissions aws ON ap.wallet_address = aws.artist_wallet_address
WHERE ap.status = 'active'
GROUP BY ap.id
ORDER BY total_sales DESC, submission_count DESC;

-- Create indexes on materialized views
CREATE INDEX idx_user_leaderboard_bid_rank ON user_leaderboard(bid_rank);
CREATE INDEX idx_user_leaderboard_level ON user_leaderboard(user_level);
CREATE INDEX idx_top_artists_sales ON top_artists(total_sales DESC);

-- ================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ================================

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh artist stats
CREATE OR REPLACE FUNCTION refresh_artist_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY top_artists;
END;
$$ LANGUAGE plpgsql;

-- Schedule materialized view refreshes (requires pg_cron extension)
-- SELECT cron.schedule('refresh-leaderboard', '*/5 * * * *', 'SELECT refresh_leaderboard();');
-- SELECT cron.schedule('refresh-artists', '0 * * * *', 'SELECT refresh_artist_stats();');

COMMENT ON SCHEMA public IS 'Digital Art Auction Platform Database Schema - Optimized for Production';

-- End of schema
