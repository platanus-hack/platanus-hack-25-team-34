#!/bin/bash

# Hedgie API - Complete curl Command Collection
# Usage: 
#   chmod +x curl_commands.sh
#   ./curl_commands.sh
# Or source it and run individual functions:
#   source curl_commands.sh
#   health_check
#   dev_login

# Configuration
BASE_URL="http://localhost:8000/api/v1"
USER_ID=1
TRACKER_ID=1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper function to print section headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Helper function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}\n"
}

# Helper function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}\n"
}

# 1. Health Check
health_check() {
    print_header "1. Health Check"
    curl -s "${BASE_URL}/health" | jq '.'
    print_success "Health check complete"
}

# 2. Dev Login
dev_login() {
    print_header "2. Dev Login (User ID: ${USER_ID})"
    curl -s -X POST "${BASE_URL}/auth/dev-login" \
        -H "Content-Type: application/json" \
        -d "{\"user_id\": ${USER_ID}}" | jq '.'
    print_success "Login complete"
}

# 3. List All Trackers
list_trackers() {
    print_header "3. List All Trackers"
    curl -s "${BASE_URL}/trackers/" | jq '.'
    print_success "Trackers listed"
}

# 4. Get Tracker Details
get_tracker_details() {
    local id=${1:-$TRACKER_ID}
    print_header "4. Get Tracker Details (ID: ${id})"
    curl -s "${BASE_URL}/trackers/${id}/" | jq '.'
    print_success "Tracker details retrieved"
}

# 5. Get Tracker Holdings
get_tracker_holdings() {
    local id=${1:-$TRACKER_ID}
    print_header "5. Get Tracker Holdings (ID: ${id})"
    curl -s "${BASE_URL}/trackers/${id}/holdings/" | jq '.'
    print_success "Tracker holdings retrieved"
}

# 6. Execute Investment
execute_investment() {
    local user_id=${1:-$USER_ID}
    local tracker_id=${2:-$TRACKER_ID}
    local amount=${3:-50000}
    local allocation=${4:-20}
    
    print_header "6. Execute Investment"
    echo "User: ${user_id}, Tracker: ${tracker_id}, Amount: ${amount} CLP, Allocation: ${allocation}%"
    
    curl -s -X POST "${BASE_URL}/invest" \
        -H "Content-Type: application/json" \
        -d "{
            \"user_id\": ${user_id},
            \"tracker_id\": ${tracker_id},
            \"amount_clp\": ${amount},
            \"allocation_percent\": ${allocation}
        }" | jq '.'
    print_success "Investment executed"
}

# 7. Get User Portfolio
get_portfolio() {
    local user_id=${1:-$USER_ID}
    print_header "7. Get User Portfolio (User ID: ${user_id})"
    curl -s "${BASE_URL}/portfolio/${user_id}/" | jq '.'
    print_success "Portfolio retrieved"
}

# Run all tests in sequence
run_all_tests() {
    print_header "RUNNING COMPLETE API TEST SUITE"
    
    health_check
    sleep 1
    
    dev_login
    sleep 1
    
    list_trackers
    sleep 1
    
    get_tracker_details 1
    sleep 1
    
    get_tracker_holdings 1
    sleep 1
    
    # Get initial portfolio (should be empty)
    get_portfolio 1
    sleep 1
    
    # Execute investment
    execute_investment 1 1 50000 20
    sleep 1
    
    # Get portfolio after investment
    print_header "Portfolio After Investment"
    get_portfolio 1
    
    print_success "ALL TESTS COMPLETE!"
}

# Test insufficient balance scenario
test_insufficient_balance() {
    print_header "TESTING INSUFFICIENT BALANCE SCENARIO"
    
    # Login as User 2 (Bob - only 20k CLP)
    print_header "Login as User 2 (Bob - 20,000 CLP)"
    curl -s -X POST "${BASE_URL}/auth/dev-login" \
        -H "Content-Type: application/json" \
        -d '{"user_id": 2}' | jq '.'
    
    sleep 1
    
    # Try to invest 50,000 CLP (should fail)
    print_header "Attempting to invest 50,000 CLP (should fail)"
    curl -s -X POST "${BASE_URL}/invest" \
        -H "Content-Type: application/json" \
        -d '{
            "user_id": 2,
            "tracker_id": 1,
            "amount_clp": 50000,
            "allocation_percent": 20
        }' | jq '.'
    
    print_error "Expected: Insufficient balance error"
}

