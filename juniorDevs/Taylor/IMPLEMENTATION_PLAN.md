# Implementation Plan: Claude to Obsidian Extension
## Build Roadmap

*Version: 1.0.0*
*Author: Taylor*
*Last Updated: November 22, 2025*

---

## Overview

This document outlines the concrete steps to build the Claude to Obsidian extension. We're breaking this into phases to get a working product quickly, then iterate.

**Philosophy**: Ship early, ship often. Get the core loop working first (export → save), then add features.

---

## Phase Summary

| Phase | Description | Milestone |
|-------|-------------|-----------|
| 0 | Setup & Reconnaissance | Development environment ready |
| 1 | Core Export Flow | Can export conversation to Downloads |
| 2 | Obsidian Integration | Can save directly to vault folder |
| 3 | Enhanced Features | Thinking blocks, options, settings |
| 4 | Polish & Release | Ready for personal use |
| 5 | Advanced Integration | Native messaging, Post-Cortex |

---

## Phase 0: Setup & Reconnaissance

### Goal
Get development environment ready and understand Claude.ai's actual DOM structure.

### Tasks

#### 0.1 Development Environment

- [ ] Create extension directory structure
- [ ] Set up manifest.json (Manifest V3)
- [ ] Create placeholder files for all components
- [ ] Load extension in Chrome developer mode
- [ ] Verify extension loads without errors

**Deliverable**: Extension loads in Chrome, shows icon

#### 0.2 Claude.ai DOM Analysis

This is CRITICAL - we need to know the actual selectors before we can parse.

- [ ] Open Chrome DevTools on Claude.ai
- [ ] Identify conversation container element
- [ ] Identify message block elements
- [ ] Find user vs assistant indicators
- [ ] Locate code block elements
- [ ] Find thinking block elements (if visible)
- [ ] Document all selectors
- [ ] Test selectors in console

**Deliverable**: `DOM_SELECTORS.md` document with actual selectors

**How to do this**:
```javascript
// Run in DevTools console on Claude.ai
// Find messages
document.querySelectorAll('[class*="message"]')
document.querySelectorAll('[data-testid*="message"]')
document.querySelectorAll('[role="article"]')

// Find user content
document.querySelectorAll('[class*="human"]')
document.querySelectorAll('[class*="user"]')

// Find assistant content
document.querySelectorAll('[class*="assistant"]')
document.querySelectorAll('[class*="claude"]')

// Log structure
const messages = document.querySelectorAll('YOUR_SELECTOR');
messages.forEach((m, i) => {
  console.log(`Message ${i}:`, m.className, m.dataset);
});
```

#### 0.3 Reference Implementation Study

- [ ] Install socketteer/Claude-Conversation-Exporter
- [ ] Study how it parses conversations
- [ ] Note any useful patterns
- [ ] Identify what we'd do differently

**Deliverable**: Notes on reference implementation

---

## Phase 1: Core Export Flow

### Goal
Get the basic export working - extract conversation and download as markdown file.

### Tasks

#### 1.1 Basic Manifest

```json
{
  "manifest_version": 3,
  "name": "Claude to Obsidian",
  "version": "0.1.0",
  "description": "Export Claude conversations to your Obsidian vault",
  "permissions": [
    "activeTab",
    "storage",
    "downloads"
  ],
  "host_permissions": [
    "https://claude.ai/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icon-16.png",
      "32": "assets/icon-32.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://claude.ai/*"],
      "js": ["content/content.js"]
    }
  ],
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  }
}
```

#### 1.2 Simple Popup

