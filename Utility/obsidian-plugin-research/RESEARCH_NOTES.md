# Obsidian Plugin Development Research Notes
## Morgan's Deep Dive into the Plugin API

*"I solemnly swear that I am up to no good."* - The Marauder's Map, and also me when I started reading the Obsidian API docs.

---

## Executive Summary (The TL;DR Scroll)

Obsidian plugins are TypeScript/JavaScript modules that run inside Obsidian's Electron environment. This means they have:
- **Full Node.js access** (file system, network requests, the works)
- **Browser DOM access** (create UI elements, manipulate the DOM)
- **Obsidian's internal APIs** (vault, workspace, editor, markdown processing)

Think of it like being a wizard with access to both arcane AND divine magic. You can do *a lot*.

---

## Core Plugin Architecture

### The Main Plugin Class

Every plugin extends the `Plugin` base class. It's like your character class in D&D - it determines what abilities you have access to:

```typescript
import { Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {
    async onload() {
        // Roll for initiative! Plugin is loading.
        // Register views, commands, events, settings here.
    }

    async onunload() {
        // Pack up your gear. Plugin is being disabled.
        // Cleanup happens automatically for registered things.
    }
}
```

### The Holy Trinity of Plugin Files

1. **main.ts** - Your actual code (compiles to main.js)
2. **manifest.json** - Plugin metadata (name, version, min Obsidian version)
3. **styles.css** - Custom CSS for your UI elements

---

## API Capabilities (What You Can Actually DO)

### 1. Vault Access (The Treasure Hoard)

The `Vault` API lets you read and write files in the vault:

```typescript
// Read a file
const content = await this.app.vault.read(file);

// Write to a file
await this.app.vault.modify(file, newContent);

// Create a new file
await this.app.vault.create(path, content);

// Get all markdown files
const files = this.app.vault.getMarkdownFiles();

// Get file by path
const file = this.app.vault.getAbstractFileByPath("path/to/note.md");
```

### 2. Workspace & Views (The User Interface Realm)

The `Workspace` API controls panes, tabs, and views:

```typescript
// Get the active markdown view
const view = this.app.workspace.getActiveViewOfType(MarkdownView);

// Get the currently active file
const file = this.app.workspace.getActiveFile();

// Open a file in a new pane
const leaf = this.app.workspace.getLeaf('split');
await leaf.openFile(file);

// Create a sidebar panel
const rightLeaf = this.app.workspace.getRightLeaf(false);
await rightLeaf.setViewState({
    type: MY_VIEW_TYPE,
    active: true
});
```

### 3. Editor API (Text Manipulation Magic)

Access the CodeMirror editor for direct text manipulation:

```typescript
// Get the editor from the active view
const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;

// Get selected text
const selection = editor.getSelection();

// Replace selection
editor.replaceSelection("New text");

// Get cursor position
const cursor = editor.getCursor();

// Insert at cursor
editor.replaceRange("inserted text", cursor);

// Get entire document
const content = editor.getValue();
```

### 4. Commands & Hotkeys (Quick Actions)

Register commands that appear in the command palette:

```typescript
this.addCommand({
    id: 'my-command',
    name: 'Do the thing',
    // Simple callback
    callback: () => {
        console.log("I'm doing the thing!");
    },
    // OR editor-aware callback
    editorCallback: (editor, view) => {
        const selected = editor.getSelection();
        editor.replaceSelection(selected.toUpperCase());
    },
    // Optional hotkey
    hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'p' }]
});
```

### 5. Custom Views (Sidebars & Panels)

Create custom UI panels by extending `ItemView`:

```typescript
import { ItemView, WorkspaceLeaf } from "obsidian";

export const VIEW_TYPE_GALE = "gale-study-view";

export class GaleStudyView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_GALE;
    }

    getDisplayText(): string {
        return "Gale's Study";  // Tab title
    }

    getIcon(): string {
        return "book-open";  // Lucide icon name
    }

    async onOpen() {
        // Build your UI here!
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h2", { text: "Gale's Thoughts" });

        // You can use any DOM manipulation here
        const div = container.createEl("div", { cls: "gale-content" });
        div.innerHTML = "<p>Loading wisdom...</p>";
    }

    async onClose() {
        // Cleanup if needed
    }
}
```

Register the view:
```typescript
this.registerView(
    VIEW_TYPE_GALE,
    (leaf) => new GaleStudyView(leaf)
);
```

### 6. Settings & Configuration (User Preferences)

Store and manage plugin settings:

```typescript
interface MyPluginSettings {
    apiEndpoint: string;
    autoRefresh: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    apiEndpoint: 'http://localhost:3000',
    autoRefresh: true
};

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new MySettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class MySettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('API Endpoint')
            .setDesc('Where the magic happens')
            .addText(text => text
                .setPlaceholder('http://localhost:3000')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));
    }
}
```

### 7. Events (The Observer Pattern)

React to things happening in Obsidian:

```typescript
// File opened
this.registerEvent(
    this.app.workspace.on('file-open', (file) => {
        if (file) {
            console.log(`Opened: ${file.path}`);
        }
    })
);

// Active leaf changed (switched tabs/panes)
this.registerEvent(
    this.app.workspace.on('active-leaf-change', (leaf) => {
        // Update your sidebar based on new context
    })
);

// Vault events
this.registerEvent(
    this.app.vault.on('create', (file) => {
        console.log(`New file created: ${file.path}`);
    })
);

this.registerEvent(
    this.app.vault.on('modify', (file) => {
        console.log(`File modified: ${file.path}`);
    })
);

this.registerEvent(
    this.app.vault.on('rename', (file, oldPath) => {
        console.log(`Renamed from ${oldPath} to ${file.path}`);
    })
);
```

