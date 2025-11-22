#!/bin/bash

# Test script to verify all Hedgie frontend views are accessible
# Usage: ./test_views.sh

set -e

echo "🧪 Testing Hedgie Frontend Views"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8000/api/v1"

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Testing $name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

echo "Backend API Tests:"
echo "-------------------"
test_endpoint "Health Endpoint" "$BACKEND_URL/health"
test_endpoint "Trackers List" "$BACKEND_URL/trackers/"
test_endpoint "Tracker Details (ID: 1)" "$BACKEND_URL/trackers/1"
test_endpoint "Tracker Holdings (ID: 1)" "$BACKEND_URL/trackers/1/holdings"

echo ""
echo "Frontend View Tests:"
echo "--------------------"
test_endpoint "Frontend Root" "$FRONTEND_URL/"
test_endpoint "Login Page" "$FRONTEND_URL/login"
test_endpoint "Marketplace" "$FRONTEND_URL/marketplace"
test_endpoint "Tracker Detail (ID: 1)" "$FRONTEND_URL/tracker/1"
test_endpoint "Dashboard" "$FRONTEND_URL/dashboard"

echo ""
echo "=================================="
echo ""

# Test dev-login endpoint
echo "Testing Dev Login:"
echo "------------------"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/dev-login" \
    -H "Content-Type: application/json" \
    -d '{"user_id": 1}')

if echo "$RESPONSE" | jq -e '.user_id' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Dev Login works${NC}"
    echo "User: $(echo $RESPONSE | jq -r '.name')"
    echo "Balance: $(echo $RESPONSE | jq -r '.balance_clp') CLP"
else
    echo -e "${RED}✗ Dev Login failed${NC}"
    echo "Response: $RESPONSE"
fi

echo ""
echo "=================================="
echo ""
echo -e "${YELLOW}📋 Quick Access URLs:${NC}"
echo "  Login:         $FRONTEND_URL/login"
echo "  Marketplace:   $FRONTEND_URL/marketplace"
echo "  Tracker 1:     $FRONTEND_URL/tracker/1"
echo "  Tracker 2:     $FRONTEND_URL/tracker/2"
echo "  Dashboard:     $FRONTEND_URL/dashboard"
echo ""
echo "  API Docs:      http://localhost:8000/docs"
echo ""
echo -e "${GREEN}Note: With VITE_LOCAL_DEVELOPMENT=true, all views bypass authentication${NC}"
echo ""
