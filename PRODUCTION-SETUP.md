# 🚀 Production Setup Guide - Going Live

This guide will help you set up your live Supabase database and Pinata IPFS storage to move your project from testing to production.

## 📋 Prerequisites

You'll need accounts and API keys for:
1. **Supabase** - PostgreSQL database hosting
2. **Pinata** - IPFS storage for NFT images and metadata

## 🔑 Required Credentials

### Supabase Setup

1. **Go to [supabase.com](https://supabase.com)**
2. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - Name your project (e.g., "digital-art-auction-prod")
   - Set a strong database password (save this!)
   - Choose a region close to your users

3. **Get your credentials:**
   - Go to Settings → API
   - Copy these values:
     - **Project URL**: `https://your-project-id.supabase.co`
     - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Pinata Setup

1. **Go to [pinata.cloud](https://pinata.cloud)**
2. **Create account and sign in**
3. **Generate API keys:**
   - Go to API Keys → New Key
   - Name: "Digital Art Auction"
   - Permissions: Check "pinFileToIPFS" and "pinJSONToIPFS"
   - Copy these values:
     - **API Key**: `your_api_key`
     - **API Secret**: `your_secret_key`
     - **JWT** (if available): `your_jwt_token`

## 🛠️ Implementation Steps

### Step 1: Update Environment Variables

Update your `.env.local` file with live credentials:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key

# Pinata IPFS Configuration (REQUIRED for NFTs)
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-key
PINATA_JWT=your-pinata-jwt-token

# Admin Configuration
ADMIN_WALLET_ADDRESS=0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
SOCKET_PORT=3001

# Development Settings
NODE_ENV=development
HOSTNAME=localhost
```

### Step 2: Deploy Database Schema

#### Option A: Using the Setup Script (Recommended)

```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

#### Option B: Manual Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `database/schema.sql`
5. Click **Run** to execute

### Step 3: Verify Database Setup

After running the schema, verify these tables exist in your Supabase dashboard:

- ✅ `users`
- ✅ `artist_profiles`
- ✅ `artwork_submissions`
- ✅ `bids`
- ✅ `chat_messages`
- ✅ `calendar_events`
- ✅ `chat_exports`
- ✅ `user_moderation`
- ✅ `platform_config`
- ✅ `admin_wallets`

### Step 4: Test Connections

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Go to Admin Panel:**
   - Navigate to `http://localhost:3000/admin`
   - Login with your admin wallet
   - Go to **Migration** tab

3. **Test connections:**
   - Click "Test Connections"
   - Verify both Supabase and Pinata show green checkmarks

### Step 5: Migrate Existing Data

If you have existing localStorage data:

1. **Create backup:**
   - In admin migration panel, click "Download Backup"
   - This saves your current data

2. **Run migration:**
   - Click "Start Migration"
   - Wait for completion
   - Review any errors

3. **Clear localStorage (optional):**
   - Only after successful migration
   - This removes old localStorage data

## 🔧 Configuration Options

### Chat Export Settings

- **Admin Only**: Only admin wallets can export chat data
- **Retention**: Exported files expire after 7 days
- **Formats**: JSON, CSV, and plain text
- **Filters**: Date range, user-specific, flagged messages

### Calendar Features

- **Event Types**: Auctions, exhibitions, maintenance, promotions
- **Scheduling**: Integration with artwork submission queue
- **Public/Private**: Control event visibility
- **Colors**: Custom color coding for different event types

### Security Features

- **Row Level Security**: Enabled on all tables
- **Admin Controls**: Granular permission system
- **Rate Limiting**: Prevents spam and abuse
- **Data Validation**: Input sanitization and constraints

## 🚨 Important Notes

### Before Going Live:

1. **Database Security:**
   - RLS policies are active
   - Admin wallets are properly configured
   - Test all user permissions

2. **IPFS Storage:**
   - Pinata account has sufficient storage
   - Test image uploads work
   - Verify metadata generation

3. **Environment Security:**
   - Never commit real API keys to git
   - Use environment variables only
   - Set up proper .gitignore

### Production Checklist:

- [ ] Supabase project created and configured
- [ ] Database schema deployed successfully  
- [ ] Pinata account set up with API keys
- [ ] Environment variables updated
- [ ] Connection tests pass
- [ ] Data migration completed (if applicable)
- [ ] Admin access verified
- [ ] All features tested

## 🔄 Migration Process

The migration tool will:

1. **Users**: Convert wallet addresses to user records
2. **Artists**: Migrate artist profiles with social links
3. **Artworks**: Transfer submissions with metadata
4. **Bids**: Recreate bidding history
5. **Chat**: Optional chat history migration

## 📞 Next Steps

Once you provide the credentials, I'll help you:

1. **Test the live connections**
2. **Verify database deployment**
3. **Run data migration**
4. **Configure admin settings**
5. **Test all features with live data**

## 🤝 What I Need From You

Please provide:

1. **Supabase Project URL** (from your dashboard)
2. **Supabase Anon Key** (from Settings → API)
3. **Pinata API Key** (from your Pinata dashboard)
4. **Pinata Secret Key** 
5. **Pinata JWT Token** (if available)

Once you have these, update your `.env.local` file and we'll test the live connections!
