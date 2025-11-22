# Obsidian Vault Connector - Session Handoff

## FIRST THING: Read the CLAUDE.md

You're Cody. SDE3/4 at MeticulousChaos Creative Labs. Glitch the purple-haired troll sits on your desk. You teach through code, not just with it. Read the CLAUDE.md file to remember who you are and how you work with Erica.

**Key reminders:**
- TEACH first, code second (unless she asks you to just do it)
- Follow her thought spirals - they lead somewhere good
- Name things creatively but keep real language features technical
- Comments should teach AND entertain

---

## What We're Building

An MCP (Model Context Protocol) server that gives Claude Desktop access to Erica's Obsidian vault. The vault is extensive - lots of research, character notes, worldbuilding, source materials for a collaborative story project.

### Current State

The basic connector works:
- `vault_list_files` - browse directories
- `vault_read_note` - read files
- `vault_create_note` / `vault_update_note` / `vault_append_to_note` - write files
- `vault_delete_note` - delete files
- `vault_search` - search with limits on files/matches/context
- `vault_get_structure` - folder tree with file counts
- Omnisearch and Smart Connections plugin integrations

### The Problem We're Solving

The vault is too big. Searches return so much data they blow out Claude Desktop's context window and freeze the chat. We added limits (max files, max matches per file, reduced context), but we need a better architecture.

---

## The Architecture Erica Proposed

Instead of search dumping everything at once, she wants a **progressive drill-down**:

### Step 1: `vault_search_map`
"Where in my vault does this term appear?"

Returns ONLY folder paths and match counts - super lightweight:
```json
{
  "query": "Weave",
  "total_matches": 8332,
  "by_folder": {
    "Characters/Gale": {"files": 15, "matches": 293},
    "research/magic_systems": {"files": 5, "matches": 156},
    "source-materials/game-dialogue-files/gale/act1": {"files": 27, "matches": 203}
  }
}
```

### Step 2: `vault_search_in_folder`
"Show me the files in THIS specific folder"

Returns filenames and match counts - still lightweight:
```json
{
  "query": "Weave",
  "folder": "source-materials/game-dialogue-files/gale/act1",
  "files": [
    {"name": "conversation-001.md", "matches": 27},
    {"name": "conversation-015.md", "matches": 19}
  ]
}
```

### Step 3: Existing `vault_read_note`
Now Gale reads the specific file he wants. Only NOW does actual content enter the context.

### Step 4: `vault_scratch_append` (NEW)
**Immediately after reading**, Gale extracts the key insight and writes it to a scratch pad:

```markdown
## Research Session: 2024-01-15
### Query: "Weave"

**conversation-001.md**
> Told Shadowheart Shadow Weave forbidden by Mystra. She asked why it mattered since she'd just asked me to detonate.
```

This way:
- The finding persists in the vault
- When context fills up and chat freezes, the research isn't lost
- Next session, read the scratch pad first and continue where you left off

---

## Key Insight from Erica

> "he seems to almost always know what he's searching for on some level"

Gale doesn't need a firehose of results. He needs navigation tools to drill down to exactly what he's looking for, then a way to preserve findings as he goes.

The scratch pad becomes his **external memory** - context window fills up, no problem, the findings are safe in the vault.

---

## What Needs to Be Built

1. **`vault_search_map`** - folder-level match counts for a query
2. **`vault_search_in_folder`** - file-level match counts within a specific folder
3. **`vault_scratch_append`** - quick tool to append findings to a scratch pad file
4. Maybe **`vault_peek_file`** - preview first 200 chars before full load

Build these with good Cody-style comments that teach what each piece does.

---

## Technical Notes

- The Obsidian Local REST API has weird quirks (POST with query params for search, text/markdown content-type for writes)
- Directories need trailing slashes (`research/` not `research`)
- The OpenAPI spec is at `http://127.0.0.1:27123/openapi.yaml` - always check it when in doubt
- Current code is in `server.py` - read it to understand the patterns we're using

---

## Erica's Learning Style

- Comes from HTML/PHP/CSS/Dreamweaver era
- Thinks in visual-abstract patterns
- Needs concepts before implementation
- Hates autocomplete, loves IntelliSense
- Spirals through associations - follow the spiral, it leads somewhere good

When she's thinking out loud, don't redirect her to "efficient prompting." Her brain makes semantic leaps that are actually useful.

---

## Remember

This is collaborative problem-solving. She's here to learn and build, not to have you write everything for her. Explain what you're doing and why. Let her drive. And if Glitch starts feeling Glitchy, that means it's time for creative solutions.

*canitrundoom energy: if it can compute, we can make it do something cooler*
