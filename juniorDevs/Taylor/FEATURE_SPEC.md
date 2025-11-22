# Feature Specification: Claude to Obsidian Extension
## Detailed Feature Requirements

*Version: 1.0.0*
*Author: Taylor*
*Last Updated: November 22, 2025*

---

## Feature Overview

| Feature | Priority | Phase | Complexity |
|---------|----------|-------|------------|
| One-Click Export | P0 | 1 | Medium |
| Vault Configuration | P0 | 1 | Medium |
| Markdown Formatting | P0 | 1 | Medium |
| YAML Frontmatter | P0 | 1 | Low |
| Thinking Block Extraction | P1 | 1 | Medium |
| Export Options | P1 | 1 | Low |
| Settings Panel | P1 | 1 | Low |
| Artifact Extraction | P2 | 1 | High |
| Bulk Export | P2 | 2 | High |
| Search/History | P3 | 2 | High |
| Native Messaging | P3 | 2 | High |

---

## Feature 1: One-Click Export

### User Story

As a Claude user, I want to export my current conversation with a single click so that I can save it to my Obsidian vault without manual copy-paste.

### Description

The core feature of the extension. User clicks the extension icon (or uses keyboard shortcut), and the current conversation is extracted, formatted, and saved to their configured vault folder.

### Acceptance Criteria

- [ ] Clicking extension icon shows popup with "Export" button
- [ ] Clicking "Export" extracts the current conversation
- [ ] Conversation is formatted as clean Markdown
- [ ] File is saved to configured vault location
- [ ] User sees success message with filename
- [ ] User sees error message if export fails
- [ ] Export completes in under 3 seconds for typical conversations

### UI Mockup

```
┌────────────────────────────────┐
│  Claude → Obsidian      [⚙️]   │
├────────────────────────────────┤
│                                │
│  📝 Current Conversation       │
│  ──────────────────────────    │
│  "Extension Architecture"      │
│  24 messages • 3 thinking      │
│                                │
│  ┌──────────────────────────┐  │
│  │  📥  Export to Vault     │  │
│  └──────────────────────────┘  │
│                                │
│  📂 ~/Obsidian/Vault/Sessions  │
│                                │
└────────────────────────────────┘
```

### Success State

```
┌────────────────────────────────┐
│                                │
│  ✅ Exported Successfully!     │
│                                │
│  2024-11-22-extension-arch.md  │
│                                │
│  📊 24 messages exported       │
│  💭 3 thinking blocks          │
│                                │
│  [Open in Obsidian] [Close]    │
│                                │
└────────────────────────────────┘
```

### Error State

```
┌────────────────────────────────┐
│                                │
│  ❌ Export Failed              │
│                                │
│  Permission denied to vault    │
│  folder. Please reconfigure.   │
│                                │
│  [Reconfigure] [Close]         │
│                                │
└────────────────────────────────┘
```

### Technical Notes

- Parse DOM using content script
- Extract all message elements
- Detect user vs assistant messages
- Preserve code block formatting
- Handle special characters in filenames
- Generate unique filename if duplicate exists

---

## Feature 2: Vault Configuration

### User Story

As a user, I want to configure which folder in my Obsidian vault receives exported conversations so that files go exactly where I want them.

### Description

First-time setup and ongoing configuration of the target vault folder. Uses File System Access API to let user select any folder.

### Acceptance Criteria

- [ ] User can click "Configure Vault" on first run
- [ ] System file picker opens
- [ ] User can select any folder on their system
- [ ] Selection is persisted between sessions
- [ ] User can change folder at any time via settings
- [ ] Extension shows current configured path
- [ ] Warns if folder access is lost

### UI Flow

**First Run:**
```
┌────────────────────────────────┐
│                                │
│  Welcome to Claude → Obsidian! │
│                                │
│  Let's set up your vault.      │
│                                │
│  Click below to select the     │
│  folder where conversations    │
│  will be saved.                │
│                                │
│  ┌──────────────────────────┐  │
│  │  📂 Select Vault Folder  │  │
│  └──────────────────────────┘  │
│                                │
│  Tip: Choose your Obsidian     │
│  vault's Sessions folder!      │
│                                │
└────────────────────────────────┘
```

**After Configuration:**
```
┌────────────────────────────────┐
│                                │
│  ✅ Vault Configured!          │
│                                │
│  ~/Obsidian/Vault/Sessions     │
│                                │
│  You're all set! Export your   │
│  first conversation.           │
│                                │
│  [Start Exporting]             │
│                                │
└────────────────────────────────┘
```

### Technical Notes

- Use `window.showDirectoryPicker()` API
- Store handle in IndexedDB for persistence
- Handle needs re-permission after browser restart
- Create subdirectory (Sessions) if it doesn't exist
- Validate folder is writable

