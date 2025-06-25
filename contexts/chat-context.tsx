"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useWallet } from '@/contexts/wallet-context'
import { useBiddingContext } from '@/contexts/bidding-context'
import { useFeatures } from '@/contexts/feature-context'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export interface ChatMessage {
  id: string
  walletAddress: string
  displayName: string
  text: string
  timestamp: string
  isAdmin: boolean
  bidCount?: number  // Number of bids the user has made
  level?: number     // User's bidding level
}

interface ChatContextType {
  isOpen: boolean
  toggleChat: () => void
  messages: ChatMessage[]
  sendMessage: (text: string) => void
  deleteMessage: (messageId: string) => void
  muteUser: (walletAddress: string, duration: number) => void
  exportChatHistory: (specificMessages?: ChatMessage[], filename?: string) => void
  unreadCount: number
  isConnected: boolean
  chatUsers: Set<string>
  isTyping: boolean
  setIsTyping: (typing: boolean) => void
  notifyBidPlaced: () => void // Function to notify of new bids
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [chatUsers] = useState(new Set<string>())
  const [isTyping, setIsTyping] = useState(false)
  
  const { isConnected: walletConnected, walletAddress, isAdmin, displayName } = useWallet()
  const { getBidCountForWallet, getLevelForWallet } = useBiddingContext()
  const { features } = useFeatures()

  // Helper function to add bidding level info to messages
  const addBiddingInfoToMessages = (messages: ChatMessage[]): ChatMessage[] => {
    return messages.map(message => ({
      ...message,
      bidCount: getBidCountForWallet(message.walletAddress),
      level: getLevelForWallet(message.walletAddress)
    }));
  };

  useEffect(() => {
    // Only connect to socket if a wallet is connected
    if (!walletConnected || !walletAddress) return
    
    // Connect to the socket server
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    
    // Set socket instance to state
    setSocket(socketInstance)
    
    // Setup socket event listeners
    socketInstance.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
    })
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server')
      setIsConnected(false)
    })
    
    socketInstance.on('chat-history', (history: ChatMessage[]) => {
      // Add bidding information to each message
      const enhancedHistory = addBiddingInfoToMessages(history);
      setMessages(enhancedHistory);
      
      // Track unique users
      history.forEach(msg => {
        chatUsers.add(msg.walletAddress)
      })
    })
    
    socketInstance.on('new-message', (message: ChatMessage) => {
      // Add bidding information to the new message
      const enhancedMessage = {
        ...message,
        bidCount: getBidCountForWallet(message.walletAddress),
        level: getLevelForWallet(message.walletAddress)
      };
      
      setMessages(prev => [...prev, enhancedMessage]);
      
      // Add to unique users
      chatUsers.add(message.walletAddress)
      
      // Increment unread count if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
    })
    
    // Listen for admin mute actions
    socketInstance.on('admin-user-muted', ({ walletAddress }) => {
      toast.info(`User ${walletAddress.substring(0, 6)}... has been muted by an admin.`)
    })
    
    // Listen for bidding updates
    socketInstance.on('bidding_updated', (data) => {
      if (data.walletAddress.toLowerCase() === walletAddress.toLowerCase()) {
        // Update could be handled by BiddingContext
        console.log("Bidding level updated:", data);
        
        // Show toast notification for level ups
        const level = data.level;
        const levelNames = ['Newcomer', 'Bidder', 'Active', 'Veteran', 'Expert', 'Master'];
        
        toast.success(`You're now a ${levelNames[level-1]}! (Level ${level})`);
      }
    })
    
    socketInstance.on('error', ({ message }: { message: string }) => {
      toast.error(message)
    })
    
    socketInstance.on('warning', ({ message }: { message: string }) => {
      toast.warning(message)
    })
    
    // Handle message deletion notification
    socketInstance.on('message-deleted', (messageId: string) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    })
    
    // Clean up socket connection on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [walletConnected, walletAddress, isOpen, chatUsers])

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const toggleChat = () => {
    setIsOpen(prev => !prev)
  }

  const sendMessage = (text: string) => {
    if (!socket || !walletConnected || !text.trim()) return
    
    // Check text length against the 42 character limit
    if (text.trim().length > 42) {
      toast.error("Message exceeds 42 character limit")
      return
    }
    
    socket.emit('send-message', {
      walletAddress,
      // Use display name from wallet context
      displayName,
      text: text.trim(),
      isAdmin
    })
  }

  const deleteMessage = (messageId: string) => {
    if (!socket || !walletConnected || !isAdmin) return
    
    socket.emit('admin-delete-message', { 
      messageId, 
      adminWallet: walletAddress 
    })
  }

  const muteUser = (userWalletAddress: string, duration: number) => {
    if (!socket || !walletConnected || !isAdmin) return
    
    socket.emit('admin-mute-user', {
      walletAddress: userWalletAddress,
      duration,
      adminWallet: walletAddress
    })
  }

  const exportChatHistory = (specificMessages?: ChatMessage[], filename?: string) => {
    if (!walletConnected) return
    
    // Use passed messages or all messages
    const messagesToExport = specificMessages || messages
    
    // Create CSV from messages
    let csv = 'Wallet Address,Display Name,Message,Timestamp,Is Admin,Level\n'
    
    messagesToExport.forEach((msg) => {
      csv += `${msg.walletAddress},${msg.displayName},"${msg.text.replace(/"/g, '""')}",${msg.timestamp},${msg.isAdmin},${msg.level || 'N/A'}\n`
    })
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', filename || `chat-history-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Function to notify the server about a new bid
  const notifyBidPlaced = () => {
    // Skip notifications if email notifications are enabled instead
    if (features.enableEmailNotifications) {
      console.log('Email notifications enabled - skipping chat notification');
      return;
    }
    
    if (!socket || !walletConnected) {
      console.warn('Cannot notify server about bid: socket or wallet not connected');
      return;
    }
    
    try {
      // Send bid notification to socket server
      socket.emit('place_bid', {
        walletAddress,
        amount: 0, // The actual amount is handled in the bidding context
        timestamp: new Date().toISOString()
      });
      console.log('Successfully sent bid notification to server');
      
      // Increment unread count for others if chat is closed
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to notify server about bid:', error);
      // Even if server notification fails, local state is still updated via BiddingContext
    }
  }

  const value = {
    isOpen,
    toggleChat,
    messages,
    sendMessage,
    deleteMessage,
    muteUser,
    exportChatHistory,
    unreadCount,
    isConnected,
    chatUsers,
    isTyping,
    setIsTyping,
    notifyBidPlaced,
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
