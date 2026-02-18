#!/bin/bash

# Development Environment Starter
# Starts all services in separate terminal tabs/windows

echo "🚀 AI Nexus - Starting Development Environment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Detect terminal type
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    echo -e "${BLUE}Starting services in Terminal tabs...${NC}"
    echo ""
    
    # Landing Site (port 3000)
    osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_DIR/apps/landing-site' && echo '🌐 Starting Landing Site (port 3000)...' && pnpm run dev" in front window
end tell
EOF
    
    # Admin Dashboard (port 3001)
    osascript <<EOF
tell application "Terminal"
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_DIR/apps/admin-dashboard' && echo '📊 Starting Admin Dashboard (port 3001)...' && pnpm run dev" in front window
end tell
EOF
    
    # Express API (port 5500)
    osascript <<EOF
tell application "Terminal"
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_DIR/apps/express-api' && echo '⚡ Starting Express API (port 5500)...' && pnpm run dev" in front window
end tell
EOF
    
    # Desktop App
    osascript <<EOF
tell application "Terminal"
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_DIR/apps/desktop-app' && echo '🖥️  Starting Desktop App...' && pnpm run dev" in front window
end tell
EOF
    
    echo -e "${GREEN}✅ All services starting in separate Terminal tabs${NC}"
    
elif [[ -n "$TMUX" ]]; then
    # tmux
    echo -e "${BLUE}Starting services in tmux panes...${NC}"
    echo ""
    
    # Split window into 4 panes
    tmux split-window -h
    tmux split-window -v
    tmux select-pane -t 0
    tmux split-window -v
    
    # Landing Site
    tmux select-pane -t 0
    tmux send-keys "cd '$PROJECT_DIR/apps/landing-site' && echo '🌐 Landing Site (port 3000)' && pnpm run dev" C-m
    
    # Admin Dashboard
    tmux select-pane -t 1
    tmux send-keys "cd '$PROJECT_DIR/apps/admin-dashboard' && echo '📊 Admin Dashboard (port 3001)' && pnpm run dev" C-m
    
    # Express API
    tmux select-pane -t 2
    tmux send-keys "cd '$PROJECT_DIR/apps/express-api' && echo '⚡ Express API (port 5500)' && pnpm run dev" C-m
    
    # Desktop App
    tmux select-pane -t 3
    tmux send-keys "cd '$PROJECT_DIR/apps/desktop-app' && echo '🖥️  Desktop App' && pnpm run dev" C-m
    
    echo -e "${GREEN}✅ All services starting in tmux panes${NC}"
    
else
    # Fallback: Use gnome-terminal or xterm
    echo -e "${YELLOW}Starting services in background...${NC}"
    echo -e "${YELLOW}(Install tmux for better experience: brew install tmux)${NC}"
    echo ""
    
    cd "$PROJECT_DIR/apps/landing-site"
    echo "Starting Landing Site..."
    pnpm run dev > /tmp/landing-site.log 2>&1 &
    LANDING_PID=$!
    
    cd "$PROJECT_DIR/apps/admin-dashboard"
    echo "Starting Admin Dashboard..."
    pnpm run dev > /tmp/admin-dashboard.log 2>&1 &
    ADMIN_PID=$!
    
    cd "$PROJECT_DIR/apps/express-api"
    echo "Starting Express API..."
    pnpm run dev > /tmp/express-api.log 2>&1 &
    API_PID=$!
    
    cd "$PROJECT_DIR/apps/desktop-app"
    echo "Starting Desktop App..."
    pnpm run dev > /tmp/desktop-app.log 2>&1 &
    DESKTOP_PID=$!
    
    echo ""
    echo -e "${GREEN}✅ All services started in background${NC}"
    echo ""
    echo "Process IDs:"
    echo "  Landing Site: $LANDING_PID"
    echo "  Admin Dashboard: $ADMIN_PID"
    echo "  Express API: $API_PID"
    echo "  Desktop App: $DESKTOP_PID"
    echo ""
    echo "View logs:"
    echo "  tail -f /tmp/landing-site.log"
    echo "  tail -f /tmp/admin-dashboard.log"
    echo "  tail -f /tmp/express-api.log"
    echo "  tail -f /tmp/desktop-app.log"
    echo ""
    echo "Stop all services:"
    echo "  kill $LANDING_PID $ADMIN_PID $API_PID $DESKTOP_PID"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Services starting...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "🌐 Landing Site:      http://localhost:3000"
echo "📊 Admin Dashboard:   http://localhost:3001"
echo "⚡ Express API:       http://localhost:5500"
echo "🖥️  Desktop App:      (Electron window)"
echo ""
echo "Wait ~30 seconds for all services to be ready..."
echo ""
