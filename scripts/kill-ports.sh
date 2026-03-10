#!/usr/bin/env bash
# kill-ports.sh — Free all dev ports used by this project.
# Usage: ./kill-ports.sh

kill_port() {
  local port=$1
  local name=$2
  local pids
  pids=$(lsof -ti :"$port" 2>/dev/null)
  if [ -z "$pids" ]; then
    printf "  [free]  :%s  (%s)\n" "$port" "$name"
  else
    printf "  [kill]  :%s  (%s)  — PID(s): %s\n" "$port" "$name" "$pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

echo "Clearing project ports..."
echo ""
kill_port 3000 "landing-site"
kill_port 3001 "admin-dashboard"
kill_port 5199 "desktop-app renderer (Vite)"
kill_port 5500 "express-api"
kill_port 3100 "mcp-server (SSE)"
echo ""
echo "Done. Run 'pnpm dev' to start fresh."
