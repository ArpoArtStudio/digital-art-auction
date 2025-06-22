# Digital Art Auction Platform - Chat & Bidding System Documentation

## Overview

The digital art auction platform features a gamified chat and bidding system that rewards user participation with increased status and privileges. This document explains how these systems work together and how to implement, test, and extend them.

## Chat System

The chat system allows users to communicate in real-time during auctions and features the following capabilities:

### Features

- **Real-time messaging**: Instant delivery of messages to all connected users
- **User leveling**: Visual indicators of user status based on bidding activity
- **Admin controls**: Message deletion and user muting for administrators
- **Typing indicators**: Shows when other users are typing
- **User information**: Detailed user profiles accessible via popover interactions
- **Quick bid functionality**: Place bids directly from the chat interface

### Implementation

The chat system is powered by Socket.IO and consists of:

1. **Frontend components**:
   - `chat-window.tsx`: Main chat interface with message display and input
   - `chat-button.tsx`: Toggles the chat window visibility
   - `user-info-popover.tsx`: Displays detailed user information

2. **Backend services**:
   - `simple-socket-server.js`: Manages WebSocket connections, message broadcasting, and data persistence
   - Message storage in JSON files for simplicity (can be replaced with a proper database)

## Bidding System

The bidding system tracks user participation and rewards engagement with progressive levels:

### User Levels

| Level | Name     | Bid Range | Color  | Benefits                            |
|-------|----------|-----------|--------|-------------------------------------|
| 1     | Newcomer | 0-9 bids  | Blue   | Basic chat access                   |
| 2     | Bidder   | 10-19 bids| Green  | Enhanced visibility in chat         |
| 3     | Active   | 20-29 bids| Red    | Access to special emojis            |
| 4     | Veteran  | 30-39 bids| Yellow | Priority in tied bids               |
| 5     | Expert   | 40-49 bids| White  | Reduced transaction fees            |
| 6     | Master   | 50+ bids  | Purple | Early access to upcoming auctions   |

### Implementation

The bidding system is implemented through:

1. **Frontend components**:
   - `level-up-notification.tsx`: Displays celebratory notifications when users level up
   - `notification-manager.tsx`: Manages the display of level-up notifications

2. **Context providers**:
   - `bidding-context.tsx`: Manages bid counts, levels, and level-up events
   - `chat-context.tsx`: Integrates with the bidding system for chat features

## Integration Between Systems

The chat and bidding systems are integrated in several ways:

1. **Visual integration**:
   - User names in chat are colored according to their bidding level
   - Level badges appear next to usernames in chat
   - Quick bid button in the chat interface

2. **Functional integration**:
   - Level-up notifications appear when bidding increases user level
   - Chat messages can trigger bidding actions
   - Admin privileges in chat for high-level users

## Running the System

### Development

To run the complete system in development mode:

```bash
npm run dev:all
```

This starts both the Next.js frontend and the Socket.IO server.

### Testing

To test the bidding system functionality:

```bash
npm run test:bidding
```

This script simulates multiple users placing bids and verifies level progression.

## Extending the System

### Adding New Features

To add new features to the chat system:

1. Update the `ChatMessage` interface in `chat-context.tsx` if needed
2. Add new UI elements to `chat-window.tsx`
3. Implement socket handlers in `simple-socket-server.js`

### Adding New User Levels

To add new bidding levels:

1. Update the `BiddingLevel` enum in `bidding-context.tsx`
2. Add level definitions to the `getLevelFromBidCount`, `getLevelColor`, and `getLevelName` functions
3. Update the level-up notification styling in `level-up-notification.tsx`

## Troubleshooting

### Common Issues

1. **Socket connection errors**:
   - Check that the socket server is running on the correct port
   - Verify that `.env.local` has the correct `NEXT_PUBLIC_SOCKET_URL` setting

2. **Level-up notifications not appearing**:
   - Ensure the `NotificationManager` component is included in your application layout
   - Check that bid count increments are correctly triggering level-up events

3. **Admin controls not working**:
   - Verify that the admin wallet address matches the `OWNER_WALLET_ADDRESS` in wallet-context.tsx
   - Confirm that admin socket events are properly configured
