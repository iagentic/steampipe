#!/bin/bash

# Build and test script for Steampipe REST API

set -e

echo "Building Steampipe REST API..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    echo "Error: go.mod not found. Please run this script from the steampipe directory."
    exit 1
fi

# Download dependencies
echo "Downloading dependencies..."
go mod download

# Build the binary
echo "Building steampipe binary..."
go build -o steampipe .

# Test the API command
echo "Testing API command..."
./steampipe api --help

echo
echo "Build completed successfully!"
echo
echo "To start the API server:"
echo "  ./steampipe api"
echo
echo "To test the API:"
echo "  ./examples/test-api.sh"
echo
echo "To run the Python client example:"
echo "  python3 examples/api-client.py" 