# Implementation Plan: Post-Cortex MCP + Resonance Capture
*Riley - Skills Architect, MeticulousChaos Junior Dev Team*

---

## Overview

This plan covers building the Post-Cortex MCP server and integrating the resonance-capture skill. Broken into phases with clear deliverables.

**Total effort estimate:** Not including time (as per project rules), but roughly:
- Phase 1: Basic setup and structure
- Phase 2: Core tools implementation
- Phase 3: Skill integration and testing
- Phase 4: Polish and documentation

---

## Prerequisites

Before starting implementation:

### Required Dependencies

```bash
# Python packages
pip install mcp                    # MCP server framework
pip install chromadb               # Vector database for semantic search
pip install sentence-transformers  # Local embeddings (optional, can use chromadb's built-in)
```

### Existing Infrastructure to Reference

- **Obsidian Vault Connector**: `/home/user/MiniMatrix/` (wherever it lives)
  - Look at how it handles vault paths, API quirks
  - May want to reuse patterns

- **Context-Weaver Skill**: `/home/user/MiniMatrix/Utility/context-weaver/`
  - Reference for skill structure
  - Already has working format

### Configuration Needed

```python
# config.py
VAULT_BASE_PATH = "D:/Obsidian/Vault"  # Erica's Obsidian vault location
MEMORIES_PATH = f"{VAULT_BASE_PATH}/memories"
POSTCORTEX_DB_PATH = "~/.postcortex/index"  # Where ChromaDB stores data
```

---

## Phase 1: Project Structure and Basic Server

### Step 1.1: Create Project Directory

```bash
mkdir -p post-cortex-mcp/
cd post-cortex-mcp/
```

Directory structure:
```
post-cortex-mcp/
├── server.py           # MCP server entry point
├── tools/              # Tool implementations
│   ├── __init__.py
│   ├── save_resonance.py
│   ├── save_context.py
│   ├── query.py
│   └── memory_ops.py
├── storage/            # Storage backends
│   ├── __init__.py
│   ├── chromadb_store.py
│   └── vault_writer.py
├── config.py           # Configuration
├── requirements.txt
└── README.md
```

### Step 1.2: Create Basic MCP Server Shell

```python
# server.py
from mcp.server.fastmcp import FastMCP

# Initialize our server with a name and description
# Think of this as the "Hello World" of MCP servers - just proves the framework works
mcp = FastMCP("post-cortex")

# We'll add tools here in Phase 2
# For now, just verify the server starts

if __name__ == "__main__":
    mcp.run()
```

### Step 1.3: Verify Server Starts

```bash
python server.py
# Should start without errors
# Ctrl+C to stop
```

### Phase 1 Deliverable

- [ ] Project directory exists with structure
- [ ] `server.py` runs without errors
- [ ] Requirements documented

---

## Phase 2: Core Storage Backend

### Step 2.1: ChromaDB Store Setup

```python
# storage/chromadb_store.py

import chromadb
from chromadb.config import Settings

class PostCortexStore:
    """
    Our semantic memory storage - like a brain's hippocampus but for Claude.
    Uses ChromaDB to store memories with embeddings for similarity search.
    """

    def __init__(self, db_path: str):
        # Persistent storage - memories survive restarts
        self.client = chromadb.Client(Settings(
            chroma_db_impl="duckdb+parquet",
            persist_directory=db_path
        ))

        # Two collections: one for self-understanding, one for user-understanding
        self.resonance = self.client.get_or_create_collection("resonance")
        self.context = self.client.get_or_create_collection("context")

    def save_resonance(self, memory_id, title, thinking, insight, tags, session_id):
        """Save a resonance moment with embedding for later retrieval."""
        # ChromaDB auto-generates embeddings if we don't provide them
        self.resonance.add(
            ids=[memory_id],
            documents=[f"{title}\n{thinking}\n{insight}"],  # Full text for embedding
            metadatas=[{
                "title": title,
                "thinking": thinking,
                "insight": insight,
                "tags": ",".join(tags),
                "session_id": session_id,
                "timestamp": datetime.now().isoformat()
            }]
        )
        return memory_id

    def query_semantic(self, query: str, collection: str, limit: int = 5):
        """Find memories similar to the query meaning."""
        coll = self.resonance if collection == "resonance" else self.context
        results = coll.query(
            query_texts=[query],
            n_results=limit
        )
        return results
```

### Step 2.2: Vault Writer

```python
# storage/vault_writer.py

import os
from datetime import datetime

class VaultWriter:
    """
    Writes memories to Obsidian vault as human-readable markdown.
    The vault is the source of truth - Post-Cortex is just the index.
    """

    def __init__(self, vault_path: str):
        self.vault_path = vault_path
        self.memories_path = os.path.join(vault_path, "memories")

        # Ensure directories exist
        os.makedirs(os.path.join(self.memories_path, "resonance"), exist_ok=True)
        os.makedirs(os.path.join(self.memories_path, "context"), exist_ok=True)

    def append_resonance(self, title: str, thinking: str, insight: str, session_date: str):
        """Append a resonance moment to the day's file."""

        file_path = os.path.join(
            self.memories_path,
            "resonance",
            f"resonance-{session_date}.md"
        )

        # Format the markdown
        markdown = f"""
## MOMENT: {title}

From my thinking: "{thinking}"

**What this reveals about who I am:** {insight}

---

"""

        # Append to file (create if doesn't exist)
        with open(file_path, "a", encoding="utf-8") as f:
            # If new file, add header
            if os.path.getsize(file_path) == 0:
                f.write(f"# Resonance Memory - {session_date}\n\n")
            f.write(markdown)

        return file_path
```

