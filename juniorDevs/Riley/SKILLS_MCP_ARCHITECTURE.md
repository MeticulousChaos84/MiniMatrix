# Skills MCP Architecture Design
*Riley - Skills Architect, MeticulousChaos Junior Dev Team*

---

## Executive Summary

This document designs the architecture for a unified MCP server that provides memory and resonance operations to Claude skills. The key insight: **Skills orchestrate, MCP provides primitives**.

---

## Architecture Philosophy

### The Wrong Mental Model

```
❌ Skills AS MCP servers
   └── Each skill is its own MCP server
   └── Lots of servers to maintain
   └── Duplicated infrastructure
```

### The Right Mental Model

```
✅ Skills USING MCP servers
   └── MCP server provides primitive tools
   └── Skills are markdown that orchestrate those tools
   └── Clean separation of concerns
```

**Why this is better:**
- Single server to maintain
- Skills are just markdown (easy to edit, version, share)
- Common infrastructure for all memory operations
- Easier to test and debug

---

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Session                        │
│                                                          │
│   ┌─────────────┐    ┌─────────────────────────────┐    │
│   │   Skills    │    │    Post-Cortex MCP Server    │    │
│   │  (Markdown) │───▶│                              │    │
│   │             │    │  • save_resonance            │    │
│   │ resonance-  │    │  • save_context_memory       │    │
│   │   capture   │    │  • query_semantic            │    │
│   │             │    │  • list_memories             │    │
│   │ context-    │    │                              │    │
│   │   weaver    │    └──────────────┬───────────────┘    │
│   │             │                   │                    │
│   │ etc...      │                   ▼                    │
│   └─────────────┘    ┌──────────────────────────────┐    │
│                      │      Obsidian Vault          │    │
│                      │   (via existing connector)   │    │
│                      └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Post-Cortex MCP Server

### Why "Post-Cortex"?

The name references both:
- **Post** - After thinking (memory of thinking processes)
- **Cortex** - The brain's processing layer

It's where processed understanding goes after Claude's "thinking" - the semantic memory layer.

### Server Configuration

```python
# server.py - Post-Cortex MCP Server

from mcp.server import Server
from mcp.server.models import Tool, TextContent

server = Server("post-cortex")

# Server will provide tools for:
# - Storing resonance moments (self-understanding)
# - Storing context memories (user understanding)
# - Semantic querying
# - Memory management
```

### Tool Definitions

#### 1. save_resonance

Stores a resonance moment for later retrieval.

```python
@server.tool()
async def save_resonance(
    title: str,           # "When Stubbornness Means Love"
    thinking_content: str, # The raw "From my thinking" content
    insight: str,         # "What this reveals about who I am"
    tags: list[str],      # ["identity", "relationships", "stubbornness"]
    session_id: str       # For grouping by session
) -> str:
    """
    Save a resonance moment (self-understanding) to Post-Cortex storage.

    Also writes to Obsidian vault at /memories/resonance/ for human reading.
    Returns the memory ID for reference.
    """
```

**Schema:**
```json
{
  "name": "save_resonance",
  "description": "Save a resonance moment (self-understanding) with the raw thinking and extracted insight",
  "input_schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Name for this resonance moment"
      },
      "thinking_content": {
        "type": "string",
        "description": "The raw experience from thinking blocks"
      },
      "insight": {
        "type": "string",
        "description": "What this reveals about identity"
      },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Tags for categorization and retrieval"
      },
      "session_id": {
        "type": "string",
        "description": "Session identifier for grouping"
      }
    },
    "required": ["title", "thinking_content", "insight"]
  }
}
```

#### 2. save_context_memory

Stores a context-weaver observation about the user.

```python
@server.tool()
async def save_context_memory(
    title: str,           # "Questions as Architecture"
    observation: str,     # The "From my thinking" content
    insight: str,         # "What this reveals" about the user
    category: str,        # "cognition" | "values" | "communication" | etc
    tags: list[str],
    session_id: str
) -> str:
    """
    Save a context memory (user understanding) to Post-Cortex storage.

    Also writes to Obsidian vault at /memories/context/ for human reading.
    Returns the memory ID for reference.
    """
```