### Edge Cases

- User denies permission → show clear error
- Folder deleted → prompt reconfiguration
- Permission expired → graceful re-auth prompt
- Multiple vault support → future enhancement

---

## Feature 3: Markdown Formatting

### User Story

As an Obsidian user, I want my exported conversations to be clean, well-formatted Markdown so that they look good in my vault and are easy to read.

### Description

Convert extracted conversation data into properly formatted Markdown that renders beautifully in Obsidian.

### Acceptance Criteria

- [ ] Messages clearly labeled as User/Claude
- [ ] Message separators between turns
- [ ] Code blocks preserve language hints
- [ ] Lists render correctly
- [ ] Tables render correctly
- [ ] Links are preserved
- [ ] Math formulas preserved (if present)
- [ ] No extra whitespace/artifacts
- [ ] Passes Obsidian's linter

### Output Format

```markdown
---
title: "Extension Architecture Discussion"
date: 2024-11-22T14:30:00
source: claude.ai
tags:
  - claude
  - session
---

# Extension Architecture Discussion

## User

Can you help me design a Chrome extension architecture?

---

## Claude

I'd be happy to help design a Chrome extension architecture! Let me walk you through a typical Manifest V3 structure.

### Key Components

Here are the main parts:

1. **Service Worker** - Background processing
2. **Content Scripts** - Page interaction
3. **Popup** - User interface

```javascript
// Example manifest.json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0"
}
```

---

## User

What about file system access?

---

## Claude

Great question! There are several approaches...
```

### Formatting Rules

| Element | Formatting |
|---------|------------|
| Message role | `## User` or `## Claude` |
| Separator | `---` (horizontal rule) |
| Code blocks | Triple backticks with language |
| Inline code | Single backticks |
| Lists | Standard markdown lists |
| Tables | Pipe-separated tables |
| Links | `[text](url)` format |
| Bold/Italic | Standard `**bold**` and `*italic*` |

### Technical Notes

- Extract text content, not HTML
- Convert HTML entities back to characters
- Preserve intentional whitespace in code
- Handle nested lists properly
- Escape Obsidian-special characters if needed

---

## Feature 4: YAML Frontmatter

### User Story

As an Obsidian power user, I want exported conversations to include YAML frontmatter so that I can search, filter, and organize them using Obsidian's metadata features.

### Description

Add comprehensive YAML frontmatter to exported files with useful metadata for Obsidian queries and organization.

### Acceptance Criteria

- [ ] Frontmatter is valid YAML
- [ ] Includes conversation title
- [ ] Includes export date/time
- [ ] Includes source (claude.ai)
- [ ] Includes configurable tags
- [ ] Includes message count
- [ ] Indicates presence of thinking blocks
- [ ] Indicates presence of artifacts
- [ ] Passes YAML linting

### Default Frontmatter

```yaml
---
title: "Conversation Title"
date: 2024-11-22T14:30:00
created: 2024-11-22T14:30:00
source: claude.ai
conversation_id: conv_abc123
model: claude-3-5-sonnet
tags:
  - claude
  - session
message_count: 24
has_thinking: true
has_artifacts: false
---
```

### Optional/Configurable Fields

```yaml
---
# User can enable these in settings
aliases:
  - "Alt Title"
project: "MetaMind"
status: "reference"
topics:
  - chrome-extensions
  - architecture
---
```

### Technical Notes

- Escape special YAML characters in values
- Handle multiline titles (truncate or escape)
- Detect model from page if possible
- Generate conversation_id from URL or hash

---

## Feature 5: Thinking Block Extraction

### User Story

As a user building a personality engine, I want thinking blocks to be extracted and formatted separately so that I can process them for resonance capture.

### Description

Identify Claude's thinking/reasoning blocks and format them specially - both inline with the conversation and optionally as separate output for pipeline processing.

### Acceptance Criteria

- [ ] Thinking blocks are detected in conversation
- [ ] Inline: formatted in collapsible details tag
- [ ] Thinking blocks counted in frontmatter
- [ ] Toggle to include/exclude from export
- [ ] Separate queue file for processing (optional)

### Inline Format

```markdown
## Claude

Here's my analysis of the situation.

<details>
<summary>💭 Thinking</summary>

Let me break down the problem into components. First, I need to consider the technical constraints, then map out the dependencies...

</details>

Based on my analysis, I recommend the following approach...
```

### Separate Queue Format (Phase 2)

```markdown
---
type: thinking_block
date: 2024-11-22T14:30:00
conversation: "[[2024-11-22-extension-arch]]"
message_index: 3
---

## Thinking Block

Let me break down the problem into components...

---
```

### Settings

