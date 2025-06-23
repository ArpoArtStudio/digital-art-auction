// A simplified Socket.IO server for testing chat functionality
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const Filter = require('bad-words');
const emojiRegex = require('emoji-regex');

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Socket.IO Server for Chat');
});

// Bidding system constants
const BIDDING_LEVELS = {
  NEWCOMER: 1,  // 0-9 bids
  BIDDER: 2,    // 10-19 bids
  ACTIVE: 3,    // 20-29 bids
  VETERAN: 4,   // 30-39 bids
  EXPERT: 5,    // 40-49 bids
  MASTER: 6     // 50+ bids
};

// Initialize Socket.IO with improved connection settings
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  // Improved connection handling to prevent ERR_TUNNEL_CONNECTION_FAILED
  connectTimeout: 30000,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8  // 100 MB
});

// Path for storing chat messages and bidding data
const messagesDir = path.join(__dirname, 'messages');
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir, { recursive: true });
}
const messagesPath = path.join(messagesDir, 'chat_messages.json');
const biddingDataPath = path.join(messagesDir, 'bidding_data.json');

// Message retention period in days
const MESSAGE_RETENTION_PERIOD_DAYS = 7;

// Function to clean up expired messages (older than 7 days)
function cleanupExpiredMessages() {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - (MESSAGE_RETENTION_PERIOD_DAYS * 24 * 60 * 60 * 1000));
  
  console.log(`Cleaning up messages older than ${MESSAGE_RETENTION_PERIOD_DAYS} days (before ${cutoffDate.toISOString()})`);
  
  // Filter out messages older than the cutoff date
  const originalCount = chatMessages.length;
  chatMessages = chatMessages.filter(message => {
    const messageDate = new Date(message.timestamp);
    return messageDate >= cutoffDate;
  });
  
  const removedCount = originalCount - chatMessages.length;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired messages`);
    // Save updated messages to disk
    fs.writeFileSync(messagesPath, JSON.stringify(chatMessages, null, 2));
  } else {
    console.log('No expired messages found');
  }
}

// Load existing messages or create an empty array
let chatMessages = [];
try {
  if (fs.existsSync(messagesPath)) {
    const data = fs.readFileSync(messagesPath, 'utf8');
    chatMessages = JSON.parse(data);
    console.log(`Loaded ${chatMessages.length} messages from file system.`);
  }
} catch (error) {
  console.error('Error loading chat messages:', error);
}

// Load bidding data or create an empty object
let biddingData = {};
try {
  if (fs.existsSync(biddingDataPath)) {
    const data = fs.readFileSync(biddingDataPath, 'utf8');
    biddingData = JSON.parse(data);
    console.log(`Loaded bidding data for ${Object.keys(biddingData).length} users.`);
  }
} catch (error) {
  console.error('Error loading bidding data:', error);
}

// Helper function to get bidding level based on bid count
function getBiddingLevel(bidCount) {
  if (bidCount >= 50) return BIDDING_LEVELS.MASTER;
  if (bidCount >= 40) return BIDDING_LEVELS.EXPERT;
  if (bidCount >= 30) return BIDDING_LEVELS.VETERAN;
  if (bidCount >= 20) return BIDDING_LEVELS.ACTIVE;
  if (bidCount >= 10) return BIDDING_LEVELS.BIDDER;
  return BIDDING_LEVELS.NEWCOMER;
}

// Helper function to get user bid count
function getUserBidCount(walletAddress) {
  return biddingData[walletAddress.toLowerCase()] || 0;
}

// Helper to increment user bid count
function incrementUserBidCount(walletAddress) {
  const address = walletAddress.toLowerCase();
  biddingData[address] = (biddingData[address] || 0) + 1;
  saveBiddingData();
  return biddingData[address];
}

// Save bidding data to file system
function saveBiddingData() {
  fs.writeFileSync(biddingDataPath, JSON.stringify(biddingData, null, 2));
}

// Save messages to file system
function saveMessages() {
  fs.writeFileSync(messagesPath, JSON.stringify(chatMessages, null, 2));
}

// Chat moderation rules
const CHARACTER_LIMIT = 42;
const RATE_LIMIT_WINDOW = 20000; // 20 seconds
const RATE_LIMIT_MAX_MESSAGES = 10;
const MUTE_DURATION = 10; // 10 seconds
const BLOCK_DURATIONS = [2 * 60 * 60, 4 * 60 * 60, 6 * 60 * 60]; // Hours in seconds

// URL/link detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|org|net|io|eth|xyz|app))/i;

// Initialize profanity filter
const filter = new Filter();

// User violation tracking
const userViolations = {};

// Get or initialize user violation state
function getUserViolationState(walletAddress) {
  if (!userViolations[walletAddress]) {
    userViolations[walletAddress] = {
      profanityCount: 0,
      lastProfanityTime: 0,
      linkViolations: 0,
      isCurrentlyMuted: false,
      muteEndTime: 0,
      blockEndTime: 0,
      blockHistory: {
        count: 0,
        currentBlockLevel: 0,
      },
      messageHistory: []
    };
  }
  return userViolations[walletAddress];
}

// Check if user is restricted (muted or blocked)
function isUserRestricted(walletAddress) {
  const state = getUserViolationState(walletAddress);
  const now = Date.now();
  
  if (state.blockEndTime > now) {
    return {
      restricted: true,
      reason: 'blocked',
      remainingSeconds: Math.ceil((state.blockEndTime - now) / 1000)
    };
  }
  
  if (state.muteEndTime > now) {
    return {
      restricted: true,
      reason: 'muted',
      remainingSeconds: Math.ceil((state.muteEndTime - now) / 1000)
    };
  }
  
  return { restricted: false };
}

// Calculate message length counting emojis as single characters
function getMessageLength(text) {
  const emoji = emojiRegex();
  // Replace each emoji with a single character placeholder
  const textWithoutEmojis = text.replace(emoji, '□');
  return textWithoutEmojis.length;
}

// Validate message against all rules
function validateMessage(text, walletAddress) {
  // First check if user is already restricted
  const restrictionCheck = isUserRestricted(walletAddress);
  if (restrictionCheck.restricted) {
    return {
      valid: false,
      reason: restrictionCheck.reason === 'blocked' 
        ? `You are blocked from chatting for ${Math.floor(restrictionCheck.remainingSeconds / 60)} minutes.`
        : `You are muted for ${restrictionCheck.remainingSeconds} more seconds.`
    };
  }
  
  // Check character limit (counting emojis as single characters)
  const messageLength = getMessageLength(text);
  if (messageLength > CHARACTER_LIMIT) {
    return {
      valid: false,
      reason: `Message too long. Limit is ${CHARACTER_LIMIT} characters (current: ${messageLength}).`
    };
  }
  
  // Check for profanity
  if (filter.isProfane(text)) {
    const violation = handleProfanityViolation(walletAddress);
    return {
      valid: false,
      reason: 'Your message contains prohibited language.',
      restriction: violation
    };
  }
  
  // Check for links
  if (URL_REGEX.test(text)) {
    handleLinkViolation(walletAddress);
    return {
      valid: false,
      reason: 'Links are not allowed in chat.',
      restriction: { action: 'mute', duration: MUTE_DURATION }
    };
  }
  
  // Check rate limiting
  if (isRateLimited(walletAddress)) {
    handleRateLimitViolation(walletAddress);
    return {
      valid: false,
      reason: 'You are sending messages too quickly. Maximum is 10 messages in 20 seconds.',
      restriction: { action: 'mute', duration: MUTE_DURATION }
    };
  }
  
  return { valid: true };
}

// Check if user is sending messages too frequently
function isRateLimited(walletAddress) {
  const state = getUserViolationState(walletAddress);
  const now = Date.now();
  
  // Clean up old messages outside the window
  state.messageHistory = state.messageHistory.filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW
  );
  
  // Add the current message attempt
  state.messageHistory.push(now);
  
  return state.messageHistory.length > RATE_LIMIT_MAX_MESSAGES;
}

// Handle profanity violation
function handleProfanityViolation(walletAddress) {
  const state = getUserViolationState(walletAddress);
  const now = Date.now();
  
  // Increment count
  state.profanityCount++;
  state.lastProfanityTime = now;
  
  // Reset counts if it's been a week since last violation
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  if (now - state.lastProfanityTime > ONE_WEEK) {
    state.profanityCount = 1;
    state.blockHistory.count = 0;
    state.blockHistory.currentBlockLevel = 0;
  }
  
  // Check if we need to apply a block
  if (state.profanityCount % 3 === 0) {
    // Determine block duration
    let blockDuration;
    
    if (state.blockHistory.currentBlockLevel < BLOCK_DURATIONS.length) {
      blockDuration = BLOCK_DURATIONS[state.blockHistory.currentBlockLevel];
      state.blockHistory.currentBlockLevel++;
    } else {
      const extraIncrements = state.blockHistory.currentBlockLevel - BLOCK_DURATIONS.length + 1;
      blockDuration = BLOCK_DURATIONS[BLOCK_DURATIONS.length - 1] + (extraIncrements * 2 * 60 * 60);
      state.blockHistory.currentBlockLevel++;
    }
    
    state.blockHistory.count++;
    state.blockEndTime = now + (blockDuration * 1000);
    
    return {
      action: 'block',
      duration: blockDuration
    };
  } else {
    // Just mute for short duration
    state.muteEndTime = now + (MUTE_DURATION * 1000);
    
    return {
      action: 'mute',
      duration: MUTE_DURATION
    };
  }
}

// Handle link violation
function handleLinkViolation(walletAddress) {
  const state = getUserViolationState(walletAddress);
  state.linkViolations++;
  state.muteEndTime = Date.now() + (MUTE_DURATION * 1000);
}

// Handle rate limit violation
function handleRateLimitViolation(walletAddress) {
  const state = getUserViolationState(walletAddress);
  state.muteEndTime = Date.now() + (MUTE_DURATION * 1000);
}

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Add bidding info to messages before sending history
  const messagesWithBiddingInfo = chatMessages.map(msg => ({
    ...msg,
    bidCount: getUserBidCount(msg.walletAddress),
    level: getBiddingLevel(getUserBidCount(msg.walletAddress))
  }));
  
  // Send message history to new client
  socket.emit('chat-history', messagesWithBiddingInfo);
  
  // Handle new chat messages
  socket.on('send-message', (message) => {
    console.log('Received message:', message);
    
    // Validate the message against chat rules
    const validation = validateMessage(message.text, message.walletAddress);
    if (!validation.valid) {
      // Send error back to the client
      socket.emit('error', { message: validation.reason });
      
      // If there's a restriction, apply it
      if (validation.restriction) {
        const { action, duration } = validation.restriction;
        if (action === 'mute') {
          socket.emit('warning', { message: `You have been muted for ${duration} seconds` });
        } else if (action === 'block') {
          socket.emit('error', { message: `You have been blocked for ${Math.floor(duration / 3600)} hours due to multiple violations` });
        }
      }
      
      return;
    }
    
    // Create the message with ID and timestamp
    const newMessage = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString(),
      bidCount: getUserBidCount(message.walletAddress),
      level: getBiddingLevel(getUserBidCount(message.walletAddress))
    };
    
    // Add message to history
    chatMessages.push(newMessage);
    
    // Save messages to file system
    fs.writeFileSync(messagesPath, JSON.stringify(chatMessages, null, 2));
    
    // Broadcast to all clients
    io.emit('new-message', newMessage);
  });
  
  // Handle bid action
  socket.on('place_bid', (data) => {
    console.log('Bid placed:', data);
    
    // Increment user's bid count
    const newBidCount = incrementUserBidCount(data.walletAddress);
    const newLevel = getBiddingLevel(newBidCount);
    
    // Notify client of updated level
    socket.emit('bidding_updated', { 
      walletAddress: data.walletAddress,
      bidCount: newBidCount,
      level: newLevel
    });
  });
  
  // Handle admin actions
  socket.on('admin-delete-message', ({ messageId, adminWallet }) => {
    console.log('Admin deleting message:', messageId, 'by admin:', adminWallet);
    // Filter out the message
    chatMessages = chatMessages.filter(msg => msg.id !== messageId);
    // Save to disk
    fs.writeFileSync(messagesPath, JSON.stringify(chatMessages, null, 2));
    // Notify all clients
    io.emit('message-deleted', messageId);
  });
  
  // Handle admin mute user
  socket.on('admin-mute-user', ({ walletAddress, duration, adminWallet }) => {
    console.log('Admin muting user:', walletAddress, 'for', duration, 'seconds by admin:', adminWallet);
    
    // Apply mute in violation tracking
    const state = getUserViolationState(walletAddress);
    state.isCurrentlyMuted = true;
    state.muteEndTime = Date.now() + (duration * 1000);
    
    // Notify all clients
    io.emit('admin-user-muted', { walletAddress, duration });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Run message cleanup on server start
console.log('Running initial message cleanup check...');
cleanupExpiredMessages();

// Schedule regular message cleanup (run once per day)
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
setInterval(() => {
  console.log('Running scheduled message cleanup...');
  cleanupExpiredMessages();
}, CLEANUP_INTERVAL_MS);

// Start server with improved error handling
const PORT = process.env.PORT || 3008;
let serverStartAttempts = 0;
const MAX_START_ATTEMPTS = 3;

function startSocketServer(port) {
  server.listen(port, () => {
    console.log('-----------------------------------------------------');
    console.log(`Socket.IO server running on http://localhost:${port}`);
    console.log('Chat Rules Enabled:');
    console.log(`- Character limit: ${CHARACTER_LIMIT} characters`);
    console.log(`- Rate limiting: ${RATE_LIMIT_MAX_MESSAGES} messages in ${RATE_LIMIT_WINDOW/1000} seconds`);
    console.log(`- Link blocking: enabled`);
    console.log(`- Profanity filtering: enabled`);
    console.log('-----------------------------------------------------');
  }).on('error', (err) => {
    serverStartAttempts++;
    console.error(`Socket server error on port ${port}:`, err.message);
    
    if (err.code === 'EADDRINUSE' && serverStartAttempts < MAX_START_ATTEMPTS) {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      setTimeout(() => startSocketServer(port + 1), 1000);
    } else if (serverStartAttempts < MAX_START_ATTEMPTS) {
      console.log(`Retrying on same port ${port} after delay...`);
      setTimeout(() => startSocketServer(port), 3000);
    } else {
      console.error(`Could not start socket server after ${MAX_START_ATTEMPTS} attempts.`);
      console.error('Please check your network configuration and ensure ports are available.');
    }
  });
}

// Add heartbeat to detect and fix connection issues
setInterval(() => {
  const clientCount = io.engine.clientsCount;
  console.log(`[Heartbeat] Active connections: ${clientCount}`);
}, 30000); // Every 30 seconds

// Start the server with error recovery
startSocketServer(PORT);
