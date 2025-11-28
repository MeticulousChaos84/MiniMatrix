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

### Taming Windows Defender (The RAM Eater)

**The Problem:** Defender sees dev servers, Python scripts, WSL processes, and loses its mind. Suddenly it's using 4GB+ of RAM "protecting" you from... yourself.

**The Solutions (from gentle to nuclear):**

#### Option 1: Add Exclusions (Recommended for Dev Work)

Tell Defender to ignore your dev directories:

```powershell
# Run PowerShell as Administrator

# Exclude your dev directories
Add-MpPreference -ExclusionPath "D:\Dev"
Add-MpPreference -ExclusionPath "D:\MeticulousChaos"
Add-MpPreference -ExclusionPath "C:\Users\$env:USERNAME\AppData\Local\Programs\Python"
Add-MpPreference -ExclusionPath "D:\Dev\WSL"

# Exclude common dev executables
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm.exe"
Add-MpPreference -ExclusionProcess "code.exe"

# Verify exclusions
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
Get-MpPreference | Select-Object -ExpandProperty ExclusionProcess
```

This lets Defender keep running but tells it "these folders? Not threats. Chill."

#### Option 2: Disable Real-Time Protection (Temporary)

For when you're actively coding and Defender is being insufferable:

```
Settings → Privacy & Security → Windows Security → Virus & threat protection
→ Manage settings → Real-time protection: OFF
```

**Note:** This will turn itself back ON after a reboot or after a few hours. Windows REALLY doesn't want this off.

#### Option 3: Disable Permanently via Group Policy (More Permanent)

**Only do this if you know what you're doing and accept the security implications.**

1. Press `Win + R`, type `gpedit.msc`, press Enter
2. Navigate to:
   ```
   Computer Configuration
   → Administrative Templates
   → Windows Components
   → Microsoft Defender Antivirus
   → Real-time Protection
   ```
3. Double-click "Turn off real-time protection"
4. Select "Enabled" (yes, "Enabled" to turn it OFF - Microsoft logic)
5. Click OK
6. Reboot

#### Option 4: The Nuclear Option (Completely Disable Defender)

**WARNING:** This disables Defender entirely. Only do this if:
- You're running local dev work, not handling sensitive data
- You're behind a router/firewall
- You're not downloading random executables
- You know what you're clicking on

Create a file: `D:\Backups\disable-defender.ps1`

```powershell
# Run as Administrator
# This COMPLETELY disables Windows Defender

# Disable real-time monitoring
Set-MpPreference -DisableRealtimeMonitoring $true

# Disable behavior monitoring
Set-MpPreference -DisableBehaviorMonitoring $true

# Disable on-access protection
Set-MpPreference -DisableOnAccessProtection $true

# Disable scanning network files
Set-MpPreference -DisableScanningNetworkFiles $true

# Disable scanning mapped drives
Set-MpPreference -DisableScanningMappedNetworkDrivesForFullScan $true

# Disable script scanning
Set-MpPreference -DisableScriptScanning $true

# Disable archive scanning
Set-MpPreference -DisableArchiveScanning $true

# Disable automatic sample submission
Set-MpPreference -SubmitSamplesConsent 2  # 2 = Never send

# Disable cloud protection
Set-MpPreference -MAPSReporting 0  # 0 = Disabled

Write-Host "✅ Windows Defender has been put to sleep" -ForegroundColor Green
Write-Host "⚠️  You are now responsible for your own security" -ForegroundColor Yellow
```

Run it:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
D:\Backups\disable-defender.ps1
```

#### Option 5: Disable Defender Service (Most Nuclear)

**EXTREME WARNING:** This completely stops the Defender service. Only for advanced users.

```powershell
# Run as Administrator

# Stop the service
Stop-Service WinDefend -Force

# Disable the service permanently
Set-Service WinDefend -StartupType Disabled

