/**
 * Chat Rules Implementation
 * Implements profanity filtering, link detection, message rate limiting,
 * and character limits as specified in the requirements.
 */

import BadWords from 'bad-words';
import emojiRegex from 'emoji-regex';

// Initialize profanity filter
const filter = new BadWords();

// Additional offensive words can be added here
filter.addWords('offensive1', 'offensive2');

// Message history for rate limiting
interface MessageHistoryItem {
  timestamp: number;
  walletAddress: string;
}

// Violation tracking
interface ViolationState {
  profanityCount: number; 
  lastProfanityTime: number;
  linkViolations: number;
  isCurrentlyMuted: boolean;
  muteEndTime: number;
  blockEndTime: number;
  blockHistory: {
    count: number;
    currentBlockLevel: number;
  };
  rateLimitHistory: MessageHistoryItem[];
}

// Initialize violation state store
const userViolations: Record<string, ViolationState> = {};

// Character limit
const CHARACTER_LIMIT = 42;

// Rate limiting constants
const RATE_LIMIT_WINDOW = 20000; // 20 seconds
const RATE_LIMIT_MAX_MESSAGES = 10;

// Mute duration constants
const MUTE_DURATION_SHORT = 10; // 10 seconds for basic violations
const BLOCK_DURATIONS = [
  2 * 60 * 60, // 2 hours
  4 * 60 * 60, // 4 hours
  6 * 60 * 60, // 6 hours
];
const BLOCK_INCREMENT = 2 * 60 * 60; // 2 hours

// URL/link detection regex
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.(com|org|net|io|eth|xyz|app))/i;

/**
 * Get or initialize violation state for a user
 */
function getUserViolationState(walletAddress: string): ViolationState {
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
      rateLimitHistory: [],
    };
  }
  
  return userViolations[walletAddress];
}

/**
 * Check if message contains profanity
 */
export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

/**
 * Check if message contains links
 */
export function containsLinks(text: string): boolean {
  return URL_REGEX.test(text);
}

/**
 * Check if message exceeds character limit
 */
export function exceedsCharacterLimit(text: string): boolean {
  // Count characters, considering emojis as single characters
  const messageLength = getMessageLength(text);
  return messageLength > CHARACTER_LIMIT;
}
  const textWithoutEmojis = text.replace(emojiPattern, '□'); // Replace each emoji with a single character
  
  return textWithoutEmojis.length > CHARACTER_LIMIT;
}

/**
 * Calculate message length, counting emojis as single characters
 */
export function getMessageLength(text: string): number {
  const emojiPattern = emojiRegex();
  const textWithoutEmojis = text.replace(emojiPattern, '□'); // Replace each emoji with a single character
  
  return textWithoutEmojis.length;
}

/**
 * Check if user is sending messages too frequently
 */
export function isRateLimited(walletAddress: string): boolean {
  const state = getUserViolationState(walletAddress);
  const now = Date.now();
  
  // Clean up old messages outside the window
  state.rateLimitHistory = state.rateLimitHistory.filter(
    item => now - item.timestamp < RATE_LIMIT_WINDOW
  );
  
  // Add the current message attempt
  state.rateLimitHistory.push({
    timestamp: now,
    walletAddress
  });
  
  return state.rateLimitHistory.length > RATE_LIMIT_MAX_MESSAGES;
}

/**
 * Check if user is currently muted or blocked
 */
export function isUserRestricted(walletAddress: string): { 
  restricted: boolean;
  reason: string;
  remainingSeconds: number;
} {
  const state = getUserViolationState(walletAddress);
  const now = Date.now();
  
  // Check for block (higher priority)
  if (state.blockEndTime > now) {
    const remainingSeconds = Math.ceil((state.blockEndTime - now) / 1000);
    return {
      restricted: true,
      reason: 'blocked',
      remainingSeconds
    };
  }
  
  // Check for mute
  if (state.muteEndTime > now) {
    const remainingSeconds = Math.ceil((state.muteEndTime - now) / 1000);
    return {
      restricted: true,
      reason: 'muted',
      remainingSeconds
    };
  }
  
  return {
    restricted: false,
    reason: '',
    remainingSeconds: 0
  };
}

