"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWallet } from './wallet-context'
import { useFeatures } from './feature-context'
import { escrowService } from '@/lib/escrow-service'
import { toast } from 'sonner'

// Define user bidding levels
export enum BiddingLevel {
  Newcomer = 1,  // 0-9 bids
  Bidder = 2,    // 10-19 bids
  Active = 3,    // 20-29 bids
  Veteran = 4,   // 30-39 bids
  Expert = 5,    // 40-49 bids
  Master = 6     // 50+ bids
}

// Define bid status for tracking
export enum BidStatus {
  Pending = "pending",
  Active = "active",
  Winning = "winning",
  Outbid = "outbid",
  Won = "won",
  Lost = "lost",
  Canceled = "canceled",
  Failed = "failed"
}

// Define payment status for tracking
export enum PaymentStatus {
  NotRequired = "not_required",
  Pending = "pending",
  Completed = "completed",
  Refunded = "refunded",
  Expired = "expired",
  Failed = "failed"
}

// Interface for bidding data
interface UserBiddingData {
  walletAddress: string;
  bidCount: number;
  level: BiddingLevel;
}

// Interface for a user bid
interface UserBid {
  auctionId: string;
  tokenId: string;
  amount: number;
  depositAmount: number;
  timestamp: number;
  status: BidStatus;
  paymentStatus: PaymentStatus;
  paymentDeadline?: number;
}

// Interface for the context
interface BiddingContextType {
  userBidCount: number;
  userLevel: BiddingLevel;
  getLevelForWallet: (walletAddress: string) => BiddingLevel;
  getBidCountForWallet: (walletAddress: string) => number;
  getLevelColor: (level: BiddingLevel) => string;
  getLevelName: (level: BiddingLevel) => string;
  getLevelBadge: (level: BiddingLevel) => string;
  getLevelFromBidCount: (bidCount: number) => BiddingLevel;
  incrementBidCount: () => void;
  showLevelUp: boolean;
  setShowLevelUp: (show: boolean) => void;
  recentLevelUp: BiddingLevel | null;
  
  // Bid amount related parameters
  currentBid: number;
  minBidIncrementPercentage: number;
  maxBidIncrementPercentage: number;
  getNextMinimumBid: () => number;
  getMaximumBid: () => number;
  placeBid: (amount: number) => Promise<boolean>;
  setMinBidIncrementPercentage: (percentage: number) => void;
  
  // Wallet and escrow integration
  requestWalletSignature: (amount: number) => Promise<boolean>;
  getUserActiveBids: () => Promise<UserBid[]>;
  getUserWonAuctions: () => Promise<UserBid[]>;
  
  // New secure bidding methods
  validateWalletFunds: (amount: number) => Promise<boolean>;
  validateWalletForBid: (amount: number) => Promise<{isValid: boolean, reason?: string}>;
  placeBidWithDeposit: (auctionId: string, amount: number, deposit: number) => Promise<boolean>;
  getDepositAmount: () => number;
  completePayment: (auctionId: string) => Promise<boolean>;
  getPaymentStatus: (auctionId: string) => Promise<PaymentStatus>;
  getBidStatus: (auctionId: string) => Promise<BidStatus>;
  retryFailedConnection: () => Promise<boolean>;
}

// Mock data for initial users and their bids
const initialUserBidData: UserBiddingData[] = [
  { walletAddress: "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0", bidCount: 55, level: BiddingLevel.Master }, // Admin
  { walletAddress: "0x1234567890123456789012345678901234567890", bidCount: 5, level: BiddingLevel.Newcomer },
  { walletAddress: "0x2345678901234567890123456789012345678901", bidCount: 15, level: BiddingLevel.Bidder },
  { walletAddress: "0x3456789012345678901234567890123456789012", bidCount: 25, level: BiddingLevel.Active },
  { walletAddress: "0x4567890123456789012345678901234567890123", bidCount: 35, level: BiddingLevel.Veteran },
  { walletAddress: "0x5678901234567890123456789012345678901234", bidCount: 45, level: BiddingLevel.Expert },
];

const BiddingContext = createContext<BiddingContextType | undefined>(undefined);

export function useBiddingContext() {
  const context = useContext(BiddingContext);
  if (!context) {
    throw new Error('useBiddingContext must be used within a BiddingProvider');
  }
  return context;
}

const LOCAL_STORAGE_KEY = 'artAuctionBidData';

