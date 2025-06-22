# Digital Art Auction Platform: Getting Started

Welcome to the Digital Art Auction Platform! This document will help you get the system up and running quickly.

## Prerequisites

Before starting, make sure you have:

1. Node.js v16 or higher
2. NPM v7 or higher
3. Git

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd digital-art-auction
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode (Complete System)

To run both the frontend and backend services together:

```bash
npm run dev:all
```

This starts:
- Socket.IO server on port 3005
- Next.js frontend on port 3000

### Running Individual Components

If you prefer to run components separately:

1. Socket server only:

```bash
npm run simple:chat
```

2. Next.js frontend only:

```bash
npm run dev:next
```

## Testing

### Bidding System Test

To test the bidding and leveling system:

```bash
npm run test:bidding
```

This will simulate multiple users placing bids and verify level progression.

## Functionality

### Main Features

1. **Real-time Chat**: Users can communicate during auctions
2. **Bidding System**: Place bids on digital art pieces
3. **Gamification**: Users gain levels and status based on bidding activity
4. **Admin Tools**: Moderation features for administrators

## Configuration

The system uses environment variables for configuration:

- `.env.local` - Contains local configuration settings
- Key settings include socket server URL and Supabase credentials

## Troubleshooting

If you encounter issues:

1. **Socket connection errors**:
   - Check that ports 3000 and 3005 are available
   - Verify correct socket URL in `.env.local`

2. **Build errors**:
   - Ensure all dependencies are installed correctly
   - Check for TypeScript errors with `npm run lint`

## Documentation

For more detailed information, see:

- `CHAT-BIDDING-SYSTEM.md` - Documentation on the chat and bidding systems
- `chat-gamification.md` - Details on the gamification features
