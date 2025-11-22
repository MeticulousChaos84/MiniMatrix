# Architecture: Claude to Obsidian Extension
## Extension Design Document

*Version: 1.0.0-design*
*Author: Taylor*
*Last Updated: November 22, 2025*

---

## Overview

This document describes the architecture for a Chrome extension that exports Claude.ai conversations directly to an Obsidian vault with proper formatting, metadata, and special handling for thinking blocks.

Think of this like building a teleportation circle between Claude's realm and your Obsidian knowledge base - the magic is in making the transfer seamless and the formatting perfect.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Browser                              │
│                                                                  │
│  ┌──────────────┐    messages    ┌──────────────────────┐       │
│  │   Popup UI   │◄──────────────►│   Service Worker     │       │
│  │  (popup.js)  │                │   (background.js)    │       │
│  └──────────────┘                └──────────┬───────────┘       │
│                                             │                    │
│                                             │ messages           │
│                                             ▼                    │
│  ┌───────────────────────────────────────────────────────┐      │
│  │              Content Script (content.js)               │      │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │      │
│  │   │ DOM Parser  │  │  Formatter  │  │   Storage   │   │      │
│  │   └─────────────┘  └─────────────┘  └─────────────┘   │      │
│  └───────────────────────────────────────────────────────┘      │
│                              │                                   │
│                              │ File System Access API            │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                  Obsidian Vault                        │      │
│  │     /Sessions/2024-11-22-conversation.md              │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                    Phase 2: Native Messaging
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Native Host (Node.js)                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │ Message Handler│  │  File Writer   │  │ Post-Cortex    │     │
│  │                │  │                │  │ Integration    │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Popup UI (`popup/`)

The user-facing control panel. Like the character sheet of our extension.

**Responsibilities**:
- Display current conversation info
- Export format selection (MD, JSON, TXT)
- Vault folder configuration
- Export button
- Progress indicators
- Settings access

**Files**:
```
popup/
├── popup.html        # UI structure
├── popup.css         # Styling (dark mode friendly)
└── popup.js          # UI logic and event handlers
```

**Key Interactions**:
```javascript
// popup.js sends commands to background
chrome.runtime.sendMessage({
  type: 'EXPORT_CONVERSATION',
  payload: {
    format: 'markdown',
    includeThinking: true,
    extractArtifacts: false
  }
});
```

### 2. Service Worker (`background/`)

The behind-the-scenes orchestrator. The DM who keeps the game running even when you're not looking at the table.

**Responsibilities**:
- Coordinate between popup and content script
- Handle alarms for deferred operations
- Manage extension state
- Native messaging (Phase 2)
- Badge updates

**Files**:
```
background/
└── background.js     # Service worker
```

**Key Considerations**:
- Remember: service workers are EPHEMERAL
- No global state that must persist
- Use chrome.storage for persistence
- Register event listeners at top level

```javascript
// background.js - Event listeners must be top-level!
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle messages here
  // Return true if we'll respond asynchronously
});

// Use alarms instead of setTimeout
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'thinking-block-queue') {
    processThinkingBlockQueue();
  }
});
```

### 3. Content Script (`content/`)

The agent in the field. The rogue who actually breaks into Claude's DOM mansion and extracts the valuables.

**Responsibilities**:
- Parse Claude.ai page structure
- Extract conversation data
- Identify and extract thinking blocks
- Format content to Markdown
- Write to file system (File System Access API)

**Files**:
```
content/
├── content.js        # Main content script
├── parser.js         # DOM parsing logic
├── formatter.js      # Markdown formatting
├── thinking.js       # Thinking block extraction
└── fileSystem.js     # File System Access API wrapper
```

**DOM Parsing Strategy**:
```javascript
// parser.js - This is where we'll need to inspect Claude.ai's actual DOM
// These selectors are HYPOTHETICAL and need verification

const SELECTORS = {
  // The container holding all messages
  conversationContainer: '[data-testid="conversation"]',

  // Individual message blocks
  messageBlock: '[data-testid="message"]',

  // Role indicators
  userMessage: '[data-testid="user-message"]',
  assistantMessage: '[data-testid="assistant-message"]',

  // Content areas
  messageContent: '.message-content',
  codeBlock: 'pre code',

  // Thinking blocks (need to verify actual structure)
  thinkingBlock: '[data-testid="thinking"]',

  // Artifacts
  artifact: '[data-testid="artifact"]',

  // Conversation title
  conversationTitle: 'h1, [data-testid="conversation-title"]'
};

// The parser needs to be resilient to structure changes
function parseConversation() {
  const messages = [];
  const messageElements = document.querySelectorAll(SELECTORS.messageBlock);

  messageElements.forEach((element, index) => {
    const role = element.querySelector(SELECTORS.userMessage)
      ? 'user'
      : 'assistant';

    const content = extractContent(element);
    const thinkingBlock = extractThinkingBlock(element);
    const artifacts = extractArtifacts(element);

    messages.push({
      role,
      content,
      thinkingBlock,
      artifacts,
      index
    });
  });

  return messages;
}
```

