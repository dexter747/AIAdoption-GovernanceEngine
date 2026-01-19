#!/bin/bash

# AI Nexus MCP Farm Startup Script
# This script starts the MCP server farm using Docker Compose

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="${SCRIPT_DIR}/infrastructure/docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     AI Nexus MCP Server Farm Launcher      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check for Docker Compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not available${NC}"
    exit 1
fi

# Check for .env file
if [ ! -f "${DOCKER_DIR}/.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo -e "Creating from .env.example..."
    cp "${DOCKER_DIR}/.env.example" "${DOCKER_DIR}/.env"
    echo -e "${YELLOW}Please edit ${DOCKER_DIR}/.env with your credentials${NC}"
    exit 1
fi

# Parse command line arguments
PROFILE=""
ACTION="up"

while [[ $# -gt 0 ]]; do
    case $1 in
        --enterprise)
            PROFILE="--profile enterprise"
            shift
            ;;
        --healthcare)
            PROFILE="--profile healthcare"
            shift
            ;;
        --legacy)
            PROFILE="--profile legacy"
            shift
            ;;
        --all)
            PROFILE="--profile enterprise --profile healthcare --profile legacy"
            shift
            ;;
        down)
            ACTION="down"
            shift
            ;;
        logs)
            ACTION="logs"
            shift
            ;;
        status)
            ACTION="ps"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: ./start-mcp-farm.sh [--enterprise|--healthcare|--legacy|--all] [down|logs|status]"
            exit 1
            ;;
    esac
done

cd "${DOCKER_DIR}"

case $ACTION in
    up)
        echo -e "${GREEN}Starting MCP Server Farm...${NC}"
        echo ""
        docker compose -f docker-compose.mcp-farm.yml ${PROFILE} up -d
        echo ""
        echo -e "${GREEN}MCP Server Farm is starting!${NC}"
        echo ""
        echo "Services:"
        docker compose -f docker-compose.mcp-farm.yml ${PROFILE} ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo -e "AI Nexus MCP Server: ${GREEN}http://localhost:3100${NC}"
        echo ""
        echo "To view logs: ./start-mcp-farm.sh logs"
        echo "To stop: ./start-mcp-farm.sh down"
        ;;
    down)
        echo -e "${YELLOW}Stopping MCP Server Farm...${NC}"
        docker compose -f docker-compose.mcp-farm.yml ${PROFILE} down
        echo -e "${GREEN}MCP Server Farm stopped${NC}"
        ;;
    logs)
        docker compose -f docker-compose.mcp-farm.yml ${PROFILE} logs -f
        ;;
    ps)
        echo -e "${GREEN}MCP Server Farm Status:${NC}"
        docker compose -f docker-compose.mcp-farm.yml ${PROFILE} ps
        ;;
esac
