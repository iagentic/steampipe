#!/bin/bash

# Test script for Steampipe REST API
# This script demonstrates how to use the API endpoints

API_BASE="http://localhost:8080"
API_VERSION="v1"

echo "Steampipe REST API Test Script"
echo "=============================="
echo

# Function to make API calls and display results
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Testing: $method $endpoint"
    echo "----------------------------------------"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE/api/$API_VERSION$endpoint")
    else
        response=$(curl -s -X "$method" \
            "$API_BASE/api/$API_VERSION$endpoint")
    fi
    
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo
}

# Test health check
echo "1. Health Check"
api_call "GET" "/health"

# Test service status
echo "2. Service Status"
api_call "GET" "/service/status"

# Test plugin list
echo "3. Plugin List"
api_call "GET" "/plugins"

# Test single query (if service is running)
echo "4. Single Query Test"
api_call "POST" "/query" '{
    "sql": "SELECT version() as postgres_version",
    "output": "json"
}'

# Test batch queries
echo "5. Batch Query Test"
api_call "POST" "/query/batch" '{
    "queries": [
        {
            "sql": "SELECT version() as postgres_version",
            "output": "json"
        },
        {
            "sql": "SELECT current_database() as current_db",
            "output": "json"
        }
    ]
}'

# Test API documentation
echo "6. API Documentation"
api_call "GET" "/docs"

echo "Test completed!"
echo
echo "To start the API server, run: steampipe api"
echo "To stop the server, press Ctrl+C in the server terminal" 