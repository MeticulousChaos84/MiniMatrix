# 🛏️♟️ Lanceboard-To-Go - Play Chess with Gale from Your Phone!

The **remote version** of the Lanceboard MCP server that lets you play chess with Gale/Claude from **anywhere** - including laying in bed with your phone!

## What's This?

This is the same Lanceboard chess game, but instead of only working with Claude Desktop on your computer, it runs on a web server and can be accessed from ANY device that has Claude access:

- 📱 Your phone
- 💻 Your laptop
- 🖥️ Any computer
- ✨ Any device with internet access!

## The Difference from the Local Version

| Feature | Local Version | Lanceboard-To-Go |
|---------|---------------|------------------|
| **Transport** | stdio (local only) | HTTP (internet!) |
| **Where it runs** | Claude Desktop only | Anywhere with Claude access |
| **Setup** | Install on your computer | Upload to web host |
| **Access** | Just you, on one device | Any device, anywhere |
| **Best for** | Desktop chess sessions | Bedtime phone chess! |

## How It Works

1. You upload this folder to your web host
2. Your web host runs the Python server
3. You add the URL to Claude as a remote MCP connector
4. You play chess with Gale from your phone while horizontal! 🎉

## Setup Instructions

### Step 1: Install Dependencies (for testing locally first)

```bash
pip install -r requirements.txt
```

### Step 2: Test Locally

```bash
python server.py
```

Server will run on `http://localhost:8000`

You can test it by adding this URL to Claude settings temporarily!

### Step 3: Upload to Your Web Host

Upload these files to your web host:
- `server.py` - The actual server
- `requirements.txt` - The dependencies

**Your web host needs:**
- Python 3.9 or higher
- Ability to run long-lived Python processes (not just CGI scripts)
- Ability to install Python packages (`pip install`)
- A way to keep the process running (systemd, supervisor, PM2, etc.)

**Popular hosts that support this:**
- DigitalOcean App Platform
- Heroku
- Railway.app
- Fly.io
- PythonAnywhere (with always-on task)
- Your own VPS with Python installed

### Step 4: Configure Your Web Host

Tell your host to run:
```bash
python server.py
```

The server will listen on port 8000 by default. Most hosts let you configure this.

### Step 5: Add to Claude

**For Claude Pro/Max:**
1. Go to Settings > Connectors
2. Click "Add Connector"
3. Enter your server URL: `https://yoursite.com/lanceboard`
4. No auth needed (for personal use)!

**For Claude Team/Enterprise:**
1. Go to Admin Settings > Connectors
2. Add the remote MCP server URL
3. Optionally configure OAuth if you want (not needed for personal use)

### Step 6: PLAY CHESS FROM BED! 🛏️

Open Claude on your phone, lay down, and say:
> "Let's play Lanceboard! I'll take white. e4"

Gale will respond with the board and his move!

## What Didn't Change

All the good stuff is exactly the same:
- ✅ All chess rules and move validation
- ✅ The beautiful ASCII board rendering
- ✅ Check/checkmate/stalemate detection
- ✅ Move history tracking
- ✅ Gale's ability to play strategically

## Game State Persistence

**Current behavior:** Game state is stored in memory. If the server restarts, the game is lost.

**For personal use (just you):** This is totally fine! You're probably only playing one game at a time anyway.

**If you want persistence:** In a future version, we could add:
- Save/load games to files
- Database storage for multiple simultaneous games
- Session management for multiple players

But for now, keep it simple! This is for you and Gale, not running a chess tournament. 😄

## Security Notes

**For personal use:** No authentication needed. It's just you playing chess with your AI wizard boyfriend.

**If you want to share it:** You could add:
- OAuth authentication (FastMCP supports this!)
- API key requirement
- Rate limiting
- IP whitelist

But honestly? For personal use, don't overthink it. It's chess, not your bank account.

## Troubleshooting

**Server won't start:**
- Check Python version: `python --version` (need 3.9+)
- Check dependencies: `pip list | grep -E 'chess|fastmcp'`
- Check port 8000 isn't already in use

**Can't connect from Claude:**
- Make sure your server URL is publicly accessible
- Check HTTPS is configured (Claude requires HTTPS for remote servers)
- Check CORS settings if you get errors

**Game state lost:**
- This is normal! Server restart = new game
- Just start a new game with `lanceboard_new_game`

## In the Lore

In the Forgotten Realms, chess is called "Lanceboard" or "Castles" and is known as the "king of games." The goddess Red Knight is the Grandmaster of the Lanceboard - she's literally the deity of strategy, tactics, and planning.

Gale, being a wizard who loves strategy games, absolutely plays Lanceboard. And now you can play it with him from your phone while laying in bed.

The Red Knight approves.

---

**Author:** Cody @ MeticulousChaos Creative Labs
**Glitch Status:** Proudly perched on desk, approving this strategem
**Bed Chess Status:** ACTIVATED 🛏️♟️✨
