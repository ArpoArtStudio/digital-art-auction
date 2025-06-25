"use client"

import { useState, useEffect } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { ChatMessage } from '@/contexts/chat-context'

export interface ChatHistoryByDate {
  date: string;
  formattedDate: string;
  messageCount: number;
  participants: Set<string>;
  messages: ChatMessage[];
  selected?: boolean;
}

export function useChatHistoryByDate(messages: ChatMessage[], searchTerm: string = '') {
  const [chatHistoryByDate, setChatHistoryByDate] = useState<ChatHistoryByDate[]>([])
  const [filteredHistory, setFilteredHistory] = useState<ChatHistoryByDate[]>([])

  // Group messages by date
  useEffect(() => {
    const historyByDate = new Map<string, ChatHistoryByDate>()
    
    messages.forEach(message => {
      try {
        const messageDate = parseISO(message.timestamp)
        const dateKey = format(messageDate, 'yyyy-MM-dd')
        const formattedDate = format(messageDate, 'MMMM d, yyyy')
        
        if (!historyByDate.has(dateKey)) {
          historyByDate.set(dateKey, {
            date: dateKey,
            formattedDate,
            messageCount: 0,
            participants: new Set<string>(),
            messages: [],
          })
        }
        
        const entry = historyByDate.get(dateKey)!
        entry.messageCount++
        entry.participants.add(message.walletAddress)
        entry.messages.push(message)
      } catch (error) {
        console.error('Error processing message timestamp:', error, message)
      }
    })
    
    // Sort by date (newest first)
    const sortedHistory = Array.from(historyByDate.values())
      .sort((a, b) => b.date.localeCompare(a.date))
    
    setChatHistoryByDate(sortedHistory)
  }, [messages])
  
  // Filter chat histories by search term (enhanced with comprehensive search)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHistory(chatHistoryByDate)
      return
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    const filtered = chatHistoryByDate.filter(chat => {
      // Search by date
      if (chat.formattedDate.toLowerCase().includes(lowerSearchTerm) ||
          chat.date.includes(lowerSearchTerm)) {
        return true
      }
      
      // Search within messages
      return chat.messages.some(msg => {
        // Search by message content
        if (msg.text.toLowerCase().includes(lowerSearchTerm)) return true
        
        // Search by username/display name
        if (msg.displayName.toLowerCase().includes(lowerSearchTerm)) return true
        
        // Search by wallet address (full and partial)
        if (msg.walletAddress.toLowerCase().includes(lowerSearchTerm)) return true
        
        // Search by time/date components
        const msgDate = new Date(msg.timestamp)
        const timeString = format(msgDate, 'HH:mm').toLowerCase()
        const dateString = format(msgDate, 'yyyy-MM-dd').toLowerCase()
        const fullDateString = format(msgDate, 'MMMM d, yyyy HH:mm').toLowerCase()
        
        if (timeString.includes(lowerSearchTerm) || 
            dateString.includes(lowerSearchTerm) || 
            fullDateString.includes(lowerSearchTerm)) {
          return true
        }
        
        // Search by user level or admin status
        if (msg.isAdmin && 'admin'.includes(lowerSearchTerm)) return true
        if (msg.level && (`level ${msg.level}`.includes(lowerSearchTerm) || 
                         `l${msg.level}`.includes(lowerSearchTerm))) return true
        
        return false
      })
    })
    
    setFilteredHistory(filtered)
  }, [chatHistoryByDate, searchTerm])

  return {
    chatHistoryByDate,
    filteredHistory
  }
}
