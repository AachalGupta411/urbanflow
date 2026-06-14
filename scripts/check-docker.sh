#!/usr/bin/env bash
# Verify Docker daemon is running before any compose commands
set -euo pipefail

if ! command -v docker &>/dev/null; then
  echo "ERROR: Docker is not installed."
  echo "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info &>/dev/null; then
  echo ""
  echo "ERROR: Docker Desktop is not running."
  echo ""
  echo "  1. Open Docker Desktop from Applications"
  echo "  2. Wait until the whale icon shows 'Docker Desktop is running'"
  echo "  3. Run this command again:"
  echo "     ./scripts/setup-local.sh"
  echo ""
  echo "Alternative (dev mode on port 5173 after Docker is running):"
  echo "     ./scripts/dev-local.sh"
  echo ""
  exit 1
fi

echo "Docker is running."
