# Supabase Database Setup Guide

## 🎯 Quick Start

The Digital Art Auction Platform now supports Supabase for production-ready database functionality. Follow this guide to set up your database.

## 🚀 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: "digital-art-auction"
5. Generate a strong database password
6. Select a region close to your users
7. Click "Create new project"

### 2. Get Your Credentials

1. Go to **Settings** → **API**
2. Copy your **Project URL**
3. Copy your **anon/public key**

### 3. Update Environment Variables

Update your `.env.local` file:

```bash
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Pinata for IPFS (NFT hosting)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Admin configuration
ADMIN_WALLET_ADDRESS=0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0
```

### 4. Set Up Database Schema

#### Option A: Using the Setup Script (Recommended)

```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

#### Option B: Manual Setup

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy the contents of `database/schema.sql`
5. Paste and run the query

### 5. Verify Setup

1. Restart your development server: `npm run dev`
2. Go to `/admin/migration` in your app
3. Click "Test Connections"
4. You should see green checkmarks for Supabase

## 🔄 Data Migration

### Migrate from localStorage

If you have existing data in localStorage:

1. Go to `/admin/migration`
2. Click "Download Backup" (creates a safety backup)
3. Click "Test Connections" (should show green for Supabase)
4. Click "Start Migration"
5. Review the results

### What Gets Migrated

- ✅ User profiles and wallet connections
- ✅ Artist registrations and profiles
- ✅ Artwork submissions and metadata
- ✅ Bidding history and user levels
- ✅ Chat messages (optional)
- ✅ User preferences and settings

## 🔧 Advanced Configuration

### Pinata IPFS Setup (Optional)

For NFT metadata hosting:

1. Create account at [pinata.cloud](https://pinata.cloud)
2. Go to **API Keys**
3. Create new key with full permissions
4. Add credentials to `.env.local`

### Database Features

- **Real-time Updates**: Live bidding and chat
- **Row Level Security**: Automatic data protection
- **Full-text Search**: Search artists and artworks
- **Analytics**: Comprehensive reporting
- **Audit Trail**: Track all admin actions
- **Rate Limiting**: Prevent spam and abuse

## 🛠️ Development Mode

The app works in two modes:

### Placeholder Mode (Current)
- Uses mock data and localStorage
- Perfect for development and testing
- No database required

### Production Mode
- Full Supabase integration
- Real-time features
- Scalable for thousands of users

## 🔍 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env.local` file exists
   - Verify URL and key format
   - Restart development server

2. **"Connection failed"**
   - Verify credentials are correct
   - Check Supabase project is active
   - Ensure database is accessible

3. **Migration errors**
   - Use the backup feature first
   - Check browser console for errors
   - Run migration in smaller batches

### Get Help

1. Check the admin migration tool for detailed error messages
2. Review the Supabase dashboard for database status
3. Use browser dev tools to inspect network requests

## 📊 Database Schema Overview

### Core Tables

- **users** - User accounts and wallet connections
- **artist_profiles** - Artist information and social links
- **artwork_submissions** - Artwork listings and auctions
- **bids** - Bidding history and escrow data
- **chat_messages** - Real-time chat with moderation

### Features

- **Badge System**: Automatic artist tier calculation
- **User Levels**: 6-tier progression (L1-L6)
- **Auction Types**: Immediate, scheduled, and queued
- **Security**: Row-level security and admin controls

## 🚀 Next Steps

After setup:

1. Test the app with real wallet connections
2. Create your first artist profile
3. Submit test artwork
4. Try the bidding system
5. Explore the admin panel
6. Set up production deployment

## 📞 Support

For technical support:
- Check the migration tool for detailed error messages
- Review Supabase dashboard logs
- Ensure all environment variables are correct

Your Digital Art Auction Platform is now ready for production use! 🎨