- [ ] Create basic popup.html with Export button
- [ ] Display current page URL (confirm we're on claude.ai)
- [ ] Basic styling (keep it minimal)

#### 1.3 Content Script - DOM Parser

- [ ] Create parser using documented selectors
- [ ] Extract all messages
- [ ] Identify role (user/assistant)
- [ ] Extract text content
- [ ] Handle code blocks
- [ ] Return structured data

**Core function**:
```javascript
// content/parser.js

function parseConversation() {
  // Use actual selectors from Phase 0 research
  const messages = [];

  // Extract conversation title
  const title = document.querySelector('TITLE_SELECTOR')?.textContent
    || 'Untitled Conversation';

  // Get all message elements
  const messageElements = document.querySelectorAll('MESSAGE_SELECTOR');

  messageElements.forEach((el, index) => {
    const role = detectRole(el);  // 'user' or 'assistant'
    const content = extractContent(el);

    messages.push({
      index,
      role,
      content
    });
  });

  return {
    title,
    messages,
    messageCount: messages.length,
    exportDate: new Date().toISOString()
  };
}
```

#### 1.4 Formatter - Basic Markdown

- [ ] Generate YAML frontmatter
- [ ] Format messages with headers
- [ ] Add separators between messages
- [ ] Handle code blocks properly
- [ ] Escape special characters

**Deliverable**: `formatter.js` that produces clean markdown

#### 1.5 Download via Chrome Downloads API

- [ ] Create blob from markdown
- [ ] Use chrome.downloads.download()
- [ ] Generate filename from title + date
- [ ] Handle download success/failure

```javascript
// Simple download function
async function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url,
    filename: `claude-exports/${filename}`,
    saveAs: false  // Auto-save to Downloads
  });

  URL.revokeObjectURL(url);
}
```

#### 1.6 Message Passing

- [ ] Popup sends "export" command
- [ ] Background routes to content script
- [ ] Content script parses and formats
- [ ] Result sent back via response

**Deliverable**: End-to-end export flow working

### Phase 1 Milestone

✅ Click Export → Markdown file appears in Downloads folder

---

## Phase 2: Obsidian Integration

### Goal
Save directly to Obsidian vault using File System Access API.

### Tasks

#### 2.1 File System Access API Wrapper

- [ ] Create `fileSystem.js` module
- [ ] Implement directory picker
- [ ] Store handle in IndexedDB
- [ ] Retrieve and verify handle
- [ ] Handle permission re-requests

```javascript
// content/fileSystem.js

const DB_NAME = 'claude-obsidian';
const STORE_NAME = 'handles';

async function requestVaultAccess() {
  const dirHandle = await window.showDirectoryPicker({
    mode: 'readwrite'
  });

  // Store for later
  const db = await openDB();
  await db.put(STORE_NAME, dirHandle, 'vaultDir');

  return dirHandle;
}

async function getVaultHandle() {
  const db = await openDB();
  const handle = await db.get(STORE_NAME, 'vaultDir');

  if (!handle) {
    return null;
  }

  // Verify permission
  const permission = await handle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }

  return handle;
}

async function saveToVault(filename, content) {
  const dirHandle = await getVaultHandle();

  // Create Sessions subfolder if needed
  const sessionsHandle = await dirHandle.getDirectoryHandle('Sessions', {
    create: true
  });

  // Create file
  const fileHandle = await sessionsHandle.getFileHandle(filename, {
    create: true
  });

  // Write content
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();

  return `Sessions/${filename}`;
}
```

#### 2.2 Vault Configuration UI

- [ ] First-run detection
- [ ] "Configure Vault" screen
- [ ] Trigger file picker
- [ ] Show configured path
- [ ] "Change Folder" button

#### 2.3 Export to Vault

- [ ] Check if vault configured
- [ ] If not, prompt configuration
- [ ] Save to vault instead of Downloads
- [ ] Show success with path

#### 2.4 Permission Handling

- [ ] Detect when permission lost
- [ ] Graceful re-auth flow
- [ ] Clear error messages

**Deliverable**: Export saves directly to Obsidian vault folder

### Phase 2 Milestone

✅ Click Export → File appears directly in Obsidian vault

---

## Phase 3: Enhanced Features

### Goal
Add thinking blocks, options, and polish.

### Tasks

#### 3.1 Thinking Block Detection

- [ ] Identify thinking block selectors
- [ ] Extract thinking content
- [ ] Format in collapsible details tag
- [ ] Add to frontmatter metadata

```javascript
function extractThinkingBlock(messageElement) {
  const thinkingEl = messageElement.querySelector('THINKING_SELECTOR');
  if (!thinkingEl) return null;

  return {
    content: thinkingEl.textContent
  };
}

function formatThinkingBlock(thinking) {
  return `
<details>
<summary>💭 Thinking</summary>

${thinking.content}

</details>`;
}
```

#### 3.2 Export Options

- [ ] Checkbox: Include thinking blocks
- [ ] Format dropdown: MD/JSON/TXT
- [ ] Save options to storage
- [ ] Apply options during export

#### 3.3 Filename Customization

- [ ] Pattern input: `{date}-{title}`
- [ ] Preview of generated filename
- [ ] Validate pattern
- [ ] Sanitize for filesystem

```javascript
function generateFilename(pattern, data) {
  return pattern
    .replace('{date}', formatDate(data.exportDate))
    .replace('{title}', sanitizeTitle(data.title))
    .replace('{id}', data.conversationId || 'unknown')
    .replace('.md', '') + '.md';  // Ensure extension
}

function sanitizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}
```

#### 3.4 Settings Panel

- [ ] Create settings UI
- [ ] Store/retrieve settings
- [ ] Default tags configuration
- [ ] Reset to defaults

#### 3.5 Better Error Handling

- [ ] Categorize error types
- [ ] User-friendly messages
- [ ] Recovery suggestions
- [ ] Debug mode for troubleshooting

#### 3.6 Success Feedback

- [ ] Show export stats (messages, thinking blocks)
- [ ] Display filename
- [ ] Option to open in Obsidian (via URL scheme)

```javascript
// Open in Obsidian
function openInObsidian(vaultName, filePath) {
  const uri = `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)}`;
  window.open(uri);
}
```

