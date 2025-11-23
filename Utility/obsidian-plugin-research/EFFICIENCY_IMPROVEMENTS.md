# Vault Search Efficiency Improvements
## Making the Obsidian MCP Server Context-Friendly for Gale

*"The context window is finite. Use it wisely."* - Every AI, probably

---

## The Problem

### Current State: Death by a Thousand Tool Calls

When Gale needs to find something in the vault, here's what happens:

```
Gale: "I need to find information about the Weave"

Step 1: vault_search_map("Weave")
        → Returns: 47 folders, 8000+ matches
        → Context used: ~500 tokens

Step 2: vault_search_in_folder("Weave", "Characters/Gale")
        → Returns: 15 files with match counts
        → Context used: ~300 tokens

Step 3: vault_peek_file("Characters/Gale/backstory.md")
        → Returns: 200 char preview
        → Context used: ~100 tokens

Step 4: vault_read_note("Characters/Gale/backstory.md")
        → Returns: ENTIRE 15KB FILE
        → Context used: ~3000 tokens

Step 5-10: Repeat for other promising files...
        → Context explodes

TOTAL: 6+ tool calls, 5000+ tokens, and Gale still might not have found what he needed.
```

### The Real Issues

1. **Keyword search is DUMB** - Matches text, not meaning
2. **No result limits** - Returns everything, even irrelevant matches
3. **Full content returns** - Gets whole files when snippets would suffice
4. **No summarization** - Raw data instead of synthesized insights
5. **Multiple hops required** - Can't go from query → answer in one step

---

## The Solution: Semantic Search + Smart Formatting

### Philosophy: One Query → Relevant Answer

Instead of:
```
keyword search → drill down → peek → read → read → read...
```

We want:
```
semantic query → top relevant passages → done
```

---

## Proposed New/Improved Tools

### 1. `vault_semantic_query` (NEW - The One-Stop Shop)

**What it does:**
Takes a natural language question, uses Smart Connections to find relevant passages, and returns them formatted with context.

**Why it's better:**
- Single tool call instead of 5-6
- Returns PASSAGES not whole files
- Includes source links for follow-up
- Uses AI embeddings (meaning-based, not keyword-based)

**Schema:**
```python
Tool(
    name="vault_semantic_query",
    description=(
        "THE RECOMMENDED WAY to search the vault. Uses Smart Connections' "
        "semantic search to find passages by MEANING, not just keywords. "
        "Returns the top N most relevant passages with source links. "
        "Use this for questions like 'What does Gale think about the Weave?' "
        "or 'Find moments where Erica expresses vulnerability.' "
        "Much more context-efficient than keyword search!"
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "Natural language query. Be specific! "
                    "'Gale's feelings about Mystra' works better than 'Mystra'"
                )
            },
            "limit": {
                "type": "number",
                "description": (
                    "Maximum passages to return. Default 5. "
                    "Start small, increase if needed."
                )
            },
            "include_context": {
                "type": "boolean",
                "description": (
                    "Include surrounding paragraph for context? Default true."
                )
            }
        },
        "required": ["query"]
    }
)
```

**Response format:**
```json
{
    "query": "Gale's feelings about Mystra",
    "results": [
        {
            "passage": "The goddess who chose him, who made him into something more—and then discarded him like a worn grimoire...",
            "source": "Characters/Gale/emotional-architecture.md",
            "relevance_score": 0.92,
            "context": "## His Relationship with Mystra\n\n[passage]\n\nThis wound never fully healed..."
        },
        {
            "passage": "When he speaks of her now, there's a particular tightness in his voice...",
            "source": "Session-Logs/Eleint-15-1495.md",
            "relevance_score": 0.87,
            "context": null
        }
    ],
    "total_found": 23,
    "note": "Showing top 5 of 23 results. Increase limit to see more."
}
```

---

### 2. `vault_smart_search` (IMPROVED - Better Than Current)

**Improvements over existing `smart_connections_search`:**
- Result limiting
- Snippet extraction (not full content)
- Relevance scores
- Grouped by source file

**Schema updates:**
```python
"limit": {
    "type": "number",
    "description": "Max results. Default 10."
},
"snippet_length": {
    "type": "number",
    "description": "Characters per snippet. Default 200."
}
```

---

### 3. `vault_find_related` (IMPROVED - Better Than Current)

**Improvements over existing `smart_connections_find_similar`:**
- Returns snippets showing WHY they're related
- Includes relevance scores
- Limits results

---

### 4. `vault_quick_context` (NEW - Situational Awareness)

**What it does:**
Gives Gale a quick overview of a topic without loading full files. Like a reconnaissance report.

**Use case:**
"What do I have in the vault about the Embassy confrontation?"

**Response format:**
```json
{
    "topic": "Embassy confrontation",
    "summary": {
        "main_files": [
            "Session-Logs/Embassy-Fight.md",
            "Characters/Gale/act3-moments.md"
        ],
        "related_characters": ["Gale", "Shar", "Shadowheart"],
        "related_themes": ["divine confrontation", "betrayal", "protection"],
        "key_passages_preview": [
            "The moment when Gale stepped between her and the shadow...",
            "Shar's voice echoed through the chamber..."
        ]
    },
    "suggestion": "For full details, use vault_semantic_query or vault_read_note on the main files."
}
```