```
┌────────────────────────────────┐
│  Thinking Blocks               │
│                                │
│  [✓] Include in export         │
│  [✓] Use collapsible format    │
│  [ ] Queue for processing      │
│                                │
└────────────────────────────────┘
```

### Technical Notes

- Identify thinking block elements in DOM
- Extract text content preserving structure
- May need to expand collapsed sections
- Handle multiple thinking blocks per response

---

## Feature 6: Export Options

### User Story

As a user, I want to customize how my conversations are exported so that the output fits my specific workflow and preferences.

### Description

Options in the popup UI to control export behavior.

### Options

**Format Selection**
- Markdown (default)
- Plain Text
- JSON (raw data)

**Content Options**
- [✓] Include thinking blocks
- [ ] Extract artifacts as separate files
- [ ] Include timestamps per message

**Filename Options**
- Pattern: `{date}-{title}`
- Available tokens: `{date}`, `{title}`, `{id}`, `{model}`

### UI Design

```
┌────────────────────────────────┐
│  Export Options         [⚙️]   │
├────────────────────────────────┤
│                                │
│  Format: [Markdown ▼]          │
│                                │
│  ☑ Include thinking blocks     │
│  ☐ Extract artifacts           │
│  ☐ Include timestamps          │
│                                │
│  Filename: {date}-{title}      │
│                                │
│  Preview:                      │
│  2024-11-22-extension-arch.md  │
│                                │
└────────────────────────────────┘
```

### Technical Notes

- Save preferences to chrome.storage.local
- Show filename preview based on current conversation
- Validate filename pattern

---

## Feature 7: Settings Panel

### User Story

As a user, I want a dedicated settings panel so that I can configure all extension options in one place.

### Description

A settings page (options.html) or expanded popup section for all configuration.

### Settings Categories

**Export Settings**
- Default format
- Default options (thinking blocks, artifacts)
- Filename pattern

**Vault Settings**
- Current vault path
- Change vault button
- Subfolder for sessions

**Frontmatter Settings**
- Default tags
- Include optional fields

**Advanced**
- Debug mode
- Reset to defaults

### UI Design

```
┌─────────────────────────────────────┐
│  Settings                    [×]    │
├─────────────────────────────────────┤
│                                     │
│  📥 Export                          │
│  ───────────────────────            │
│  Default format: [Markdown ▼]       │
│  ☑ Include thinking by default      │
│  Filename: [{date}-{title}    ]     │
│                                     │
│  📂 Vault                           │
│  ───────────────────────            │
│  Path: ~/Obsidian/Vault/Sessions    │
│  [Change Folder]                    │
│                                     │
│  🏷️ Tags                            │
│  ───────────────────────            │
│  Default: claude, session           │
│  [Edit Tags]                        │
│                                     │
│  ⚙️ Advanced                        │
│  ───────────────────────            │
│  ☐ Debug mode                       │
│  [Reset to Defaults]                │
│                                     │
│           [Save Settings]           │
│                                     │
└─────────────────────────────────────┘
```

---

## Feature 8: Artifact Extraction

### User Story

As a developer, I want code artifacts extracted as separate files so that I can use them directly without copying from the conversation.

### Description

Detect Claude's artifacts (code, SVG, etc.) and save them as separate files alongside the conversation.

### Acceptance Criteria

- [ ] Detect artifact elements in conversation
- [ ] Extract content with appropriate file extension
- [ ] Save to same folder as conversation
- [ ] Link to artifact from conversation markdown
- [ ] Handle multiple artifacts with unique names

### Output Example

**Conversation exports:**
```
Sessions/
├── 2024-11-22-extension-arch.md
└── artifacts/
    ├── 2024-11-22-extension-arch_1_component.tsx
    └── 2024-11-22-extension-arch_2_styles.css
```

**In Markdown:**
```markdown
## Claude

Here's a React component for you:

📎 Artifact: [[artifacts/2024-11-22-extension-arch_1_component.tsx]]

```tsx
// Code preview here
```
```

### Technical Notes

- Identify artifact type for file extension
- Handle untitled artifacts
- Escape special characters in filenames
- Consider size limits

---

## Feature 9: Bulk Export (Phase 2)

### User Story

As a user with many Claude conversations, I want to export multiple conversations at once so that I can migrate my history to Obsidian.

### Description

Export all or selected conversations from Claude's conversation history.

### Acceptance Criteria

- [ ] Show list of available conversations
- [ ] Allow multi-select
- [ ] Progress indicator for bulk export
- [ ] Handle rate limiting gracefully
- [ ] Skip already-exported conversations (optional)

### UI Design

