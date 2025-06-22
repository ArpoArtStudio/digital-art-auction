import { Server } from 'socket.io';
import BadWordsFilter from 'bad-words';
import emojiRegex from 'emoji-regex';
import { Server as HTTPServer } from 'http';
import { parse } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { supabase } from '../lib/supabase';

// Initialize filter for profanity
const filter = new BadWordsFilter();

// Custom words to add to the filter
const customBadWords = ['scam', 'rugpull', 'phishing'];
filter.addWords(...customBadWords);

// Chat message interface
interface ChatMessage {
  id: string;
  walletAddress: string;
  displayName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

// Chat rate limiting tracker
interface RateLimitTracker {
  [walletAddress: string]: {
    lastMessageTime: number;
    messageCount: number;
    violations: number;
    isMuted: boolean;
    muteUntil?: number;
  };
}

// Global variables
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10;
const MAX_MESSAGE_LENGTH = 500;
const MAX_EMOJI_COUNT = 5;
const MUTE_DURATION = 10 * 60 * 1000; // 10 minutes

// Supabase operations
const loadChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100); // Limit to last 100 messages for performance
    
    if (error) {
      console.error('Error loading chat history from Supabase:', error);
      return [];
    }
    
    return data.map(item => ({
      id: item.uuid,
      walletAddress: item.wallet_address,
      displayName: item.display_name,
      text: item.message_text,
      timestamp: item.timestamp,
      isAdmin: item.is_admin
    }));
  } catch (error) {
    console.error('Error in loadChatHistory:', error);
    return [];
  }
};

const saveMessage = async (message: ChatMessage): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        uuid: message.id,
        wallet_address: message.walletAddress,
        display_name: message.displayName,
        message_text: message.text,
        timestamp: message.timestamp,
        is_admin: message.isAdmin
      });
      
    if (error) {
      console.error('Error saving message to Supabase:', error);
    }
  } catch (error) {
    console.error('Error in saveMessage:', error);
  }
};

const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('uuid', messageId);
      
    if (error) {
      console.error('Error deleting message from Supabase:', error);
    }
  } catch (error) {
    console.error('Error in deleteMessage:', error);
  }
};

// Check if user is muted in the database
const checkUserMuteStatus = async (walletAddress: string): Promise<{ isMuted: boolean, muteUntil?: number }> => {
  try {
    const { data, error } = await supabase
      .from('user_mutes')
      .select('muted_until')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error || !data) {
      return { isMuted: false };
    }
    
    const muteUntil = new Date(data.muted_until).getTime();
    const now = Date.now();
    
    // If mute has expired, remove the record
    if (muteUntil < now) {
      await supabase
        .from('user_mutes')
        .delete()
        .eq('wallet_address', walletAddress);
      
      return { isMuted: false };
    }
    
    return { isMuted: true, muteUntil };
  } catch (error) {
    console.error('Error checking mute status:', error);
    return { isMuted: false };
  }
};

// Set a user as muted in the database
const setUserMuted = async (
  walletAddress: string, 
  duration: number, 
  adminWallet: string, 
  reason?: string
): Promise<void> => {
  try {
    const muteUntil = new Date(Date.now() + duration * 60 * 1000); // minutes to ms
    
    // Upsert - will insert or update if exists
    const { error } = await supabase
      .from('user_mutes')
      .upsert({
        wallet_address: walletAddress,
        muted_until: muteUntil.toISOString(),
        muted_by: adminWallet,
        reason: reason || 'No reason provided'
      });
      
    if (error) {
      console.error('Error setting user mute in Supabase:', error);
    }
  } catch (error) {
    console.error('Error in setUserMuted:', error);
  }
};

// Initialize rate limit tracker
const userRateLimit: RateLimitTracker = {};

