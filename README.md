# Ethereum auction website

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/iEEZJsLknm0)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Features

### Enhanced Chat System with Bidding Gamification

The platform includes a gamified chat system that incentivizes bidding:

- **Level-Based Username Colors**: Users progress through 6 color-coded levels based on bid count
- **Level Badges**: Each user has a level badge (L1-L6) that shows their bidding experience
- **Clean Text Design**: Modern white text on dark background for better readability
- **Status Display**: Shows users their current level and bid count
- **Automatic Level-Up**: Users automatically level up as they place more bids with toast notifications
- **Persistence**: Bid counts and levels persist across sessions using localStorage
- **Data Sync**: Real-time synchronization across multiple devices via socket server

### Username Management System

The platform includes a comprehensive username management system:

- **Display Options**: Users can choose to display their wallet address (short or full) or ENS name
- **Admin Approval**: Username change requests require admin approval to prevent abuse
- **Admin Dashboard**: Dedicated admin interface for managing username change requests
- **Notifications**: Users are informed about their request status

See [chat-gamification.md](chat-gamification.md) for complete details and testing procedures.

## Quick Start

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Visit `http://localhost:3000` in your web browser
5. For username change approval management, go to `/admin/users` with an admin wallet connected

## Deployment

Your project is live at:

**[https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website](https://vercel.com/bigf0t-protonmes-projects/v0-ethereum-auction-website)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/iEEZJsLknm0](https://v0.dev/chat/projects/iEEZJsLknm0)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
