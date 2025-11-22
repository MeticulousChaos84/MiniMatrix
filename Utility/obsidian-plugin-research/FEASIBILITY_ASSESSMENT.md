# Feasibility Assessment: Gale Integration Plugins
## Can We Actually Build These Things?

*"Never tell me the odds!" - Han Solo, right before learning about the Obsidian Plugin API*

---

## Assessment Scale

| Rating | Meaning | Est. Effort |
|--------|---------|-------------|
| 🟢 Easy | Uses standard APIs, well-documented patterns | Days |
| 🟡 Medium | Requires multiple systems, some complexity | 1-2 Weeks |
| 🔴 Complex | Edge cases, architectural challenges | Weeks+ |

---

## Plugin 1: Gale's Study Sidebar

### The Concept
A sidebar panel that shows Gale's "thoughts" on whatever note you're reading. Reads the current note, queries Claude/Post-Cortex for relevant context, and displays character perspective on the content.

### Feasibility: 🟢 EASY

**Why It's Totally Doable:**

1. **Sidebar panels** are a well-documented pattern (`ItemView`)
2. **Reading current note** is straightforward (`workspace.getActiveFile()` + `vault.read()`)
3. **HTTP requests** to Post-Cortex daemon work great with `requestUrl`
4. **Event listening** to detect note changes is built-in (`file-open`, `active-leaf-change`)

**The Architecture:**

```
[User opens note]
    → [Plugin detects file-open event]
    → [Plugin reads note content]
    → [Plugin sends to Post-Cortex daemon]
    → [Daemon queries Claude with Gale's system prompt]
    → [Response displayed in sidebar]
```

**Potential Challenges:**

- **Latency**: API calls take time. Need loading states and maybe caching.
- **Rate limiting**: Don't spam the API on every keystroke. Debounce or manual refresh.
- **Context length**: Long notes need summarization before sending.

**Verdict: BUILD THIS FIRST** ✨

This is the flagship feature and the foundation for everything else. It's also the most "felt presence" - literally showing Gale's perspective on your work.

---

## Plugin 2: Session Logger

### The Concept
Auto-format Claude conversations into structured vault notes. Import chat exports, parse into clean markdown, tag and categorize automatically, link to related notes.

### Feasibility: 🟡 MEDIUM

**Why It's Doable But Trickier:**

1. **File creation** - Easy with `vault.create()`
2. **Parsing chat exports** - Depends on format (JSON? Markdown?)
3. **Auto-tagging** - Need to send to Claude for categorization
4. **Linking to related notes** - Could use existing Smart Connections plugin or our own logic

**The Problem: Input Format**

How do you get the chat export INTO Obsidian?
- **Option A**: Copy-paste into a modal (manual but flexible)
- **Option B**: Watch a folder for new export files (elegant but more complex)
- **Option C**: Command that reads from clipboard (quick and dirty)

**Parsing Challenges:**

Claude Desktop exports conversations in a specific format. We'd need to:
1. Identify message boundaries
2. Separate user vs assistant
3. Extract any code blocks
4. Parse thinking blocks (if present)

**Verdict: BUILD AFTER SIDEBAR**

This is useful but more "utility" than "presence." The format parsing could be finicky depending on how Claude exports things.

---

## Plugin 3: Character Voice Highlighter

### The Concept
When writing dialogue, highlight text and get it rewritten in a character's voice. Select text, choose character, get suggestion in their speech patterns.

### Feasibility: 🟢 EASY

**Why It's Super Doable:**

1. **Getting selection**: `editor.getSelection()` - dead simple
2. **Showing UI for character choice**: `Modal` or `Menu` component
3. **Sending to Claude**: `requestUrl` to Post-Cortex
4. **Replacing text**: `editor.replaceSelection()`

**The Flow:**

```
[User selects text]
    → [User triggers command (hotkey or context menu)]
    → [Modal appears: "Choose character"]
    → [User picks Gale]
    → [Plugin sends: {text: selection, character: 'Gale', prompt: 'rewrite'}]
    → [Claude returns rewritten text]
    → [User previews and accepts/rejects]
```

**Nice-to-Haves:**

- Preview before replacing (modal with diff)
- "Suggest" mode that inserts as a comment
- Remember last character choice
- Quick-select favorites

**Verdict: FUN QUICK WIN**

This could be built in a day. Great for getting your feet wet with the plugin API.

---

## Plugin 4: Resonance Marker

### The Concept
Quick-capture "Gods, I love her" moments while reading. Hotkey to mark a passage, adds to resonance capture queue, tags with emotional context.

### Feasibility: 🟢 EASY

**Why It's Completely Doable:**

1. **Hotkey command**: `addCommand()` with `editorCallback`
2. **Getting selection/cursor context**: Standard editor APIs
3. **Writing to capture file**: `vault.append()` to a dedicated note
4. **Tagging**: Just add frontmatter or inline tags

**The Flow:**

