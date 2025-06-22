#!/bin/zsh

# Set terminal colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Digital Art Auction Platform - Development Server${NC}"
echo -e "${BLUE}==================================================${NC}"

# Run connection diagnostics test first
echo -e "${YELLOW}Running connection diagnostics...${NC}"
node connection-test.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Connection diagnostics found issues. Fix them before continuing.${NC}"
  echo -e "${YELLOW}You can try running the script again with --force to bypass checks.${NC}"
  if [[ "$1" != "--force" ]]; then
    exit 1
  else
    echo -e "${YELLOW}Proceeding despite connection issues (--force mode)${NC}"
  fi
fi

# Kill any processes on ports 3000 and 3008 if they exist
echo -e "${YELLOW}Checking for existing processes...${NC}"
PORT_3000_PID=$(lsof -ti:3000 2>/dev/null)
PORT_3008_PID=$(lsof -ti:3008 2>/dev/null)

if [ ! -z "$PORT_3000_PID" ]; then
  echo -e "${YELLOW}Port 3000 in use. Stopping process...${NC}"
  kill -9 $PORT_3000_PID
  sleep 1
fi

if [ ! -z "$PORT_3008_PID" ]; then
  echo -e "${YELLOW}Port 3008 in use. Stopping process...${NC}"
  kill -9 $PORT_3008_PID
  sleep 1
fi

# Check for and install any missing dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! npm list next &>/dev/null; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

# Start the socket server in the background with better error handling
echo -e "${GREEN}Starting socket server on port 3008...${NC}"
node simple-socket-server.js > socket-server.log 2>&1 &
SOCKET_PID=$!

# Give the socket server a moment to start
sleep 2

# Check if socket server started successfully
if ! lsof -ti:3008 &>/dev/null; then
  echo -e "${RED}Socket server failed to start. Check socket-server.log for errors.${NC}"
  exit 1
fi

echo -e "${GREEN}Socket server running on http://localhost:3008${NC}"

# Clear Next.js cache to avoid stale build issues
echo -e "${YELLOW}Clearing Next.js cache...${NC}"
rm -rf .next/cache

# Optimize connection settings
echo -e "${YELLOW}Optimizing network settings...${NC}"
export NODE_OPTIONS="--max-http-header-size=16384 --dns-result-order=ipv4first --max-http-header-size=16384 --max-old-space-size=4096 --http-parser=legacy"

# Check network connectivity
echo -e "${YELLOW}Checking network connectivity...${NC}"
ping -c 1 localhost > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}Network connectivity issues detected. Check your network settings.${NC}"
  exit 1
fi

# Start the Next.js app with improved connection settings
echo -e "${GREEN}Starting Next.js app on port 3000...${NC}"
echo -e "${BLUE}--------------------------------------------------${NC}"

# Start Next.js with optimized settings
PORT=3000 npm run dev:next

# Clean up function
function cleanup {
  echo -e "${BLUE}--------------------------------------------------${NC}"
  echo -e "${YELLOW}Stopping servers...${NC}"
  
  # Kill the socket server
  if [ ! -z "$SOCKET_PID" ]; then
    kill $SOCKET_PID 2>/dev/null || kill -9 $SOCKET_PID 2>/dev/null
    echo -e "${GREEN}Socket server stopped.${NC}"
  fi
  
  # Kill any remaining Next.js processes
  NEXT_PID=$(lsof -ti:3000 2>/dev/null)
  if [ ! -z "$NEXT_PID" ]; then
    kill -9 $NEXT_PID 2>/dev/null
    echo -e "${GREEN}Next.js server stopped.${NC}"
  fi
  
  echo -e "${BLUE}==================================================${NC}"
  echo -e "${GREEN}Servers shut down successfully${NC}"
  echo -e "${BLUE}==================================================${NC}"
}

# Set up trap to clean up when the script exits
trap cleanup EXIT

# Keep script running until Ctrl+C
wait $SOCKET_PID
