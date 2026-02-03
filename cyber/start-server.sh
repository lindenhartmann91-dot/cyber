#!/bin/bash

echo "========================================"
echo "   CyberSentinel Development Server"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    echo
    exit 1
fi

echo "Node.js version:"
node --version
echo

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "ERROR: server.js not found in current directory"
    echo "Please make sure you're running this from the project root"
    echo
    exit 1
fi

echo "Starting CyberSentinel server..."
echo "Server will be available at: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo

# Start the server
node server.js