#!/bin/bash

# Velanova Desktop App Build Script
# This script builds the desktop application for all platforms

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_DIR="$ROOT_DIR/apps/desktop-app"

echo "🚀 Velanova Desktop App Build Script"
echo "======================================"
echo ""

# Check for required tools
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm is not installed"
        exit 1
    fi
    
    echo "✅ Node.js $(node --version)"
    echo "✅ pnpm $(pnpm --version)"
    echo ""
}

# Build MCP servers first
build_mcp_servers() {
    echo "📦 Building MCP servers..."
    
    MCP_DIR="$ROOT_DIR/packages/mcp-servers"
    
    for dir in "$MCP_DIR"/*/; do
        if [ -f "$dir/package.json" ]; then
            echo "  Building $(basename $dir)..."
            cd "$dir"
            pnpm install --frozen-lockfile 2>/dev/null || pnpm install
            pnpm build 2>/dev/null || echo "    ⚠️ Build skipped (no build script)"
            cd "$ROOT_DIR"
        fi
    done
    
    echo "✅ MCP servers built"
    echo ""
}

# Build the renderer (Vite/React)
build_renderer() {
    echo "🎨 Building renderer (React app)..."
    cd "$APP_DIR"
    pnpm run build:renderer
    echo "✅ Renderer built"
    echo ""
}

# Build the main process (TypeScript)
build_main() {
    echo "⚙️ Building main process (Electron)..."
    cd "$APP_DIR"
    pnpm run build:main
    pnpm run build:preload
    echo "✅ Main process built"
    echo ""
}

# Package with electron-builder
package_app() {
    local platform=$1
    
    echo "📦 Packaging for $platform..."
    cd "$APP_DIR"
    
    case $platform in
        "mac")
            pnpm run build:mac
            ;;
        "win")
            pnpm run build:win
            ;;
        "linux")
            pnpm run build:linux
            ;;
        "all")
            electron-builder --mac --win --linux
            ;;
        *)
            electron-builder
            ;;
    esac
    
    echo "✅ Packaging complete"
    echo ""
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --mac       Build for macOS"
    echo "  --win       Build for Windows"
    echo "  --linux     Build for Linux"
    echo "  --all       Build for all platforms"
    echo "  --skip-mcp  Skip building MCP servers"
    echo "  --help      Show this help"
    echo ""
    echo "Example:"
    echo "  $0 --mac         # Build macOS DMG"
    echo "  $0 --all         # Build for all platforms"
    echo "  $0               # Build for current platform"
}

# Main
main() {
    local platform=""
    local skip_mcp=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --mac)
                platform="mac"
                shift
                ;;
            --win)
                platform="win"
                shift
                ;;
            --linux)
                platform="linux"
                shift
                ;;
            --all)
                platform="all"
                shift
                ;;
            --skip-mcp)
                skip_mcp=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    check_requirements
    
    if [ "$skip_mcp" = false ]; then
        build_mcp_servers
    fi
    
    build_renderer
    build_main
    package_app "$platform"
    
    echo ""
    echo "🎉 Build complete!"
    echo ""
    echo "Output files are in: $APP_DIR/release/"
    ls -la "$APP_DIR/release/" 2>/dev/null || echo "(No release files found yet)"
}

main "$@"
