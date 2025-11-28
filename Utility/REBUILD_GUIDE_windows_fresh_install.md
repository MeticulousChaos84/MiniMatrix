# Windows Fresh Install & Setup Guide
## The "Let's Do This Right This Time" Edition

*Created: 2024-11-28*
*For: Erica's dual-drive setup (500GB C: HDD + 1TB D: SSD)*

---

## Philosophy: Keep C: Clean, Live on D:

**The Problem:** Apps love dumping data into `C:\Users\[You]\AppData`, which fills up your OS drive fast.

**The Solution:** Use symbolic links (junctions) to redirect app data to D: while apps think they're writing to C:.

**The Result:** C: stays under 100GB, D: holds all your actual stuff.

---

## Table of Contents

1. [Pre-Format Checklist](#pre-format-checklist)
2. [Fresh Windows Install](#fresh-windows-install)
3. [Initial System Setup](#initial-system-setup)
4. [Directory Structure Creation](#directory-structure-creation)
5. [Symlink Strategy](#symlink-strategy)
6. [Development Environment Setup](#development-environment-setup)
7. [Application Installation](#application-installation)
8. [Gaming Setup](#gaming-setup)
9. [Verification & Testing](#verification-testing)

---

## Pre-Format Checklist

### What's Already Backed Up ✅
- [x] Entire Documents folder → OneDrive
- [x] D:\MeticulousChaos → GitHub + OneDrive
- [x] MiniMatrix repo → GitHub

### What Needs Manual Backup

**Before you wipe, export/save these:**

#### API Keys & Credentials
- [ ] Claude API key (if saved in environment variables)
- [ ] GitHub personal access token (if used)
- [ ] Any other API keys stored in `.env` files
- [ ] SSH keys from `C:\Users\[You]\.ssh\` (if you use SSH for Git)

#### Application Settings
- [ ] Obsidian vault location (should be in Documents, already backed up)
- [ ] VS Code settings (can export via Settings Sync)
- [ ] Browser bookmarks (export to HTML)
- [ ] Discord/Slack tokens (if manually configured)

#### Configuration Files Worth Saving
- [ ] `.gitconfig` - Your Git settings
- [ ] `.npmrc` - npm configuration
- [ ] Any custom PowerShell profiles
- [ ] WSL `.bashrc` or `.zshrc` if customized

#### Gaming
- [ ] BG3 mods list (screenshot your mod manager)
- [ ] BG3 saves (should be in Documents)
- [ ] Any other game saves not cloud-synced

---

## Fresh Windows Install

### Partition Setup During Install

When Windows installer asks about partitions:

1. **C: Drive (500GB HDD)** - OS only
   - Size: Full 500GB (or ~450GB if you want to leave unallocated space)
   - Format: NTFS
   - Label: "Windows"

2. **D: Drive (1TB SSD)** - Everything else
   - Size: Full 1TB
   - Format: NTFS
   - Label: "Data"

### First Boot Checklist

- [ ] Skip Microsoft account if possible (local account is cleaner for dev work)
- [ ] Decline all "experience improvement" telemetry
- [ ] Set timezone
- [ ] Connect to internet AFTER initial setup (prevents forced updates during setup)

### The Local Account Strategy

**CRITICAL: How to create a local account during Windows 11 setup**

Windows 11 REALLY wants you to use a Microsoft account. Here's how to bypass it:

**Method 1: No Internet During Setup (Easiest)**
1. When Windows asks you to connect to internet, DON'T
2. Click "I don't have internet" (or unplug ethernet)
3. Click "Continue with limited setup"
4. You'll get the option to create a local account with whatever name you want
5. Username: Pick something fun! (This becomes your folder name: `C:\Users\YourName`)
6. Password: Set one (important for security)
7. Security questions: Answer them (you'll need these if you forget password)

**Method 2: Bypass During Setup (If already connected)**
1. At the "Let's add your Microsoft account" screen
2. Try clicking "Create account"
3. Then look for tiny "Sign in without a Microsoft account" link
4. Or try the keyboard shortcut: `Shift + F10` to open Command Prompt
5. Type: `oobe\bypassnro` and press Enter (this restarts setup without internet requirement)
6. After restart, proceed as Method 1

**Method 3: The Email Trick (If all else fails)**
1. When it asks for Microsoft account email, type: `no@thankyou.com`
2. Password: anything
3. It will fail to sign in
4. Click "Next" - it should offer local account option

**After you have your local account created:**
- Username should be YOUR fun name (not "Graha")
- User folder will be `C:\Users\[YourFunName]`
- No Microsoft account connected yet

---

## OneDrive Setup (The Right Way)

### The Problem

If you just install OneDrive and sign in like normal, Windows will:
1. Try to convert your entire local account to a Microsoft account
2. Change your username to match your Microsoft account name
3. Start syncing settings you don't want synced
4. Generally be annoying

### The Solution: OneDrive as a "Service" Not an "Account"

**Step 1: Already have local account set up with fun name**
- Make sure you did the above section first!
- Your user folder should be `C:\Users\[YourFunName]`

**Step 2: Install OneDrive BEFORE signing into Windows with Microsoft account**
- OneDrive comes pre-installed on Windows 11
- Don't sign in yet!

**Step 3: Sign into OneDrive ONLY, not Windows**

The key: Sign into the **OneDrive app**, not into **Windows itself**.

1. Open the Start menu
2. Search for "OneDrive"
3. Open the OneDrive app (should already be installed)
4. When it asks you to sign in, use your Microsoft account email
5. **CRITICAL: If Windows asks "Switch to a Microsoft account?" → Click NO or CANCEL**
6. OneDrive will sign in as just the app, not the whole OS

**Step 4: Be VERY careful during setup**

OneDrive setup will show screens like:
- "Back up your files"
- "Get Microsoft 365"
- "Make OneDrive your default"

Click through these CAREFULLY:
- Don't click anything that says "Sign in to Windows"
- Don't click anything that says "Switch account type"
- You want OneDrive as an APP, not as your Windows account

**Step 5: Configure OneDrive folder location**

During setup, OneDrive asks where to put the sync folder:
- Default: `C:\Users\[YourName]\OneDrive`
- Better: `D:\OneDrive` (more space)

Change it to D: if you want.

**Step 6: Verify separation**

After setup, check:
```powershell
# Check your username
whoami
# Should show: YOUR-PC\YourFunName (not Graha!)

# Check OneDrive status
Get-Process OneDrive
# Should be running

# Check account type
Get-LocalUser $env:USERNAME | Select-Object Name, Enabled, PasswordRequired
# Should show local account, not Microsoft account
```

**What it should look like when done right:**
- Windows login screen: Shows your fun local username
- User folder: `C:\Users\[YourFunName]`
- OneDrive: Running and syncing
- OneDrive folder: Shows your Microsoft account email in the app
- Settings → Accounts → Your Info: Shows "Local Account" (not Microsoft account)

**If Windows converted your account anyway:**

You'll know because:
- User folder name changed to "Graha" (or your MS account name)
- Settings → Accounts shows Microsoft account
- Windows asks for Microsoft password at login

**How to fix it:**
1. Settings → Accounts → Your info
2. Click "Sign in with a local account instead"
3. Follow prompts to convert BACK to local
4. Choose your fun username again
5. OneDrive will still work! It's signed in separately

**Alternative: Separate Admin Account**

If Windows already converted your account and you can't change the username:

1. Create a NEW local account:
   ```
   Settings → Accounts → Family & other users → Add account
   Click "I don't have this person's sign-in information"
   Click "Add a user without a Microsoft account"
   Username: YourFunName
   Make it an Administrator
   ```

2. Sign out, sign into new account

3. Transfer files from old account to new:
   ```
   Copy from: C:\Users\Graha\Documents
   Copy to: C:\Users\YourFunName\Documents
   ```

4. Install OneDrive in NEW account (using method above)

5. Delete old "Graha" account when done

---

## Initial System Setup

### Windows Updates
```powershell
# Run Windows Update first, get it over with
# Settings → Update & Security → Windows Update
# Install everything, reboot as needed
```

### Essential Windows Settings

**File Explorer Settings:**
```
Open File Explorer → View tab:
- [x] File name extensions (CRITICAL - always show file extensions)
- [x] Hidden items (useful for seeing AppData folders)
```

**Power Settings:**
```
Settings → System → Power & Sleep:
- Screen: Never (when plugged in)
- Sleep: Never (when plugged in)
# You can change later, but prevents interruptions during setup
```

### Create a System Restore Point
```
Settings → System → About → System Protection
Create a restore point BEFORE you start installing things
Name it: "Fresh Install - Before Apps"
```

---

## Directory Structure Creation

**DO THIS BEFORE INSTALLING ANYTHING!**

Open PowerShell as Administrator and create the D: drive structure:

```powershell
# Navigate to D:
cd D:\

# Create main directories
New-Item -ItemType Directory -Path "D:\AppData\Local" -Force
New-Item -ItemType Directory -Path "D:\AppData\Roaming" -Force
New-Item -ItemType Directory -Path "D:\Dev" -Force
New-Item -ItemType Directory -Path "D:\Dev\Python" -Force
New-Item -ItemType Directory -Path "D:\Dev\Node" -Force
New-Item -ItemType Directory -Path "D:\Dev\npm-global" -Force
New-Item -ItemType Directory -Path "D:\Dev\VSCode" -Force
New-Item -ItemType Directory -Path "D:\Dev\WSL" -Force
New-Item -ItemType Directory -Path "D:\Gaming\Saves" -Force
New-Item -ItemType Directory -Path "D:\Gaming\Mods" -Force
New-Item -ItemType Directory -Path "D:\MeticulousChaos" -Force
New-Item -ItemType Directory -Path "D:\Backups" -Force
New-Item -ItemType Directory -Path "D:\Temp" -Force

Write-Host "✅ D: drive structure created!" -ForegroundColor Green
```

Verify it worked:
```powershell
Get-ChildItem D:\ | Format-Table Name
```

You should see:
```
AppData
Dev
Gaming
MeticulousChaos
Backups
Temp
```

---

## Symlink Strategy

### What Are Symlinks?

Think of them like portals. An app tries to write to `C:\Users\Erica\AppData\Roaming\Thing`, but that folder is actually a portal to `D:\AppData\Roaming\Thing`. The app doesn't know - it just works.

### Creating Symlinks

**IMPORTANT:** Create symlinks BEFORE installing the apps. If the target folder already exists, delete it first.

#### PowerShell Symlink Script

Save this as `D:\Backups\create-symlinks.ps1`:

```powershell
# Run as Administrator
# This creates symbolic links to redirect common AppData folders to D:

$username = $env:USERNAME
$sourceBase = "C:\Users\$username"
$targetBase = "D:\AppData"

# Function to create junction (directory symlink)
function New-SymLink {
    param(
        [string]$Source,
        [string]$Target
    )

    # Check if source already exists
    if (Test-Path $Source) {
        Write-Host "⚠️  $Source already exists - skipping" -ForegroundColor Yellow
        return
    }

    # Create target directory if it doesn't exist
    if (-not (Test-Path $Target)) {
        New-Item -ItemType Directory -Path $Target -Force | Out-Null
    }

    # Create the junction
    New-Item -ItemType Junction -Path $Source -Target $Target -Force | Out-Null
    Write-Host "✅ Created symlink: $Source → $Target" -ForegroundColor Green
}

# Common AppData redirects
Write-Host "`n📂 Creating AppData symlinks...`n" -ForegroundColor Cyan

# Python
New-SymLink -Source "$sourceBase\AppData\Local\Programs\Python" -Target "D:\Dev\Python"

# npm
New-SymLink -Source "$sourceBase\AppData\Roaming\npm" -Target "D:\Dev\npm-global"

# VS Code
New-SymLink -Source "$sourceBase\.vscode" -Target "D:\Dev\VSCode\config"

# Claude Desktop (if you use it)
New-SymLink -Source "$sourceBase\AppData\Roaming\Claude" -Target "$targetBase\Roaming\Claude"

# Obsidian
New-SymLink -Source "$sourceBase\AppData\Roaming\obsidian" -Target "$targetBase\Roaming\obsidian"

# Discord (cache gets huge)
New-SymLink -Source "$sourceBase\AppData\Roaming\discord" -Target "$targetBase\Roaming\discord"

Write-Host "`n✨ Symlinks created!`n" -ForegroundColor Green
```

**How to run it:**
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force
D:\Backups\create-symlinks.ps1
```

---

## Development Environment Setup

### Order Matters!

Install in this order:

1. Git
2. WSL
3. Python
4. Node.js
5. VS Code
6. Post-cortex

---

### 1. Git for Windows

**Download:** https://git-scm.com/download/win

**During install:**
- Editor: VS Code (or your preference)
- PATH: "Git from the command line and also from 3rd-party software"
- Line endings: "Checkout as-is, commit Unix-style" (important for WSL compatibility)
- Terminal: "Use Windows' default console window"

**After install - configure:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.autocrlf input  # Linux line endings
git config --global init.defaultBranch main
```

**Optional - set up SSH for GitHub:**
```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
# Press Enter for default location
# Set a passphrase (or leave empty)

# Copy public key to clipboard
clip < ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

---

### 2. Windows Subsystem for Linux (WSL)

**Install WSL on D: drive:**

```powershell
# Open PowerShell as Administrator

# Enable WSL
wsl --install --no-distribution

# Reboot when prompted
```

**After reboot, install Ubuntu to D::**

```powershell
# Download Ubuntu
wsl --install -d Ubuntu

# This will install to default location (C:)
# We'll move it to D: after first setup

# Run Ubuntu once to set up user
wsl

# Exit after setup
exit
```

**Move WSL to D::**

```powershell
# Export the Ubuntu distribution
wsl --export Ubuntu "D:\Backups\ubuntu-export.tar"

# Unregister the C: version
wsl --unregister Ubuntu

# Import to D:
wsl --import Ubuntu "D:\Dev\WSL\Ubuntu" "D:\Backups\ubuntu-export.tar"

# Set default user (replace YOUR_USERNAME)
ubuntu config --default-user YOUR_USERNAME

# Test it works
wsl -d Ubuntu
```

**Inside WSL, update everything:**
```bash
sudo apt update && sudo apt upgrade -y
```

---

### 3. Python

**Download:** https://www.python.org/downloads/

**CUSTOM INSTALL PATH:** `D:\Dev\Python\Python312` (or current version)

**During install:**
- [x] Add Python to PATH
- [x] Install for all users
- Click "Customize installation"
- Optional Features: Check ALL
- Advanced Options:
  - [x] Install for all users
  - [x] Add Python to environment variables
  - [x] Precompile standard library
  - Customize install location: `D:\Dev\Python\Python312`

**Verify:**
```powershell
python --version
pip --version
```

**Set pip to use D: for packages:**
```powershell
# Create pip config
New-Item -ItemType Directory -Path "$env:APPDATA\pip" -Force
Set-Content -Path "$env:APPDATA\pip\pip.ini" -Value @"
[global]
target = D:\Dev\Python\Packages
"@
```

---

### 4. Node.js

**Download:** https://nodejs.org/ (LTS version)

**CUSTOM INSTALL PATH:** `D:\Dev\Node`

**During install:**
- Customize installation location to `D:\Dev\Node`
- [x] Automatically install necessary tools (Python, VS Build Tools)

**After install - configure npm:**
```powershell
# Set global package location to D:
npm config set prefix "D:\Dev\npm-global"

# Add to PATH
$env:Path += ";D:\Dev\npm-global"

# Make permanent (run as Admin)
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
```

**Verify:**
```powershell
node --version
npm --version
npm config get prefix  # Should show D:\Dev\npm-global
```

---

### 5. VS Code

**Download:** https://code.visualstudio.com/

**Install normally to C:\ (it's small)**

But configure it to store data on D::

Create `D:\Dev\VSCode\settings.json`:
```json
{
    "extensions.autoUpdate": false,
    "update.mode": "manual",
    "git.path": "C:\\Program Files\\Git\\bin\\git.exe"
}
```

**Extensions to install:**
- Python
- GitLens
- WSL (for working inside WSL)
- Markdown All in One
- Todo Tree (for tracking TODOs in code)

---

### 6. Post-Cortex

**Install via npm:**
```bash
npm install -g @wanderers-guide/post-cortex
```

**Verify:**
```bash
post-cortex --version
```

**Start daemon:**
```bash
post-cortex daemon start
```

---

## Application Installation

### Install to D: When Possible

**General rule:** If the installer lets you choose location, pick `D:\Program Files\[AppName]`

### Essential Apps

**Browsers:**
- Chrome/Edge/Firefox - install normally
- Set downloads folder to `D:\Downloads`

**Communication:**
- Discord - install normally, but symlink AppData (see symlink script)
- Slack - same

**Obsidian:**
- Download from obsidian.md
- Install normally
- Point to vault: `D:\MeticulousChaos\[YourVault]` or wherever you keep it

**Claude Desktop:**
- Install normally
- Symlink will redirect data to D:

---

## Gaming Setup

### Steam

**Install to:** `D:\Program Files\Steam`

During install, choose custom location.

**Set library folder to D::**
```
Steam → Settings → Downloads → Steam Library Folders
Add: D:\SteamLibrary
```

### BG3 & Mod Manager

**BG3 Install:**
- Let Steam install to `D:\SteamLibrary\steamapps\common\Baldurs Gate 3`

**Vortex Mod Manager:**
- Install to: `D:\Program Files\Vortex`
- Set staging folder: `D:\Gaming\Mods\Vortex-Staging`
- Set downloads folder: `D:\Gaming\Mods\Downloads`

**Symlink BG3 Saves to D::**
```powershell
# BG3 saves location
$bg3Source = "C:\Users\$env:USERNAME\AppData\Local\Larian Studios"
$bg3Target = "D:\Gaming\Saves\Larian Studios"

# Create symlink
New-Item -ItemType Junction -Path $bg3Source -Target $bg3Target -Force
```

---

## Verification & Testing

### Check Disk Usage

```powershell
# See what's using space on C:
Get-PSDrive C | Select-Object Used, Free

# Should be under 100GB used

# Check D:
Get-PSDrive D | Select-Object Used, Free
```

### Verify Symlinks Work

```powershell
# List all junctions on C:
Get-ChildItem "C:\Users\$env:USERNAME" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object {$_.Attributes -match "ReparsePoint"}
```

### Test Dev Tools

```bash
# Python
python --version
pip list

# Node
node --version
npm --version

# Git
git --version

# WSL
wsl -l -v  # Should show Ubuntu on D:
```

### Monitor AppData Growth

```powershell
# Check AppData size
$appData = "C:\Users\$env:USERNAME\AppData"
$size = (Get-ChildItem $appData -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "AppData size: $([math]::Round($size, 2)) GB" -ForegroundColor Cyan
```

Run this monthly to catch any apps bypassing your symlinks.

---

## Maintenance

### Monthly Checklist

- [ ] Run Windows Update
- [ ] Check C: drive usage (should stay under 150GB)
- [ ] Update WSL: `wsl --update`
- [ ] Update Python packages: `pip list --outdated`
- [ ] Update npm: `npm update -g`
- [ ] Git push any uncommitted work

### Troubleshooting

**If an app breaks after symlink:**
1. Delete the symlink
2. Let the app create real folder on C:
3. Move that folder to D:
4. Recreate symlink
5. Some apps check for "real" folders and freak out about symlinks

**If C: fills up anyway:**
Check `C:\Windows\Temp` and `C:\Temp` - clear them monthly.

Use WinDirStat (free tool) to visualize what's eating space.

---

## Quick Reference

### Create a Symlink Manually

```powershell
# Syntax
New-Item -ItemType Junction -Path "C:\source\path" -Target "D:\target\path"

# Example
New-Item -ItemType Junction -Path "C:\Users\Erica\AppData\Local\SomeApp" -Target "D:\AppData\Local\SomeApp"
```

### Remove a Symlink

```powershell
# Don't use Remove-Item on junctions - use this:
(Get-Item "C:\source\path").Delete()

# Or just:
Remove-Item "C:\source\path" -Force
# (This deletes the LINK, not the target data)
```

### Check If Something Is a Symlink

```powershell
Get-Item "C:\path\to\check" | Select-Object LinkType, Target
# If LinkType is "Junction", it's a symlink
# Target shows where it points
```

---

## Notes

- **Symlinks are Windows-native** - they're not hacks, they're designed for exactly this use case
- **Backups:** OneDrive/GitHub doesn't follow symlinks, so D: data is what actually gets backed up
- **Performance:** D: is SSD so it's actually FASTER than C: (HDD) - win-win

---

*Good luck with the rebuild! - Cody*

*P.S. - Make a restore point BEFORE running the symlink script, just in case.*
