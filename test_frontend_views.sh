#!/bin/bash

# Frontend View Tests for Local Development Mode
# This script tests that all views are accessible when VITE_LOCAL_DEVELOPMENT=true
# Usage: ./test_frontend_views.sh

set -e

echo "🧪 Frontend View Accessibility Tests (Local Development Mode)"
echo "=============================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_URL="http://localhost:5173"
TESTS_PASSED=0
TESTS_FAILED=0

# Test result tracking
declare -a FAILED_TESTS

# Test function
test_view() {
    local view_name=$1
    local view_url=$2
    local expected_text=$3
    
    echo -ne "${BLUE}Testing ${view_name}...${NC} "
    
    # Fetch the page
    RESPONSE=$(curl -s "$view_url")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$view_url")
    
    # Check HTTP status
    if [ "$HTTP_CODE" != "200" ]; then
        echo -e "${RED}✗ FAILED${NC}"
        echo "  └─ HTTP Status: $HTTP_CODE (expected 200)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        FAILED_TESTS+=("$view_name - HTTP $HTTP_CODE")
        return 1
    fi
    
    # Check if page contains expected text (if provided)
    if [ -n "$expected_text" ]; then
        if echo "$RESPONSE" | grep -q "$expected_text"; then
            echo -e "${GREEN}✓ PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}✗ FAILED${NC}"
            echo "  └─ Expected text not found: '$expected_text'"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            FAILED_TESTS+=("$view_name - Missing expected content")
            return 1
        fi
    else
        echo -e "${GREEN}✓ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    fi
}

# Check if frontend is running
echo "${YELLOW}Checking if frontend is running...${NC}"
if ! curl -s "$FRONTEND_URL" > /dev/null; then
    echo -e "${RED}✗ Frontend is not running at $FRONTEND_URL${NC}"
    echo ""
    echo "Please start the frontend:"
    echo "  cd /home/alonso/hackathon"
    echo "  docker-compose up -d frontend"
    exit 1
fi
echo -e "${GREEN}✓ Frontend is running${NC}"
echo ""

# Wait for frontend to be ready
echo "${YELLOW}Waiting for frontend to be ready...${NC}"
sleep 3
echo ""

echo "Running View Tests:"
echo "-------------------"

# Test 1: Root redirects to login
test_view "Root Path (/)" \
    "$FRONTEND_URL/" \
    ""

# Test 2: Login Page
test_view "Login Page" \
    "$FRONTEND_URL/login" \
    ""

# Test 3: Marketplace
test_view "Marketplace Page" \
    "$FRONTEND_URL/marketplace" \
    ""

# Test 4: Tracker Detail (Nancy Pelosi - ID 1)
test_view "Tracker Detail Page (ID: 1)" \
    "$FRONTEND_URL/tracker/1" \
    ""

# Test 5: Tracker Detail (Warren Buffett - ID 2)
test_view "Tracker Detail Page (ID: 2)" \
    "$FRONTEND_URL/tracker/2" \
    ""

# Test 6: Dashboard
test_view "Dashboard Page" \
    "$FRONTEND_URL/dashboard" \
    ""

# Test 7: Invalid Tracker (should still load, show error)
test_view "Invalid Tracker Page (ID: 999)" \
    "$FRONTEND_URL/tracker/999" \
    ""

echo ""
echo "=============================================================="
echo "Test Summary:"
echo "-------------------"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Failed Tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  • $test"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "All frontend views are accessible in local development mode."
    echo ""
    echo "Test URLs:"
    echo "  • Login:         $FRONTEND_URL/login"
    echo "  • Marketplace:   $FRONTEND_URL/marketplace"
    echo "  • Tracker #1:    $FRONTEND_URL/tracker/1"
    echo "  • Tracker #2:    $FRONTEND_URL/tracker/2"
    echo "  • Dashboard:     $FRONTEND_URL/dashboard"
    echo ""
    exit 0
fi