export function BiddingProvider({ children }: { children: ReactNode }) {
  const { walletAddress, isConnected } = useWallet();
  const { features, walletSettings } = useFeatures();
  const [userBidData, setUserBidData] = useState<UserBiddingData[]>(initialUserBidData);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [recentLevelUp, setRecentLevelUp] = useState<BiddingLevel | null>(null);
  
  // Bid amount parameters
  const [currentBid, setCurrentBid] = useState<number>(100); // Mock starting bid
  const [minBidIncrementPercentage, setMinBidIncrementPercentage] = useState<number>(0.01); // Default 1%
  const [maxBidIncrementPercentage] = useState<number>(0.10); // Fixed at 10%
  
  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        setUserBidData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse bidding data from localStorage');
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userBidData));
  }, [userBidData]);

  // Get level based on bid count
  const getLevelFromBidCount = (bidCount: number): BiddingLevel => {
    if (bidCount >= 50) return BiddingLevel.Master;
    if (bidCount >= 40) return BiddingLevel.Expert;
    if (bidCount >= 30) return BiddingLevel.Veteran;
    if (bidCount >= 20) return BiddingLevel.Active;
    if (bidCount >= 10) return BiddingLevel.Bidder;
    return BiddingLevel.Newcomer;
  };

  // Get bid count for the current user
  const userBidCount = isConnected ? 
    userBidData.find(user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase())?.bidCount || 0 : 0;
  
  // Get level for the current user
  const userLevel = getLevelFromBidCount(userBidCount);

  // Get level for any wallet address
  const getLevelForWallet = (address: string): BiddingLevel => {
    const user = userBidData.find(user => user.walletAddress.toLowerCase() === address.toLowerCase());
    return user ? user.level : BiddingLevel.Newcomer;
  };

  // Get bid count for any wallet address
  const getBidCountForWallet = (address: string): number => {
    const user = userBidData.find(user => user.walletAddress.toLowerCase() === address.toLowerCase());
    return user ? user.bidCount : 0;
  };

  // Get color for a level
  const getLevelColor = (level: BiddingLevel): string => {
    switch (level) {
      case BiddingLevel.Master: return 'text-purple-400'; // Purple
      case BiddingLevel.Expert: return 'text-white'; // White
      case BiddingLevel.Veteran: return 'text-yellow-400'; // Yellow
      case BiddingLevel.Active: return 'text-red-400'; // Red
      case BiddingLevel.Bidder: return 'text-green-400'; // Green
      case BiddingLevel.Newcomer: 
      default: 
        return 'text-blue-400'; // Blue
    }
  };

  // Get name for a level
  const getLevelName = (level: BiddingLevel): string => {
    switch (level) {
      case BiddingLevel.Master: return 'Master';
      case BiddingLevel.Expert: return 'Expert';
      case BiddingLevel.Veteran: return 'Veteran';
      case BiddingLevel.Active: return 'Active';
      case BiddingLevel.Bidder: return 'Bidder';
      case BiddingLevel.Newcomer:
      default:
        return 'Newcomer';
    }
  };

  // Get badge text for a level
  const getLevelBadge = (level: BiddingLevel): string => {
    return `L${level}`;
  };

  // Increment bid count for current user
  const incrementBidCount = () => {
    if (!isConnected) return;

    setUserBidData(prevData => {
      const userIndex = prevData.findIndex(user => 
        user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );

      if (userIndex >= 0) {
        // Update existing user
        const newCount = prevData[userIndex].bidCount + 1;
        const newLevel = getLevelFromBidCount(newCount);
        const oldLevel = prevData[userIndex].level;
        
        const newData = [...prevData];
        newData[userIndex] = {
          ...newData[userIndex],
          bidCount: newCount,
          level: newLevel
        };
        
        // Check if user leveled up
        if (newLevel > oldLevel) {
          setRecentLevelUp(newLevel);
          setShowLevelUp(true);
        }
        
        return newData;
      } else {
        // Add new user
        return [
          ...prevData, 
          {
            walletAddress,
            bidCount: 1,
            level: BiddingLevel.Newcomer
          }
        ];
      }
    });
  };

  // Get the minimum required bid
  const getNextMinimumBid = (): number => {
    const minIncrement = currentBid * minBidIncrementPercentage;
    return currentBid + minIncrement;
  };
  
  // Get the maximum allowed bid
  const getMaximumBid = (): number => {
    return currentBid * (1 + maxBidIncrementPercentage);
  };
  
  // Place a bid with a specific amount
  const placeBid = async (amount: number): Promise<boolean> => {
    if (!isConnected) {
      console.error("Cannot place bid: wallet not connected");
      return false;
    }
    
    const minBid = getNextMinimumBid();
    const maxBid = getMaximumBid();
    
    if (amount < minBid) {
      console.error(`Bid too low. Minimum bid is ${minBid}`);
      return false;
    }
    
    if (amount > maxBid) {
      console.error(`Bid too high. Maximum bid is ${maxBid}`);
      return false;
    }
    
    // Calculate royalty amount if enabled
    let royaltyAmount = 0;
    if (features.enableNFTRoyalties) {
      royaltyAmount = amount * 0.05; // 5% royalty
    }
    
    try {
      // Validate wallet has sufficient funds for both deposit and full bid amount
      const walletValidation = await validateWalletForBid(amount);
      if (!walletValidation.isValid) {
        console.error(`Cannot place bid: ${walletValidation.reason}`);
        return false;
      }
      
      // Request wallet signature as commitment to the bid
      const signatureSuccess = await requestWalletSignature(amount);
      if (!signatureSuccess) {
        console.error("Failed to get wallet signature for bid commitment");
        return false;
      }
      
      // Just collect the deposit amount (0.01 ETH) for now
      const depositAmount = 0.01; // ETH
      const depositSuccess = await escrowService.lockBidAmount(
        walletAddress,
        "current-auction-id", // This would be the actual auction ID in production
        depositAmount.toString()
      );
      
      if (!depositSuccess) {
        console.error("Failed to collect bid deposit");
        return false;
      }
      
      // Register the full bid amount in the auction contract
      // This doesn't lock the full amount, just records the commitment
      const bidSuccess = await escrowService.getSignedBidCommitment(
        walletAddress,
        "current-auction-id",
        amount.toString()
      );
      
      if (bidSuccess) {
        setCurrentBid(amount);
        incrementBidCount();
        return true;
      } else {
        console.error("Failed to register bid in auction contract");
        // If bid registration fails, refund the deposit
        await escrowService.releaseBidAmount(walletAddress, "current-auction-id");
        return false;
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      return false;
    }
  };

  // Request wallet signature to confirm bid commitment
  const requestWalletSignature = async (amount: number): Promise<boolean> => {
    if (!isConnected) {
      return false;
    }
    
    try {
      // Create the message to be signed, including important information
      const messageToSign = `
I am placing a bid of ${amount.toFixed(2)} ETH on auction current-auction-id.
I agree to:
1. Pay a 0.01 ETH deposit now
2. Complete the full payment within 24 hours if I win
3. Forfeit my deposit if I fail to complete payment
Timestamp: ${Date.now()}
      `.trim();
      
      console.log("Requesting signature for message:", messageToSign);
      
      // In production, this would call the wallet provider to request a signature
      // For the real wallet integration, you'd use something like:
      /*
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const signature = await signer.signMessage(messageToSign)
      */
      
      // For now we'll use the escrow service mock
      const signedCommitment = await escrowService.getSignedBidCommitment(
        walletAddress,
        "current-auction-id",
        amount.toString()
      );
      
      if (signedCommitment) {
        console.log("Bid commitment signed successfully");
        
        // In production, this signed message would be stored along with the bid
        // to provide cryptographic proof of the user's commitment
        
        return true;
      } else {
        console.error("User rejected signature request");
        return false;
      }
    } catch (error) {
      console.error("Error requesting wallet signature:", error);
      return false;
    }
  };
  
  // Get active bids for current user
  const getUserActiveBids = async () => {
    if (!isConnected) {
      return [];
    }
    
    try {
      return await escrowService.getUserActiveBids(walletAddress);
    } catch (error) {
      console.error("Error fetching active bids:", error);
      return [];
    }
  };
  
  // Validate if wallet can place a bid
  const validateWalletForBid = async (amount: number): Promise<{isValid: boolean, reason?: string}> => {
    if (!isConnected) {
      return { isValid: false, reason: "Wallet not connected" };
    }
    
    try {
      // First, check if wallet has enough for the initial deposit
      const hasDepositFunds = await escrowService.validateWalletHasFunds(
        walletAddress,
        "0.01" // Fixed deposit amount
      );
      
      if (!hasDepositFunds) {
        return { isValid: false, reason: "Insufficient funds for the required 0.01 ETH deposit" };
      }
      
      // Second, check if the wallet has enough total funds for the full bid
      // This doesn't lock the funds, just verifies they exist
      const hasBidFunds = await escrowService.validateWalletHasFunds(
        walletAddress,
        amount.toString()
      );
      
      if (!hasBidFunds) {
        return { isValid: false, reason: "Your wallet doesn't have enough funds to cover this bid amount if you win" };
      }
      
      // Check if user has any active bids that might conflict
      const activeBids = await getUserActiveBids();
      const hasActiveBidsForSameAuction = activeBids.some(bid => 
        bid.auctionId === "current-auction-id" && 
        bid.status === 0 // BidEscrowStatus.BidLocked
      );
      
      if (hasActiveBidsForSameAuction) {
        return { isValid: false, reason: "You already have an active bid on this auction" };
      }
      
      return { isValid: true };
    } catch (error) {
      console.error("Error validating wallet:", error);
      return { isValid: false, reason: "Error validating wallet" };
    }
  };

  const contextValue: BiddingContextType = {
    userBidCount,
    userLevel,
    getLevelForWallet,
    getBidCountForWallet,
    getLevelColor,
    getLevelFromBidCount,
    getLevelName,
    getLevelBadge,
    incrementBidCount,
    showLevelUp,
    setShowLevelUp,
    recentLevelUp,
    currentBid,
    minBidIncrementPercentage,
    maxBidIncrementPercentage,
    getNextMinimumBid,
    getMaximumBid,
    placeBid,
    setMinBidIncrementPercentage,
    requestWalletSignature,
    getUserActiveBids,
    getUserWonAuctions: async () => {
      if (!isConnected) {
        return [];
      }
      
      try {
        const wonAuctions = await escrowService.getUserWonAuctions(walletAddress);
        // Convert UserBidInfo to UserBid
        return wonAuctions.map(auction => ({
          auctionId: auction.auctionId,
          tokenId: auction.auctionId,
          amount: parseFloat(auction.bidAmount),
          depositAmount: 0.01,
          timestamp: auction.timestamp.getTime(),
          status: BidStatus.Won,
          paymentStatus: PaymentStatus.Completed
        }));
      } catch (error) {
        console.error("Error fetching won auctions:", error);
        return [];
      }
    },
    validateWalletFunds: async (amount: number) => {
      if (!isConnected) return false;
      
      try {
        const hasFunds = await escrowService.validateWalletHasFunds(walletAddress, amount.toString());
        return hasFunds;
      } catch (error) {
        console.error("Error validating wallet funds:", error);
        return false;
      }
    },
    validateWalletForBid,
    placeBidWithDeposit: async (auctionId: string, amount: number, deposit: number) => {
      if (!isConnected) return false;
      
      try {
        // First, lock the deposit amount
        const depositSuccess = await escrowService.lockBidAmount(
          walletAddress,
          auctionId,
          deposit.toString()
        );
        
        if (!depositSuccess) {
          console.error("Failed to lock deposit amount");
          return false;
        }
        
        // Then, register the bid with the full amount
        const bidSuccess = await escrowService.getSignedBidCommitment(
          walletAddress,
          auctionId,
          amount.toString()
        );
        
        if (bidSuccess) {
          incrementBidCount();
          return true;
        } else {
          console.error("Failed to register bid in auction contract");
          // If bid registration fails, refund the deposit
          await escrowService.releaseBidAmount(walletAddress, auctionId);
          return false;
        }
      } catch (error) {
        console.error("Error placing bid with deposit:", error);
        return false;
      }
    },
    getDepositAmount: () => {
      return 0.01; // Fixed deposit amount in ETH
    },
    completePayment: async (auctionId: string) => {
      if (!isConnected) return false;
      
      try {
        // In a real implementation, this would interact with the payment processor
        // For now, we'll just simulate a successful payment
        const paymentSuccess = true; // await paymentService.processPayment(walletAddress, auctionId);
        
        if (paymentSuccess) {
          // Update bid and payment status in the escrow service
          await escrowService.updateBidStatus(auctionId, BidStatus.Won, PaymentStatus.Completed);
          return true;
        } else {
          console.error("Payment processing failed");
          return false;
        }
      } catch (error) {
        console.error("Error completing payment:", error);
        return false;
      }
    },
    getPaymentStatus: async (auctionId: string) => {
      if (!isConnected) return PaymentStatus.NotRequired;
      
      try {
        const bid = await escrowService.getUserBid(walletAddress, auctionId);
        return bid ? bid.paymentStatus : PaymentStatus.NotRequired;
      } catch (error) {
        console.error("Error fetching payment status:", error);
        return PaymentStatus.NotRequired;
      }
    },
    getBidStatus: async (auctionId: string) => {
      if (!isConnected) return BidStatus.Pending;
      
      try {
        const bid = await escrowService.getUserBid(walletAddress, auctionId);
        return bid ? bid.status : BidStatus.Pending;
      } catch (error) {
        console.error("Error fetching bid status:", error);
        return BidStatus.Pending;
      }
    },
    retryFailedConnection: async () => {
      if (!isConnected) return false;
      
      try {
        // In a real implementation, this would attempt to re-establish the connection
        // For now, we'll just simulate a successful reconnection
        const reconnectSuccess = true; // await walletService.reconnect();
        
        if (reconnectSuccess) {
          toast.success("Reconnected successfully");
          return true;
        } else {
          toast.error("Reconnection failed");
          return false;
        }
      } catch (error) {
        console.error("Error retrying connection:", error);
        return false;
      }
    }
  };

  return (
    <BiddingContext.Provider value={contextValue}>
      {children}
    </BiddingContext.Provider>
  );
}
