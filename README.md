# opencode-progress-bar

A [opencode](https://opencode.ai) TUI plugin that displays a context usage progress bar in the session prompt area.

## Preview

```
█░░░░░░░░░   (white — <75%)
████████░░   (yellow — <90%)
█████████░   (red — ≥90%)
```

## How it works

- Hooks into the `session_prompt_right` TUI slot, rendering a 10-character `█░` bar next to the input prompt
- Calculates context usage from the last completed assistant message's tokens: `input + cache.read + cache.write`
- Compares against the model's context window limit from provider config
- Color changes based on usage: **white** (<75%), **yellow** (<90%), **red** (≥90%)
- Updates via `message.updated` and `session.next.step.ended` events — no polling

## Install

### Option 1: Local file (recommended)

Copy `src/index.tsx` into your opencode plugins directory and add it to `tui.json`:

```bash
mkdir -p ~/.config/opencode/plugins
cp src/index.tsx ~/.config/opencode/plugins/progress-bar.tsx
```

Then edit `~/.config/opencode/tui.json`:

```json
{
  "plugin": ["./plugins/progress-bar.tsx"]
}
```

### Option 2: Symlink

```bash
ln -s /path/to/opencode-progress-bar/src/index.tsx ~/.config/opencode/plugins/progress-bar.tsx
```

## Notes

- Uses `/** @jsxImportSource @opentui/solid */` — this is required for opencode's local plugin loading. Do **not** use `solid-js` as the JSX import source; it will not render.
- Token counts from the model's cache (`cache.read`, `cache.write`) are included in the total, as they occupy the same context window.
- The bar ignores assistant messages with zero tokens (e.g., still streaming) and preserves the last known value.
