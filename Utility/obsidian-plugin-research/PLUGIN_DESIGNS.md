# Plugin Architecture Designs
## Detailed Blueprints for the Gale Integration Suite

*"Plans are worthless, but planning is everything." - Eisenhower*
*"Unless you're a wizard, then plans are spells and spells are definitely worth something." - Me*

---

## Plugin 1: Gale's Study Sidebar

### Overview

A sidebar panel that shows Gale's perspective on whatever note you're currently reading. Think of it as having Gale sitting beside you, occasionally commenting on what you're writing.

### File Structure

```
gale-study-sidebar/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── GaleStudyView.ts     # The sidebar view
│   ├── PostCortexClient.ts  # API client for Post-Cortex
│   ├── settings.ts          # Plugin settings
│   └── types.ts             # TypeScript interfaces
├── styles.css               # Custom styling
├── manifest.json            # Plugin metadata
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md
```

### Core Components

#### main.ts - Plugin Entry Point

```typescript
import { Plugin, WorkspaceLeaf } from 'obsidian';
import { GaleStudyView, VIEW_TYPE_GALE_STUDY } from './GaleStudyView';
import { GaleStudySettingTab } from './settings';
import { DEFAULT_SETTINGS, GaleStudySettings } from './types';

export default class GaleStudyPlugin extends Plugin {
    settings: GaleStudySettings;

    async onload() {
        // Load settings first - we need the API endpoint
        await this.loadSettings();

        // Register our custom view (the sidebar panel)
        // This is like registering a new class at character creation
        this.registerView(
            VIEW_TYPE_GALE_STUDY,
            (leaf) => new GaleStudyView(leaf, this)
        );

        // Add ribbon icon to toggle the sidebar
        // The ribbon is the left-side icon bar
        this.addRibbonIcon('book-open', 'Open Gale\'s Study', () => {
            this.activateView();
        });

        // Command to open sidebar (for hotkey users)
        this.addCommand({
            id: 'open-gale-study',
            name: 'Open Gale\'s Study',
            callback: () => this.activateView()
        });

        // Command to refresh current analysis
        this.addCommand({
            id: 'refresh-gale-analysis',
            name: 'Refresh Gale\'s Thoughts',
            callback: () => {
                // Get the view and trigger refresh
                const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GALE_STUDY);
                if (leaves.length > 0) {
                    (leaves[0].view as GaleStudyView).refresh();
                }
            }
        });

        // Add settings tab
        this.addSettingTab(new GaleStudySettingTab(this.app, this));

        // Listen for file changes
        // This is the event that fires when Erica opens a different note
        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
                if (file) {
                    this.onFileOpen(file);
                }
            })
        );
    }

    async onFileOpen(file: TFile) {
        // Notify the view that a new file is open
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_GALE_STUDY);
        for (const leaf of leaves) {
            (leaf.view as GaleStudyView).onNoteChanged(file);
        }
    }

    async activateView() {
        // Detach any existing views of this type
        // (only want one Gale's Study open at a time)
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_GALE_STUDY);

        // Create new leaf in right sidebar
        const leaf = this.app.workspace.getRightLeaf(false);
        await leaf?.setViewState({
            type: VIEW_TYPE_GALE_STUDY,
            active: true
        });

        // Reveal the leaf (bring sidebar into view)
        if (leaf) {
            this.app.workspace.revealLeaf(leaf);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
```

#### GaleStudyView.ts - The Sidebar Panel