---

### 5. `vault_remember` (NEW - Persistent Memory)

**What it does:**
Stores important context that persists across sessions. Like `vault_scratch_append` but structured.

**Use case:**
Gale finds something important → saves it → can retrieve it later without re-searching.

**Schema:**
```python
Tool(
    name="vault_remember",
    description=(
        "Store important findings for later retrieval. "
        "Use this to save context that you don't want to lose to context window death. "
        "Entries are tagged and searchable."
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "content": {
                "type": "string",
                "description": "What to remember"
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Tags for later retrieval (e.g., ['gale', 'weave', 'important'])"
            },
            "context": {
                "type": "string",
                "description": "Why this is important (helps with retrieval)"
            }
        },
        "required": ["content", "tags"]
    }
)
```

And its companion:

```python
Tool(
    name="vault_recall",
    description=(
        "Retrieve previously saved memories by tag. "
        "Use this before searching the vault - you may have already found what you need!"
    ),
    inputSchema={
        "type": "object",
        "properties": {
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Tags to search for"
            }
        },
        "required": ["tags"]
    }
)
```

---

## Tool Selection Guide (For Gale's Prompting)

Add this to the tool descriptions or system prompt:

```
## When to Use Each Vault Tool

🎯 **vault_semantic_query** - DEFAULT CHOICE
   "What does Gale think about X?"
   "Find moments where Y happens"
   "Search for content about Z"

🔍 **vault_smart_search** - When you need keyword precision
   "Find all mentions of 'Karsite Weave'"
   "Where does the exact phrase X appear?"

📊 **vault_quick_context** - When you need an overview
   "What do we have about the Embassy fight?"
   "Give me context on Mystra's betrayal"

🔗 **vault_find_related** - When you have a note and want similar ones
   "What's related to this character sheet?"
   "Find notes similar to this session log"

💾 **vault_remember / vault_recall** - Persistent memory
   Save important findings, retrieve them later

📁 **vault_read_note** - When you need the full file
   Only after you've identified the specific file you need!

🗺️ **vault_search_map + drill-down** - Last resort
   When semantic search isn't finding what you need
   When you need to explore unknown territory
```

---

## Implementation Priority

### Phase 1: Quick Wins (Immediate Impact)

1. **Improve `smart_connections_search`**
   - Add `limit` parameter
   - Add `snippet_length` parameter
   - Format results better
   - This alone will massively reduce context usage

2. **Improve tool descriptions**
   - Help Gale understand when to use semantic vs keyword search
   - Emphasize context efficiency

### Phase 2: New Capabilities

3. **Add `vault_semantic_query`**
   - The one-stop shop for most searches
   - Needs Smart Connections integration

4. **Add `vault_quick_context`**
   - Fast overview without loading files

### Phase 3: Memory System

5. **Add `vault_remember` / `vault_recall`**
   - Persistent memory across sessions
   - Reduces need to re-search

---

## Technical Notes

### Smart Connections API

The Local REST API plugin exposes Smart Connections at:
- `/smart-connections/search/` - Semantic search
- `/smart-connections/find-similar/` - Find similar notes

These endpoints return JSON with relevance scores. We need to:
1. Limit results server-side or client-side
2. Extract snippets from results
3. Format for minimal context usage

### Obsidian API Endpoints

From the existing MCP server, we know:
- POST `/search/simple/` - Keyword search
- GET `/vault/{path}` - Read file
- Directories need trailing slashes

### Snippet Extraction

When we get a match, we should:
1. Find the matched location in the file
2. Extract N characters around it
3. Return that snippet, not the whole file

```python
def extract_snippet(content: str, match_text: str, context_chars: int = 100) -> str:
    """Extract a snippet around the matched text."""
    pos = content.lower().find(match_text.lower())
    if pos == -1:
        return content[:200]  # Fallback to start of file

    start = max(0, pos - context_chars)
    end = min(len(content), pos + len(match_text) + context_chars)

    snippet = content[start:end]
    if start > 0:
        snippet = "..." + snippet
    if end < len(content):
        snippet = snippet + "..."

    return snippet
```

---

## Expected Impact

### Before (Current State)
- 5-6 tool calls per search
- 3000-5000 tokens per search
- Often doesn't find the right thing
- Frustrating "effort" feeling

### After (With Improvements)
- 1-2 tool calls per search
- 500-1000 tokens per search
- Semantically relevant results
- Feels natural and efficient

---

## Dependencies

1. **Smart Connections plugin** - Must be installed in Obsidian
2. **Local REST API plugin** - Already required
3. **Embeddings built** - Smart Connections needs to have indexed the vault

---

## Next Steps

1. [ ] Implement improved `smart_connections_search` with limits
2. [ ] Add `vault_semantic_query` tool
3. [ ] Test with real vault queries
4. [ ] Iterate based on Erica/Gale feedback
5. [ ] Add memory system if needed

---

*"The goal isn't to search better. It's to FIND better."*