// Initialize socket.io server
export const initSocketServer = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Load chat history from Supabase
  let chatHistory: ChatMessage[] = [];
  loadChatHistory().then(history => {
    chatHistory = history;
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send chat history to the connected user
    loadChatHistory().then(history => {
      socket.emit('chat-history', history);
    });

    // Listen for new messages
    socket.on('send-message', async (message: { 
      walletAddress: string,
      displayName: string, 
      text: string,
      isAdmin: boolean
    }) => {
      const { walletAddress, displayName, text, isAdmin } = message;
      
      // Skip processing if not properly authenticated
      if (!walletAddress) {
        socket.emit('error', { message: 'Authentication required' });
        return;
      }

      // Check if user is muted in database
      const muteStatus = await checkUserMuteStatus(walletAddress);
      if (muteStatus.isMuted) {
        const remainingMinutes = Math.ceil((muteStatus.muteUntil! - Date.now()) / 60000);
        socket.emit('error', { 
          message: `You are muted for ${remainingMinutes} more minutes due to rule violations.` 
        });
        return;
      }

      // Rate limiting check
      if (!isAdmin) { // Admins aren't rate-limited
        const now = Date.now();
        
        if (!userRateLimit[walletAddress]) {
          userRateLimit[walletAddress] = {
            lastMessageTime: now,
            messageCount: 1,
            violations: 0,
            isMuted: false
          };
        } else {
          const userLimit = userRateLimit[walletAddress];
          
          // Reset counter if outside window
          if (now - userLimit.lastMessageTime > RATE_LIMIT_WINDOW) {
            userLimit.messageCount = 1;
            userLimit.lastMessageTime = now;
          } else {
            userLimit.messageCount++;
            
            // Check if exceeding rate limit
            if (userLimit.messageCount > MAX_MESSAGES_PER_WINDOW) {
              userLimit.violations++;
              
              // Mute user after 3 violations
              if (userLimit.violations >= 3) {
                await setUserMuted(
                  walletAddress, 
                  10, // 10 minute duration
                  'system', 
                  'Excessive messaging rate'
                );
                socket.emit('error', { 
                  message: `You have been muted for 10 minutes due to excessive messaging.` 
                });
                return;
              } else {
                socket.emit('error', { 
                  message: `You're sending messages too quickly. Warning ${userLimit.violations}/3.` 
                });
                return;
              }
            }
          }
        }
      }

      // Message length check
      if (text.length > MAX_MESSAGE_LENGTH) {
        socket.emit('error', { message: `Message too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.` });
        return;
      }

      // Emoji count check
      const emoji = emojiRegex();
      const emojiMatches = text.match(emoji) || [];
      if (emojiMatches.length > MAX_EMOJI_COUNT) {
        socket.emit('error', { message: `Too many emojis. Maximum is ${MAX_EMOJI_COUNT} emojis per message.` });
        return;
      }

      // Link detection (simple check for http/https)
      if (!isAdmin && /https?:\/\//.test(text)) {
        socket.emit('error', { message: 'Links are not allowed in chat messages.' });
        return;
      }

      // Profanity check
      let filteredText = text;
      try {
        if (filter.isProfane(text)) {
          // For admins, we warn but don't filter
          if (isAdmin) {
            socket.emit('warning', { message: 'Your message contains words that would be filtered for regular users.' });
          } else {
            filteredText = filter.clean(text);
            // Track violation for excessive profanity
            if (userRateLimit[walletAddress]) {
              userRateLimit[walletAddress].violations++;
              
              // Mute after repeated violations
              if (userRateLimit[walletAddress].violations >= 5) {
                await setUserMuted(
                  walletAddress, 
                  10, // 10 minute duration
                  'system', 
                  'Excessive profanity'
                );
                socket.emit('error', { message: 'You have been muted due to excessive rule violations.' });
                return;
              }
            }
          }
        }
      } catch (error) {
        console.error('Error with profanity filter:', error);
      }

      // Create message object
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        walletAddress,
        displayName,
        text: isAdmin ? text : filteredText,
        timestamp: new Date().toISOString(),
        isAdmin
      };

      // Save message to Supabase
      await saveMessage(newMessage);
      
      // Add to in-memory history and broadcast
      chatHistory.unshift(newMessage);  // Add to the beginning for correct display order
      io.emit('new-message', newMessage);
    });

    // Admin commands
    socket.on('admin-delete-message', async ({ messageId, adminWallet }: { messageId: string, adminWallet: string }) => {
      // TODO: Implement proper admin verification here
      // For now, we'll use the walletAddress for admin checking
      const isAdmin = adminWallet.toLowerCase() === "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0".toLowerCase();
      
      if (!isAdmin) {
        socket.emit('error', { message: 'Unauthorized admin action' });
        return;
      }
      
      // Delete from Supabase
      await deleteMessage(messageId);
      
      // Remove from in-memory history
      chatHistory = chatHistory.filter(msg => msg.id !== messageId);
      
      // Notify clients about deletion
      io.emit('message-deleted', { messageId });
    });
    
    // Admin mute user
    socket.on('admin-mute-user', async ({ walletAddress, duration, adminWallet }: 
      { walletAddress: string, duration: number, adminWallet: string }) => {
      // Verify admin
      const isAdmin = adminWallet.toLowerCase() === "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0".toLowerCase();
      
      if (!isAdmin) {
        socket.emit('error', { message: 'Unauthorized admin action' });
        return;
      }
      
      // Store mute in Supabase
      await setUserMuted(walletAddress, duration, adminWallet, 'Admin action');
      
      // Update in-memory rate limiter for immediate effect
      if (!userRateLimit[walletAddress]) {
        userRateLimit[walletAddress] = {
          lastMessageTime: Date.now(),
          messageCount: 0,
          violations: 0,
          isMuted: true
        };
      } else {
        userRateLimit[walletAddress].isMuted = true;
      }
      
      // Notify all clients about the mute
      io.emit('user-muted', { walletAddress, duration });
    });
    
    // Export chat history (admin only)
    socket.on('admin-export-history', async ({ adminWallet }: { adminWallet: string }) => {
      // Verify admin
      const isAdmin = adminWallet.toLowerCase() === "0xec24DCDFA7Dc5dc95D18a43FB2A64A23d8E350a0".toLowerCase();
      
      if (!isAdmin) {
        socket.emit('error', { message: 'Unauthorized admin action' });
        return;
      }
      
      // Get the latest messages from Supabase
      const history = await loadChatHistory();
      socket.emit('chat-export', history);
    });
    
    // Disconnect handler
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Refresh the in-memory chat history periodically
  setInterval(() => {
    loadChatHistory().then(history => {
      chatHistory = history;
    });
    // Note: Supabase will handle automatic message cleanup via database function
  }, 24 * 60 * 60 * 1000);

  return io;
};