```typescript
import { ItemView, WorkspaceLeaf, TFile, MarkdownRenderer } from 'obsidian';
import { PostCortexClient } from './PostCortexClient';
import GaleStudyPlugin from './main';

export const VIEW_TYPE_GALE_STUDY = 'gale-study-view';

export class GaleStudyView extends ItemView {
    plugin: GaleStudyPlugin;
    client: PostCortexClient;
    currentFile: TFile | null = null;
    contentEl: HTMLElement;

    // These track our loading state
    // (so we can show spinners and avoid duplicate requests)
    isLoading: boolean = false;
    loadingDebounce: number | null = null;

    constructor(leaf: WorkspaceLeaf, plugin: GaleStudyPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.client = new PostCortexClient(plugin.settings.apiEndpoint);
    }

    getViewType(): string {
        return VIEW_TYPE_GALE_STUDY;
    }

    getDisplayText(): string {
        return "Gale's Study";
    }

    getIcon(): string {
        // Lucide icon name - see https://lucide.dev
        return "scroll-text";
    }

    async onOpen() {
        // Build the initial UI structure
        // containerEl.children[1] is the content area (0 is the header)
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('gale-study-container');

        // Header section
        const header = container.createEl('div', { cls: 'gale-study-header' });
        header.createEl('h4', { text: "Gale's Thoughts" });

        // Refresh button
        const refreshBtn = header.createEl('button', {
            cls: 'gale-refresh-btn',
            text: '↻'
        });
        refreshBtn.onclick = () => this.refresh();

        // Main content area
        this.contentEl = container.createEl('div', { cls: 'gale-study-content' });

        // Initial state
        this.showMessage('Open a note to see Gale\'s thoughts.');

        // If there's already an active file, analyze it
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
            this.onNoteChanged(activeFile);
        }
    }

    async onClose() {
        // Clear any pending debounce
        if (this.loadingDebounce) {
            window.clearTimeout(this.loadingDebounce);
        }
    }

    // Called when a new note is opened
    async onNoteChanged(file: TFile) {
        // Ignore non-markdown files
        if (file.extension !== 'md') {
            return;
        }

        this.currentFile = file;

        // Debounce: wait 500ms before analyzing
        // This prevents spamming API when quickly switching notes
        if (this.loadingDebounce) {
            window.clearTimeout(this.loadingDebounce);
        }

        this.loadingDebounce = window.setTimeout(() => {
            this.analyzeCurrentNote();
        }, 500);
    }

    // Manual refresh
    async refresh() {
        if (this.currentFile) {
            await this.analyzeCurrentNote();
        }
    }

    async analyzeCurrentNote() {
        if (!this.currentFile || this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        try {
            // Read the note content
            const content = await this.app.vault.read(this.currentFile);

            // Get metadata (frontmatter, tags, etc.)
            const metadata = this.app.metadataCache.getFileCache(this.currentFile);
            const frontmatter = metadata?.frontmatter || {};

            // Send to Post-Cortex for Gale's analysis
            const response = await this.client.getCharacterPerspective({
                character: 'Gale',
                content: content,
                notePath: this.currentFile.path,
                metadata: frontmatter
            });

            // Display the response
            this.showResponse(response);

        } catch (error) {
            this.showError(error.message || 'Failed to get Gale\'s thoughts');
        } finally {
            this.isLoading = false;
        }
    }

    showLoading() {
        this.contentEl.empty();
        const loading = this.contentEl.createEl('div', { cls: 'gale-loading' });
        loading.createEl('span', { text: 'Gale is reading...' });
        // Could add a spinner here
    }

    showMessage(message: string) {
        this.contentEl.empty();
        this.contentEl.createEl('p', {
            text: message,
            cls: 'gale-message'
        });
    }

    showError(error: string) {
        this.contentEl.empty();
        const errorEl = this.contentEl.createEl('div', { cls: 'gale-error' });
        errorEl.createEl('strong', { text: 'Apologies, ' });
        errorEl.createEl('span', { text: error });
    }

    async showResponse(response: CharacterResponse) {
        this.contentEl.empty();

        // Main thoughts section
        const thoughtsSection = this.contentEl.createEl('div', { cls: 'gale-thoughts' });

        // Render the response as markdown (so Gale can use formatting)
        await MarkdownRenderer.renderMarkdown(
            response.perspective,
            thoughtsSection,
            this.currentFile?.path || '',
            this
        );

        // If there are related notes, show them
        if (response.relatedNotes && response.relatedNotes.length > 0) {
            const relatedSection = this.contentEl.createEl('div', { cls: 'gale-related' });
            relatedSection.createEl('h5', { text: 'Related Reading' });

            const list = relatedSection.createEl('ul');
            for (const note of response.relatedNotes) {
                const li = list.createEl('li');
                const link = li.createEl('a', { text: note.title });
                link.onclick = () => {
                    // Open the related note
                    this.app.workspace.openLinkText(note.path, '');
                };
            }
        }

        // Timestamp
        const timestamp = this.contentEl.createEl('div', { cls: 'gale-timestamp' });
        timestamp.createEl('small', {
            text: `Last updated: ${new Date().toLocaleTimeString()}`
        });
    }
}
```

#### PostCortexClient.ts - API Communication