# Verify
Get-Service WinDefend
```

**To re-enable if needed:**
```powershell
Set-Service WinDefend -StartupType Automatic
Start-Service WinDefend
```

#### Option 6: Use Windows Security Settings GUI

For less scary manual control:

```
Settings → Privacy & Security → Windows Security → Virus & threat protection

Turn OFF:
- Cloud-delivered protection
- Automatic sample submission
- Tamper Protection (must be OFF before you can disable other things)

Under "Exclusions":
- Add your D:\Dev folder
- Add your D:\MeticulousChaos folder
- Add any game mod directories
```

#### Recommended Setup for Dev Work

My suggestion for balance between security and sanity:

1. **Keep Defender running** (for basic protection from actual malware)
2. **Add exclusions** for all your dev directories
3. **Disable cloud protection** (stops uploading your code to Microsoft)
4. **Disable automatic sample submission** (stops uploading files)
5. **Turn off scheduled scans** during work hours

```powershell
# The balanced approach
Add-MpPreference -ExclusionPath "D:\Dev"
Add-MpPreference -ExclusionPath "D:\MeticulousChaos"
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "node.exe"
Set-MpPreference -SubmitSamplesConsent 2
Set-MpPreference -MAPSReporting 0
```

This way Defender still protects against actual threats but leaves your dev work alone.

### Alternative: Use a Third-Party Antivirus

If you install something like:
- Avast Free
- Bitdefender Free
- Kaspersky Free

Windows Defender automatically disables itself. Most third-party AVs are less aggressive with dev tools.

---

## Performance Tweaks & Optimization

### Your Hardware Specs

For reference (your current build):
- CPU: Intel i7-11700 (11th gen, 8 cores, 2.50 GHz base)
- RAM: 16GB
- GPU 1: Intel UHD 750 (integrated on CPU)
- GPU 2: NVIDIA GeForce GTX 1650 Super (discrete)
- Storage: 500GB HDD (C:) + 1TB SSD (D:)
- OS: Windows 11 Home
- Monitors: Dual monitor setup

### 1. Paging File (Virtual Memory) Setup

**What it is:** When RAM gets full, Windows swaps data to disk. The "page file" is that swap space.

**The problem:** By default, Windows puts it on C: and sizes it dynamically, which fragments your HDD.

**The solution:** Put it on D: (SSD = faster) with a fixed size.

**How to configure:**

1. Press `Win + Pause` (or right-click This PC → Properties)
2. Click "Advanced system settings"
3. Under Performance, click "Settings"
4. Go to "Advanced" tab
5. Under Virtual Memory, click "Change"

**Current setup will show:**
- C: drive with "System managed size" (BAD)

**Change it to:**

```
[✓] Automatically manage paging file size for all drives (UNCHECK THIS)

C: drive
  ( ) System managed size
  (•) No paging file            ← Select this
  [Set]

D: drive
  ( ) System managed size
  (•) Custom size:              ← Select this
      Initial size (MB): 4096   ← 4GB (quarter of your RAM)
      Maximum size (MB): 8192   ← 8GB (half of your RAM)
  [Set]