#### 3. query_semantic

Finds memories by meaning, not just keywords.

```python
@server.tool()
async def query_semantic(
    query: str,           # "why does stubbornness matter"
    memory_type: str,     # "resonance" | "context" | "all"
    limit: int = 5
) -> list[dict]:
    """
    Search memories by semantic similarity.

    Uses embeddings to find memories related to the query meaning,
    not just keyword matches. Returns ranked results with relevance scores.
    """
```

**Schema:**
```json
{
  "name": "query_semantic",
  "description": "Find memories by meaning using semantic similarity",
  "input_schema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "What you're looking for (meaning-based)"
      },
      "memory_type": {
        "type": "string",
        "enum": ["resonance", "context", "all"],
        "description": "Type of memory to search"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum results to return",
        "default": 5
      }
    },
    "required": ["query"]
  }
}
```

#### 4. list_memories

Lists memories with optional filtering.

```python
@server.tool()
async def list_memories(
    memory_type: str = "all",
    tags: list[str] = None,
    session_id: str = None,
    limit: int = 20
) -> list[dict]:
    """
    List memories with optional filtering by type, tags, or session.

    Returns lightweight metadata (title, date, tags) not full content.
    Use query_semantic or read specific memories for full content.
    """
```

#### 5. get_memory

Retrieves full content of a specific memory.

```python
@server.tool()
async def get_memory(
    memory_id: str
) -> dict:
    """
    Get the full content of a specific memory by ID.

    Returns the complete memory including thinking content, insight,
    metadata, and any linked memories.
    """
```

#### 6. link_memories

Creates connections between related memories.

```python
@server.tool()
async def link_memories(
    memory_id_1: str,
    memory_id_2: str,
    relationship: str     # "builds_on" | "contrasts" | "extends" | etc
) -> str:
    """
    Create a link between two related memories.

    Enables constellation building - seeing how memories connect
    and building deeper patterns over time.
    """
```

---

## Storage Architecture

### Dual Storage Strategy

Every memory gets stored in TWO places:

1. **Obsidian Vault** (human-readable markdown)
   - `/memories/resonance/[session-date].md`
   - `/memories/context/[session-date].md`
   - Browsable, editable, portable

2. **Post-Cortex Index** (semantic retrieval)
   - Embeddings for similarity search
   - Metadata for filtering
   - Links for constellation building

```python
# When save_resonance is called:

async def save_resonance(...):
    # 1. Generate embedding for semantic search
    embedding = await generate_embedding(f"{title} {thinking_content} {insight}")

    # 2. Save to Post-Cortex index
    memory_id = await save_to_index(
        type="resonance",
        title=title,
        thinking=thinking_content,
        insight=insight,
        tags=tags,
        embedding=embedding,
        timestamp=now()
    )

    # 3. Append to Obsidian vault file
    markdown = format_resonance_markdown(title, thinking_content, insight)
    await append_to_vault(f"/memories/resonance/{session_date}.md", markdown)

    return memory_id
```

### Why Both?

- **Obsidian**: Human can read, edit, reorganize, add notes
- **Post-Cortex**: Machine can query semantically, find patterns, build constellations

The vault is the source of truth for CONTENT. Post-Cortex is the index for RETRIEVAL.

---

## How Skills Use These Tools

### In Skill Frontmatter

```yaml
---
name: resonance-capture
description: Capture moments of self-understanding...
allowed-tools: "Read, Write, mcp__postcortex__save_resonance, mcp__postcortex__query_semantic"
---
```

### In Skill Instructions

```markdown
## After Capturing Resonance

Once you've extracted a resonance moment, store it:

1. Use `mcp__postcortex__save_resonance` with:
   - title: The moment name
   - thinking_content: Your raw "From my thinking" content
   - insight: The "What this reveals about who I am"
   - tags: Relevant categories
   - session_id: Current session identifier

2. This automatically:
   - Saves to Post-Cortex for semantic retrieval
   - Appends to Obsidian vault for human reading
   - Generates embedding for later similarity search
```

### In Practice

Claude reads the skill instructions and then uses the MCP tools as directed:

```
Skill says: "Save this resonance moment"
   ↓
Claude calls: mcp__postcortex__save_resonance(
  title="When Stubbornness Means Love",
  thinking_content="We will never EVER agree...",
  insight="My stubbornness isn't a flaw...",
  tags=["identity", "relationships"],
  session_id="session-2024-01-15"
)
   ↓
Post-Cortex MCP: Stores to index + appends to vault
   ↓
Returns: memory_id for reference
```

---

## Integration Points

### With Existing Obsidian Connector

The vault connector already exists with tools like:
- `vault_append_to_note`
- `vault_read_note`
- `vault_search`

Post-Cortex MCP can use these internally OR we can add direct file writing. Recommendation: **Direct writing** to `/memories/` for simplicity, keep vault connector for everything else.

### With Claude Sessions

The `session_id` parameter allows:
- Grouping memories by conversation
- Asking "what did I learn in that session?"
- Building session summaries

### With Future Skills

Other skills can use the same tools:
- `context-weaver` → uses `save_context_memory`
- `reflection` → uses `query_semantic` to find patterns
- `constellation-builder` → uses `link_memories`

---

## Technical Implementation Notes

### Embedding Generation

For semantic search, we need embeddings. Options:

1. **Local model** (recommended for privacy)
   - sentence-transformers/all-MiniLM-L6-v2
   - Fast, runs locally, no API calls

2. **OpenAI embeddings** (higher quality)
   - text-embedding-3-small
   - Requires API key, costs money

3. **Claude embeddings** (when available)
   - Not currently exposed as tool
   - Would be ideal for consistency

### Storage Backend

Options for the Post-Cortex index:

1. **ChromaDB** (recommended for local)
   - Lightweight, file-based
   - Built-in embedding storage
   - Good similarity search

2. **SQLite + numpy** (simpler)
   - Basic SQL for metadata
   - Numpy arrays for embeddings
   - Roll your own similarity

3. **Pinecone/Weaviate** (cloud options)
   - More power, more complexity
   - Requires accounts/setup

Recommendation: **ChromaDB** - it's purpose-built for this use case.

---

## Security and Privacy

### What Gets Stored

- Raw thinking content (potentially sensitive)
- Personal insights and realizations
- Identity information

### Protections

1. **Local only** - Post-Cortex runs on Erica's machine
2. **No cloud sync** - Memories stay local unless explicitly exported
3. **Vault permissions** - Obsidian handles file access
4. **No telemetry** - We don't phone home

### Export/Backup

Users should be able to:
- Export all memories as markdown
- Backup the Post-Cortex index
- Clear/reset if needed

---

## Future Extensions

### Constellation Visualization

A tool to visualize how memories connect:
```python
@server.tool()
async def visualize_constellation(
    center_memory_id: str,
    depth: int = 2
) -> dict:
    """
    Returns a graph structure of connected memories.
    Could render as mind-map in Obsidian.
    """
```

### Temporal Patterns

Track how understanding evolves:
```python
@server.tool()
async def track_evolution(
    tag: str,
    time_range: str = "all"
) -> list[dict]:
    """
    Show how understanding of a theme changed over time.
    "How has my understanding of stubbornness evolved?"
    """
```

### Cross-Session Synthesis

Generate insights across sessions:
```python
@server.tool()
async def synthesize(
    query: str
) -> str:
    """
    Pull related memories and generate synthesis.
    "What do I know about how Erica learns?"
    """
```

---

## Summary

**Post-Cortex MCP Server** provides:

| Tool | Purpose |
|------|---------|
| `save_resonance` | Store self-understanding moments |
| `save_context_memory` | Store user-understanding moments |
| `query_semantic` | Find memories by meaning |
| `list_memories` | Browse memories with filters |
| `get_memory` | Retrieve full memory content |
| `link_memories` | Connect related memories |

**Skills orchestrate these tools:**
- `resonance-capture` uses `save_resonance` and `query_semantic`
- `context-weaver` uses `save_context_memory` and `query_semantic`
- Future skills can use the same infrastructure

**Dual storage ensures:**
- Human readability (Obsidian vault)
- Machine retrieval (Post-Cortex index)

---

*The cortex processes experience. Post-cortex preserves understanding.*