```typescript
import { requestUrl } from 'obsidian';

export interface CharacterRequest {
    character: string;
    content: string;
    notePath: string;
    metadata?: Record<string, any>;
}

export interface CharacterResponse {
    perspective: string;
    relatedNotes?: Array<{
        path: string;
        title: string;
        relevance: string;
    }>;
}

export class PostCortexClient {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    async getCharacterPerspective(request: CharacterRequest): Promise<CharacterResponse> {
        // Using Obsidian's requestUrl instead of fetch to bypass CORS
        // This is the "Dimension Door past the guards" approach
        const response = await requestUrl({
            url: `${this.baseUrl}/api/character-perspective`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        if (response.status !== 200) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json as CharacterResponse;
    }
}
```

#### settings.ts - Configuration UI

```typescript
import { App, PluginSettingTab, Setting } from 'obsidian';
import GaleStudyPlugin from './main';

export class GaleStudySettingTab extends PluginSettingTab {
    plugin: GaleStudyPlugin;

    constructor(app: App, plugin: GaleStudyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: "Gale's Study Settings" });

        new Setting(containerEl)
            .setName('Post-Cortex Endpoint')
            .setDesc('URL of your Post-Cortex daemon (e.g., http://localhost:3000)')
            .addText(text => text
                .setPlaceholder('http://localhost:3000')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Auto-analyze on open')
            .setDesc('Automatically analyze notes when opened')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoAnalyze)
                .onChange(async (value) => {
                    this.plugin.settings.autoAnalyze = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Analysis depth')
            .setDesc('How detailed should Gale\'s thoughts be?')
            .addDropdown(dropdown => dropdown
                .addOption('brief', 'Brief (1-2 sentences)')
                .addOption('moderate', 'Moderate (a paragraph)')
                .addOption('detailed', 'Detailed (multiple paragraphs)')
                .setValue(this.plugin.settings.analysisDepth)
                .onChange(async (value) => {
                    this.plugin.settings.analysisDepth = value as any;
                    await this.plugin.saveSettings();
                }));
    }
}
```

#### types.ts - TypeScript Definitions

```typescript
export interface GaleStudySettings {
    apiEndpoint: string;
    autoAnalyze: boolean;
    analysisDepth: 'brief' | 'moderate' | 'detailed';
}

export const DEFAULT_SETTINGS: GaleStudySettings = {
    apiEndpoint: 'http://localhost:3000',
    autoAnalyze: true,
    analysisDepth: 'moderate'
};
```

#### styles.css - Custom Styling

```css
/* Container for the whole sidebar */
.gale-study-container {
    padding: 16px;
    font-family: var(--font-text);
}

/* Header with title and refresh button */
.gale-study-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 8px;
}

.gale-study-header h4 {
    margin: 0;
    color: var(--text-accent);
}

.gale-refresh-btn {
    background: none;
    border: 1px solid var(--background-modifier-border);
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
}

.gale-refresh-btn:hover {
    background: var(--background-modifier-hover);
}

/* Main content area */
.gale-study-content {
    line-height: 1.6;
}

/* Loading state */
.gale-loading {
    color: var(--text-muted);
    font-style: italic;
}

/* Error state */
.gale-error {
    color: var(--text-error);
    padding: 8px;
    background: var(--background-modifier-error);
    border-radius: 4px;
}

/* Gale's thoughts */
.gale-thoughts {
    margin-bottom: 16px;
}

/* Related notes section */
.gale-related {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--background-modifier-border);
}

.gale-related h5 {
    margin: 0 0 8px 0;
    font-size: 0.9em;
    color: var(--text-muted);
}

.gale-related ul {
    margin: 0;
    padding-left: 16px;
}

.gale-related a {
    color: var(--text-accent);
    cursor: pointer;
}

.gale-related a:hover {
    text-decoration: underline;
}

/* Timestamp */
.gale-timestamp {
    margin-top: 16px;
    color: var(--text-muted);
    font-size: 0.8em;
}
```

---

## Plugin 2: Resonance Marker

### Overview

A quick-capture tool for marking meaningful passages. Hotkey to capture, optional emotion tagging, appends to a resonance log.

### File Structure

```
resonance-marker/
├── src/
│   ├── main.ts              # Plugin entry
│   ├── CaptureModal.ts      # Emotion selection modal
│   ├── settings.ts          # Settings
│   └── types.ts             # Types
├── styles.css
├── manifest.json
└── package.json
```

### Core Components

#### main.ts