```

**Why these numbers:**
- With 16GB RAM, you rarely need page file
- 4-8GB is plenty for edge cases
- Fixed size prevents fragmentation
- SSD makes it much faster when needed

**Alternative - Disable Entirely:**
If you have 16GB+ and don't run VMs:
```
C: → No paging file
D: → No paging file
```

This frees up 4-8GB of disk space. Windows will warn you - ignore it. Modern systems with 16GB+ don't need page files for normal use.

**After changing:**
- Click "Set" for each drive
- Click "OK" on all dialogs
- Reboot (required for changes to take effect)

---

### 2. Dual GPU Setup (Intel + NVIDIA)

**The problem:** Windows might use the weak Intel GPU for things that should use the NVIDIA card.

**The goal:** Intel for desktop/2D, NVIDIA for games/AI/heavy lifting.

#### Configure NVIDIA Control Panel

**Step 1: Set Global Default to NVIDIA**

1. Right-click Desktop → "NVIDIA Control Panel"
2. Navigate: "Manage 3D Settings" → "Global Settings" tab
3. "Preferred graphics processor" → Select "High-performance NVIDIA processor"
4. Click "Apply"

**Step 2: Set Per-Application Preferences**

Still in NVIDIA Control Panel:
1. "Program Settings" tab
2. Click "Add" and select applications:
   - Python.exe → High-performance NVIDIA
   - Code.exe (VS Code) → High-performance NVIDIA
   - Any games → High-performance NVIDIA
   - Chrome/Firefox → Integrated graphics (saves power)

**Step 3: Windows Graphics Settings**

Windows 11 has its own GPU preference system:

```
Settings → System → Display → Graphics
```

Click "Browse" and add:
- `D:\Dev\Python\python.exe` → High performance
- VS Code → High performance
- Games → High performance
- Browsers → Power saving

#### Monitor Configuration

With dual monitors + dual GPUs:

**Recommended setup:**
1. Plug BOTH monitors into the NVIDIA card (not motherboard)
2. This lets NVIDIA handle all display output
3. Intel GPU goes idle, saving power

**Check current setup:**
```powershell
# List display adapters
Get-WmiObject Win32_VideoController | Select-Object Name, Status, DriverVersion
```

Should show both Intel UHD 750 and GTX 1650 Super.

#### Update NVIDIA Drivers

**During fresh install:**
1. Go to https://www.nvidia.com/download/index.aspx
2. Select:
   - Product: GeForce GTX 16 Series
   - Series: GeForce GTX 16 Series
   - Product: GeForce GTX 1650 SUPER
   - OS: Windows 11
   - Download Type: Game Ready Driver (or Studio Driver for creative work)
3. Install
4. Choose "Custom" installation
5. Check "Perform clean installation"
6. Uncheck "GeForce Experience" (bloatware, eats resources)

**Keep drivers updated:**
- Check monthly for new drivers
- Or use Windows Update (usually 1-2 months behind)

---

### 3. Ollama Setup (Local AI Models on D:)

**What it is:** Ollama runs local LLMs (like ChatGPT, but on your machine, private, free).

**Why you want it:** Local AI for coding help, writing, reasoning - no API costs, all private.

**Your hardware can handle:** Models up to ~7-8B parameters (with 16GB RAM).

#### Install Ollama to D:

**Download:** https://ollama.com/download

During install:
- Default location: `C:\Users\[You]\AppData\Local\Programs\Ollama`
- Change to: `D:\Dev\Ollama`

**Or install via command line:**

```powershell
# Download installer
Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile "D:\Downloads\OllamaSetup.exe"

# Run installer
Start-Process "D:\Downloads\OllamaSetup.exe"
```

**Configure Ollama to use D: for models:**

Models can get HUGE (4-8GB each). Store them on D::

```powershell
# Set environment variable for model storage
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "D:\Dev\Ollama\models", "Machine")

# Verify
$env:OLLAMA_MODELS
```

**Verify Ollama is running:**
```powershell
ollama --version
```

#### Recommended Models for Your Hardware

**For thinking/reasoning (best with 16GB RAM):**

```bash
# Qwen 2.5 - 7B (excellent reasoning, 4.7GB)
ollama pull qwen2.5:7b

# Llama 3.2 - 3B (fast, lighter, 2GB)
ollama pull llama3.2:3b

# DeepSeek R1 - 8B (good for coding, 4.9GB)
ollama pull deepseek-r1:8b
```

**For coding specifically:**

```bash
# Qwen Coder - 7B (trained for code)
ollama pull qwen2.5-coder:7b

# CodeLlama - 7B (Meta's code model)
ollama pull codellama:7b
```

**Test it:**
```bash
# Start a chat
ollama run qwen2.5:7b

