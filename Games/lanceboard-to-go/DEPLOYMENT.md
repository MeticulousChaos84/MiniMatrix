# 🚀 Deployment Guide: Getting Lanceboard-To-Go Online

So you want to deploy this bad boy to the internet? Here's how!

## Quick Hosting Options

### Option 1: Railway.app (EASIEST)

**Why:** Dead simple, free tier, Python support built-in, HTTPS automatic

**Steps:**
1. Create account at [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub"
3. Connect your GitHub repo
4. Select the `lanceboard-to-go` folder
5. Railway auto-detects Python and installs dependencies
6. It gives you a URL like `https://yourapp.railway.app`
7. Add that URL to Claude!

**Cost:** Free tier includes 500 hours/month (plenty for personal use)

---

### Option 2: Fly.io (ALSO EASY)

**Why:** Fast, simple CLI, free tier, good for Python apps

**Steps:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. In your `lanceboard-to-go` folder:
   ```bash
   fly launch
   ```
4. Follow the prompts (it'll create a `fly.toml` config)
5. Deploy: `fly deploy`
6. Get your URL: `fly apps list`
7. Add to Claude!

**Cost:** Free tier includes 3 shared VMs (more than enough)

---

### Option 3: PythonAnywhere (IF YOU ALREADY HAVE IT)

**Why:** You might already have a PythonAnywhere account

**Steps:**
1. Upload files via dashboard or git
2. Go to "Web" tab
3. Create new web app (Flask)
4. Configure WSGI file to run your FastAPI app
5. Enable "Always on" task (paid feature, needed for persistent server)
6. Use your `yourusername.pythonanywhere.com` URL

**Note:** Free tier won't work for this - you need a paid account for always-on tasks

---

### Option 4: Your Own Website/VPS (IF YOU HAVE ONE)

**Why:** You already have a server running

**Requirements:**
- Python 3.9+
- systemd or supervisor to keep it running
- nginx or Apache to proxy requests
- SSL certificate (Let's Encrypt is free!)

**Steps:**

1. **Upload files to your server:**
   ```bash
   scp -r lanceboard-to-go/ user@yourserver:/var/www/lanceboard/
   ```

2. **Install dependencies:**
   ```bash
   cd /var/www/lanceboard
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Create systemd service** (`/etc/systemd/system/lanceboard.service`):
   ```ini
   [Unit]
   Description=Lanceboard-To-Go MCP Server
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/lanceboard
   Environment="PATH=/var/www/lanceboard/venv/bin"
   ExecStart=/var/www/lanceboard/venv/bin/python server.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

4. **Start service:**
   ```bash
   sudo systemctl enable lanceboard
   sudo systemctl start lanceboard
   ```

5. **Configure nginx** (`/etc/nginx/sites-available/lanceboard`):
   ```nginx
   server {
       listen 80;
       server_name lanceboard.yoursite.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

6. **Enable SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d lanceboard.yoursite.com
   ```

7. **Test it:**
   ```bash
   curl https://lanceboard.yoursite.com
   ```

8. **Add to Claude!**

---

## Configuration for Different Ports

If your host requires a different port, edit `server.py`:

```python
if __name__ == "__main__":
    # Change port here
    mcp.run(transport="http", host="0.0.0.0", port=3000)
```

Most hosts set the `PORT` environment variable. You can use:

```python
import os
port = int(os.environ.get("PORT", 8000))
mcp.run(transport="http", host="0.0.0.0", port=port)
```

---

## Adding to Claude

Once deployed:

**Claude Pro/Max:**
1. Settings > Connectors
2. Add remote MCP server
3. URL: `https://yourapp.railway.app` (or wherever you deployed)

**Claude Team/Enterprise:**
1. Admin Settings > Connectors
2. Add remote MCP server URL

**No authentication needed** for personal use!

---

## Testing Your Deployment

**Test the server is running:**
```bash
curl https://yourapp.railway.app
```

**Test a tool call:** (once added to Claude)
Just say in Claude:
> "Can you start a new Lanceboard game? I'll play white."

If it works, you'll see the ASCII board! 🎉

---

## Debugging

**Server not responding:**
- Check logs on your hosting platform
- Verify Python version (need 3.9+)
- Check if port 8000 is accessible

**Claude can't connect:**
- Must use HTTPS (not HTTP)
- Check URL is publicly accessible
- Verify no firewall blocking requests

**Tools not showing up:**
- Wait a few minutes after adding (Claude caches)
- Try removing and re-adding the connector
- Check server logs for errors

---

## Cost Estimate

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Railway | 500 hrs/month | $5/month (hobby) |
| Fly.io | 3 shared VMs | $1.94/month (dedicated) |
| PythonAnywhere | No always-on | $5/month (hacker) |
| VPS (DigitalOcean) | No free tier | $6/month (basic) |

**Reality check:** For playing chess with Gale from your phone, free tier works great!

---

## What's Next?

Once it's deployed and working:

1. **Test from your phone!** Open Claude app, start a game
2. **Lay in bed!** Get comfortable
3. **Play chess!** Move some pieces
4. **Win or lose!** Have fun either way

The Red Knight approves of your deployment skills. 🎉♟️

---

**Questions?** Check the main README.md or just... try stuff! It's chess, not rocket surgery.