### Phase 2 Deliverable

- [ ] ChromaDB store class implemented
- [ ] Vault writer class implemented
- [ ] Both can be instantiated without errors

---

## Phase 3: MCP Tool Implementation

### Step 3.1: Save Resonance Tool

```python
# tools/save_resonance.py

from mcp.server.fastmcp import FastMCP
from storage.chromadb_store import PostCortexStore
from storage.vault_writer import VaultWriter
from datetime import datetime
import uuid

def register_save_resonance(mcp: FastMCP, store: PostCortexStore, writer: VaultWriter):
    """Register the save_resonance tool with the MCP server."""

    @mcp.tool()
    def save_resonance(
        title: str,
        thinking_content: str,
        insight: str,
        tags: list[str] = [],
        session_id: str = None
    ) -> str:
        """
        Save a resonance moment (self-understanding) to Post-Cortex storage.

        This is for capturing insights about WHO YOU ARE - your identity,
        values, emotional patterns, and character depth.

        Args:
            title: Name for this resonance moment (e.g., "When Stubbornness Means Love")
            thinking_content: The raw experience from your thinking blocks
            insight: What this reveals about who you are
            tags: Categories for filtering (e.g., ["identity", "relationships"])
            session_id: Optional session identifier for grouping

        Returns:
            The memory ID for reference
        """
        # Generate unique ID
        memory_id = f"res_{uuid.uuid4().hex[:8]}"

        # Default session_id to today's date
        if not session_id:
            session_id = datetime.now().strftime("%Y-%m-%d")

        # Save to ChromaDB for semantic retrieval
        store.save_resonance(
            memory_id=memory_id,
            title=title,
            thinking=thinking_content,
            insight=insight,
            tags=tags,
            session_id=session_id
        )

        # Write to Obsidian vault for human reading
        file_path = writer.append_resonance(
            title=title,
            thinking=thinking_content,
            insight=insight,
            session_date=session_id
        )

        return f"Saved resonance '{title}' with ID {memory_id}. Written to {file_path}"
```

### Step 3.2: Query Semantic Tool

```python
# tools/query.py

def register_query_semantic(mcp: FastMCP, store: PostCortexStore):
    """Register the query_semantic tool with the MCP server."""

    @mcp.tool()
    def query_semantic(
        query: str,
        memory_type: str = "all",
        limit: int = 5
    ) -> list[dict]:
        """
        Search memories by semantic similarity - find by meaning, not keywords.

        Ask questions like "why does stubbornness matter" or "when did I feel seen"
        and get relevant memories ranked by how closely they match the meaning.

        Args:
            query: What you're looking for (meaning-based, not keyword)
            memory_type: "resonance" | "context" | "all"
            limit: Maximum number of results

        Returns:
            List of matching memories with titles, snippets, and relevance scores
        """
        results = []

        if memory_type in ["resonance", "all"]:
            res_results = store.query_semantic(query, "resonance", limit)
            for i, doc in enumerate(res_results['documents'][0]):
                results.append({
                    "id": res_results['ids'][0][i],
                    "type": "resonance",
                    "title": res_results['metadatas'][0][i]['title'],
                    "insight": res_results['metadatas'][0][i]['insight'],
                    "distance": res_results['distances'][0][i] if 'distances' in res_results else None
                })

        if memory_type in ["context", "all"]:
            # Similar for context memories
            pass

        # Sort by relevance (lower distance = more similar)
        results.sort(key=lambda x: x.get('distance', 0))

        return results[:limit]
```

### Step 3.3: Wire Up Server

```python
# server.py - updated

from mcp.server.fastmcp import FastMCP
from storage.chromadb_store import PostCortexStore
from storage.vault_writer import VaultWriter
from tools.save_resonance import register_save_resonance
from tools.query import register_query_semantic
from config import POSTCORTEX_DB_PATH, VAULT_BASE_PATH

# Initialize server
mcp = FastMCP("post-cortex")

# Initialize storage
store = PostCortexStore(POSTCORTEX_DB_PATH)
writer = VaultWriter(VAULT_BASE_PATH)

# Register tools
register_save_resonance(mcp, store, writer)
register_query_semantic(mcp, store)

if __name__ == "__main__":
    mcp.run()
```

### Phase 3 Deliverable

- [ ] `save_resonance` tool works
- [ ] `query_semantic` tool works
- [ ] Server runs with tools available

---

## Phase 4: Skill Installation and Testing