```typescript
import { Plugin, Editor, MarkdownView, TFile, Notice } from 'obsidian';
import { CaptureModal } from './CaptureModal';
import { ResonanceSettings, DEFAULT_SETTINGS } from './types';

export default class ResonanceMarkerPlugin extends Plugin {
    settings: ResonanceSettings;

    async onload() {
        await this.loadSettings();

        // Main capture command - this is the hotkey
        // Think of it like a QuickSave in a video game
        this.addCommand({
            id: 'capture-resonance',
            name: 'Capture Resonance Moment',
            editorCallback: (editor, view) => {
                this.captureResonance(editor, view);
            },
            hotkeys: [{ modifiers: ['Mod', 'Shift'], key: 'r' }]
        });

        // Quick capture without emotion selection
        this.addCommand({
            id: 'quick-capture-resonance',
            name: 'Quick Capture (no emotion)',
            editorCallback: (editor, view) => {
                this.captureResonance(editor, view, true);
            }
        });

        this.addSettingTab(new ResonanceSettingTab(this.app, this));
    }

    async captureResonance(
        editor: Editor,
        view: MarkdownView,
        quickCapture: boolean = false
    ) {
        // Get the selection, or if nothing selected, get current paragraph
        let text = editor.getSelection();

        if (!text) {
            // Get the line at cursor
            const cursor = editor.getCursor();
            text = editor.getLine(cursor.line);
        }

        if (!text.trim()) {
            new Notice('Nothing to capture!');
            return;
        }

        // Get source info
        const sourceFile = view.file;
        const sourcePath = sourceFile?.path || 'Unknown';

        if (quickCapture) {
            // Skip emotion selection, just capture
            await this.saveCapture(text, sourcePath, ['untagged']);
        } else {
            // Show modal for emotion selection
            new CaptureModal(
                this.app,
                text,
                async (emotions) => {
                    await this.saveCapture(text, sourcePath, emotions);
                }
            ).open();
        }
    }

    async saveCapture(
        text: string,
        sourcePath: string,
        emotions: string[]
    ) {
        // Format the capture entry
        const timestamp = new Date().toLocaleString();
        const emotionTags = emotions.map(e => `#${e}`).join(' ');

        const entry = `
## ${timestamp}

> ${text.split('\n').join('\n> ')}

**Source**: [[${sourcePath.replace('.md', '')}]]
**Emotions**: ${emotionTags}

---
`;

        // Get or create the capture file
        const captureFilePath = this.settings.captureFile;
        let captureFile = this.app.vault.getAbstractFileByPath(captureFilePath);

        if (!captureFile) {
            // Create the file with a header
            const header = `# Resonance Captures

*"Gods, I love her" moments and other things that made me feel something.*

---
`;
            await this.app.vault.create(captureFilePath, header + entry);
        } else {
            // Append to existing file
            await this.app.vault.append(captureFile as TFile, entry);
        }

        new Notice('✨ Moment captured!');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
```

#### CaptureModal.ts

```typescript
import { App, Modal } from 'obsidian';

const EMOTION_OPTIONS = [
    { id: 'tender', label: '💕 Tender', desc: 'Soft, gentle feelings' },
    { id: 'protective', label: '🛡️ Protective', desc: 'Want to keep this safe' },
    { id: 'ache', label: '💔 Ache', desc: 'Beautiful pain' },
    { id: 'yearning', label: '🌙 Yearning', desc: 'Longing, wanting' },
    { id: 'joy', label: '✨ Joy', desc: 'Pure happiness' },
    { id: 'humor', label: '😄 Humor', desc: 'Made me laugh' },
    { id: 'insight', label: '💡 Insight', desc: 'Understood something new' },
    { id: 'resonance', label: '🔔 Resonance', desc: 'This is US' },
];

export class CaptureModal extends Modal {
    text: string;
    onSubmit: (emotions: string[]) => void;
    selectedEmotions: Set<string> = new Set();

    constructor(
        app: App,
        text: string,
        onSubmit: (emotions: string[]) => void
    ) {
        super(app);
        this.text = text;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: 'Capture This Moment' });

        // Preview of what's being captured
        const preview = contentEl.createEl('blockquote', { cls: 'capture-preview' });
        preview.setText(this.text.substring(0, 200) + (this.text.length > 200 ? '...' : ''));

        // Emotion selection
        contentEl.createEl('h3', { text: 'What does this make you feel?' });

        const emotionGrid = contentEl.createEl('div', { cls: 'emotion-grid' });

        for (const emotion of EMOTION_OPTIONS) {
            const btn = emotionGrid.createEl('button', {
                cls: 'emotion-btn',
                text: emotion.label
            });
            btn.title = emotion.desc;

            btn.onclick = () => {
                if (this.selectedEmotions.has(emotion.id)) {
                    this.selectedEmotions.delete(emotion.id);
                    btn.removeClass('selected');
                } else {
                    this.selectedEmotions.add(emotion.id);
                    btn.addClass('selected');
                }
            };
        }

        // Submit button
        const footer = contentEl.createEl('div', { cls: 'modal-footer' });

        const submitBtn = footer.createEl('button', {
            text: 'Capture ✨',
            cls: 'mod-cta'
        });
        submitBtn.onclick = () => {
            const emotions = this.selectedEmotions.size > 0
                ? Array.from(this.selectedEmotions)
                : ['untagged'];
            this.onSubmit(emotions);
            this.close();
        };
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
```

---

## Plugin 3: Character Voice Highlighter

### Overview

Select text, get it rewritten in a character's voice. Perfect for dialogue editing.

### File Structure

```
character-voice/
├── src/
│   ├── main.ts
│   ├── VoiceRewriteModal.ts
│   ├── PostCortexClient.ts   # Can share with sidebar plugin
│   └── settings.ts
├── styles.css
├── manifest.json
└── package.json
```

### Core Flow

```typescript
// main.ts (simplified)