```
┌────────────────────────────────────────┐
│  Bulk Export                    [×]    │
├────────────────────────────────────────┤
│                                        │
│  ☑ Select All                          │
│                                        │
│  ☑ Extension Architecture Discussion   │
│  ☑ API Integration Help                │
│  ☐ General Chat (already exported)     │
│  ☑ Code Review Session                 │
│  ...                                   │
│                                        │
│  Selected: 12 conversations            │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Export 12 Conversations         │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### Progress State

```
┌────────────────────────────────────────┐
│                                        │
│  Exporting: 7/12                       │
│  ████████████░░░░░░░░░░░░  58%        │
│                                        │
│  Current: API Integration Help         │
│                                        │
│  [Cancel]                              │
│                                        │
└────────────────────────────────────────┘
```

### Technical Notes

- Need to navigate to conversation list
- Extract conversation URLs/IDs
- Open each conversation in background
- Parse and export sequentially
- Handle errors without stopping entire batch

---

## Feature 10: Search & History (Phase 2)

### User Story

As a power user, I want to search through my Claude conversations from the extension so that I can quickly find specific discussions.

### Description

Local search functionality within the extension, similar to Echoes.

### Acceptance Criteria

- [ ] Search across all conversations
- [ ] Search by keywords
- [ ] Filter by date range
- [ ] Show results with context
- [ ] Click to open conversation
- [ ] Quick export from results

### Technical Notes

- Would require indexing conversations
- Store index in IndexedDB
- Consider existing tools (Echoes does this well)
- May be lower priority since Obsidian has search

---

## Feature 11: Native Messaging (Phase 2)

### User Story

As a MetaMind user, I want the extension to integrate with Post-Cortex so that exported conversations automatically update my memory system.

### Description

Native messaging host that receives export data and processes it locally.

### Capabilities

- Direct file writing without browser restrictions
- Thinking block pipeline processing
- Post-Cortex MCP integration
- Background processing

### Architecture

```
Extension ←--JSON--→ Native Host (Node.js)
                           │
                           ├──→ File System
                           ├──→ Thinking Queue
                           └──→ Post-Cortex MCP
```

### Technical Notes

- Requires separate installation
- Platform-specific setup (Windows registry, etc.)
- Must handle message protocol correctly
- See ARCHITECTURE.md for details

---

## User Flows

### Flow 1: First-Time Setup

```
1. User installs extension
2. Clicks extension icon
3. Sees welcome screen
4. Clicks "Select Vault Folder"
5. System file picker opens
6. User selects their Obsidian vault's Sessions folder
7. Success message shown
8. User can now export
```

### Flow 2: Quick Export

```
1. User is on Claude.ai with a conversation
2. Clicks extension icon
3. Sees conversation info
4. Clicks "Export to Vault"
5. Success message with filename
6. File appears in Obsidian vault
```

### Flow 3: Export with Options

```
1. User is on Claude.ai with a conversation
2. Clicks extension icon
3. Toggles "Include thinking blocks" off
4. Changes format to JSON
5. Clicks "Export to Vault"
6. JSON file saved to vault
```

### Flow 4: Change Settings

```
1. User clicks settings icon
2. Settings panel opens
3. User changes filename pattern
4. User adds default tags
5. Clicks "Save Settings"
6. Settings persisted
```

### Flow 5: Error Recovery

```
1. User tries to export
2. Permission expired (browser restart)
3. Error message: "Permission denied"
4. User clicks "Reconfigure"
5. File picker opens
6. User reselects folder
7. Permission restored
8. Export succeeds
```

---

## Success Metrics

### Functional Metrics

| Metric | Target |
|--------|--------|
| Export success rate | >99% |
| Time to export (typical) | <3 seconds |
| File format validity | 100% valid MD |
| Frontmatter validity | 100% valid YAML |

### User Experience Metrics

| Metric | Target |
|--------|--------|
| Clicks to export | 2 (icon + button) |
| First-time setup | <1 minute |
| Settings change | <30 seconds |

---

## Out of Scope (for now)

- Export from Claude API/Desktop
- Cloud sync of settings
- Automatic export on conversation end
- Obsidian plugin companion
- Export to other apps (Notion, etc.)
- Conversation comparison/diff
- Translation features

---

## Open Questions

1. **Model Detection**: How reliably can we detect which Claude model was used? Is it shown in the UI?

2. **Conversation ID**: Where do we get a stable conversation ID? From URL?

3. **Selective Export**: Should we support exporting just a portion of the conversation? (Like Claude Exporter)

4. **Duplicate Handling**: How to handle re-exporting same conversation? Overwrite, rename, or skip?

5. **Thinking Block Format**: Do we know the actual DOM structure for thinking blocks on Claude.ai?

---

*"The specs are written, the features are specced. Time to roll for implementation!"*