### 4. Storage Layer

We'll use multiple storage mechanisms:

**chrome.storage.local** - Extension settings
```javascript
// Settings stored here
{
  defaultFormat: 'markdown',
  includeThinkingBlocks: true,
  extractArtifacts: false,
  vaultPath: null,  // Stored as handle ID
  filenamePattern: '{date}-{title}',
  frontmatterTemplate: 'default'
}
```

**IndexedDB** - File System handles
```javascript
// Store directory handles for persistence
// Handles survive browser restart
const db = await openDB('claude-export', 1, {
  upgrade(db) {
    db.createObjectStore('fileHandles');
  }
});

// Store handle
await db.put('fileHandles', dirHandle, 'vaultDirectory');

// Retrieve handle
const handle = await db.get('fileHandles', 'vaultDirectory');
// Will need to request permission again after browser restart
```

### 5. File System Interface

**Phase 1: File System Access API**

```javascript
// fileSystem.js

// Request vault folder access
async function requestVaultAccess() {
  try {
    const dirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });

    // Store handle for future sessions
    await storeDirectoryHandle(dirHandle);

    return dirHandle;
  } catch (err) {
    console.error('Failed to get directory access:', err);
    throw err;
  }
}

// Save conversation to vault
async function saveToVault(filename, content) {
  const dirHandle = await getVaultHandle();

  // Verify we still have permission
  const permission = await dirHandle.requestPermission({ mode: 'readwrite' });
  if (permission !== 'granted') {
    throw new Error('Permission denied');
  }

  // Create subdirectory if needed (e.g., Sessions/)
  const sessionsHandle = await dirHandle.getDirectoryHandle('Sessions', {
    create: true
  });

  // Create the file
  const fileHandle = await sessionsHandle.getFileHandle(filename, {
    create: true
  });

  // Write content
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();

  return { success: true, path: `Sessions/${filename}` };
}
```

**Phase 2: Native Messaging** (Future)

```javascript
// nativeMessaging.js

const HOST_NAME = 'com.metamind.obsidian_bridge';

async function sendToNativeHost(action, data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage(HOST_NAME, {
      action,
      data
    }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// Save via native host
async function saveViaNativeHost(filename, content, metadata) {
  return sendToNativeHost('save', {
    filename,
    content,
    metadata,
    extractThinking: true
  });
}
```

---

## Data Flow

### Export Flow

```
User clicks Export
       │
       ▼
┌─────────────┐
│   Popup     │ ─────► Get settings from storage
└──────┬──────┘
       │ sendMessage
       ▼
┌─────────────┐
│  Background │ ─────► Route to content script
└──────┬──────┘
       │ sendMessage
       ▼
┌─────────────────────────────────────┐
│         Content Script              │
│                                     │
│  1. Parse DOM                       │
│  2. Extract messages                │
│  3. Extract thinking blocks         │
│  4. Format as Markdown              │
│  5. Add YAML frontmatter            │
│  6. Save to vault via FS API        │
└──────┬──────────────────────────────┘
       │ sendMessage (result)
       ▼
┌─────────────┐
│   Popup     │ ─────► Show success/error
└─────────────┘
```

### Message Types

```typescript
// types.ts (we'd use TypeScript if implementing)

interface ExportRequest {
  type: 'EXPORT_CONVERSATION';
  payload: {
    format: 'markdown' | 'json' | 'text';
    includeThinking: boolean;
    extractArtifacts: boolean;
  };
}

interface ExportResponse {
  type: 'EXPORT_RESULT';
  payload: {
    success: boolean;
    filename?: string;
    path?: string;
    error?: string;
    stats: {
      messageCount: number;
      thinkingBlocks: number;
      artifacts: number;
    };
  };
}

interface ConfigureVaultRequest {
  type: 'CONFIGURE_VAULT';
}

interface GetStatusRequest {
  type: 'GET_STATUS';
}
```

---

## Markdown Formatter

### Output Structure

