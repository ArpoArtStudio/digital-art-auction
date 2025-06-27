# Supabase Database Integration

This document covers the complete Supabase database integration for the Digital Art Auction Platform.

## Overview

The platform has been migrated from localStorage to a production-ready Supabase PostgreSQL database with the following features:

- **Complete data persistence** - No more data loss on browser refresh
- **Real-time capabilities** - Live updates for bidding and chat
- **Scalable architecture** - Supports thousands of concurrent users
- **Security by design** - Row Level Security (RLS) and proper access controls
- **IPFS integration** - Pinata for NFT metadata and image hosting
- **Analytics and reporting** - Comprehensive user and sales analytics

## Database Schema

### Core Tables

1. **users** - User profiles and authentication
2. **artist_profiles** - Artist information and portfolio data
3. **artwork_submissions** - Artwork listings and auction data
4. **bids** - Bidding history and escrow management
5. **chat_messages** - Real-time chat with moderation
6. **user_moderation** - User bans and restrictions
7. **platform_config** - Admin settings and configuration
8. **admin_actions** - Audit trail for admin activities
9. **user_rate_limits** - Rate limiting and spam prevention

### Features

- **Badge System**: Automatic tier calculation (Blue 5+, Red 10+, Gold 20+, Platinum 30+ submissions)
- **User Levels**: 6-tier progression system based on bidding activity (L1-L6)
- **Real-time Chat**: Moderated chat with user levels and gamification
- **Auction Scheduling**: Immediate, scheduled, and queue-based auctions
- **Escrow System**: Secure payment handling with multiple payment statuses
- **Search & Analytics**: Full-text search and comprehensive reporting

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key
3. Set a strong database password

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and update:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Pinata IPFS Configuration (for NFT hosting)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_api_key
PINATA_JWT=your_pinata_jwt_token

# Admin Configuration
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
```

### 3. Database Schema Setup

#### Option A: Using Setup Script (Recommended)

```bash
chmod +x setup-supabase.sh
./setup-supabase.sh
```

#### Option B: Manual Setup

1. Go to your Supabase dashboard → SQL Editor
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL

### 4. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr uuid @types/uuid
```

### 5. Data Migration

Use the admin migration tool to transfer existing localStorage data:

1. Go to `/admin` in your app
2. Navigate to "Database Migration"
3. Test connections
4. Create backup
5. Run migration

## API Usage

### Database Service

The `DatabaseService` class provides high-level methods for all database operations:

```typescript
import { DatabaseService } from '@/lib/database'

// Create a new user
const user = await DatabaseService.createUser({
  wallet_address: '0x123...',
  display_name_option: 'wallet',
  user_level: 'L1'
})

// Get artist profiles
const artists = await DatabaseService.getAllArtists({
  verified: true,
  limit: 10
})

// Create artwork submission
const artwork = await DatabaseService.createArtworkSubmission({
  artist_id: 'artist-uuid',
  title: 'My Artwork',
  starting_bid: 100
})
```

### Pinata IPFS Service

For NFT metadata and image hosting:

```typescript
import { PinataService } from '@/lib/pinata'

// Upload image and create NFT metadata
const nft = await PinataService.createNFT(
  imageFile,
  {
    title: 'Artwork Title',
    description: 'Artwork description',
    artistName: 'Artist Name'
  }
)

// Returns: { imageHash, metadataHash, metadataUrl }
```

### Real-time Subscriptions

Listen for database changes in real-time:

```typescript
import { supabase } from '@/lib/supabase'

// Listen for new bids
supabase
  .channel('bids')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'bids' },
    (payload) => {
      console.log('New bid:', payload.new)
    }
  )
  .subscribe()
```

## Security Features

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users can only access their own data
- Admins have full access
- Public data is properly exposed
- Chat messages respect moderation rules

### Admin Controls

Admins can:
- Manage artist verifications
- Moderate chat messages
- Configure platform settings
- View comprehensive analytics
- Handle user reports and bans

### Rate Limiting

Built-in rate limiting prevents:
- Chat spam
- Excessive bidding
- API abuse
- DoS attacks

## Performance Optimizations

### Indexes

Strategic indexes for optimal query performance:
- Full-text search on artwork titles/descriptions
- Artist name and badge searches
- Bidding history by user and artwork
- Chat messages by timestamp
- User level and badge tier filtering

### Materialized Views

Pre-computed views for:
- Leaderboards (top bidders/sellers)
- Analytics dashboards
- Featured content

### Query Optimization

- Aggressive JOIN optimization to prevent N+1 queries
- Proper use of `select()` to fetch only needed fields
- Pagination for large datasets
- Efficient real-time subscriptions

## Migration from localStorage

The migration process preserves:
- All registered artists
- Artwork submissions
- Bidding history
- User preferences
- Chat history (optional)

### Migration Steps

1. **Backup**: Automatic backup of localStorage data
2. **Users**: Create user accounts for all wallet addresses
3. **Artists**: Migrate artist profiles with social links
4. **Artworks**: Transfer artwork submissions and metadata
5. **Bids**: Recreate bidding history with proper relationships
6. **Cleanup**: Optional localStorage cleanup after successful migration

## Monitoring and Analytics

### Built-in Analytics

- User growth and engagement metrics
- Bidding volume and trends
- Artist performance statistics
- Platform revenue tracking
- Chat activity monitoring

### Admin Dashboard

Comprehensive admin tools for:
- User management
- Artist verification
- Auction scheduling
- Platform configuration
- Security monitoring

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check Supabase project status
   - Ensure database is accessible

2. **Migration Issues**
   - Run connection tests first
   - Check for data format inconsistencies
   - Review error logs in migration tool

3. **Performance Issues**
   - Monitor query performance in Supabase dashboard
   - Check for missing indexes
   - Review RLS policy efficiency

### Support

For technical support:
1. Check the error logs in Supabase dashboard
2. Use the built-in database migration tool
3. Review the comprehensive error handling in the application
4. Contact the development team with specific error messages

## Future Enhancements

Planned features:
- Advanced analytics dashboard
- Multi-language support
- Enhanced NFT metadata standards
- Integration with additional IPFS providers
- Advanced auction types (Dutch, reserve, etc.)
- Mobile app support with offline capabilities

## API Reference

### Database Types

All database types are fully typed with TypeScript:

```typescript
import type { Tables, Inserts, Updates } from '@/lib/supabase'

type User = Tables<'users'>
type NewUser = Inserts<'users'>
type UserUpdate = Updates<'users'>
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `PINATA_API_KEY` | Pinata API key for IPFS | Optional |
| `PINATA_SECRET_API_KEY` | Pinata secret key | Optional |
| `PINATA_JWT` | Pinata JWT token | Optional |
| `ADMIN_WALLET_ADDRESS` | Admin wallet address | Optional |

This integration provides a solid foundation for a production-ready digital art auction platform with enterprise-grade features and security.