/**
 * Apply mute penalty to user
 */
export function muteUser(walletAddress: string, durationInSeconds: number): void {
  const state = getUserViolationState(walletAddress);
  state.isCurrentlyMuted = true;
  state.muteEndTime = Date.now() + (durationInSeconds * 1000);
}

/**
 * Handle profanity violation
 */
export function handleProfanityViolation(walletAddress: string): {
  action: 'mute' | 'block';
  duration: number;
} {
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
    let blockDuration: number;
    
    if (state.blockHistory.currentBlockLevel < BLOCK_DURATIONS.length) {
      blockDuration = BLOCK_DURATIONS[state.blockHistory.currentBlockLevel];
      state.blockHistory.currentBlockLevel++;
    } else {
      const extraIncrements = state.blockHistory.currentBlockLevel - BLOCK_DURATIONS.length + 1;
      blockDuration = BLOCK_DURATIONS[BLOCK_DURATIONS.length - 1] + (extraIncrements * BLOCK_INCREMENT);
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
    state.muteEndTime = now + (MUTE_DURATION_SHORT * 1000);
    
    return {
      action: 'mute',
      duration: MUTE_DURATION_SHORT
    };
  }
}

/**
 * Handle link violation
 */
export function handleLinkViolation(walletAddress: string): void {
  const state = getUserViolationState(walletAddress);
  state.linkViolations++;
  state.muteEndTime = Date.now() + (MUTE_DURATION_SHORT * 1000);
}

/**
 * Handle rate limit violation
 */
export function handleRateLimitViolation(walletAddress: string): void {
  const state = getUserViolationState(walletAddress);
  state.muteEndTime = Date.now() + (MUTE_DURATION_SHORT * 1000);
  
  // We don't need to clear the history as isRateLimited already manages the window
}

/**
 * Validate message against all rules
 */
export function validateMessage(text: string, walletAddress: string): {
  valid: boolean;
  reason?: string;
  restriction?: {
    type: 'mute' | 'block';
    duration: number;
    remainingSeconds?: number;
  };
} {
  // First check if user is already restricted
  const restrictionCheck = isUserRestricted(walletAddress);
  if (restrictionCheck.restricted) {
    return {
      valid: false,
      reason: restrictionCheck.reason === 'blocked' 
        ? `You are blocked from chatting for ${Math.floor(restrictionCheck.remainingSeconds / 60)} minutes.`
        : `You are muted for ${restrictionCheck.remainingSeconds} more seconds.`,
      restriction: {
        type: restrictionCheck.reason as 'mute' | 'block',
        duration: 0,
        remainingSeconds: restrictionCheck.remainingSeconds
      }
    };
  }
  
  // Check character limit
  if (exceedsCharacterLimit(text)) {
    return {
      valid: false,
      reason: `Message too long. Limit is ${CHARACTER_LIMIT} characters.`
    };
  }
  
  // Check for profanity
  if (containsProfanity(text)) {
    const violation = handleProfanityViolation(walletAddress);
    return {
      valid: false,
      reason: 'Your message contains prohibited language.',
      restriction: {
        type: violation.action,
        duration: violation.duration
      }
    };
  }
  
  // Check for links
  if (containsLinks(text)) {
    handleLinkViolation(walletAddress);
    return {
      valid: false,
      reason: 'Links are not allowed in chat.',
      restriction: {
        type: 'mute',
        duration: MUTE_DURATION_SHORT
      }
    };
  }
  
  // Check rate limiting
  if (isRateLimited(walletAddress)) {
    handleRateLimitViolation(walletAddress);
    return {
      valid: false,
      reason: 'You are sending messages too quickly.',
      restriction: {
        type: 'mute',
        duration: MUTE_DURATION_SHORT
      }
    };
  }
  
  // All rules passed
  return { valid: true };
}