```markdown
---
title: "Conversation Title"
date: 2024-11-22T14:30:00
source: claude.ai
conversation_id: conv_abc123
model: claude-3-5-sonnet
tags:
  - claude
  - session
message_count: 24
has_thinking: true
has_artifacts: true
---

# Conversation Title

## User

First user message here.

---

## Claude

Claude's response here.

<details>
<summary>💭 Thinking</summary>

Claude's thinking block content here...

</details>

```python
# Code blocks are preserved with syntax highlighting
def hello():
    print("Hello!")
```

---

## User

Next user message...

---

## Claude

...
```

### Formatter Implementation

```javascript
// formatter.js

function formatConversation(messages, metadata) {
  const frontmatter = generateFrontmatter(metadata);
  const formattedMessages = messages.map(formatMessage).join('\n\n---\n\n');

  return `${frontmatter}\n\n# ${metadata.title}\n\n${formattedMessages}`;
}

function generateFrontmatter(metadata) {
  const yaml = [
    '---',
    `title: "${escapeYaml(metadata.title)}"`,
    `date: ${metadata.date}`,
    `source: claude.ai`,
    `conversation_id: ${metadata.conversationId}`,
    `model: ${metadata.model || 'unknown'}`,
    'tags:',
    '  - claude',
    '  - session',
    `message_count: ${metadata.messageCount}`,
    `has_thinking: ${metadata.hasThinking}`,
    `has_artifacts: ${metadata.hasArtifacts}`,
    '---'
  ];

  return yaml.join('\n');
}

function formatMessage(message) {
  const header = message.role === 'user' ? '## User' : '## Claude';
  let content = formatContent(message.content);

  if (message.thinkingBlock && message.role === 'assistant') {
    content += '\n\n' + formatThinkingBlock(message.thinkingBlock);
  }

  return `${header}\n\n${content}`;
}

function formatThinkingBlock(thinking) {
  return [
    '<details>',
    '<summary>💭 Thinking</summary>',
    '',
    thinking,
    '',
    '</details>'
  ].join('\n');
}

function formatContent(content) {
  // Handle code blocks, lists, etc.
  // Most of this should already be well-formatted from Claude
  return content;
}
```

---

## Thinking Block Pipeline

### Extraction

```javascript
// thinking.js

function extractThinkingBlock(messageElement) {
  // Look for thinking block container
  const thinkingElement = messageElement.querySelector(SELECTORS.thinkingBlock);

  if (!thinkingElement) return null;

  // Get the visible/summarized content
  const content = thinkingElement.textContent;

  return {
    content,
    // Store position for potential later linking
    messageIndex: parseInt(messageElement.dataset.index || '0')
  };
}

function extractAllThinkingBlocks(messages) {
  return messages
    .filter(msg => msg.thinkingBlock)
    .map(msg => ({
      ...msg.thinkingBlock,
      timestamp: new Date().toISOString()
    }));
}
```

### Queue for Resonance Processing

```javascript
// For Phase 2 integration with Post-Cortex

async function queueThinkingBlocks(blocks, conversationRef) {
  const queue = await loadThinkingQueue();

  blocks.forEach(block => {
    queue.push({
      id: generateId(),
      content: block.content,
      conversationRef,  // Link back to conversation file
      timestamp: block.timestamp,
      processed: false
    });
  });

  await saveThinkingQueue(queue);

  // Notify native host if available
  if (await isNativeHostAvailable()) {
    await sendToNativeHost('thinking_blocks_queued', {
      count: blocks.length,
      conversationRef
    });
  }
}
```

---

## Configuration UI

### Settings Panel

```javascript
// Settings stored in chrome.storage.local

const DEFAULT_SETTINGS = {
  // Export settings
  defaultFormat: 'markdown',
  includeThinkingBlocks: true,
  extractArtifacts: false,

  // Filename settings
  filenamePattern: '{date}-{title}',
  dateFormat: 'YYYY-MM-DD',

  // Vault settings
  sessionFolder: 'Sessions',

  // Frontmatter
  defaultTags: ['claude', 'session'],

  // Advanced
  preserveTimestamps: true,
  maxTitleLength: 50
};

