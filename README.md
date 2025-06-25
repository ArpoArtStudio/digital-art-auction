# Arpo Studio - Advanced Digital Art Auction Platform

*A comprehensive Web3 digital art auction platform with advanced scheduling, secure bidding, and interactive chat features*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)](https://ethereum.org)

## 🎯 Overview

**Arpo Studio** is a cutting-edge digital art auction platform that combines Web3 technology with sophisticated auction management, real-time chat, and advanced queue scheduling. The platform provides a seamless experience for artists, collectors, and administrators with enterprise-level features and security.

## ✨ Key Features

### 🚀 **Advanced Queue Scheduling System**
- **Priority-Based Scheduling**: Custom scheduled auctions interrupt basic queue with absolute priority
- **Conflict Detection**: Automatic detection and resolution of scheduling conflicts
- **Emergency Reorganization**: Instant queue reorganization for urgent situations
- **Time Gap Management**: Graceful handling of periods with no scheduled auctions
- **Visual Timeline**: Clear display of scheduled vs basic queue items

### 💬 **Enhanced Chat System with Gamification**
- **Level-Based Progression**: 6 color-coded user levels based on bidding activity
- **Real-Time Bidding Integration**: Chat levels sync with actual bidding behavior
- **Visual Level Indicators**: Level badges (L1-L6) with progress tracking
- **Wallet-Based Authentication**: Chat access tied to wallet connection status
- **Cross-Device Sync**: Real-time synchronization via WebSocket server

### 🎨 **Responsive Design & UI/UX**
- **Mobile-First Design**: Fully responsive layout for all device types
- **Auto-Sizing Components**: Prevents text overflow and adapts to zoom levels
- **Modern UI Components**: Built with Tailwind CSS and shadcn/ui
- **Dark/Light Theme Support**: Consistent theming across all components
- **Accessibility Compliant**: WCAG 2.1 guidelines adherence

### 🔐 **Secure Wallet Integration**
- **Multi-Wallet Support**: MetaMask and other Ethereum wallet compatibility
- **Robust Error Handling**: Graceful handling of wallet extension conflicts
- **ENS Name Resolution**: Support for Ethereum Name Service display
- **Admin Role Management**: Secure admin authentication and permissions

### 📊 **Admin Dashboard**
- **Queue Management**: Advanced tools for auction scheduling and organization
- **User Management**: Username approval system and user level monitoring
- **Analytics Dashboard**: Comprehensive auction and user analytics
- **Real-Time Monitoring**: Live auction status and bidding activity

## 🛠 Technical Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Ethereum Web3 integration
- **Real-Time**: WebSocket server for chat and live updates
- **State Management**: React Context API
- **Database**: Supabase (configured for production)
- **Deployment**: Vercel with automatic CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- MetaMask or compatible Ethereum wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-art-auction22-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure your environment variables
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   NEXT_PUBLIC_ADMIN_WALLET=your_admin_wallet_address
   ```

4. **Start Development Servers**
   ```bash
   # Start Next.js development server
   npm run dev
   
   # In a separate terminal, start the WebSocket server
   npm run start:socket
   ```

5. **Access the Application**
   - Main site: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`

## 📋 Feature Documentation

### Queue Management System
The advanced queue scheduling system provides:

- **Basic Queue**: Standard first-in-first-out auction queue
- **Custom Scheduling**: Ability to schedule auctions for specific dates/times
- **Priority Handling**: Custom scheduled items automatically interrupt basic queue
- **Conflict Resolution**: Detection and management of scheduling conflicts
- **Emergency Controls**: Instant reorganization capabilities for urgent situations

**Admin Usage:**
1. Navigate to `/admin` with connected admin wallet
2. Use "Reorganize Queue" for standard priority scheduling
3. Use "Emergency Reorganize" for urgent situations
4. Monitor conflicts in console and toast notifications

### Chat & Bidding Integration
The chat system includes sophisticated user progression:

**User Levels:**
- **L1 (Gray)**: 0 bids - New User
- **L2 (Blue)**: 1-2 bids - Participant  
- **L3 (Green)**: 3-5 bids - Active Bidder
- **L4 (Purple)**: 6-10 bids - Frequent Bidder
- **L5 (Orange)**: 11-20 bids - Expert Bidder
- **L6 (Red)**: 21+ bids - Master Collector

**Features:**
- Real-time level progression with toast notifications
- Persistent progress across browser sessions
- Visual level indicators with color-coded usernames
- Bidding integration for automatic level advancement

### Responsive Design Implementation
The platform implements comprehensive responsive design:

**Mobile Optimizations:**
- Collapsible navigation menu
- Touch-friendly bidding controls
- Optimized image galleries
- Responsive typography scaling

**Accessibility Features:**
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

## 🏗 Project Structure

```
├── app/                    # Next.js 13+ app router
│   ├── admin/             # Admin dashboard pages
│   ├── artists/           # Artist management pages
│   └── page.tsx           # Main auction page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── chat-window.tsx   # Real-time chat component
│   ├── queue-management.tsx # Advanced queue scheduling
│   └── ...
├── contexts/             # React context providers
│   ├── wallet-context.tsx # Wallet connection state
│   ├── chat-context.tsx   # Chat state management
│   └── ...
├── lib/                  # Utility libraries
│   ├── queue-scheduler.ts # Advanced scheduling logic
│   ├── ethereum-provider.ts # Wallet connection utilities
│   └── ...
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── server/               # WebSocket server for real-time features
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
NEXT_PUBLIC_ADMIN_WALLET=0xYourAdminWalletAddress

# Optional: Additional admin wallets (comma-separated)
NEXT_PUBLIC_ADDITIONAL_ADMIN_WALLETS=0xWallet1,0xWallet2

# Socket Server Configuration
SOCKET_PORT=3001
```

### Admin Wallet Setup
1. Set your admin wallet address in `NEXT_PUBLIC_ADMIN_WALLET`
2. Connect with the admin wallet to access admin features
3. Additional admin wallets can be configured via environment variables

## 🧪 Testing

### Manual Testing Procedures

**Queue Scheduling:**
1. Navigate to `/admin` with admin wallet
2. Add test auction items with different scheduling modes
3. Use "Reorganize Queue" to test priority scheduling
4. Verify custom scheduled items interrupt basic queue

**Chat System:**
1. Connect wallet and join chat
2. Place bids to test level progression
3. Verify level badges and color changes
4. Test across multiple browser sessions

**Responsive Design:**
1. Test on various screen sizes (mobile, tablet, desktop)
2. Verify all components adapt properly
3. Test zoom levels from 50% to 200%
4. Ensure no text overflow or layout breaking

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Socket Server Deployment
The WebSocket server needs to be deployed separately:
```bash
# Start socket server in production
node server/socket-server.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### v2.0.0 (Current)
- ✅ **Advanced Queue Scheduling**: Priority-based scheduling with conflict detection
- ✅ **Enhanced Chat System**: Wallet-based authentication and bidding integration
- ✅ **Responsive Design**: Complete mobile and desktop optimization
- ✅ **Site Rebranding**: Changed from "ArtBase" to "Arpo Studio"
- ✅ **Layout Improvements**: Moved artwork details to sidebar
- ✅ **Security Enhancements**: Robust wallet connection handling
- ✅ **Emergency Controls**: Admin tools for urgent queue management

### v1.0.0
- Initial platform release with basic auction functionality

## 🐛 Known Issues & Solutions

### MetaMask Extension Conflicts
**Issue**: `Error: Cannot redefine property: ethereum`
**Solution**: Implemented robust ethereum provider detection in `lib/ethereum-provider.ts`

### Queue Scheduling Conflicts
**Issue**: Overlapping auction times
**Solution**: Automatic conflict detection with admin notifications

### Mobile Layout Issues
**Issue**: Text overflow on small screens
**Solution**: Comprehensive responsive design utilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Arpo Studio Platform](https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website)
- **Documentation**: See individual markdown files for detailed feature documentation
- **Support**: Open an issue on GitHub for support

---

**Built with ❤️ for the Web3 art community**
