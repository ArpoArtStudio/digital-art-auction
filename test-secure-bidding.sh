#!/bin/zsh

# Colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==================================================${NC}"
echo -e "${GREEN}Secure Bidding System Test Script${NC}"
echo -e "${YELLOW}==================================================${NC}"

# Check if the connection test passes
echo -e "\n${GREEN}Step 1: Running connection diagnostics${NC}"
node connection-test.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Connection diagnostics failed. Please fix the issues before continuing.${NC}"
  exit 1
fi

# Check if the secure bidding components exist
echo -e "\n${GREEN}Step 2: Checking required components${NC}"
MISSING_FILES=0

FILES_TO_CHECK=(
  "components/secure-bidding-ui.tsx"
  "components/bid-buttons.tsx" 
  "components/quick-bid-button.tsx"
  "components/bid-history.tsx"
  "components/payment-completion.tsx"
  "components/user-auctions.tsx"
  "contexts/bidding-context.tsx"
  "lib/auction-contract.ts"
)

for file in ${FILES_TO_CHECK[@]}; do
  if [ -f "$file" ]; then
    echo -e "✅ $file exists"
  else
    echo -e "${RED}❌ $file is missing${NC}"
    MISSING_FILES=$((MISSING_FILES+1))
  fi
done

if [ $MISSING_FILES -gt 0 ]; then
  echo -e "${RED}Some required files are missing. Please fix before continuing.${NC}"
  exit 1
fi

# Simulate a bid placement
echo -e "\n${GREEN}Step 3: Simulating a bid placement${NC}"

echo -e "Starting the socket server..."
node simple-socket-server.js &
SOCKET_PID=$!

# Give the socket server time to start
sleep 2

# Simulate a bid with the test bidding system
echo -e "${YELLOW}Running bid simulation...${NC}"
node test-bidding-system.js

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Bid simulation successful${NC}"
else
  echo -e "${RED}❌ Bid simulation failed${NC}"
  # Kill the socket server before exiting
  kill $SOCKET_PID
  exit 1
fi

# Kill the socket server
kill $SOCKET_PID

echo -e "\n${GREEN}Step 4: Checking Next.js build${NC}"
# Check if Next.js can build without errors
echo -e "Running Next.js build check..."
npm run build --quiet

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Next.js build successful${NC}"
else
  echo -e "${RED}❌ Next.js build failed${NC}"
  exit 1
fi

# Final report
echo -e "\n${YELLOW}==================================================${NC}"
echo -e "${GREEN}Secure Bidding System Test Complete${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "The secure bidding system is properly integrated and connection issues have been resolved."
echo -e "To start the development server with all improvements, run:"
echo -e "  ${YELLOW}./start-improved.sh${NC}"

exit 0