# Ask it something
>>> Write a Python function to check if a number is prime

# Exit with /bye
```

#### Using Ollama with VS Code

Install the "Continue" extension for VS Code:
1. VS Code → Extensions → Search "Continue"
2. Install "Continue - Codestral, Claude, and more"
3. Configure to use Ollama:
   ```json
   {
     "models": [
       {
         "title": "Qwen 2.5",
         "provider": "ollama",
         "model": "qwen2.5:7b"
       }
     ]
   }
   ```

Now you have local AI code completion!

#### Ollama Service Management

Ollama runs as a background service:

```powershell
# Check if running
Get-Service Ollama

# Stop service
Stop-Service Ollama

# Start service
Start-Service Ollama

# Disable auto-start (save RAM when not using)
Set-Service Ollama -StartupType Manual
```

**Memory usage:** Expect 4-8GB RAM used when a model is loaded. Closes automatically after 5 minutes of inactivity.

---

### 4. Windows Features to Enable

**What these are:** Optional Windows components that aren't enabled by default.

**How to access:**
```
Control Panel → Programs → Turn Windows features on or off
```

Or via PowerShell (faster):

```powershell
# Enable WSL (already covered in main guide, but for completeness)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Enable .NET Framework 3.5 (some older apps need it)
dism.exe /online /enable-feature /featurename:NetFx3 /all

# Enable Hyper-V (if you want to run VMs - WARNING: uses 4GB+ RAM)
# Only enable if you actually use VMs
dism.exe /online /enable-feature /featurename:Microsoft-Hyper-V-All /all

# Enable Windows Sandbox (safe environment for testing sketchy apps)
dism.exe /online /enable-feature /featurename:Containers-DisposableClientVM /all
```

**Recommended for dev work:**
- [x] Windows Subsystem for Linux (WSL)
- [x] Virtual Machine Platform (required for WSL 2)
- [x] .NET Framework 3.5 (legacy compatibility)
- [ ] Hyper-V (only if you run VMs - heavy)
- [x] Windows Sandbox (useful for testing)

**After enabling, reboot.**

---

### 5. Performance Tweaks for Your Specific Hardware

#### Disable Visual Effects (Speed boost on older hardware)

```
Control Panel → System → Advanced system settings
→ Performance → Settings → Visual Effects tab
```

Select "Adjust for best performance" OR custom:
- [ ] Animate windows when minimizing/maximizing (OFF)
- [ ] Animations in the taskbar (OFF)
- [ ] Fade or slide menus into view (OFF)
- [ ] Fade or slide tooltips into view (OFF)
- [x] Show shadows under windows (ON - helps readability)
- [x] Smooth edges of screen fonts (ON - ClearType, critical)
- [ ] Everything else (OFF)

**Or via PowerShell:**
```powershell
# Disable animations
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop\WindowMetrics" -Name MinAnimate -Value 0

# Disable transparency
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name EnableTransparency -Value 0
```

#### Disable Startup Programs

```
Task Manager (Ctrl+Shift+Esc) → Startup tab
```

Disable everything except:
- NVIDIA stuff (if you disabled GeForce Experience, you won't have this)
- Audio drivers
- Maybe OneDrive (if you're using it)

**Disable bloatware:**
- Microsoft Teams (unless you use it)
- Skype
- Spotify web helper
- Steam (set it to NOT start on boot)
- Discord (set it to NOT start on boot)

#### Power Plan Settings

```
Control Panel → Power Options
```

Select "High performance" (shows more settings):
1. Click "Change plan settings"
2. Click "Change advanced power settings"

**Recommended settings:**
```
Hard disk → Turn off hard disk after: Never (on HDD, prevents spin-down lag)
Sleep → Sleep after: Never (or 30 minutes if you want)
USB settings → USB selective suspend: Disabled
PCI Express → Link State Power Management: Off
Processor power management:
  - Minimum processor state: 5% (saves power when idle)
  - Maximum processor state: 100%
  - System cooling policy: Active