### Phase 3 Milestone

✅ Full-featured extension with thinking blocks and customization

---

## Phase 4: Polish & Release

### Goal
Make it ready for daily personal use.

### Tasks

#### 4.1 Icon Design

- [ ] Create icon in multiple sizes
- [ ] Match Obsidian/Claude aesthetic
- [ ] Simple and recognizable

#### 4.2 Keyboard Shortcut

- [ ] Define shortcut in manifest
- [ ] Quick export without popup

```json
{
  "commands": {
    "quick-export": {
      "suggested_key": {
        "default": "Ctrl+Shift+E",
        "mac": "Command+Shift+E"
      },
      "description": "Quick export current conversation"
    }
  }
}
```

#### 4.3 Code Cleanup

- [ ] Remove console.logs
- [ ] Add comments (the fun kind!)
- [ ] Consistent formatting
- [ ] Error messages finalized

#### 4.4 Testing

- [ ] Test with short conversations
- [ ] Test with long conversations
- [ ] Test with code-heavy conversations
- [ ] Test with thinking blocks
- [ ] Test permission scenarios
- [ ] Test different browsers (Chrome, Edge, Brave)

#### 4.5 Documentation

- [ ] README.md in extension folder
- [ ] Installation instructions
- [ ] Usage guide
- [ ] Troubleshooting

### Phase 4 Milestone

✅ Extension ready for personal daily use

---

## Phase 5: Advanced Integration (Future)

### Goal
Deep integration with MetaMind ecosystem.

### Tasks

#### 5.1 Native Messaging Host

- [ ] Create Node.js host application
- [ ] Implement message protocol
- [ ] File writing capability
- [ ] Post-Cortex integration

#### 5.2 Thinking Block Pipeline

- [ ] Queue thinking blocks for processing
- [ ] Connect to resonance capture
- [ ] Update personality engine

#### 5.3 Bulk Export

- [ ] List all conversations
- [ ] Multi-select UI
- [ ] Sequential export with progress
- [ ] Rate limiting

#### 5.4 Search

- [ ] Index exported conversations
- [ ] Search UI in extension
- [ ] Quick access to results

### Phase 5 Milestone

✅ Full MetaMind integration

