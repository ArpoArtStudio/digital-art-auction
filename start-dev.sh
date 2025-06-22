#!/bin/zsh

# Set terminal colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Digital Art Auction Platform - Development Server${NC}"
echo -e "${BLUE}==================================================${NC}"

# Check if the socket server is already running
if pgrep -f "node simple-socket-server.js" > /dev/null; then
  echo -e "${YELLOW}Socket server is already running.${NC}"
  EXISTING_SOCKET=true
else
  # Start the socket server in the background
  echo -e "${GREEN}Starting socket server on port 3008...${NC}"
  node simple-socket-server.js &
  SOCKET_PID=$!
  EXISTING_SOCKET=false
  
  # Give the socket server a moment to start
  sleep 2
fi

# Print status
echo -e "${YELLOW}Socket server: http://localhost:3008${NC}"
echo -e "${YELLOW}App server: http://localhost:3000${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# Kill any process using port 3000 if it exists
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
  echo -e "${YELLOW}Port 3000 is in use. Freeing it up...${NC}"
  kill -9 $PORT_3000_PID
  sleep 1
fi

# Start the Next.js app on port 3000
echo -e "${GREEN}Starting Next.js app on port 3000...${NC}"
PORT=3000 npm run dev:next

# Clean up processes when the script exits
function cleanup {
  echo -e "${BLUE}--------------------------------------------------${NC}"
  
  # Only kill the socket server if we started it
  if [ "$EXISTING_SOCKET" = false ] && [ ! -z "$SOCKET_PID" ]; then
    echo -e "${YELLOW}Shutting down socket server...${NC}"
    kill $SOCKET_PID
  fi
  
  echo -e "${GREEN}Development servers stopped.${NC}"
  exit 0
}

# Set up trap to catch exit signals
trap cleanup SIGINT SIGTERM

# Wait for processes to complete
wait
