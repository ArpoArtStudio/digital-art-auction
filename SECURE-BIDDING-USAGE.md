# Secure Bidding System - Usage Guide

This document explains how to use the secure bidding system implemented in the digital art auction platform.

## Overview

The secure bidding system provides a balanced approach to bidding that ensures user accountability without requiring the full bid amount to be locked in escrow. Instead, users place a small deposit (0.01 ETH) when bidding, and only the auction winner needs to complete the full payment.

## Implementation Components

The secure bidding system consists of the following key components:

1. **Bid Buttons** (`bid-buttons.tsx`)
2. **Quick Bid Button** (`quick-bid-button.tsx`)
3. **Bid History** (`bid-history.tsx`)
4. **Payment Completion** (`payment-completion.tsx`)
5. **User Auctions** (`user-auctions.tsx`) 
6. **Secure Bidding UI** (`secure-bidding-ui.tsx`)

## How to Use

### Adding the Secure Bidding UI to a Page

To add the complete secure bidding experience to a page, use the `SecureBiddingUi` component:

```tsx
// Example: app/auction/[id]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { SecureBiddingUi } from "@/components/secure-bidding-ui"
import { auctionContract } from "@/lib/auction-contract"

export default function AuctionPage({ params }: { params: { id: string } }) {
  const [auction, setAuction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const auctionDetails = await auctionContract.getAuctionDetails(params.id)
        setAuction(auctionDetails)
      } catch (error) {
        console.error("Error fetching auction details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAuction()
  }, [params.id])

  if (loading) {
    return <div>Loading auction details...</div>
  }

  return (
    <div className="container py-8">
      <SecureBiddingUi
        auctionId={auction.id}
        tokenId={auction.tokenId}
        artworkName="Digital Masterpiece"
        artworkImage="/images/artwork.jpg"
        currentBid={parseFloat(auction.highestBid)}
        endTime={auction.endTime}
        isEnded={auction.ended}
      />
    </div>
  )
}
```

### Individual Component Usage

#### Bid Buttons

The `BidButtons` component provides both minimum (1%) and maximum (10%) bid buttons with secure validation and confirmation:

```tsx
import { BidButtons } from "@/components/bid-buttons"

export default function BidSection() {
  return (
    <div>
      <h2>Place Your Bid</h2>
      <BidButtons />
    </div>
  )
}
```

#### Quick Bid Button

The `QuickBidButton` component provides a compact bidding interface:

```tsx
import { QuickBidButton } from "@/components/quick-bid-button"

export default function QuickActions() {
  return (
    <div className="flex justify-between items-center">
      <h3>Quick Actions</h3>
      <QuickBidButton />
    </div>
  )
}
```

#### Bid History

The `BidHistory` component displays bids with their status and deposit information:

```tsx
import { BidHistory } from "@/components/bid-history"

export default function BidSection({ auctionId }: { auctionId: string }) {
  return (
    <div>
      <h2>Recent Bids</h2>
      <BidHistory auctionId={auctionId} />
    </div>
  )
}
```

#### Payment Completion

The `PaymentCompletion` component allows auction winners to complete their payment:

```tsx
import { PaymentCompletion } from "@/components/payment-completion"

export default function WinnerDashboard({ 
  auctionId, 
  artworkName, 
  bidAmount 
}: { 
  auctionId: string 
  artworkName: string
  bidAmount: string
}) {
  const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  
  return (
    <div>
      <h2>Complete Your Purchase</h2>
      <PaymentCompletion 
        auctionId={auctionId}
        artworkName={artworkName}
        bidAmount={bidAmount}
        depositAmount="0.01"
        paymentDeadline={paymentDeadline}
      />
    </div>
  )
}
```

#### User Auctions

The `UserAuctions` component displays auctions where the user has placed bids or won:

```tsx
import { UserAuctions } from "@/components/user-auctions"

export default function Dashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>
      <UserAuctions />
    </div>
  )
}
```

## Bidding Flow

1. **View Auction**: User views auction details including current bid and time remaining
2. **Connect Wallet**: User connects their Ethereum wallet to enable bidding
3. **Place Bid**: 
   - User clicks either Min Bid (1%) or Max Bid (10%)
   - System validates that user has sufficient funds
   - User confirms bid and deposit amount via confirmation dialog
4. **Bid Registered**:
   - Small deposit (0.01 ETH) is collected
   - Bid is registered on the blockchain
   - Bid appears in the bid history with status
5. **Auction Ends**:
   - If user won, they receive notification to complete payment
   - Payment deadline is 24 hours after auction end
   - User can view payment requirement in their dashboard
6. **Payment Completion**:
   - Winner completes payment through payment completion UI
   - NFT is transferred to the winner upon successful payment

## Security Features

1. **Wallet Validation**: System validates that users have sufficient funds before allowing bids
2. **Transparent UI**: Clear explanations and confirmations regarding bidding obligations
3. **Deposit System**: Small deposits ensure bidders are committed
4. **Payment Tracking**: Clear status tracking for payments with deadlines
5. **Smart Contract Security**: All transactions secured by our audited smart contract

## Configuration Options

The secure bidding system includes several configurable parameters:

1. **Deposit Amount**: Currently set to 0.01 ETH but can be adjusted
2. **Min Bid Increment**: Default 1% (configurable via bidding context)
3. **Max Bid Increment**: Fixed at 10%
4. **Payment Deadline**: 24 hours after auction end

## Troubleshooting

### User can't place a bid

- Ensure wallet is connected
- Verify user has sufficient funds for both deposit and potential full payment
- Check if there are any existing active bids from the user

### Payment completion fails

- Ensure transaction has sufficient gas
- Verify payment is being attempted before the deadline
- Check if user has sufficient funds for the remaining amount

### Bid not showing in history

- Refresh the page
- Check blockchain transaction confirmation
- Verify the correct auction ID is being used
