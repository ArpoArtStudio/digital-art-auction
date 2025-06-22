/**
 * Test Script for Bidding System
 * 
 * This script simulates multiple users placing bids and verifies the level system
 * Run it after starting the socket server with node simple-socket-server.js
 */

const { io } = require('socket.io-client');

// Test wallet addresses
const wallets = [
  "0x1111111111111111111111111111111111111111", // Test user 1
  "0x2222222222222222222222222222222222222222", // Test user 2
  "0x3333333333333333333333333333333333333333", // Test user 3
];

// Connect to the socket server
const socket = io('http://localhost:3008');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Simulate bidding for each wallet
  simulateBidding();
});

socket.on('bidding_updated', (data) => {
  console.log(`Bidding update for ${data.walletAddress}: Level ${data.level}, Bids: ${data.bidCount}`);
});

socket.on('error', (data) => {
  console.error('Error:', data.message);
});

// Simulate bidding for different users with various bid counts
async function simulateBidding() {
  // First user - simulate 15 bids (should reach Bidder level)
  await simulateUserBids(wallets[0], 15);
  
  // Second user - simulate 25 bids (should reach Active level)
  await simulateUserBids(wallets[1], 25);
  
  // Third user - simulate 55 bids (should reach Master level)
  await simulateUserBids(wallets[2], 55);
  
  console.log('Bidding simulation complete. Checking current levels...');
  
  // Simulate a message from each user to check their level
  setTimeout(() => {
    wallets.forEach(wallet => {
      socket.emit('message', {
        id: `test-${Date.now()}-${wallet.substring(0, 6)}`,
        walletAddress: wallet,
        displayName: `User-${wallet.substring(0, 6)}`,
        text: `This is a test message from level ${wallet}`,
        timestamp: new Date().toISOString(),
        isAdmin: false
      });
    });
    
    // Disconnect after all tests
    setTimeout(() => {
      console.log('Test complete. Disconnecting...');
      socket.disconnect();
    }, 1000);
  }, 1000);
}

// Helper function to simulate multiple bids for a user
async function simulateUserBids(walletAddress, count) {
  console.log(`Simulating ${count} bids for wallet ${walletAddress}...`);
  
  for (let i = 0; i < count; i++) {
    // Place a bid
    socket.emit('place_bid', { walletAddress });
    
    // Small delay to avoid flooding the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`Completed ${count} bids for wallet ${walletAddress}`);
}

// Error handling
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
