#!/bin/bash
# Setup npm to use a local directory for global packages (avoids sudo)

set -e

NPM_DIR="$HOME/.npm-global"

echo "Setting up npm to use local directory: $NPM_DIR"

# Create directory
mkdir -p "$NPM_DIR"

# Configure npm
npm config set prefix "$NPM_DIR"

echo "npm prefix set to: $(npm config get prefix)"

# Detect shell and update config
add_to_path() {
    local config_file="$1"
    local path_line="$2"

    if [ -f "$config_file" ]; then
        if grep -q ".npm-global" "$config_file"; then
            echo "PATH already configured in $config_file"
            return
        fi
    fi

    echo "" >> "$config_file"
    echo "# npm global packages" >> "$config_file"
    echo "$path_line" >> "$config_file"
    echo "Added PATH to $config_file"
}

SHELL_NAME=$(basename "$SHELL")

case "$SHELL_NAME" in
    fish)
        FISH_CONFIG="$HOME/.config/fish/config.fish"
        mkdir -p "$(dirname "$FISH_CONFIG")"
        add_to_path "$FISH_CONFIG" 'set -gx PATH ~/.npm-global/bin $PATH'
        echo ""
        echo "Run: source $FISH_CONFIG"
        ;;
    zsh)
        add_to_path "$HOME/.zshrc" 'export PATH="$HOME/.npm-global/bin:$PATH"'
        echo ""
        echo "Run: source ~/.zshrc"
        ;;
    bash)
        add_to_path "$HOME/.bashrc" 'export PATH="$HOME/.npm-global/bin:$PATH"'
        echo ""
        echo "Run: source ~/.bashrc"
        ;;
    *)
        echo ""
        echo "Unknown shell: $SHELL_NAME"
        echo "Manually add this to your shell config:"
        echo '  export PATH="$HOME/.npm-global/bin:$PATH"'
        ;;
esac

echo ""
echo "Done! After reloading your shell, run:"
echo "  npm run link"
