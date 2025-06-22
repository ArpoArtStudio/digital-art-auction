# Digital Art Auction Platform - Complete Documentation

**Version:** 1.0.0  
**Last Updated:** June 22, 2025  
**Authors:** Development Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [User Interface](#user-interface)
   - [Main Layout](#main-layout)
   - [Home Page](#home-page)
   - [Auction View](#auction-view)
   - [Artist Galleries](#artist-galleries)
   - [Previous Auctions](#previous-auctions)
4. [Bidding System](#bidding-system)
   - [Bid Placement](#bid-placement)
   - [Quick Bid Feature](#quick-bid-feature)
   - [Bid History](#bid-history)
   - [Escrow Management](#escrow-management)
5. [Chat System](#chat-system)
   - [Chat Window](#chat-window)
   - [Username Selection](#username-selection)
   - [Chat Rules & Moderation](#chat-rules--moderation)
   - [User Levels & Gamification](#user-levels--gamification)
   - [Notifications](#notifications)
6. [Wallet Integration](#wallet-integration)
   - [Connection Process](#connection-process)
   - [Wallet Display Options](#wallet-display-options)
   - [ENS Integration](#ens-integration)
7. [Admin Panel](#admin-panel)
   - [Dashboard](#dashboard)
   - [Auction Management](#auction-management)
   - [User Management](#user-management)
   - [Content Moderation](#content-moderation)
   - [Analytics](#analytics)
8. [Smart Contracts](#smart-contracts)
   - [Auction Contract](#auction-contract)
   - [Escrow Contract](#escrow-contract)
   - [NFT Minting](#nft-minting)
9. [Backend Services](#backend-services)
   - [Socket Server](#socket-server)
   - [Database Schema](#database-schema)
   - [API Endpoints](#api-endpoints)
10. [Development & Deployment](#development--deployment)
    - [Local Development](#local-development)
    - [Production Deployment](#production-deployment)
    - [Environment Variables](#environment-variables)

---

## Introduction

The Digital Art Auction Platform is a comprehensive web application designed to facilitate the auctioning of digital art as NFTs. The platform integrates blockchain technology, real-time bidding, interactive chat, and wallet connections to create an immersive auction experience for digital art enthusiasts.

Key features include:
- Real-time NFT auctions with secure bidding
- Live chat system with user levels and gamification
- Wallet integration with ENS support
- Comprehensive admin panel
- Artist profiles and galleries
- Auction history and analytics

This document provides a comprehensive overview of all platform components, features, and technical implementations.

---

## System Architecture

### Overall Architecture

The Digital Art Auction Platform is built using:
- **Frontend**: Next.js 15.2.4 with React
- **Styling**: Tailwind CSS with shadcn/ui component system
- **Backend**: Node.js with Socket.IO for real-time features
- **Database**: Supabase (PostgreSQL)
- **Blockchain Integration**: Ethereum smart contracts for auctions and NFT minting

### Main Components

1. **Next.js Application (Port 3000)**
   - Core frontend application
   - Server-side rendering for SEO optimization
   - API routes for backend functionality
   - Authentication system

2. **Socket Server (Port 3008)**
   - Handles real-time bidding updates
   - Powers the chat system
   - Sends notifications to connected clients
   - Manages user presence and typing indicators

3. **Smart Contracts**
   - Auction contract for bid validation and winner determination
   - Escrow contract for secure fund handling
   - NFT contract for digital art tokenization

4. **Supabase Database**
   - Stores user information
   - Records auction history
   - Manages artist profiles
   - Logs chat and bid activity

---

## User Interface

### Main Layout

The application follows a responsive design with a dark theme by default (light theme available via toggle).

**Header Components:**
- Site logo (top-left)
- Navigation menu (center-top)
  - Home
  - Current Auction
  - Artists
  - Previous Auctions
- Wallet connection button (top-right)
- Theme toggle (top-right)

**Footer Components:**
- Copyright information
- Social media links
- Terms and policies
- Contact information

**Floating Components:**
- Chat button (bottom-right)
- Chat window (expands above chat button)
- Notification system (appears as needed)

### Home Page

**Hero Section:**
- Featured artwork preview
- Current auction countdown timer
- Quick access bidding button
- Brief platform description

**Current Auction Section:**
- Large preview of current auction item
- Artist information
- Current bid and minimum next bid information
- Countdown timer
- Bid history preview (top 3 bids)
- "Place Bid" button

**Artist Spotlight Section:**
- Rotating featured artist
- Brief bio
- Sample works (3-4 thumbnails)
- Link to full profile

**Recent Activity Section:**
- Latest bids across all auctions
- Recent artwork submissions
- New user signups
- Upcoming auction announcements

**Platform Stats:**
- Total artworks auctioned
- Total value transacted
- Number of artists
- Active user count

### Auction View

**Auction Header:**
- Artwork title
- Artist name with profile link
- Auction status (upcoming, active, ended)
- Time remaining/ended timestamp

**Artwork Display:**
- High-resolution artwork image/video
- Expandable to full-screen view
- Multiple view angles if available
- Artwork details (dimensions, medium, year)

**Bidding Section:**
- Current highest bid
- Minimum next bid amount
- Quick Bid button with dropdown for:
  - Min Bid (1% increase)
  - Max Bid (10% increase)
- Bid history table with:
  - Bidder name/address
  - Bid amount
  - Timestamp
  - User level badge

**Artwork Information:**
- Detailed description
- Creation process
- Artist statement
- Provenance information
- Certificate of authenticity details

**Related Works:**
- Other works by the same artist
- Similar styled artworks
- Previous auction pieces with similar themes

### Artist Galleries

**Artist Header:**
- Profile image
- Artist name
- Location
- Specialization/style
- Social media links

**Artist Bio:**
- Detailed biography
- Career highlights
- Artist statement
- Influences and inspiration

**Artwork Gallery:**
- Grid layout of all artworks
- Filtering options:
  - Year created
  - Medium/style
  - Auction status (sold/available)
  - Price range
- Sort options:
  - Recently added
  - Price (high/low)
  - Popularity
  - Year created

**Auction History:**
- List of previously auctioned works
- Final sale prices
- Auction dates
- Link to auction details

### Previous Auctions

**Filter Panel:**
- Date range selector
- Artist filter
- Price range filter
- Medium/style filter
- Sort options (date, price, popularity)

**Auction Grid:**
- Thumbnail image
- Title and artist
- Final sale price
- Auction date
- Number of bids
- Quick link to details

**Auction Details Modal:**
- Full artwork display
- Complete bid history
- Winner information
- Auction statistics
  - Starting price
  - Final price
  - Percentage increase
  - Number of unique bidders
  - Duration of bidding

---

## Bidding System

### Bid Placement

The bidding system allows users to place bids on active auctions through multiple methods:

**Minimum Requirements:**
- Connected wallet with sufficient funds
- Bid amount meets or exceeds minimum bid requirement
- Auction is currently active
- User is not banned or restricted

**Bid Methods:**
1. **Quick Bid Button:**
   - Located in the chat window and main auction interface
   - Main button immediately places minimum (1%) bid
   - Adjacent dropdown offers Min/Max bid options
   - Visual feedback indicating bid success/failure
   - Automatic chat notification of bid placement

2. **Bid Buttons:**
   - Two prominent buttons: 
     - Min Bid (1%) - Places bid at minimum required amount
     - Max Bid (10%) - Places bid at 10% above current highest bid
   - Each shows exact bid amount
   - Wallet signature required for bid commitment
   - Clear information about financial obligation

**Wallet Integration:**
- Before bid placement, user's wallet is prompted to sign a transaction
- This signature serves as a legal commitment to pay if the user wins
- The signature includes:
  - User's wallet address
  - Auction ID
  - Bid amount
  - Timestamp and expiration
  - Platform terms acknowledgment

**Fund Handling:**
- Smart contract holds bid commitments securely
- Previous bidder's funds are automatically released when outbid
- Winner's committed funds are transferred to seller (minus platform fees)
- All transactions are recorded on-chain for transparency

**Technical Implementation:**
- Components: 
  - `/components/quick-bid-button.tsx`
  - `/components/bid-buttons.tsx`
- Services:
  - `/lib/escrow-service.ts` 
  - `/lib/auction-contract.ts`
- Context Providers:
  - `/contexts/bidding-context.tsx`

For more detailed information, see [BIDDING-INTEGRATION.md](BIDDING-INTEGRATION.md).

### Quick Bid Feature

The Quick Bid button provides a streamlined bidding experience for users who want to quickly participate in auctions without manual bid amount entry.

**Visual Appearance:**
- Button with "Quick Bid" label and award icon
- User's bidding level displayed in parentheses (e.g., "Newcomer", "Bidder", "Active")
- Dropdown chevron indicating additional options
- Disabled state when wallet not connected or bid in progress

**Dropdown Options:**
1. **Min Bid (1%)**
   - Shows calculated minimum bid amount (e.g., "Min Bid (1%) - 1.01 ETH")
   - Places bid at the minimum acceptable increment above current high bid
   - Executes immediately upon selection

2. **Max Bid (10%)**
   - Shows calculated maximum bid amount (e.g., "Max Bid (10%) - 1.10 ETH")
   - Places bid at 10% above the current high bid
   - Executes immediately upon selection

**Technical Implementation:**
- Component location: `/components/quick-bid-button.tsx`
- Uses `useBiddingContext` for bid calculations and placement
- Uses `useWallet` for connection status
- Uses `useChatContext` to announce bid in chat
- Success/error notifications via toast system
- Bidding context manages actual bid placement

### Bid History

The bid history component displays all bids placed on the current auction, maintaining a chronological record of bidding activity.

**Visual Appearance:**
- Scrollable table/list with most recent bids at top
- Each bid entry shows:
  - Bidder username/wallet address (based on display preferences)
  - Bid amount in ETH
  - Timestamp (relative or absolute)
  - User bidding level indicated by colored badge

**Features:**
- Auto-scrolls to latest bid when new bids are placed
- Highlights the user's own bids
- Highlights the current winning bid
- Expandable to show full bid history
- Exportable (admin only) to CSV format

**Technical Implementation:**
- Updates in real-time via socket connection
- Cached locally to reduce database queries
- Paginated for performance (initial load shows last 20 bids)
- Filters out invalid/rejected bids

### Escrow Management

The escrow system manages the flow of funds during the auction process, ensuring security and transparency for all participants.

**Process Flow:**
1. Bidder places bid, funds are held in escrow contract
2. If outbid, funds are automatically returned to bidder
3. When auction ends, funds are:
   - Transferred to artist/platform (minus platform fees) if auction successful
   - Returned to highest bidder if reserve not met

**Technical Implementation:**
- Smart contract handles all fund transfers
- View functions allow checking escrow status
- Admin functions allow management of exceptional cases
- Automated verification of fund transfers

---

## Chat System

### Chat Window

The chat system provides real-time communication between auction participants, enhancing community engagement and bidding excitement.

**Visual Appearance:**
- Fixed position: Bottom-right of screen
- Size: 384px wide (mobile: 320px), height: 70% of viewport
- Minimized state: Chat button with notification count
- Expanded state: Full chat interface with message list and input area

**Chat Window Components:**
1. **Header Section:**
   - Title: "Auction Chat"
   - Online user count badge
   - Username display settings icon (if username already selected)
   - Current display preference label (Short Address/Full Address/ENS)
   - Export button (admin only)
   - Close button (minimizes chat)

2. **Message List Area:**
   - Scrollable container with messages
   - Each message shows:
     - Username (colored according to user level)
     - User level badge
     - Message text
     - Timestamp
     - Admin controls (for admin users only):
       - Delete message option
       - Mute user option with duration selection (5min, 30min, 1hr, 24hr)
   - "Someone is typing..." indicator
   - Empty state message when no messages exist

3. **Input Area:**
   - Quick Bid button (access to bidding without leaving chat)
   - Text input field (42 character limit)
   - Send button
   - Character counter (0/42)
   - User level display

**Features:**
- Real-time message updates
- Message length limitation (42 characters)
- Rate limiting (10 messages in 20 seconds)
- Link blocking
- Profanity filtering
- Auto-scrolling to newest messages
- Typing indicators
- Different color schemes based on user levels

**Technical Implementation:**
- Component: `/components/chat-window.tsx`
- Context: `/contexts/chat-context.tsx`
- Socket connection for real-time updates
- Message persistence through server restarts
- Optimistic UI updates for better UX
- Comprehensive moderation with profanity filtering and link blocking
- Rate limiting to prevent spam (10 messages in 20 seconds)
- Admin controls for message deletion and user muting
- Admin-only chat export functionality

### Username Selection

The username selection system allows users to choose how they appear in the auction chat and bidding history:

**Display Options:**
- First 5 characters of wallet address (default)
- Full wallet address
- ENS name (if available)

**User Experience:**
- First-time users are prompted to select a display name upon connection
- Settings can be changed via chat header settings icon
- Changes require admin approval to prevent abuse
- Selection is persisted across sessions using localStorage

**ENS Integration:**
- System automatically fetches ENS names for connected wallets
- Users with multiple ENS names can choose their preferred name
- ENS names are shown with proper verification indicators

**Admin Controls:**
- Username change requests appear in admin panel
- Admins can approve or reject username change requests
- System maintains history of username changes for audit

**Technical Implementation:**
- Components:
  - `/components/username-selection-dialog.tsx`
  - `/components/username-change-requests.tsx`
- Context:
  - `/contexts/wallet-context.tsx` manages display options and persistence

This system ensures users have flexibility in how they present themselves while maintaining accountability through wallet connection.

### User Levels & Gamification

The platform incorporates user levels and gamification elements to encourage participation and reward engagement.

**User Levels:**
- Levels range from "Newcomer" to "Legendary"
- Based on factors like bid activity, auction wins, and platform engagement
- Higher levels unlock benefits such as:
  - Reduced fees
  - Exclusive auction access
  - Enhanced profile visibility

**Gamification Features:**
- Badges awarded for achievements (e.g., "First Bid", "Auction Winner")
- Leaderboards showcasing top users by various metrics
- Seasonal challenges with unique rewards

**Technical Implementation:**
- User levels stored in Supabase database
- Calculated on-the-fly for real-time display
- Badge and leaderboard systems integrated with user profiles

---

## Wallet Integration

### Connection Process

Users can connect their crypto wallets to the platform to participate in auctions and manage their digital assets.

**Supported Wallets:**
- MetaMask
- WalletConnect compatible wallets
- Coinbase Wallet

**Connection Steps:**
1. Click on the "Connect Wallet" button
2. Select your wallet type
3. Approve the connection in your wallet application
4. (Optional) Set a display name for chat and bidding history

**Technical Implementation:**
- Wallet connection handled by `@web3-react/core` library
- Connection state managed in global context
- Reconnects automatically on page reload if previously connected

### Wallet Display Options

Users can customize how their wallet information is displayed on the platform for privacy or preference reasons.

**Display Options:**
- Full wallet address
- First 5 and last 4 characters of the wallet address (e.g., `0x1234...abcd`)
- ENS name (if available)

**Technical Implementation:**
- Display logic handled in the user interface components
- ENS names fetched and cached on wallet connect
- User preference stored in localStorage

### ENS Integration

The platform integrates with the Ethereum Name Service (ENS) to provide human-readable names for wallet addresses.

**ENS Features:**
- Automatic fetching of ENS names on wallet connection
- Display of ENS names in chat, bids, and user profiles
- Support for ENS name registration and management

**Technical Implementation:**
- ENS integration using `@ensdomains/ensjs` library
- ENS name resolution and reverse resolution supported
- Cached ENS data for performance

---

## Admin Panel

### Dashboard

The admin dashboard provides a comprehensive overview of platform activity and key metrics.

**Key Metrics Displayed:**
- Total number of users
- Total number of auctions
- Total volume of bids
- Total revenue generated

**Activity Feed:**
- Recent user signups
- Recent auctions created
- Recent bids placed
- System alerts and notifications

**Technical Implementation:**
- Dashboard data fetched from Supabase and blockchain
- Real-time updates via socket connections
- Admin-only access control

### Auction Management

Admin users can manage all aspects of auctions on the platform, including creation, modification, and cancellation.

**Auction Controls:**
- Create new auction: Fill in details like title, description, starting bid, reserve price, and auction duration
- Modify existing auction: Change details like starting bid, reserve price, and duration
- Cancel auction: Immediately ends the auction and refunds any active bids
- Force end auction: Ends the auction and selects a winner based on current highest bid

**Technical Implementation:**
- Auction management forms use React Hook Form for validation and submission
- Server-side functions handle auction creation, modification, and cancellation
- Smart contracts handle the actual auction mechanics on-chain

### User Management

Admin users can view and manage all registered users on the platform.

**User Controls:**
- View user profile: See details like wallet address, email, and auction activity
- Edit user details: Modify user information and preferences
- Ban user: Restrict a user from participating in auctions or using the chat
- Lift ban: Re-enable access for a previously banned user

**Technical Implementation:**
- User management features use data tables for easy browsing and searching
- Edit forms use React Hook Form for validation and submission
- Ban/lift ban actions trigger email notifications to users

### Content Moderation

The platform includes tools for moderating user-generated content, including chat messages and auction listings.

**Moderation Tools:**
- Delete message: Remove inappropriate or spammy messages
- Mute user: Temporarily prevent a user from sending messages
- Ban user: Permanently restrict a user from the platform

**Technical Implementation:**
- Moderation actions are logged for audit purposes
- Admins are notified of potential moderation issues via email

### Analytics

The analytics section provides insights into platform usage and performance.

**Key Analytics Provided:**
- User engagement metrics
- Auction performance metrics
- Financial metrics (revenue, fees, etc.)
- System performance metrics (load times, error rates, etc.)

**Technical Implementation:**
- Analytics data is aggregated and processed on a regular basis
- Reports are generated and can be exported as CSV files

---

## Smart Contracts

### Auction Contract

The auction contract handles all logic related to the auctioning of NFTs, including bid placement, bid validation, and winner determination.

**Key Functions:**
- `createAuction`: Initializes a new auction
- `placeBid`: Allows users to place bids on an active auction
- `endAuction`: Ends the auction and determines the winner
- `withdrawFunds`: Allows the seller to withdraw funds after a successful auction

**Technical Implementation:**
- Smart contract written in Solidity
- Deployed on the Ethereum blockchain
- Interacts with the ERC721 contract for NFT ownership verification

### Escrow Contract

The escrow contract manages the secure holding and transferring of funds during the auction process.

**Key Functions:**
- `deposit`: Holds the bid amount in escrow
- `release`: Releases the funds to the seller or returns to the bidder
- `escrowStatus`: Checks the status of funds in escrow

**Technical Implementation:**
- Smart contract written in Solidity
- Deployed on the Ethereum blockchain
- Integrated with the Auction Contract to automate fund handling

### NFT Minting

The platform includes functionality for minting new NFTs as part of the auction creation process.

**Minting Process:**
1. Artist submits artwork for auction
2. Auction contract calls the minting function
3. New NFT is created and linked to the auction

**Technical Implementation:**
- NFT minting uses the ERC721 standard
- Metadata for the NFT is stored on IPFS
- Smart contract handles the minting and metadata linking

---

## Backend Services

### Socket Server

The socket server enables real-time communication between the client and server, powering the live bidding and chat features.

**Key Features:**
- Real-time bid updates
- Real-time chat messaging
- User presence indicators
- Typing indicators in chat

**Technical Implementation:**
- Socket server built with Node.js and Socket.IO
- Scalable architecture to handle many concurrent connections
- Integrated with the bidding and chat systems

### Database Schema

The platform uses a relational database schema to store and manage data.

**Key Tables:**
- `users`: Stores user information and preferences
- `auctions`: Stores auction details and metadata
- `bids`: Stores bid history for each auction
- `chat_messages`: Stores chat messages for each auction

**Technical Implementation:**
- Database schema designed for normalization and efficiency
- Uses PostgreSQL features like JSONB columns for flexible data storage

### API Endpoints

The platform provides a set of API endpoints for interacting with the bidding, chat, and user systems.

**Key Endpoints:**
- `POST /api/bid`: Places a new bid
- `GET /api/bid-history`: Retrieves the bid history for an auction
- `POST /api/chat-message`: Sends a new chat message
- `GET /api/chat-history`: Retrieves the chat history for an auction
- `POST /api/username`: Sets or updates the user's display name

**Technical Implementation:**
- API built with Next.js API routes
- Uses middleware for authentication and validation
- Integrates with the Supabase database and Ethereum blockchain

---

## Development & Deployment

### Local Development

For local development, the platform provides a set of tools and scripts to set up the entire environment.

**Development Tools:**
- Docker: For containerized services
- Docker Compose: For managing multi-container applications
- Node.js: For running the backend services
- NPM: For managing JavaScript packages

**Development Workflow:**
1. Clone the repository
2. Copy the `.env.example` to `.env` and update settings
3. Start the development environment: `docker-compose up`
4. Access the application at `http://localhost:3000`

**Technical Implementation:**
- Dockerfiles and docker-compose.yml provided for easy setup
- Scripts for common tasks like building, testing, and deploying

### Production Deployment

For production deployment, the platform provides a set of guidelines and scripts to deploy the application securely and efficiently.

**Deployment Steps:**
1. Build the application: `npm run build`
2. Run database migrations: `npx supabase db push`
3. Start the production server: `npm start`

**Technical Implementation:**
- Production server uses PM2 for process management
- Static files served from a CDN
- Environment variables managed with a secure vault

### Environment Variables

The platform uses environment variables to manage configuration settings and secrets.

**Key Environment Variables:**
- `NEXT_PUBLIC_SOCKET_URL`: URL of the socket server
- `NEXT_PUBLIC_SUPABASE_URL`: URL of the Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key for Supabase access
- `ETHEREUM_RPC_URL`: Ethereum node URL for blockchain interactions
- `PRIVATE_KEY`: Private key for signing transactions (never expose this)

**Technical Implementation:**
- Environment variables are loaded from a `.env` file in development
- In production, variables are managed by the hosting provider's secret management system

---

## Recent Platform Updates

The following key improvements have been implemented in the latest update:

1. **Enhanced Quick Bid System**
   - Redesigned Quick Bid button with adjacent dropdown
   - Simplified bidding with direct access to Min (1%) and Max (10%) options
   - Added wallet signature integration for bid commitments

2. **Username Display Improvements**
   - Changed short address format to show only first 5 characters
   - Added ENS name support with multi-ENS selection
   - Implemented username change request system with admin approvals
   - Added persistent storage of username preferences

3. **Level-Up Notification Refinements**
   - Repositioned notification above chat box for better visibility
   - Reduced auto-dismiss time from 8 to 5 seconds
   - Added fade animations for smoother user experience
   - Enhanced visual design with level-specific colors

4. **Wallet Integration Enhancements**
   - Added wallet signature requirement for bid commitments
   - Implemented escrow system for bid fund management
   - Added validation for wallet funds before bid placement
   - Created clear documentation for the bidding process

5. **Documentation Updates**
   - Created comprehensive README documentation
   - Added detailed BIDDING-INTEGRATION.md with wallet requirements
   - Updated USER-GUIDE.md with new bidding instructions
   - Added diagrams and flowcharts for technical processes

These updates improve both the user experience and the technical robustness of the platform, particularly focusing on the bidding system's security and usability.

---

## Getting Started

### Prerequisites
- Node.js v16 or higher
- NPM v7 or higher
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd digital-art-auction
```

2. Install dependencies:
```bash
npm install
```

### Configuration

Update the `.env.local` file with your settings:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:3008
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running the Application

Start both the Socket.IO server and Next.js frontend:
```bash
./start-dev.sh
```

Or run components individually:

1. Socket server:
```bash
node simple-socket-server.js
```

2. Next.js frontend:
```bash
npm run dev:next
```

### Testing

Run the bidding system test:
```bash
node test-bidding-system.js
```

## Architecture

### Frontend
- **Next.js**: React framework for the UI
- **shadcn/ui**: Component library for the UI
- **TailwindCSS**: Utility-first CSS framework

### Backend
- **Socket.IO**: Real-time communication
- **Node.js**: Server-side JavaScript runtime

### Data Storage
- Local file system (development)
- Supabase (production)

## Project Structure

- `/app`: Next.js application pages
- `/components`: React components
- `/contexts`: React context providers
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and APIs
- `/public`: Static assets
- `/messages`: Local storage for chat messages
- `/server`: Server-side code

## Core Components

### Chat System
- `chat-window.tsx`: Main chat interface
- `chat-context.tsx`: Chat state management
- `simple-socket-server.js`: WebSocket server

### Bidding System
- `bidding-context.tsx`: Bidding state management
- `quick-bid-button.tsx`: UI component for quick bidding
- `admin/bid-settings-panel.tsx`: Admin panel for bid settings

## Documentation

Detailed documentation is available in the following files:
- `USER-GUIDE.md`: End-user guide
- `ADMIN-GUIDE.md`: Admin user guide
- `CHAT-BIDDING-SYSTEM.md`: Technical documentation
- `test-results.md`: Test results and validation

## Future Enhancements

1. **Enhanced User Profiles**
   - Personal bidding statistics
   - Collection showcase

2. **Advanced Auction Types**
   - Dutch auctions
   - Silent auctions
   - Reserve price auctions

3. **Mobile App**
   - iOS and Android native applications
   - Push notifications for bid events

4. **Integration with More Marketplaces**
   - OpenSea
   - Rarible
   - Foundation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

This project is proprietary and confidential.
