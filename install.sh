#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/plugins"
PLUGIN_FILE="$PLUGIN_DIR/progress-bar.tsx"
TUI_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/tui.json"
URL="https://raw.githubusercontent.com/Dawnfz-Lenfeng/opencode-progress-bar/main/src/index.tsx"

mkdir -p "$PLUGIN_DIR"

echo "Downloading progress-bar plugin..."
curl -fsSL "$URL" -o "$PLUGIN_FILE"

if [ -f "$TUI_FILE" ]; then
  if grep -q '"plugin"' "$TUI_FILE"; then
    echo "tui.json already has a \"plugin\" entry — skipping config update."
  else
    sed -i '' 's/{/{ "plugin": [".\/plugins\/progress-bar.tsx"],/' "$TUI_FILE"
    echo "Added plugin entry to tui.json."
  fi
else
  echo '{ "plugin": ["./plugins/progress-bar.tsx"] }' > "$TUI_FILE"
  echo "Created tui.json with plugin entry."
fi

echo "Done! Restart opencode to see the progress bar."
