"use client"

import React, { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { 
  X, Send, MoreVertical, Trash2, UserX, Clock, Download, 
  ExternalLink, Settings
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useChatContext, ChatMessage } from "@/contexts/chat-context"
import { useWallet, DisplayNameOption } from "@/contexts/wallet-context"
import { useBiddingContext, BiddingLevel } from "@/contexts/bidding-context"
import { UserInfoPopover } from "@/components/user-info-popover"
import { QuickBidButton } from "@/components/quick-bid-button"
import { UsernameSelectionDialog } from "@/components/username-selection-dialog"
import { toast } from "sonner"

// Define mute duration options
const MUTE_DURATIONS = [
  { label: "5 minutes", value: 5 * 60 },
  { label: "30 minutes", value: 30 * 60 },
  { label: "1 hour", value: 60 * 60 },
  { label: "24 hours", value: 24 * 60 * 60 },
]

export function ChatWindow() {
  const { 
    isOpen, 
    toggleChat, 
    messages, 
    sendMessage,
    deleteMessage,
    muteUser,
    exportChatHistory,
    isConnected,
    chatUsers,
    isTyping,
    setIsTyping,
    notifyBidPlaced
  } = useChatContext()
  
  const { 
    isConnected: walletConnected, 
    connectWallet, 
    isAdmin, 
    displayNameOption,
    setDisplayNameOption,
    displayName,
    hasSetUsername,
    usernameChangeRequested,
    requestUsernameChange
  } = useWallet()

  const { 
    userLevel, 
    getLevelColor, 
    getLevelName, 
    getLevelBadge, 
    incrementBidCount,
    currentBid,
    getNextMinimumBid,
    getMaximumBid,
    placeBid
  } = useBiddingContext()

  const [messageText, setMessageText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showMuteOptions, setShowMuteOptions] = useState<string | null>(null)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [isUsernameChangeRequest, setIsUsernameChangeRequest] = useState(false)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle when user is typing
  useEffect(() => {
    if (messageText) {
      setIsTyping(true)
      const timeout = setTimeout(() => setIsTyping(false), 1000)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [messageText, setIsTyping])

  // Handle username setup or change request
  useEffect(() => {
    if (walletConnected && !hasSetUsername) {
      // New user needs to select username first
      setShowUsernameDialog(true)
      setIsUsernameChangeRequest(false)
    }
  }, [walletConnected, hasSetUsername])
  
  // Handle username settings button click
  const handleUsernameSettings = () => {
    setShowUsernameDialog(true)
    setIsUsernameChangeRequest(true)
    requestUsernameChange()
  }

  // If chat is not open, don't render anything
  if (!isOpen) return null
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return
    sendMessage(messageText)
    setMessageText("")
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "h:mm a")
  }

  // Handle message deletion (admin only)
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId)
  }

  // Handle user muting (admin only)
  const handleMuteUser = (walletAddress: string, duration: number) => {
    muteUser(walletAddress, duration)
    setShowMuteOptions(null)
  }

  // Simple quick bid for back-compatibility
  const handleQuickBid = () => {
    const bidAmount = getNextMinimumBid()
    const success = placeBid(bidAmount)
    
    if (success) {
      notifyBidPlaced()
      sendMessage(`I just placed a bid of ${bidAmount.toFixed(2)} ETH! 🎉`)
    }
  }

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 shadow-xl max-h-[70vh] flex flex-col rounded-lg border bg-card text-card-foreground">
      <div className="p-4 border-b flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-lg font-semibold">Auction Chat</div>
          {isConnected && (
            <Badge variant="outline" className="text-xs">
              {chatUsers.size} online
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {walletConnected && hasSetUsername && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={handleUsernameSettings}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Request Username Change</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Display current username type */}
          {walletConnected && hasSetUsername && (
            <div className="text-xs text-muted-foreground">
              ID: {displayNameOption === 'short_address' ? 'Short Address' : 
                   displayNameOption === 'full_address' ? 'Full Address' : 'ENS'}
            </div>
          )}
          {/* Export button only visible to admins */}
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={exportChatHistory}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export Chat History</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={toggleChat}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col max-h-[calc(70vh-120px)] p-0 m-0">
        {!walletConnected ? (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">Connect your wallet to join the chat</p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground p-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    <div className="flex items-end gap-2">
                      <div className="max-w-[80%] px-1 py-1">
                        <div className="flex items-center gap-2">
                          <UserInfoPopover
                            walletAddress={message.walletAddress}
                            displayName={message.displayName}
                            isAdmin={message.isAdmin}
                            level={message.level}
                            bidCount={message.bidCount}
                            firstSeen={message.timestamp}
                          >
                            <span className={`text-xs font-medium cursor-pointer underline decoration-dotted underline-offset-4 ${message.isAdmin ? 'text-red-400' : getLevelColor(message.level || BiddingLevel.Newcomer)}`}>
                              {message.displayName}
                            </span>
                          </UserInfoPopover>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] h-4 border-0 ${message.isAdmin ? 'bg-red-400/10 text-red-400' : `${getLevelColor(message.level || BiddingLevel.Newcomer).replace('text-', 'bg-').replace('-400', '-400/10')}`}`}
                          >
                            {message.isAdmin ? 'Admin' : getLevelBadge(message.level || BiddingLevel.Newcomer)}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 text-white">{message.text}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                        
                        {isAdmin && !message.isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 rounded-full ml-1 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem 
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Message
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowMuteOptions(message.walletAddress)}>
                                <UserX className="h-4 w-4 mr-2" />
                                Mute User
                              </DropdownMenuItem>
                              
                              {showMuteOptions === message.walletAddress && (
                                <div className="px-2 py-1 bg-muted">
                                  <p className="text-xs text-muted-foreground mb-1">Mute for:</p>
                                  <div className="grid grid-cols-2 gap-1">
                                    {MUTE_DURATIONS.map((duration) => (
                                      <Button
                                        key={duration.value}
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => handleMuteUser(message.walletAddress, duration.value)}
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {duration.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="text-xs text-muted-foreground animate-pulse">
                  Someone is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            <div className="p-3 border-t">
              <div className="mb-2">
                <QuickBidButton showUserLevel={true} variant="secondary" size="sm" />
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={42}
                  disabled={!isConnected}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!isConnected || !messageText.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">
                  {`${messageText.length}/42 characters`}
                </span>
                <span className={`font-medium ${getLevelColor(userLevel)}`}>
                  {getLevelName(userLevel)} ({getLevelBadge(userLevel)})
                </span>
              </div>
            </div>
            
            {/* Username Selection Dialog */}
            <UsernameSelectionDialog 
              isOpen={showUsernameDialog}
              onClose={() => setShowUsernameDialog(false)}
              isChangeRequest={isUsernameChangeRequest}
            />
          </>
        )}
      </div>
    </div>
  )
}
