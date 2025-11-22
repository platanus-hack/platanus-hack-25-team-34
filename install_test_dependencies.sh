#!/bin/bash

# Install Frontend Testing Dependencies
# This script installs all necessary testing libraries with compatible versions
# using npm, which handles version resolution automatically.

set -e

echo "📦 Installing Frontend Testing Dependencies"
echo "==========================================="
echo ""

cd /home/alonso/hackathon/frontend

echo "Installing Vitest and testing utilities..."
npm install --save-dev vitest@latest \
  @vitest/ui@latest \
  jsdom@latest

echo ""
echo "Installing React Testing Library..."
npm install --save-dev @testing-library/react@latest \
  @testing-library/jest-dom@latest \
  @testing-library/user-event@latest

echo ""
echo "✅ All testing dependencies installed!"
echo ""
echo "Available test commands:"
echo "  npm test              - Run tests in watch mode"
echo "  npm run test:ui       - Run tests with UI"
echo "  npm run test:coverage - Run tests with coverage report"
echo ""