### 8. HTTP Requests (Network Magic)

Make network requests to external APIs (like our Post-Cortex daemon!):

```typescript
import { requestUrl } from 'obsidian';

// Obsidian's built-in request function bypasses CORS!
const response = await requestUrl({
    url: 'http://localhost:3000/api/analyze',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        text: noteContent,
        character: 'Gale'
    })
});

const data = response.json;
```

**Why not use `fetch()`?**
Regular fetch gets blocked by CORS when your origin is `app://obsidian.md`. The `requestUrl` function uses Node.js under the hood, bypassing browser security restrictions. It's like casting Dimension Door instead of walking around the guards.

---

## UI Components (Building Blocks)

Obsidian provides several built-in UI components:

```typescript
import {
    Setting,
    Modal,
    DropdownComponent,
    TextComponent,
    ButtonComponent,
    ToggleComponent,
    SliderComponent
} from 'obsidian';

// In your view's onOpen():
new ButtonComponent(container)
    .setButtonText("Analyze Note")
    .onClick(() => {
        // Do the thing
    });

new DropdownComponent(container)
    .addOption('gale', 'Gale Dekarios')
    .addOption('astarion', 'Astarion Ancunín')
    .onChange(value => {
        this.selectedCharacter = value;
    });
```

---

## Ribbon Icons (Sidebar Buttons)

Add buttons to the left ribbon:

```typescript
this.addRibbonIcon('dice', 'Roll for Inspiration', (evt) => {
    new Notice('You feel inspired!');
});
```

Icons are from the [Lucide](https://lucide.dev/) icon set.

---

## Notices (Toast Messages)

Show temporary messages to the user:

```typescript
import { Notice } from 'obsidian';

new Notice('Gale approves of this note.');

// With duration (milliseconds)
new Notice('Processing...', 5000);
```

---

## Modals (Dialog Boxes)

Create popup dialogs:

```typescript
import { Modal, App } from 'obsidian';

class CharacterSelectModal extends Modal {
    constructor(app: App, private onChoose: (char: string) => void) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Choose a character' });

        const btn = contentEl.createEl('button', { text: 'Gale' });
        btn.onclick = () => {
            this.onChoose('Gale');
            this.close();
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// Usage:
new CharacterSelectModal(this.app, (character) => {
    console.log(`Selected: ${character}`);
}).open();
```

---

## Markdown Processing

Work with Obsidian's markdown:

```typescript
import { MarkdownRenderer } from 'obsidian';

// Render markdown to HTML
await MarkdownRenderer.renderMarkdown(
    "# Hello **World**",
    containerEl,
    sourcePath,
    this
);

// Parse frontmatter from a file
const metadata = this.app.metadataCache.getFileCache(file);
const frontmatter = metadata?.frontmatter;
```

---

## Key Limitations to Know

### 1. **No Direct File System Access Outside Vault**
Plugins can only access files within the vault through the Vault API. No `fs.readFileSync('/etc/passwd')` shenanigans.

### 2. **Mobile Limitations**
Some Node.js APIs don't work on mobile. If you're targeting all platforms, stick to Obsidian's APIs.

### 3. **CORS for Browser Fetch**
As mentioned, use `requestUrl` instead of `fetch` for external APIs.

### 4. **State Management**
Views need to handle their own state. When Obsidian restarts, your view's state is lost unless you save it (using `saveData`/`loadData` or `setViewState`).

### 5. **Performance**
Heavy operations (like parsing every file on load) can slow down Obsidian. Use debouncing and caching.

---

## Useful Resources

- **Official Docs**: https://docs.obsidian.md/
- **TypeScript API**: https://github.com/obsidianmd/obsidian-api
- **Sample Plugin**: https://github.com/obsidianmd/obsidian-sample-plugin
- **Community Plugins Hub**: https://publish.obsidian.md/hub/
- **Lucide Icons** (for ribbon/view icons): https://lucide.dev/

---

## Integration Points for Our Use Case

### Connecting to Post-Cortex Daemon

Since our Post-Cortex daemon will run as a local HTTP server (similar to how we set up the Obsidian MCP server), plugins can communicate with it using `requestUrl`:

```typescript
// In your plugin
async function getGalesPerspective(noteContent: string): Promise<string> {
    const response = await requestUrl({
        url: 'http://localhost:3000/api/character-perspective',
        method: 'POST',
        body: JSON.stringify({
            character: 'Gale',
            content: noteContent
        })
    });
    return response.json.perspective;
}
```

### Working with the Existing MCP Server

The MCP server (in `/Utility/obsidian-vault-connector/`) communicates with Obsidian via the Local REST API plugin. Our Obsidian plugins could either:
1. Use the same Local REST API for consistency
2. Or use Obsidian's internal APIs directly (more powerful, but different code path)

For Erica's use case, using internal APIs directly is better since the plugins run *inside* Obsidian.

---

*Next up: FEASIBILITY_ASSESSMENT.md - where we figure out which of these cool plugin ideas are actually doable!*
