# Chat Rules System Documentation

This document explains the chat rules system implemented in the Digital Art Auction platform.

## Features

1. **Character Limit (42 characters)**
   - Messages are limited to 42 characters
   - Emojis count as single characters
   - Server validates length before accepting messages
   - Client displays current character count/limit

2. **Rate Limiting**
   - Users are limited to 10 messages in a 20-second window
   - Violations result in a temporary mute
   - Repeated violations increase mute duration

3. **Link Blocking**
   - All URLs and links are automatically blocked
   - Detection includes common TLDs (.com, .org, etc.)
   - Link posting results in a temporary mute

4. **Profanity Filtering**
   - Messages containing profanity are filtered
   - Uses bad-words npm package with additional custom blocklist
   - Violations result in escalating penalties
   - Multiple violations can lead to extended blocks

5. **User Identification Options**
   - Users can choose how they appear in chat:
     - Short address (0x1234...5678)
     - Full wallet address
     - ENS name (if available)
   - Settings can be changed from the chat interface

6. **Admin Moderation Tools**
   - Message deletion
   - User muting (various durations)
   - Chat export functionality

7. **Bidding Integration**
   - User levels displayed in chat
   - Quick bid buttons
   - Level up notifications

## Technical Implementation

- Socket.IO for real-time communication
- File-based storage for development, Supabase for production
- Consistent event naming between client and server
- Progressive penalties for rule violations

## Chat Rules Server Flow

```
User sends message → 
  → Server validates character limit 
  → Server checks for profanity
  → Server checks for links
  → Server checks rate limiting
  → If passes all checks, message is broadcast to all users
  → If fails any check, error is sent back to user
```

## Penalty System

1. **First-time violations**: Short mute (10 seconds)
2. **Repeated violations**: Longer mutes (escalating durations)
3. **Persistent violations**: Blocks (2 hours → 4 hours → 6 hours → etc.)

## Using the Chat System

1. Connect your wallet to join the chat
2. Choose your display name style in the dropdown
3. Type messages (42 character limit)
4. Follow the rules to avoid penalties
5. Use quick bid button to place bids directly from chat

## Starting the System

Use the `start-dev.sh` script to run both the chat server and Next.js app:

```bash
chmod +x start-dev.sh
./start-dev.sh
```