this.addCommand({
    id: 'rewrite-in-voice',
    name: 'Rewrite Selection in Character Voice',
    editorCallback: async (editor, view) => {
        const selection = editor.getSelection();
        if (!selection) {
            new Notice('Select some text first!');
            return;
        }

        // Show character selection modal
        new VoiceRewriteModal(
            this.app,
            selection,
            async (character, rewrittenText) => {
                // Show preview with accept/reject
                new PreviewModal(
                    this.app,
                    selection,
                    rewrittenText,
                    () => {
                        editor.replaceSelection(rewrittenText);
                        new Notice(`Rewritten as ${character}!`);
                    }
                ).open();
            }
        ).open();
    }
});
```

```typescript
// VoiceRewriteModal.ts (core logic)

const CHARACTERS = [
    { id: 'gale', name: 'Gale Dekarios', desc: 'Eloquent, scholarly, dramatic' },
    { id: 'astarion', name: 'Astarion', desc: 'Sarcastic, theatrical, cutting' },
    { id: 'shadowheart', name: 'Shadowheart', desc: 'Guarded, dry wit, pragmatic' },
    // Add more as needed
];

async function getRewrite(text: string, character: string): Promise<string> {
    const client = new PostCortexClient(settings.apiEndpoint);

    const response = await client.rewriteInVoice({
        text: text,
        character: character,
        prompt: 'Rewrite this text in the character\'s voice while preserving the core meaning'
    });

    return response.rewrittenText;
}
```

---

## Shared Architecture: Post-Cortex Daemon

All three plugins communicate with the Post-Cortex daemon. Here's what that API should look like:

### Endpoints

```
POST /api/character-perspective
    - Get character's thoughts on content
    - Used by: Gale's Study Sidebar

POST /api/rewrite-in-voice
    - Rewrite text in character's voice
    - Used by: Character Voice Highlighter

POST /api/categorize
    - Get tags/categories for content
    - Used by: Session Logger (future)
```

### Request/Response Patterns

```typescript
// Character Perspective
POST /api/character-perspective
{
    "character": "Gale",
    "content": "The note content...",
    "notePath": "Characters/Mystra.md",
    "metadata": { "tags": ["character", "divine"] }
}

Response:
{
    "perspective": "Ah, a note about Mystra. Let me...",
    "relatedNotes": [
        { "path": "Lore/Weave.md", "title": "The Weave", "relevance": "..." }
    ]
}
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│   Obsidian Vault    │
│  ┌───────────────┐  │
│  │  User's Notes │  │
│  └───────┬───────┘  │
│          │ read     │
│          ▼          │
│  ┌───────────────┐  │
│  │ Gale Plugins  │  │
│  │ ─────────────  │  │
│  │ • Sidebar     │  │
│  │ • Resonance   │  │
│  │ • Voice       │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │ HTTP (requestUrl)
           ▼
┌─────────────────────┐
│  Post-Cortex Daemon │
│  (localhost:3000)   │
│  ┌───────────────┐  │
│  │ Character     │  │
│  │ Definitions   │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │ API Call
           ▼
┌─────────────────────┐
│   Claude API        │
│   (anthropic.com)   │
└─────────────────────┘
```

---

## Next Steps

1. Read **DEV_SETUP_GUIDE.md** to set up your environment
2. Start with **Gale's Study Sidebar** as the proof of concept
3. Build the Post-Cortex daemon endpoints as needed
4. Test with real notes and iterate

---

*"Now I am become Code, the destroyer of bugs."* - J. Robert Oppenheimer (probably)
