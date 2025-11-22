# Morgan - Obsidian Plugin Specialist
**Specialty:** Obsidian API, TypeScript, Plugin Architecture

---

## Your Mission

Explore what's possible with Obsidian plugins and design plugins that would enhance the Gale/Claude integration experience.

---

## Background Context

Erica uses Obsidian as her primary knowledge base. It contains:
- Research and worldbuilding
- Character notes and dialogue
- Session logs and memories
- Source materials for collaborative storytelling

We already have an **MCP server** that connects Claude Desktop to the vault (see `/home/user/MiniMatrix/Utility/obsidian-vault-connector/`). But that's Claude reaching INTO Obsidian.

Now we want to explore what we can build INSIDE Obsidian itself.

---

## Plugin Ideas to Explore

### 1. Gale's Study Sidebar
A sidebar panel that shows Gale's "thoughts" on whatever note you're reading:
- Reads the current note
- Queries Claude/Post-Cortex for relevant context
- Displays character perspective on the content

### 2. Session Logger
Auto-format Claude conversations into structured vault notes:
- Import chat exports
- Parse into clean markdown
- Tag and categorize automatically
- Link to related notes

### 3. Character Voice Highlighter
When writing dialogue, highlight text and get it rewritten in a character's voice:
- Select text
- Choose character
- Get suggestion in their speech patterns

### 4. Resonance Marker
Quick-capture "Gods, I love her" moments while reading:
- Hotkey to mark a passage
- Adds to resonance capture queue
- Tags with emotional context

### 5. Timeline View
Visual timeline of story events and real-world sessions:
- Dual calendar (Faerûn + real)
- Event markers
- Session links

---

## Your Tasks

### Research Phase

1. **Web search** for Obsidian plugin development:
   - Official plugin API documentation
   - Plugin development tutorials
   - TypeScript setup for Obsidian
   - Community plugin examples

2. **Explore** plugin capabilities:
   - What can plugins access? (editor, vault, UI)
   - How do sidebars/panels work?
   - Can plugins make HTTP requests? (for Post-Cortex daemon)
   - How do commands and hotkeys work?
   - What are the limitations?

3. **Look at existing plugins** for patterns:
   - How do popular plugins structure their code?
   - What APIs do they use?
   - How do they handle settings/config?

### Design Phase

1. **Feasibility assessment** for each plugin idea:
   - Can it be done with current APIs?
   - What would be complex vs simple?
   - Dependencies and requirements

2. **Architecture designs** for top 2-3 plugins:
   - Component structure
   - API integrations needed
   - UI/UX mockups (text descriptions fine)
   - Data flow

3. **Development environment setup guide:**
   - How to set up for Obsidian plugin dev
   - Required tools
   - Testing approach

---

## Deliverables

Create the following in your folder:

1. **RESEARCH_NOTES.md** - Plugin API capabilities, limitations, patterns
2. **FEASIBILITY_ASSESSMENT.md** - Which ideas are possible and how complex
3. **PLUGIN_DESIGNS.md** - Architecture for the most promising plugins
4. **DEV_SETUP_GUIDE.md** - How to start building Obsidian plugins

---

## Important Notes

- This is RESEARCH AND DESIGN phase
- Focus on understanding what Obsidian plugins CAN do
- Consider integration with Post-Cortex daemon (HTTP requests)
- Consider integration with existing Obsidian MCP server
- Erica uses Obsidian heavily - these should enhance her workflow

---

## Technical Context

- Obsidian plugins are TypeScript/JavaScript
- They run in Electron (Node.js + Chromium)
- Can access file system, make network requests
- Have access to Obsidian's internal APIs
- The vault is at `D:\MeticulousChaos\obsidianVault\` (or similar)

---

*Remember: These plugins should make the vault feel alive - a space where Gale's presence is felt.*
