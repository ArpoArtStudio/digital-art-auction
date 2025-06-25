# Arpo Studio - Advanced Digital Art Auction Platform v2.0

*A comprehensive Web3 digital art auction platform with advanced scheduling, secure bidding, and interactive chat features*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?style=for-the-badge&logo=Ethereum&logoColor=white)](https://ethereum.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🎯 Overview

**Arpo Studio** is a cutting-edge digital art auction platform that combines Web3 technology with sophisticated auction management, real-time chat, and advanced queue scheduling. The platform provides a seamless experience for artists, collectors, and administrators with enterprise-level features and security.

## ✨ Major Features

### 🚀 **Advanced Queue Scheduling System**
- **Priority-Based Logic**: Custom scheduled auctions automatically interrupt basic queue
- **Conflict Detection & Resolution**: Automatic detection of scheduling overlaps with admin notifications
- **Emergency Reorganization**: Instant queue reorganization for urgent situations with high priority
- **Time Gap Management**: Graceful handling of periods with no scheduled auctions
- **Visual Timeline Management**: Clear display of scheduled vs basic queue items with color coding
- **Admin Controls**: Emergency reorganize button and comprehensive queue management tools

### 💬 **Enhanced Chat System with Bidding Integration**
- **Wallet-Based Authentication**: Chat access tied to wallet connection (not socket connection)
- **Level-Based Progression**: 6 color-coded user levels (L1-L6) based on actual bidding activity
- **Real-Time Bidding Integration**: Chat levels sync with bidding behavior and update instantly
- **Visual Level Indicators**: Level badges with progress tracking and color coding
- **Cross-Device Synchronization**: Real-time updates via WebSocket server
- **User Level Display**: Shows current level and bid count with progression feedback

### 🎨 **Comprehensive Responsive Design**
- **Mobile-First Architecture**: Fully responsive layout for all device types and orientations
- **Auto-Sizing Components**: Prevents text overflow and adapts to any zoom level
- **Sidebar Layout Optimization**: Artwork details moved to right sidebar for better space utilization
- **Modern UI Components**: Built with Tailwind CSS and shadcn/ui for consistent design
- **Accessibility Compliant**: WCAG 2.1 AA guidelines adherence
- **Cross-Browser Compatibility**: Tested across modern browsers

### 🔐 **Robust Wallet Integration**
- **Multi-Wallet Support**: MetaMask and other Ethereum wallet compatibility
- **Extension Conflict Resolution**: Advanced ethereum provider handling to prevent conflicts
- **ENS Name Resolution**: Support for Ethereum Name Service display options
- **Secure Admin Authentication**: Role-based access control and admin permissions
- **Error Handling**: Comprehensive error catching and user-friendly feedback

### 📊 **Advanced Admin Dashboard**
- **Queue Management**: Sophisticated tools for auction scheduling and organization
- **Emergency Controls**: Instant queue reorganization and priority management
- **User Management**: Username approval system and user level monitoring
- **Analytics Dashboard**: Comprehensive auction statistics and user analytics
- **Real-Time Monitoring**: Live auction status and bidding activity tracking

## 🛠 Technical Architecture

### **Core Technologies**
- **Framework**: Next.js 15 with TypeScript for type safety
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Ethereum Web3 integration with ethers.js
- **Real-Time**: Custom WebSocket server for chat and live updates
- **State Management**: React Context API with optimized patterns
- **Database**: Supabase integration (configurable)
- **Deployment**: Vercel with automatic CI/CD

### **Advanced Features**
- **Queue Scheduler**: Custom priority-based scheduling algorithm
- **Ethereum Provider**: Robust wallet connection with extension conflict handling
- **Responsive System**: Mobile-first design with auto-sizing utilities
- **Error Boundaries**: Comprehensive error handling and recovery
- **Performance Optimization**: Code splitting and lazy loading

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** 
- **npm/yarn/pnpm**
- **MetaMask** or compatible Ethereum wallet
- **Git** for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ArpoArtStudio/digital-art-auction.git
   cd digital-art-auction
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
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
   # Start the complete development environment
   npm run dev
   
   # This will start both:
   # - Next.js development server on http://localhost:3000
   # - WebSocket server for real-time features
   ```

5. **Access the Platform**
   - **Main Application**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin (requires admin wallet)
   - **Artist Submissions**: http://localhost:3000/submit-artwork

## 📖 Usage Guide

### **For Artists**
1. Connect your Ethereum wallet
2. Navigate to `/submit-artwork`
3. Fill out the artwork submission form
4. Choose between basic queue or custom scheduling
5. Wait for admin approval

### **For Collectors**
1. Connect your wallet to access bidding features
2. Participate in live auctions with real-time bidding
3. Use the chat system to interact with the community
4. Level up by placing more bids (L1-L6 progression)

### **For Administrators**
1. Connect with an admin wallet address
2. Access the admin panel at `/admin`
3. Manage queue scheduling with advanced controls
4. Use emergency reorganization for urgent changes
5. Monitor user levels and chat activity

## 🔧 Advanced Configuration

### **Queue Scheduling System**
The platform includes a sophisticated queue scheduling system with:

```typescript
// Priority levels
- High Priority: Custom scheduled auctions (interrupt basic queue)
- Normal Priority: Basic queue items (fill available slots)
- Emergency Priority: Instant reorganization capability
```

### **Chat Level System**
Users progress through 6 levels based on bidding activity:

```
L1 (Gray): 0 bids - New user
L2 (Blue): 1-2 bids - Getting started  
L3 (Green): 3-5 bids - Active participant
L4 (Purple): 6-10 bids - Regular bidder
L5 (Orange): 11-20 bids - Serious collector
L6 (Red): 21+ bids - Elite collector
```

### **Responsive Breakpoints**
```css
Mobile: 0-768px (Mobile-first)
Tablet: 768-1024px (Responsive scaling)
Desktop: 1024px+ (Full featured layout)
```

## 🧪 Testing

### **Run Tests**
```bash
# Run all tests
npm run test

# Test specific features
npm run test:bidding
npm run test:chat
npm run test:queue
```

### **Test Admin Features**
1. Use the default admin wallet: `0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0`
2. Connect wallet and access `/admin`
3. Test queue reorganization features
4. Verify emergency controls functionality

## 🚀 Deployment

### **Vercel Deployment**
The platform is optimized for Vercel deployment:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Configure production environment variables
3. **Deploy**: Automatic deployment on push to main branch

### **Production Environment Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
NEXT_PUBLIC_ADMIN_WALLET=your_admin_wallet_address
NODE_ENV=production
```

## 📚 Documentation

### **Complete Documentation Set**
- **[Admin Guide](ADMIN-GUIDE.md)**: Comprehensive admin features guide
- **[User Guide](USER-GUIDE.md)**: Complete user documentation
- **[Chat System](CHAT-BIDDING-SYSTEM.md)**: Chat and bidding integration
- **[Queue Scheduling](AUCTION-SCHEDULING-IMPLEMENTATION.md)**: Advanced scheduling guide
- **[Security Features](SMART-CONTRACT-SECURITY.md)**: Security implementation details

### **API Documentation**
- **Queue Management API**: Advanced scheduling endpoints
- **Chat WebSocket API**: Real-time communication protocols
- **Wallet Integration API**: Secure wallet connection methods

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 🛡️ Security Features

- **Smart Contract Integration**: Secure NFT and payment handling
- **Wallet Security**: Robust wallet connection with error handling
- **Admin Controls**: Secure role-based access control
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Boundaries**: Graceful error handling and recovery

## 📝 Recent Updates (v2.0)

### **Major Improvements**
- ✅ **Complete Rebranding**: Changed from "ArtBase" to "Arpo Studio"
- ✅ **Advanced Queue Scheduling**: Priority-based scheduling with conflict detection
- ✅ **Enhanced Chat System**: Wallet-based authentication and bidding integration
- ✅ **Responsive Design**: Complete mobile-first responsive implementation
- ✅ **Ethereum Provider**: Robust wallet handling with extension conflict resolution
- ✅ **Admin Controls**: Emergency reorganization and advanced queue management

### **Bug Fixes**
- ✅ Fixed chat input disabled condition (wallet vs socket)
- ✅ Resolved TypeScript compilation errors
- ✅ Removed verified artist badge as requested
- ✅ Fixed ethereum provider redefinition conflicts
- ✅ Enhanced error handling and user feedback

## 📞 Support

For technical support or questions:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive guides in `/docs` folder
- **Community**: Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Arpo Studio Team**

*Empowering digital artists with cutting-edge auction technology*

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