Graphics settings:
  - NVIDIA GPU: Maximum Performance
```

#### Disable Background Apps

```
Settings → Privacy → Background apps
```

Turn OFF everything you don't use actively.

**Keep enabled:**
- OneDrive (if using)
- Maybe VS Code (for updates)

**Disable:**
- Mail
- Calendar
- Maps
- News
- Weather
- Xbox stuff (unless gaming on Xbox app)

#### Disable Search Indexing on HDD (Saves resources)

```
Control Panel → Indexing Options
```

Click "Modify" and uncheck C: drive (the HDD).

Keep D: indexed (SSD is fast enough that indexing doesn't hurt).

**Why:** Indexing on HDD causes constant disk thrashing. You don't search C: much anyway since apps are what you launch, not files.

#### Disk Cleanup Script

Run monthly to clear caches:

```powershell
# Clear temp files
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# Clear Windows Update cache
Stop-Service wuauserv
Remove-Item -Path "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service wuauserv

# Clear browser caches (Chrome)
Remove-Item -Path "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache\*" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Temp files cleared!" -ForegroundColor Green
```

#### Monitor Performance

**Windows Task Manager** (Ctrl+Shift+Esc):
- Performance tab shows CPU/RAM/GPU usage
- Startup tab shows what's slowing boot
- Processes tab shows what's eating RAM

**Resource Monitor** (resmon):
- More detailed than Task Manager
- Shows disk queue length (should be <2)
- Shows network activity per process

**When to worry:**
- CPU constantly >80%: Close background apps or upgrade
- RAM constantly >90%: Close apps or add more RAM
- Disk at 100%: This is the HDD being slow - putting everything on D: helps
- GPU at 100%: Normal when gaming/AI, not normal when idle

---

### 6. Dual Monitor Optimization

With two monitors:

**Main monitor (primary):**
- Set to highest refresh rate available (60Hz, 75Hz, 144Hz)
- This is where you do intensive work

**Second monitor:**
- Can be lower refresh rate
- Good for Discord, documentation, terminals

**Windows settings:**
```
Settings → System → Display
```

- Identify monitors (click "Identify")
- Set which is #1 and #2
- Set resolution for each (probably 1920x1080)
- Set scale (100% or 125% depending on monitor size)
- "Make this my main display" on your primary

**Multi-monitor taskbar:**
```
Settings → Personalization → Taskbar
→ Taskbar behaviors
```

- "Show my taskbar on all displays" (personal preference)
- "When using multiple displays, show taskbar apps on" → "Taskbar where window is open"

---

### 7. Keep C: Drive Under 100GB

**Monthly check:**
```powershell
Get-PSDrive C | Select-Object @{n="Used (GB)";e={[math]::Round($_.Used/1GB,2)}}, @{n="Free (GB)";e={[math]::Round($_.Free/1GB,2)}}
```

**If C: fills up:**

1. Run Disk Cleanup (cleanmgr)
2. Clear Windows Update cache
3. Check if WSL moved properly to D:
4. Check if page file moved to D:
5. Use WinDirStat to find what's eating space

**Target:** C: should stay 80-100GB used, leaving 400GB free for Windows updates and breathing room.

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
New-Item -ItemType Directory -Path "D:\Dev\Ollama" -Force
New-Item -ItemType Directory -Path "D:\Dev\Ollama\models" -Force
New-Item -ItemType Directory -Path "D:\Gaming\Saves" -Force
New-Item -ItemType Directory -Path "D:\Gaming\Mods" -Force
New-Item -ItemType Directory -Path "D:\MeticulousChaos" -Force
New-Item -ItemType Directory -Path "D:\Backups" -Force
New-Item -ItemType Directory -Path "D:\Downloads" -Force
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
