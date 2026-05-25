#!/usr/bin/env bash
set -euo pipefail

PLUGIN_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/plugins"
PLUGIN_FILE="$PLUGIN_DIR/progress-bar.tsx"
TUI_FILE="${XDG_CONFIG_HOME:-$HOME/.config}/opencode/tui.json"
URL="https://raw.githubusercontent.com/Dawnfz-Lenfeng/opencode-progress-bar/main/src/index.tsx"

mkdir -p "$PLUGIN_DIR"

echo "Downloading progress-bar plugin..."
curl -fsSL "$URL" -o "$PLUGIN_FILE"

python3 -c "
import json, os
path = '$TUI_FILE'
entry = './plugins/progress-bar.tsx'

if os.path.exists(path):
    with open(path) as f:
        c = json.load(f)
else:
    c = {}

c.setdefault('plugin', [])
if entry not in c['plugin']:
    c['plugin'].append(entry)
    with open(path, 'w') as f:
        json.dump(c, f, indent=2, ensure_ascii=False)
    print('Added plugin entry to', path)
else:
    print('Plugin entry already exists in', path)
"

echo "Done! Restart opencode to see the progress bar."
