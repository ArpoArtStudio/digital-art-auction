#!/bin/bash
# Test script for the chat gamification system
# This script runs a series of tests to verify the bidding level system

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Chat Gamification Test Suite${NC}"

# 1. Start the socket server in the background
echo -e "${YELLOW}Starting socket server...${NC}"
node simple-socket-server.js > socket-server.log 2>&1 &
SERVER_PID=$!

# Give the server time to start
sleep 2

echo -e "${GREEN}Socket server started with PID: $SERVER_PID${NC}"

# 2. Run the bidding simulation test
echo -e "${YELLOW}Running bidding system test...${NC}"
node test-bidding-system.js

# 3. Check if the socket server is still running
if ps -p $SERVER_PID > /dev/null
then
   echo -e "${GREEN}Socket server is running correctly${NC}"
else
   echo -e "${RED}Socket server crashed. Check socket-server.log for details${NC}"
fi

# 4. Check if bidding data was saved
if [ -f "messages/bidding_data.json" ]; then
    echo -e "${GREEN}Bidding data file exists${NC}"
    echo "Content of bidding_data.json:"
    cat messages/bidding_data.json
else
    echo -e "${RED}Bidding data file was not created${NC}"
fi

# 5. Clean up
echo -e "${YELLOW}Stopping socket server...${NC}"
kill $SERVER_PID
echo -e "${GREEN}Tests completed${NC}"

echo ""
echo -e "${YELLOW}===== Manual Testing Instructions =====${NC}"
echo "1. Start the Next.js development server: npm run dev"
echo "2. Start the socket server: node simple-socket-server.js"
echo "3. Open the application in your browser"
echo "4. Connect your wallet"
echo "5. Place bids and observe the level system in action"
echo "6. Check for level-up notifications"
echo "7. Verify data persistence by reloading the page"
echo -e "${YELLOW}===================================${NC}"