# Test multiple investments
test_multiple_investments() {
    print_header "TESTING MULTIPLE INVESTMENTS"
    
    # Login as User 3 (Charlie - 100k CLP)
    print_header "Login as User 3 (Charlie - 100,000 CLP)"
    curl -s -X POST "${BASE_URL}/auth/dev-login" \
        -H "Content-Type: application/json" \
        -d '{"user_id": 3}' | jq '.'
    
    sleep 1
    
    # Check initial portfolio
    print_header "Initial Portfolio"
    get_portfolio 3
    sleep 1
    
    # Invest in Nancy Pelosi
    print_header "Investment 1: Nancy Pelosi (30,000 CLP)"
    execute_investment 3 1 30000 15
    sleep 1
    
    # Invest in Warren Buffett
    print_header "Investment 2: Warren Buffett (20,000 CLP)"
    execute_investment 3 2 20000 10
    sleep 1
    
    # Check final portfolio
    print_header "Final Portfolio (Should show 2 active trackers)"
    get_portfolio 3
    
    print_success "Multiple investments test complete"
}

# Export individual curl commands (for copying)
export_curl_commands() {
    print_header "INDIVIDUAL CURL COMMANDS"
    
    echo -e "${GREEN}# Health Check${NC}"
    echo "curl '${BASE_URL}/health'"
    echo ""
    
    echo -e "${GREEN}# Dev Login${NC}"
    echo "curl -X POST '${BASE_URL}/auth/dev-login' \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"user_id\": 1}'"
    echo ""
    
    echo -e "${GREEN}# List Trackers${NC}"
    echo "curl '${BASE_URL}/trackers/'"
    echo ""
    
    echo -e "${GREEN}# Get Tracker Details${NC}"
    echo "curl '${BASE_URL}/trackers/1/'"
    echo ""
    
    echo -e "${GREEN}# Get Tracker Holdings${NC}"
    echo "curl '${BASE_URL}/trackers/1/holdings/'"
    echo ""
    
    echo -e "${GREEN}# Execute Investment${NC}"
    echo "curl -X POST '${BASE_URL}/invest' \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{"
    echo "    \"user_id\": 1,"
    echo "    \"tracker_id\": 1,"
    echo "    \"amount_clp\": 50000,"
    echo "    \"allocation_percent\": 20"
    echo "  }'"
    echo ""
    
    echo -e "${GREEN}# Get Portfolio${NC}"
    echo "curl '${BASE_URL}/portfolio/1/'"
    echo ""
}

# Show usage
show_usage() {
    echo "Hedgie API - curl Command Collection"
    echo ""
    echo "Usage:"
    echo "  ./curl_commands.sh                    # Run all tests"
    echo "  source curl_commands.sh               # Load functions"
    echo ""
    echo "Available functions:"
    echo "  health_check                          # Check API health"
    echo "  dev_login [user_id]                   # Login (default: 1)"
    echo "  list_trackers                         # List all trackers"
    echo "  get_tracker_details [id]              # Get tracker details (default: 1)"
    echo "  get_tracker_holdings [id]             # Get tracker holdings (default: 1)"
    echo "  execute_investment [uid] [tid] [amt] [alloc]  # Invest"
    echo "  get_portfolio [user_id]               # Get user portfolio (default: 1)"
    echo "  run_all_tests                         # Run complete test suite"
    echo "  test_insufficient_balance             # Test error scenario"
    echo "  test_multiple_investments             # Test multiple investments"
    echo "  export_curl_commands                  # Show individual curl commands"
    echo ""
    echo "Examples:"
    echo "  health_check"
    echo "  dev_login 2"
    echo "  execute_investment 1 1 100000 25"
    echo "  get_portfolio 1"
}

# If script is run directly (not sourced), show usage or run tests
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ $# -eq 0 ]]; then
        run_all_tests
    else
        case "$1" in
            -h|--help)
                show_usage
                ;;
            test)
                run_all_tests
                ;;
            insufficient)
                test_insufficient_balance
                ;;
            multiple)
                test_multiple_investments
                ;;
            export)
                export_curl_commands
                ;;
            *)
                echo "Unknown command: $1"
                show_usage
                exit 1
                ;;
        esac
    fi
else
    echo "Functions loaded. Type 'show_usage' for help."
fi