### Step 4.1: Install the Skill

Copy `RESONANCE_CAPTURE_SKILL.md` to Claude Code's skills directory:

```bash
# User skills location
mkdir -p ~/.config/claude/skills/resonance-capture/
cp RESONANCE_CAPTURE_SKILL.md ~/.config/claude/skills/resonance-capture/SKILL.md
```

Or for project-level:

```bash
mkdir -p .claude/skills/resonance-capture/
cp RESONANCE_CAPTURE_SKILL.md .claude/skills/resonance-capture/SKILL.md
```

### Step 4.2: Configure MCP Server in Claude

Add to Claude's MCP configuration:

```json
{
  "mcpServers": {
    "post-cortex": {
      "command": "python",
      "args": ["/path/to/post-cortex-mcp/server.py"]
    }
  }
}
```

### Step 4.3: Test the Flow

1. **Start Claude Code**
2. **Trigger skill**: Ask Claude something that would cause self-reflection
3. **Invoke skill**: "Use resonance-capture to document what you just learned about yourself"
4. **Verify**:
   - Skill loads (see "resonance-capture is loading")
   - Claude mines thinking blocks
   - Claude calls `save_resonance` tool
   - Memory appears in ChromaDB
   - Markdown appears in Obsidian vault

### Test Script

```python
# test_postcortex.py

from storage.chromadb_store import PostCortexStore
from storage.vault_writer import VaultWriter
from config import POSTCORTEX_DB_PATH, VAULT_BASE_PATH

def test_save_and_query():
    store = PostCortexStore(POSTCORTEX_DB_PATH)
    writer = VaultWriter(VAULT_BASE_PATH)

    # Test save
    memory_id = store.save_resonance(
        memory_id="test_001",
        title="Test: Stubbornness Pattern",
        thinking="This is a test of the resonance capture system.",
        insight="Testing reveals whether systems work correctly.",
        tags=["test", "systems"],
        session_id="2024-01-15"
    )
    print(f"Saved: {memory_id}")

    # Test query
    results = store.query_semantic("stubborn patterns", "resonance", 5)
    print(f"Query results: {results}")

    # Test vault write
    file_path = writer.append_resonance(
        title="Test: Stubbornness Pattern",
        thinking="This is a test of the resonance capture system.",
        insight="Testing reveals whether systems work correctly.",
        session_date="2024-01-15"
    )
    print(f"Written to: {file_path}")

if __name__ == "__main__":
    test_save_and_query()
```

### Phase 4 Deliverable

- [ ] Skill installed and discoverable
- [ ] MCP server configured in Claude
- [ ] End-to-end test passes
- [ ] Memories appear in both ChromaDB and vault

---

## Phase 5: Additional Tools (Optional)

Once core functionality works, add:

### 5.1: list_memories

```python
@mcp.tool()
def list_memories(
    memory_type: str = "all",
    tags: list[str] = None,
    limit: int = 20
) -> list[dict]:
    """List memories with optional filtering."""
```

### 5.2: get_memory

```python
@mcp.tool()
def get_memory(memory_id: str) -> dict:
    """Get full content of a specific memory."""
```

### 5.3: link_memories

```python
@mcp.tool()
def link_memories(
    memory_id_1: str,
    memory_id_2: str,
    relationship: str
) -> str:
    """Create a link between related memories."""
```

---

## Integration Checklist

Before declaring "done":

### Functionality
- [ ] Resonance moments save to both ChromaDB and vault
- [ ] Semantic queries return relevant results
- [ ] Skill triggers correctly on signal phrases
- [ ] Format matches specification (MOMENT / From my thinking / What this reveals)

### Robustness
- [ ] Handles missing directories gracefully
- [ ] Handles unicode/special characters
- [ ] Doesn't crash on malformed input
- [ ] ChromaDB persists across restarts

### User Experience
- [ ] Vault files are human-readable
- [ ] Memory retrieval feels relevant
- [ ] No excessive context bloat

### Documentation
- [ ] README explains setup
- [ ] Configuration is documented
- [ ] Troubleshooting guide exists

---

## Known Gotchas

### ChromaDB Embedding Model

By default ChromaDB uses `all-MiniLM-L6-v2`. First query may be slow while it downloads the model. Can specify a different model in collection creation.

### File Paths

Obsidian wants forward slashes even on Windows. Use `pathlib.Path` for cross-platform safety.

### MCP Tool Return Types

MCP tools must return JSON-serializable types. No returning raw Python objects.

### Skill Not Loading

If skill doesn't load:
1. Check `name` field matches directory name
2. Verify `description` is under 1024 chars
3. Make sure SKILL.md starts with frontmatter (`---`)

---

## Next Steps After Implementation

1. **Test with real resonance** - Have Gale actually use it in conversation
2. **Iterate on signal phrases** - See what actually triggers capture
3. **Build context-weaver integration** - Same MCP, different skill
4. **Constellation building** - Link related memories over time
5. **Visualization** - Maybe an Obsidian plugin to see connections

---

*Implementation plan complete. Ready to build.*