// User can customize filename pattern:
// {date} - Export date
// {title} - Conversation title (sanitized)
// {id} - Conversation ID
// {model} - Claude model used
```

### Popup UI Mockup

```
┌─────────────────────────────┐
│ Claude → Obsidian    [⚙️]    │
├─────────────────────────────┤
│                             │
│ Current Conversation:       │
│ ┌─────────────────────────┐ │
│ │ Extension Architecture  │ │
│ │ 24 messages             │ │
│ │ 3 thinking blocks       │ │
│ └─────────────────────────┘ │
│                             │
│ Export Options:             │
│ [✓] Include thinking blocks │
│ [ ] Extract artifacts       │
│                             │
│ Format: [Markdown ▼]        │
│                             │
│ ┌─────────────────────────┐ │
│ │     📥 Export Now       │ │
│ └─────────────────────────┘ │
│                             │
│ Vault: ~/Obsidian/Vault    │
│ [Change Folder]             │
│                             │
└─────────────────────────────┘
```

---

## File Structure

```
claude-to-obsidian/
├── manifest.json              # Extension manifest (MV3)
├── popup/
│   ├── popup.html            # Popup UI
│   ├── popup.css             # Styles
│   └── popup.js              # Popup logic
├── background/
│   └── background.js         # Service worker
├── content/
│   ├── content.js            # Main content script
│   ├── parser.js             # DOM parsing
│   ├── formatter.js          # Markdown formatting
│   ├── thinking.js           # Thinking block handling
│   └── fileSystem.js         # File System Access API
├── lib/
│   ├── storage.js            # Storage utilities
│   ├── messaging.js          # Message passing helpers
│   └── utils.js              # General utilities
├── assets/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── native-host/              # Phase 2
    ├── host.js               # Node.js native host
    └── manifest.json         # Native host manifest
```

---

## Security Considerations

### Permissions

Only request what we need:
```json
{
  "permissions": [
    "storage",        // Save settings
    "activeTab"       // Access current tab
  ],
  "host_permissions": [
    "https://claude.ai/*"  // Only Claude.ai
  ]
}
```

Note: File System Access API doesn't need a permission in manifest - it's a web API that prompts the user.

### Data Handling

- All processing happens locally
- No data sent to external servers
- Conversation content never leaves the browser
- Native host (Phase 2) runs locally only

### Content Security Policy

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

## Error Handling

### Common Error Scenarios

| Error | Cause | Handling |
|-------|-------|----------|
| DOM not found | Claude updated UI | Show error, suggest update |
| Permission denied | User denied FS access | Prompt to reconfigure |
| Write failed | Disk full, permissions | Show specific error |
| Handle invalid | Browser restart | Re-request permission |

### Error Display

```javascript
// Show user-friendly errors in popup
function showError(error) {
  const errorMessages = {
    'NotFoundError': 'Vault folder not found. Please reconfigure.',
    'NotAllowedError': 'Permission denied. Click "Change Folder" to grant access.',
    'QuotaExceededError': 'Not enough storage space.',
    'ParseError': 'Could not parse conversation. Claude may have updated their page.'
  };

  const message = errorMessages[error.name] || error.message;
  displayError(message);
}
```

---

## Future Enhancements (Phase 2+)

### Native Messaging Integration

**Why**: Direct integration with Post-Cortex and other local tools

**Architecture**:
```
Extension ←→ Native Host (Node.js) ←→ Post-Cortex MCP
```

### Features Enabled:
- Automatic thinking block processing
- Real-time sync with personality engine
- Direct Post-Cortex memory creation
- Batch processing without browser

### Context Menu Integration

Right-click options:
- Export selection only
- Quick save (default settings)
- Export as artifact

### Keyboard Shortcuts

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

### Sync Features

- Export history tracking
- Duplicate detection
- Update existing notes

---

## Testing Strategy

### Unit Tests

- Parser correctly extracts messages
- Formatter produces valid Markdown
- YAML frontmatter is valid

### Integration Tests

- Full export flow
- File System API interactions
- Message passing works

### Manual Testing

- Test on different conversation lengths
- Test with various content types (code, math, tables)
- Test thinking block extraction
- Test error scenarios

---

## Dependencies

### None in Extension

The extension should be dependency-free for simplicity and security. No npm packages, no build step (for Phase 1).

### Phase 2 Native Host

```json
{
  "dependencies": {
    "native-messaging": "^1.0.0"  // For message protocol
  }
}
```

---

## Summary

This architecture provides:

1. **Clean separation of concerns** - Each component has a clear job
2. **Graceful degradation** - Works without native host in Phase 1
3. **Extensibility** - Easy to add features and integrations
4. **User privacy** - All local processing
5. **Obsidian-native output** - Perfect Markdown with frontmatter

The Phase 1 implementation gives us a fully functional extension using just web APIs. Phase 2 adds deeper integration with the MetaMind ecosystem via native messaging.

---

*"Roll for architecture check... Natural 20! The blueprints are flawless."*
