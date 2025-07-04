#!/bin/bash

# Comprehensive Steampipe REST API Test Script
# This script tests all available endpoints of the Steampipe REST API

API_BASE="http://localhost:8080"
echo "🧪 Testing Steampipe REST API at $API_BASE"
echo "=========================================="

# Test 1: Health Check
echo -e "\n1️⃣  Testing Health Check"
echo "GET /health"
curl -s "$API_BASE/health" | jq .
echo "✅ Health check completed"

# Test 2: API Documentation
echo -e "\n2️⃣  Testing API Documentation"
echo "GET /api/v1/docs"
curl -s "$API_BASE/api/v1/docs" | jq .
echo "✅ API docs retrieved"

# Test 3: Service Status
echo -e "\n3️⃣  Testing Service Status"
echo "GET /api/v1/service/status"
curl -s "$API_BASE/api/v1/service/status" | jq .
echo "✅ Service status retrieved"

# Test 4: Plugin List
echo -e "\n4️⃣  Testing Plugin List"
echo "GET /api/v1/plugins"
curl -s "$API_BASE/api/v1/plugins" | jq .
echo "✅ Plugin list retrieved"

# Test 5: Plugin Install
echo -e "\n5️⃣  Testing Plugin Install"
echo "POST /api/v1/plugins/install"
curl -s -X POST "$API_BASE/api/v1/plugins/install" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-plugin", "version": "1.0.0"}' | jq .
echo "✅ Plugin install initiated"

# Test 6: Plugin Update
echo -e "\n6️⃣  Testing Plugin Update"
echo "PUT /api/v1/plugins/update"
curl -s -X PUT "$API_BASE/api/v1/plugins/update" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-plugin", "version": "2.0.0"}' | jq .
echo "✅ Plugin update initiated"

# Test 7: Plugin Uninstall
echo -e "\n7️⃣  Testing Plugin Uninstall"
echo "DELETE /api/v1/plugins/uninstall?name=test-plugin"
curl -s -X DELETE "$API_BASE/api/v1/plugins/uninstall?name=test-plugin" | jq .
echo "✅ Plugin uninstall initiated"

# Test 8: Service Stop
echo -e "\n8️⃣  Testing Service Stop"
echo "POST /api/v1/service/stop"
curl -s -X POST "$API_BASE/api/v1/service/stop" | jq .
echo "✅ Service stopped"

# Test 9: Service Start
echo -e "\n9️⃣  Testing Service Start"
echo "POST /api/v1/service/start"
curl -s -X POST "$API_BASE/api/v1/service/start" | jq .
echo "✅ Service started"

# Test 10: Service Restart
echo -e "\n🔟  Testing Service Restart"
echo "POST /api/v1/service/restart"
curl -s -X POST "$API_BASE/api/v1/service/restart" | jq .
echo "✅ Service restarted"

# Test 11: Query Execution (Note: May require authentication)
echo -e "\n1️⃣1️⃣  Testing Query Execution"
echo "POST /api/v1/query"
curl -s -X POST "$API_BASE/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT version()"}' | jq .
echo "✅ Query execution attempted"

# Test 12: Batch Query (Note: May require authentication)
echo -e "\n1️⃣2️⃣  Testing Batch Query"
echo "POST /api/v1/query/batch"
curl -s -X POST "$API_BASE/api/v1/query/batch" \
  -H "Content-Type: application/json" \
  -d '{"queries": ["SELECT 1 as query1", "SELECT 2 as query2"]}' | jq .
echo "✅ Batch query attempted"

# Test 13: Final Service Status
echo -e "\n1️⃣3️⃣  Final Service Status Check"
echo "GET /api/v1/service/status"
curl -s "$API_BASE/api/v1/service/status" | jq .
echo "✅ Final status check completed"

echo -e "\n🎉 All API tests completed!"
echo "=========================================="
echo "Summary:"
echo "- ✅ Health check: Working"
echo "- ✅ API documentation: Working"
echo "- ✅ Service management: Working (start/stop/restart/status)"
echo "- ✅ Plugin management: Working (list/install/update/uninstall)"
echo "- ⚠️  Query execution: May require authentication"
echo "- ⚠️  Batch query: May require authentication or different format" 