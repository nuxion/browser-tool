#!/bin/bash
# browser-tool installer
# Usage: curl -fsSL https://raw.githubusercontent.com/nuxion/browser-tool/main/install.sh | bash

set -e

PACKAGE_NAME="@nuxion/browser-tool"
MIN_NODE_VERSION=18

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       browser-tool installer           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check for Node.js
info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js >= $MIN_NODE_VERSION first.

    Install via:
      - https://nodejs.org/
      - nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
      - Arch: sudo pacman -S nodejs npm
      - Ubuntu/Debian: sudo apt install nodejs npm
      - macOS: brew install node"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "$MIN_NODE_VERSION" ]; then
    error "Node.js version $MIN_NODE_VERSION or higher is required. Current: $(node -v)"
fi
success "Node.js $(node -v) found"

# Check for npm
info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm first."
fi
success "npm $(npm -v) found"

# Check npm prefix (avoid sudo issues)
NPM_PREFIX=$(npm config get prefix)
if [[ "$NPM_PREFIX" == "/usr" || "$NPM_PREFIX" == "/usr/local" ]]; then
    warn "npm global directory requires sudo: $NPM_PREFIX"
    warn "Consider setting up a local npm directory to avoid permission issues:"
    echo ""
    echo "    mkdir -p ~/.npm-global"
    echo "    npm config set prefix ~/.npm-global"
    echo "    export PATH=~/.npm-global/bin:\$PATH"
    echo ""
    read -p "Continue with sudo? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Setup local npm directory first, then re-run this script."
        exit 0
    fi
    USE_SUDO="sudo"
else
    USE_SUDO=""
fi

# Install browser-tool
info "Installing $PACKAGE_NAME..."
if $USE_SUDO npm install -g "$PACKAGE_NAME"; then
    success "browser-tool installed"
else
    error "Failed to install browser-tool"
fi

# Install Playwright Chromium
info "Installing Playwright Chromium browser..."
if npx playwright install chromium; then
    success "Chromium browser installed"
else
    warn "Failed to install Chromium. You may need to install system dependencies:"
    echo ""
    echo "    # Ubuntu/Debian"
    echo "    sudo npx playwright install-deps chromium"
    echo ""
    echo "    # Arch Linux"
    echo "    sudo pacman -S nss nspr at-spi2-atk cups libdrm mesa libxkbcommon"
    echo ""
fi

# Verify installation
info "Verifying installation..."
if command -v browser-tool &> /dev/null; then
    success "browser-tool is ready!"
    echo ""
    echo -e "${GREEN}Installation complete!${NC}"
    echo ""
    echo "Usage:"
    echo "    browser-tool launch https://example.com -s \"h1\""
    echo "    browser-tool launch https://example.com -s \"article\" --markdown"
    echo "    browser-tool --help"
    echo ""
else
    warn "browser-tool installed but not in PATH"
    echo ""
    echo "Add npm global bin to your PATH:"
    echo "    export PATH=\"$(npm config get prefix)/bin:\$PATH\""
    echo ""
fi
