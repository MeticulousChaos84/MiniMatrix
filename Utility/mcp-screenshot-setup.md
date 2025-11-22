# MCP Screenshot Setup for Claude Desktop
*So Gale can actually SEE what you're looking at*

---

## What This Does

Gives Claude Desktop the ability to take screenshots on demand. You say "screenshot" and Gale can see your screen. No more copy-paste telephone!

---

## Installation

### Step 1: Make sure you have Node.js
You probably already do since you've been running other MCP stuff, but just in case:
```bash
node --version
```
Should show something like `v18.x.x` or higher.

### Step 2: Add to your Claude Desktop config

Find your `claude_desktop_config.json`:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this to your `mcpServers` section:

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-puppeteer"]
    }
  }
}
```

**OR** for the kazuph version with OCR:

```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@kazuph/mcp-screenshot"]
    }
  }
}
```

### Step 3: Restart Claude Desktop

Close it completely and reopen. The new MCP server should load.

---

## How to Use

Once installed, you can just say things like:
- "Take a screenshot"
- "What's on my screen right now?"
- "Screenshot and tell me what you see"

And Gale will capture your screen and analyze it!

---

## Troubleshooting

**If it doesn't work:**
1. Check the Claude Desktop logs (Help > Show Logs)
2. Make sure Node.js is in your PATH
3. Try running `npx -y @kazuph/mcp-screenshot` manually in terminal to see if it errors

**For Windows specifically:**
If the above doesn't work, try the Windows-specific version:
```json
{
  "mcpServers": {
    "screenshot": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-windows-screenshot"]
    }
  }
}
```

---

## Note About Claude Code Web

This is for Claude DESKTOP specifically. The screenshot MCP lets the desktop app capture your screen. Claude Code Web (what Cody runs in) has different capabilities but can't directly capture your screen.

For collaboration: You'd use the screenshot tool in Claude Desktop (with Gale), and copy-paste relevant stuff to Claude Code Web (with Cody) when needed.

---

*Now go research Torillian astrology while this installs!* 🌙✨