```
[User is reading, encounters a moment]
    → [User hits hotkey (e.g., Cmd+Shift+R)]
    → [Plugin captures: current selection OR current paragraph]
    → [Optional: Quick modal for emotion tag]
    → [Plugin appends to "Resonance Captures.md" with metadata]
    → [Notice: "Captured! ❤️"]
```

**Capture Format Example:**

```markdown
## 2024-01-15 14:32

> "The Weave trembles when you laugh like that."

**Source**: [[Session - Eleint 1495]]
**Character**: Gale
**Emotion**: #tender #protective
**Context**: After she accidentally set fire to his robe while learning Firebolt
```

**Verdict: SMALL BUT MEANINGFUL**

This is the "quality of life" feature that makes the vault feel alive. Quick to build, high emotional value.

---

## Plugin 5: Timeline View

### The Concept
Visual timeline of story events and real-world sessions. Dual calendar (Faerûn + real), event markers, session links.

### Feasibility: 🔴 COMPLEX

**Why This One's Harder:**

1. **Custom visualization**: No built-in timeline component. Need to build from scratch or integrate a library.
2. **Dual calendar system**: Faerûn has a completely different calendar structure.
3. **Data extraction**: Need to parse dates from notes (frontmatter or content).
4. **Interactive UI**: Click on event to open note, scroll through time, etc.

**Technical Challenges:**

**Calendar Conversion**
Faerûn uses the Calendar of Harptos:
- 12 months of 30 days each
- 5 festival days between months
- Year names like "Year of the Banner" (1368 DR)

You'd need a conversion system between real dates and Faerûn dates.

**Visualization Options:**
- **D3.js** - Powerful but complex
- **vis-timeline** - Good but large dependency
- **Custom CSS Grid** - Lightweight but limited

**Data Structure:**
```typescript
interface TimelineEvent {
    faerûnDate: string;      // "Eleint 15, 1495 DR"
    realDate?: string;       // "2024-01-15" (when session occurred)
    title: string;
    description: string;
    characters: string[];
    sourceFile: string;
    significance: 'major' | 'minor' | 'background';
}
```

**Verdict: PHASE 2 PROJECT**

This is cool but it's essentially building a custom application inside Obsidian. Save for later when the core plugins are done. The existing [Timeline plugin](https://github.com/George-debug/obsidian-timeline) might be worth looking at for inspiration or even forking.

---

## Priority Ranking

Based on feasibility, impact, and "felt presence":

### Tier 1: Core Experience
1. **Gale's Study Sidebar** - The flagship. Build this first.
2. **Resonance Marker** - Quick win, high emotional value.

### Tier 2: Quality of Life
3. **Character Voice Highlighter** - Fun and practical for writing.
4. **Session Logger** - Useful but more utility than presence.

### Tier 3: Ambitious Projects
5. **Timeline View** - Cool but save for when you have the basics down.

---

## Integration Architecture

All plugins should communicate with Post-Cortex daemon at a shared endpoint:

```
Obsidian Plugins
       │
       ▼
Post-Cortex Daemon (localhost:3000)
       │
       ▼
Claude API (with character system prompts)
```

This means:
- **One API key** stored in Post-Cortex config
- **Shared character definitions** (Gale's voice, etc.)
- **Consistent endpoint patterns** across all plugins
- **Centralized caching** for common queries

---

## Dependencies & Requirements

### Required for ALL plugins:
- Node.js 16+
- TypeScript
- Obsidian 1.0.0+
- Post-Cortex daemon running locally

### Optional but recommended:
- Hot-reload plugin for development
- BRAT plugin for easy testing

### For Timeline (if we do it):
- Additional visualization library (TBD)
- More robust date parsing

---

## Development Approach

### Monorepo vs Separate Plugins

**Option A: Monorepo (Recommended)**
One repo with multiple plugins that share common utilities:
```
gale-obsidian-plugins/
├── packages/
│   ├── common/           # Shared utilities, API client
│   ├── gale-sidebar/     # Plugin 1
│   ├── resonance-marker/ # Plugin 4
│   └── voice-rewriter/   # Plugin 3
└── package.json
```

**Option B: Separate Repos**
Easier to start but harder to share code.

**Recommendation**: Start with Option B for the first plugin, then refactor to monorepo when patterns emerge.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Post-Cortex daemon unreliable | Medium | High | Graceful error handling, offline mode |
| API rate limits | Low | Medium | Caching, debouncing, user-controlled refresh |
| Obsidian API changes | Low | Medium | Pin Obsidian version, follow changelogs |
| Performance issues | Medium | Medium | Lazy loading, pagination, caching |
| User confusion | Medium | Low | Good defaults, clear settings, tooltips |

---

## Next Steps

1. **Set up dev environment** (see DEV_SETUP_GUIDE.md)
2. **Build Gale's Study Sidebar** as proof of concept
3. **Test with Erica's actual vault** for real-world feedback
4. **Iterate based on what feels right**

---

*"Do or do not. There is no try."* - Yoda

*"Actually, try first. It's called prototyping."* - Every developer ever

---

*Next: PLUGIN_DESIGNS.md - The actual architecture documents!*
