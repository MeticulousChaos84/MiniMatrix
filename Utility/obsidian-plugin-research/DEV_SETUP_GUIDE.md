# Obsidian Plugin Development Setup Guide
## From Zero to "Hello World" in Your Sidebar

*"I put on my robe and wizard hat."* - The internet, circa 2002

---

## Prerequisites (Gather Your Components)

Before we begin, make sure you have:

### Required
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
  - Verify: `node --version` should show v18.0.0 or higher
- **npm** - Comes with Node.js
  - Verify: `npm --version`
- **Obsidian** - The latest version from [obsidian.md](https://obsidian.md/)
- **A test vault** - Create a fresh vault for development (don't experiment in your main vault!)

### Recommended
- **VS Code** - With these extensions:
  - TypeScript and JavaScript Language Features (built-in)
  - ESLint
  - Prettier
- **Git** - For version control

---

## Step 1: Create Your Plugin Project

### Option A: Use the Sample Plugin Template (Recommended)

The Obsidian team maintains an official template. Let's use it:

```bash
# Navigate to your development folder
cd ~/Projects

# Clone the sample plugin
git clone https://github.com/obsidianmd/obsidian-sample-plugin.git my-awesome-plugin

# Enter the directory
cd my-awesome-plugin

# Remove the existing git history (start fresh)
rm -rf .git

# Initialize your own repo
git init
git add .
git commit -m "Initial commit from Obsidian sample plugin"

# Install dependencies
npm install
```

### Option B: Start from Scratch

If you want to understand every file:

```bash
mkdir my-awesome-plugin
cd my-awesome-plugin
npm init -y

# Install Obsidian types
npm install --save-dev @types/node typescript obsidian

# Install build tools
npm install --save-dev esbuild builtin-modules
```

Then create these files manually (see below).

---

## Step 2: Understand the Project Structure

After cloning the sample plugin, you'll have:

```
my-awesome-plugin/
├── main.ts              # Your main TypeScript source
├── manifest.json        # Plugin metadata
├── versions.json        # Version compatibility tracking
├── styles.css           # Custom CSS (optional)
├── package.json         # npm dependencies
├── tsconfig.json        # TypeScript config
├── esbuild.config.mjs   # Build configuration
└── .gitignore
```

### Key Files Explained

#### manifest.json
This tells Obsidian about your plugin:

```json
{
    "id": "my-awesome-plugin",
    "name": "My Awesome Plugin",
    "version": "1.0.0",
    "minAppVersion": "0.15.0",
    "description": "Does awesome things with your notes!",
    "author": "Your Name",
    "authorUrl": "https://your-website.com",
    "isDesktopOnly": false
}
```

**Important fields:**
- `id`: Must be unique across all plugins. Use kebab-case.
- `minAppVersion`: Minimum Obsidian version required. Check [releases](https://obsidian.md/changelog) for API features.
- `isDesktopOnly`: Set to `true` if you use Node.js-only features.

#### main.ts
Your actual plugin code. The sample includes:

```typescript
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default'
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        // This creates an icon in the left ribbon
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
            new Notice('This is a notice!');
        });
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        // This adds a command
        this.addCommand({
            id: 'open-sample-modal-simple',
            name: 'Open sample modal (simple)',
            callback: () => {
                new SampleModal(this.app).open();
            }
        });

        // This adds a settings tab
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    onunload() {
        // Cleanup happens automatically for most things
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
```

---

## Step 3: Set Up Development Environment

### Link Plugin to Your Test Vault

Instead of copying files around every time you build, create a symlink:

```bash
# Navigate to your test vault's plugins folder
cd "D:/TestVault/.obsidian/plugins"

# Create a symbolic link to your development folder
# On Windows (run as Administrator):
mklink /D my-awesome-plugin "C:/Users/YourName/Projects/my-awesome-plugin"

# On Mac/Linux:
ln -s ~/Projects/my-awesome-plugin ./my-awesome-plugin
```

Now Obsidian will load directly from your development folder!

### Start Development Mode

In your plugin directory:

```bash
npm run dev
```

This watches for changes and automatically recompiles. The output is `main.js`.

### Enable Hot Reload (Optional but HIGHLY Recommended)

Install the **Hot Reload** community plugin in your test vault:
1. Settings → Community Plugins → Browse
2. Search for "Hot Reload"
3. Install and enable it

Now when you save your TypeScript files:
1. esbuild compiles to main.js
2. Hot Reload detects the change
3. Plugin automatically reloads
4. No manual disable/enable cycle!

---

## Step 4: Enable Your Plugin

In your test vault:

1. Settings → Community Plugins
2. Disable "Restricted Mode" (if not already)
3. Reload the list (click the refresh icon)
4. Find your plugin and toggle it ON

If you don't see your plugin:
- Check that `manifest.json` is valid JSON
- Check that the `id` matches the folder name
- Make sure `main.js` exists (run `npm run dev`)

---

## Step 5: Your First Changes

Let's modify the sample plugin to do something more interesting:

### Change the Ribbon Icon Action

In `main.ts`, find the `addRibbonIcon` call and change it:

```typescript
// Find this line:
const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
    new Notice('This is a notice!');
});

// Change it to:
const ribbonIconEl = this.addRibbonIcon('book-open', "Gale's Study", async (evt: MouseEvent) => {
    const file = this.app.workspace.getActiveFile();
    if (file) {
        const content = await this.app.vault.read(file);
        new Notice(`Current file has ${content.length} characters!`);
    } else {
        new Notice('No file is open!');
    }
});
```

Save the file. If Hot Reload is working, you should see the change immediately!

### Add a New Command

Add this inside the `onload()` function:

```typescript
this.addCommand({
    id: 'count-words',
    name: 'Count words in current note',
    editorCallback: (editor: Editor, view: MarkdownView) => {
        const content = editor.getValue();
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        new Notice(`This note has ${wordCount} words!`);
    },
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'w' }]
});
```

Now press `Cmd+Shift+W` (Mac) or `Ctrl+Shift+W` (Windows) to count words!

---

## Step 6: Create a Custom Sidebar View

Let's create the foundation for Gale's Study Sidebar. Add a new file `GaleView.ts`:

```typescript
import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_GALE = "gale-view";

export class GaleView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_GALE;
    }

    getDisplayText() {
        return "Gale's Study";
    }

    getIcon() {
        return "scroll-text";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: "Gale's Study" });
        container.createEl("p", {
            text: "Open a note to see Gale's thoughts...",
            cls: "gale-placeholder"
        });
    }

    async onClose() {
        // Nothing to clean up yet
    }
}
```

Then in `main.ts`, register and activate it:

```typescript
import { GaleView, VIEW_TYPE_GALE } from './GaleView';

// In onload():
this.registerView(
    VIEW_TYPE_GALE,
    (leaf) => new GaleView(leaf)
);

this.addRibbonIcon('scroll-text', "Open Gale's Study", () => {
    this.activateGaleView();
});

// Add this method to the class:
async activateGaleView() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_GALE);

    await this.app.workspace.getRightLeaf(false)?.setViewState({
        type: VIEW_TYPE_GALE,
        active: true,
    });

    this.app.workspace.revealLeaf(
        this.app.workspace.getLeavesOfType(VIEW_TYPE_GALE)[0]
    );
}
```

Click the ribbon icon, and your sidebar appears!

---

## Step 7: Debugging

### Use the Developer Console

Press `Ctrl+Shift+I` (Windows) or `Cmd+Option+I` (Mac) to open Developer Tools.

Add `console.log()` statements to your code:

```typescript
async onload() {
    console.log('My plugin is loading!');
    // ...
}
```

### Common Issues

**"Cannot find module 'obsidian'"**
- Make sure you ran `npm install`
- Check that `obsidian` is in your `package.json` devDependencies

**Plugin doesn't appear in settings**
- Verify `manifest.json` is valid JSON
- Check for syntax errors in your TypeScript

**Changes don't take effect**
- Make sure `npm run dev` is running
- Check that Hot Reload is enabled
- Try manually disabling and re-enabling the plugin

**TypeScript errors**
- Read the error message carefully
- Check the [Obsidian API types](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)

---

## Step 8: Building for Distribution

When you're ready to share your plugin:

```bash
npm run build
```

This creates an optimized `main.js`. Your distribution package needs:
- `main.js`
- `manifest.json`
- `styles.css` (if you have one)

---

## Useful Development Plugins

Install these in your test vault:

1. **Hot Reload** - Auto-reload on file changes
2. **Style Settings** - Test CSS variables
3. **BRAT** - Install plugins directly from GitHub during beta testing

---

## Resources for Learning

### Official
- [Developer Documentation](https://docs.obsidian.md/)
- [TypeScript API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts)
- [Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)

### Community
- [Obsidian Forum - Developers section](https://forum.obsidian.md/c/developers/14)
- [Obsidian Hub - Plugin development](https://publish.obsidian.md/hub/)
- [Discord](https://discord.gg/obsidianmd) - #plugin-dev channel

### Example Plugins to Study
- [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) - Views and events
- [Dataview](https://github.com/blacksmithgu/obsidian-dataview) - Complex queries
- [Templater](https://github.com/SilentVoid13/Templater) - Commands and templates
- [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) - Settings UI patterns

---

## Quick Reference

### Common Imports

```typescript
import {
    Plugin,           // Base plugin class
    App,              // The app instance
    Editor,           // Text editor
    MarkdownView,     // Markdown editing view
    TFile,            // File in vault
    TFolder,          // Folder in vault
    Notice,           // Toast notification
    Modal,            // Popup dialog
    Setting,          // Settings UI component
    ItemView,         // Custom view (sidebar)
    WorkspaceLeaf,    // Tab/pane
    requestUrl,       // HTTP requests (CORS-free)
} from 'obsidian';
```

### Common Patterns

```typescript
// Get active file
const file = this.app.workspace.getActiveFile();

// Read file content
const content = await this.app.vault.read(file);

// Write to file
await this.app.vault.modify(file, newContent);

// Create file
await this.app.vault.create('path/to/new.md', 'Content');

// Get editor
const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

// Get selection
const selection = editor.getSelection();

// Replace selection
editor.replaceSelection('new text');

// Show notification
new Notice('Hello!');

// Register event (auto-cleanup)
this.registerEvent(
    this.app.workspace.on('file-open', (file) => { /* ... */ })
);

// HTTP request (no CORS)
const response = await requestUrl({
    url: 'http://localhost:3000/api',
    method: 'POST',
    body: JSON.stringify(data)
});
```

---

## Checklist: Ready to Build Gale's Study?

- [ ] Node.js 18+ installed
- [ ] Test vault created
- [ ] Sample plugin cloned and customized
- [ ] Symlink to test vault set up
- [ ] `npm run dev` working
- [ ] Hot Reload installed
- [ ] Developer console accessible
- [ ] First custom sidebar view working

---

## What's Next?

1. **Build the full Gale's Study Sidebar** from PLUGIN_DESIGNS.md
2. **Set up Post-Cortex daemon** to handle API calls
3. **Test with real notes** from Erica's vault
4. **Iterate based on how it feels**

---

*"The journey of a thousand plugins begins with a single `npm install`."* - Lao Tzu (probably)

---

Good luck, and may your builds always compile on the first try! 🎲✨