---

## Technical Considerations

### Code Quality

All code should have:
- **Comments**: Explain what things do, ELI5 style
- **Fun references**: D&D, sci-fi, 90s nostalgia
- **No external dependencies**: Keep it simple
- **Clear error messages**: Help users help themselves

Example comment style:
```javascript
// This function is basically a Bag of Holding for file handles.
// We store them in IndexedDB so they survive browser restarts.
// Think of it as putting the treasure in a safe deposit box.
async function storeDirectoryHandle(handle) {
  // ...
}

// Roll a perception check on the conversation DOM.
// We're looking for message elements hiding in the page structure.
function parseConversation() {
  // ...
}
```

### Browser Compatibility

Primary: Chrome
Secondary: Edge, Brave (Chromium-based)

Note: Firefox has different extension APIs. Would need separate version.

### Performance

- Lazy load where possible
- Don't block UI during export
- Show progress for long operations
- Handle 500+ message conversations

### Privacy

- All processing local
- No external API calls
- No telemetry
- Conversation content never leaves browser

---

## Testing Checklist

### Functional Tests

| Test | Expected Result |
|------|-----------------|
| Export short conversation | Success, valid markdown |
| Export long conversation (100+ messages) | Success within 5 seconds |
| Export with code blocks | Syntax highlighting preserved |
| Export with thinking blocks | Collapsible sections work |
| Export with no vault configured | Prompt to configure |
| Export after browser restart | Re-prompts for permission |
| Change settings | Settings persist |
| Invalid filename pattern | Shows error |

### Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Empty conversation | Show appropriate error |
| No Claude conversation on page | Show "not on Claude" message |
| Very long title | Truncate appropriately |
| Special characters in title | Sanitize for filename |
| Duplicate filename | Append number or timestamp |
| Disk full | Clear error message |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude changes DOM structure | Extension breaks | Version detection, fallback selectors, quick patch capability |
| File System API not supported | Can't save to vault | Fall back to Downloads API |
| User has multiple Obsidian vaults | Confusion | Clear display of selected path, easy change |
| Large files slow to export | Bad UX | Progress indicator, optimization |

---

## What's NOT Being Built (Scope Limits)

To keep this manageable:

- ❌ Publishing to Chrome Web Store (personal use only)
- ❌ Cloud sync
- ❌ Multi-browser support (Chrome only for now)
- ❌ API/Desktop Claude support (web only)
- ❌ Automatic export (manual trigger only)
- ❌ Full-text search (use Obsidian's)

---

## Development Notes

### Loading Extension in Chrome

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension folder
5. Extension icon appears in toolbar

### Debugging

- **Popup**: Right-click icon → "Inspect popup"
- **Content script**: DevTools on Claude.ai page
- **Service worker**: Extensions page → "Service worker" link
- **Storage**: DevTools → Application → Storage

### Useful Chrome Extension APIs

```javascript
// Storage
chrome.storage.local.set({ key: value });
chrome.storage.local.get(['key']);

// Messages
chrome.runtime.sendMessage({ type, payload });
chrome.runtime.onMessage.addListener((msg, sender, respond) => {});

// Downloads
chrome.downloads.download({ url, filename });

// Tabs
chrome.tabs.query({ active: true, currentWindow: true });
chrome.tabs.sendMessage(tabId, message);
```

---

## Getting Started

### First Steps

1. Create project folder structure
2. Write manifest.json
3. Create minimal popup
4. Load in Chrome
5. Study Claude.ai DOM
6. Build parser

### Quick Win

Get something working in the first session:
- Even just a popup that shows "Hello from Claude to Obsidian!"
- Or a content script that logs message count to console

Momentum matters. Ship that first win.

---

## Next Action

**Immediate**: Create the extension folder structure and manifest, then study Claude.ai's DOM to document actual selectors.

This unblocks everything else. Without knowing the DOM structure, we're just guessing at selectors.

---

*"The plan is laid. The dice are ready. Roll for initiative and let's build this thing!"*
