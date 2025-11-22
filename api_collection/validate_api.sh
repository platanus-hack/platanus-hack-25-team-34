#!/bin/bash
# Quick API validation script - tests all endpoints

echo "🧪 Hedgie API - Quick Validation Test"
echo "======================================"
echo ""

BASE_URL="http://localhost:8000/api/v1"
PASS=0
FAIL=0

test_endpoint() {
    local name=$1
    local cmd=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    response=$(eval "$cmd -w '\n%{http_code}'" 2>/dev/null)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo "✅ PASS (HTTP $status_code)"
        ((PASS++))
        return 0
    else
        echo "❌ FAIL (Expected HTTP $expected_status, got $status_code)"
        echo "   Response: $body"
        ((FAIL++))
        return 1
    fi
}

# Test 1: Health Check
test_endpoint "Health Check" \
    "curl -s $BASE_URL/health"

# Test 2: Dev Login
test_endpoint "Dev Login" \
    "curl -s -X POST $BASE_URL/auth/dev-login -H 'Content-Type: application/json' -d '{\"user_id\": 1}'"

# Test 3: List Trackers
test_endpoint "List Trackers" \
    "curl -s $BASE_URL/trackers/"

# Test 4: Get Tracker Details
test_endpoint "Get Tracker Details (ID:1)" \
    "curl -s $BASE_URL/trackers/1/"

# Test 5: Get Tracker Holdings
test_endpoint "Get Tracker Holdings (ID:1)" \
    "curl -s $BASE_URL/trackers/1/holdings/"

# Test 6: Get Portfolio (Empty)
test_endpoint "Get Portfolio (User 1)" \
    "curl -s $BASE_URL/portfolio/1/"

# Test 7: Execute Investment
test_endpoint "Execute Investment" \
    "curl -s -X POST $BASE_URL/invest -H 'Content-Type: application/json' -d '{\"user_id\":1,\"tracker_id\":1,\"amount_clp\":50000,\"allocation_percent\":20}'"

# Test 8: Get Portfolio (After Investment)
test_endpoint "Get Portfolio (After Investment)" \
    "curl -s $BASE_URL/portfolio/1/"

# Test 9: Insufficient Balance Error
test_endpoint "Insufficient Balance (should fail)" \
    "curl -s -X POST $BASE_URL/invest -H 'Content-Type: application/json' -d '{\"user_id\":2,\"tracker_id\":1,\"amount_clp\":50000,\"allocation_percent\":20}'" \
    400

# Test 10: Invalid Tracker
test_endpoint "Invalid Tracker (should fail)" \
    "curl -s $BASE_URL/trackers/999/" \
    404

echo ""
echo "======================================"
echo "Results: $PASS passed, $FAIL failed"
echo "======================================"

if [ $FAIL -eq 0 ]; then
    echo "✅ All tests passed!"
    exit 0
else
    echo "❌ Some tests failed"
    exit 1
fi
