"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { useChatContext } from "@/contexts/chat-context"
import { useWallet } from "@/contexts/wallet-context"
import { cn } from "@/lib/utils"

export function ChatButton() {
  const { toggleChat, unreadCount, isConnected } = useChatContext()
  const { isConnected: walletConnected, connectWallet } = useWallet()
  
  // Handle chat button click based on wallet connection state
  const handleChatButtonClick = async () => {
    if (!walletConnected) {
      // If wallet is not connected, try to connect first
      await connectWallet();
    } else {
      // If wallet is connected, toggle the chat
      toggleChat();
    }
  };
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={handleChatButtonClick}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg border-2 chat-button-glow", 
            isConnected 
              ? "bg-primary hover:bg-primary/90 border-primary text-primary-foreground" 
              : "dark:bg-white bg-black hover:bg-black/90 dark:hover:bg-white/90 border-zinc-700 dark:border-zinc-200"
          )}
          aria-label="Open Chat"
        >
          <MessageCircle className="h-6 w-6 dark:text-black text-white" />
        </Button>
        
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
    </div>
  )
}
