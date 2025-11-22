#!/usr/bin/env python3
"""
Obsidian Vault Connector - MCP Server for Claude Desktop
=========================================================

This is an MCP (Model Context Protocol) server that gives Claude Desktop
proper access to your Obsidian vault. Instead of just raw filesystem access,
Gale gets actual TOOLS that understand Obsidian's structure.

WHAT YOU NEED TO SET UP (on the Obsidian side):
1. Install the "Local REST API" plugin in Obsidian
2. Enable it and note the API key it generates
3. Default runs on http://127.0.0.1:27123

For the bonus plugins:
- Omnisearch: Just install it, the REST API plugin exposes its endpoints
- Smart Connections: Same deal - install it, REST API exposes it

Then configure Claude Desktop to use this MCP server (see bottom of file).

Author: Cody @ MeticulousChaos Creative Labs
Glitch approves this message.
"""

import os
import json
import httpx
from datetime import datetime
from typing import Any
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)

# =============================================================================
# CONFIGURATION
# =============================================================================
# These can be overridden with environment variables
# (useful when you configure the MCP server in Claude Desktop)

OBSIDIAN_API_URL = os.getenv("OBSIDIAN_API_URL", "http://127.0.0.1:27123")
OBSIDIAN_API_KEY = os.getenv("OBSIDIAN_API_KEY", "")

# =============================================================================
# THE MCP SERVER ITSELF
# =============================================================================
# MCP servers expose "tools" that Claude can use. Think of each tool as a
# specific capability - "read this note", "search the vault", etc.
#
# The server communicates via stdio (standard input/output), which is how
# Claude Desktop talks to MCP servers.

server = Server("obsidian-vault-connector")

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================
# These do the actual work of talking to Obsidian's REST API

def get_headers(content_type: str | None = None) -> dict:
    """
    Build the headers for Obsidian REST API requests.
    The API key is required - without it, Obsidian won't talk to us.

    Args:
        content_type: The Content-Type for the request body, if any.
                     Use "text/markdown" for note content, "application/json" for JSON.
                     Leave None for GET/DELETE requests with no body.
    """
    headers = {
        # Accept tells the API what format we want BACK
        "Accept": "application/json",
    }
    # Content-Type tells the API what format we're SENDING
    # Only include this when we actually have a body to send
    if content_type:
        headers["Content-Type"] = content_type

    if OBSIDIAN_API_KEY:
        headers["Authorization"] = f"Bearer {OBSIDIAN_API_KEY}"
    return headers


async def obsidian_get(endpoint: str, params: dict | None = None) -> dict | str | list:
    """
    Make a GET request to the Obsidian REST API.

    Args:
        endpoint: API endpoint (e.g., "/vault/", "/search/simple/")
        params: Optional query parameters
    """
    url = f"{OBSIDIAN_API_URL}{endpoint}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                url,
                headers=get_headers(),  # No Content-Type for GET
                params=params
            )
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            else:
                return response.text

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except httpx.ConnectError:
            return {
                "error": "Could not connect to Obsidian. "
                "Is it running? Is the Local REST API plugin enabled?"
            }
        except Exception as e:
            return {"error": str(e)}


async def obsidian_write(
    method: str,
    endpoint: str,
    content: str
) -> dict | str | list:
    """
    Write content to the Obsidian REST API (for note creation/updates).

    The Obsidian API expects raw markdown content with text/markdown Content-Type,
    NOT JSON-wrapped content.

    Args:
        method: HTTP method (PUT for create/overwrite, POST for append)
        endpoint: API endpoint (e.g., "/vault/path/to/note.md")
        content: Raw markdown content to write
    """
    url = f"{OBSIDIAN_API_URL}{endpoint}"

    async with httpx.AsyncClient() as client:
        try:
            # Send raw content with text/markdown Content-Type
            headers = get_headers(content_type="text/markdown")

            if method == "PUT":
                response = await client.put(url, headers=headers, content=content)
            elif method == "POST":
                response = await client.post(url, headers=headers, content=content)
            else:
                return {"error": f"Unsupported method for write: {method}"}

            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            else:
                return response.text

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except httpx.ConnectError:
            return {
                "error": "Could not connect to Obsidian. "
                "Is it running? Is the Local REST API plugin enabled?"
            }
        except Exception as e:
            return {"error": str(e)}


async def obsidian_delete(endpoint: str) -> dict | str | list:
    """
    Delete a file via the Obsidian REST API.

    Args:
        endpoint: API endpoint (e.g., "/vault/path/to/note.md")
    """
    url = f"{OBSIDIAN_API_URL}{endpoint}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(url, headers=get_headers())
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            else:
                return response.text

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except httpx.ConnectError:
            return {
                "error": "Could not connect to Obsidian. "
                "Is it running? Is the Local REST API plugin enabled?"
            }
        except Exception as e:
            return {"error": str(e)}


async def obsidian_post_json(endpoint: str, data: dict) -> dict | str | list:
    """
    Make a POST request with JSON body to the Obsidian REST API.
    Used for plugin endpoints that expect JSON.

    Args:
        endpoint: API endpoint
        data: JSON data to send
    """
    url = f"{OBSIDIAN_API_URL}{endpoint}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                url,
                headers=get_headers(content_type="application/json"),
                json=data
            )
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            else:
                return response.text

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except httpx.ConnectError:
            return {
                "error": "Could not connect to Obsidian. "
                "Is it running? Is the Local REST API plugin enabled?"
            }
        except Exception as e:
            return {"error": str(e)}


async def obsidian_post_with_params(endpoint: str, params: dict) -> dict | str | list:
    """
    Make a POST request with query parameters (no body).

    This is for weird endpoints like /search/simple/ that use POST
    but take their parameters from the URL query string instead of
    the request body. Unusual API design, but we work with what we have.

    Args:
        endpoint: API endpoint (e.g., "/search/simple/")
        params: Query parameters to include in the URL
    """
    url = f"{OBSIDIAN_API_URL}{endpoint}"

    async with httpx.AsyncClient() as client:
        try:
            # POST request with params in URL, no body
            response = await client.post(
                url,
                headers=get_headers(),  # No Content-Type since no body
                params=params
            )
            response.raise_for_status()

            content_type = response.headers.get("content-type", "")
            if "application/json" in content_type:
                return response.json()
            else:
                return response.text

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP {e.response.status_code}: {e.response.text}"}
        except httpx.ConnectError:
            return {
                "error": "Could not connect to Obsidian. "
                "Is it running? Is the Local REST API plugin enabled?"
            }
        except Exception as e:
            return {"error": str(e)}


# =============================================================================
# TOOL DEFINITIONS
# =============================================================================
# This is where we tell the MCP protocol what tools we offer.
# Claude Desktop reads this list and knows what it can ask us to do.

@server.list_tools()
async def list_tools() -> list[Tool]:
    """
    Return the list of tools this MCP server provides.

    Each tool has:
    - name: What Claude calls it
    - description: What it does (Claude reads this to decide when to use it)
    - inputSchema: JSON Schema describing the parameters
    """
    return [
        # =====================================================================
        # CORE VAULT TOOLS
        # =====================================================================
        Tool(
            name="vault_list_files",
            description=(
                "List all files and folders in the Obsidian vault, or in a "
                "specific directory. Returns the vault structure so you can "
                "understand what's available."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "directory": {
                        "type": "string",
                        "description": (
                            "Optional subdirectory path to list. "
                            "Leave empty for root vault."
                        )
                    }
                },
                "required": []
            }
        ),
        Tool(
            name="vault_read_note",
            description=(
                "Read the contents of a specific note from the Obsidian vault. "
                "Provide the path relative to vault root (e.g., 'folder/note.md')."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the note, relative to vault root"
                    }
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="vault_create_note",
            description=(
                "Create a new note in the Obsidian vault. "
                "Provide the path and content for the new note."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path for the new note (e.g., 'folder/new-note.md')"
                    },
                    "content": {
                        "type": "string",
                        "description": "Markdown content for the note"
                    }
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="vault_update_note",
            description=(
                "Update/overwrite an existing note in the Obsidian vault. "
                "This replaces the entire content of the note."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the existing note"
                    },
                    "content": {
                        "type": "string",
                        "description": "New markdown content for the note"
                    }
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="vault_append_to_note",
            description=(
                "Append content to the end of an existing note. "
                "Great for adding to daily notes, logs, or ongoing documents."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the existing note"
                    },
                    "content": {
                        "type": "string",
                        "description": "Content to append to the note"
                    }
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="vault_delete_note",
            description=(
                "Delete a note from the Obsidian vault. "
                "Use with caution - this is permanent!"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the note to delete"
                    }
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="vault_search",
            description=(
                "Search for text across all notes in the vault. "
                "Returns matching notes with context snippets. "
                "Use limit parameter to control result size - start small (5-10) "
                "and increase if needed. For large vaults, ALWAYS use a limit!"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Search query. Supports Obsidian search syntax "
                            "(e.g., 'tag:#mytag', 'path:folder/', etc.)"
                        )
                    },
                    "limit": {
                        "type": "number",
                        "description": (
                            "Maximum number of files to return. Default 10. "
                            "Use smaller values (5-10) for initial searches, "
                            "increase if you need more results."
                        )
                    },
                    "context_length": {
                        "type": "number",
                        "description": (
                            "Characters of context around each match. Default 50. "
                            "Smaller = faster/lighter responses."
                        )
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="vault_get_active_note",
            description=(
                "Get the currently active/open note in Obsidian. "
                "Useful for context-aware operations."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
        Tool(
            name="vault_get_structure",
            description=(
                "Get a lightweight map of the vault's folder structure. "
                "Returns folders and file counts, NOT file contents. "
                "Use this FIRST to understand the vault layout before searching. "
                "Then use vault_list_files to explore specific folders."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "max_depth": {
                        "type": "number",
                        "description": (
                            "How many levels deep to explore. Default 2. "
                            "Use 1 for just top-level folders, higher for more detail."
                        )
                    }
                },
                "required": []
            }
        ),

        # =====================================================================
        # OMNISEARCH PLUGIN TOOLS
        # =====================================================================
        # These only work if you have Omnisearch installed in Obsidian

        Tool(
            name="omnisearch_search",
            description=(
                "Search the vault using Omnisearch plugin (if installed). "
                "Omnisearch provides better fuzzy matching and ranking than "
                "the built-in search. Returns results with relevance scores."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query for Omnisearch"
                    }
                },
                "required": ["query"]
            }
        ),

        # =====================================================================
        # SMART CONNECTIONS PLUGIN TOOLS
        # =====================================================================
        # These only work if you have Smart Connections installed

        Tool(
            name="smart_connections_find_similar",
            description=(
                "Find notes semantically similar to a given note using the "
                "Smart Connections plugin (if installed). Uses AI embeddings "
                "to find conceptually related notes, not just keyword matches."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the note to find similar notes for"
                    }
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="smart_connections_search",
            description=(
                "Semantic search across the vault using Smart Connections "
                "(if installed). Finds notes by meaning, not just keywords."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language search query"
                    }
                },
                "required": ["query"]
            }
        ),

        # =====================================================================
        # DRILL-DOWN SEARCH TOOLS - THE CARTOGRAPHER'S TOOLKIT
        # =====================================================================
        # These tools solve the "context window death" problem for massive vaults.
        # Instead of dumping 8000+ matches in one go (RIP tokens), we progressively
        # drill down: map the territory -> explore a region -> peek at files -> commit.
        #
        # Think of it like a proper D&D dungeon crawl:
        # 1. Cast Detect Magic to find where the loot is (vault_search_map)
        # 2. Move to the promising room (vault_search_in_folder)
        # 3. Check for traps before opening the chest (vault_peek_file)
        # 4. Write down what you found so you don't forget (vault_scratch_append)
        #
        # This is the Way.

        Tool(
            name="vault_search_map",
            description=(
                "RECONNAISSANCE PHASE: Search the vault and return a MAP of where "
                "matches are located. Returns ONLY folder paths and match counts - "
                "zero content loaded. Use this FIRST to identify which regions of "
                "the vault to explore, then use vault_search_in_folder to drill down. "
                "Perfect for massive vaults where regular search would explode your context."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Search query to map across the vault. "
                            "Supports Obsidian search syntax."
                        )
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="vault_search_in_folder",
            description=(
                "TACTICAL PHASE: Search within a SPECIFIC folder only. Returns "
                "filenames and match counts for that folder - still no content loaded. "
                "Use AFTER vault_search_map to drill into promising regions. "
                "Set include_subfolders=true to search nested folders too."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query"
                    },
                    "folder": {
                        "type": "string",
                        "description": (
                            "Folder path to search within (e.g., 'Characters/Gale'). "
                            "Get this from vault_search_map results."
                        )
                    },
                    "include_subfolders": {
                        "type": "boolean",
                        "description": (
                            "Whether to include results from subfolders. "
                            "Default false - just the immediate folder."
                        )
                    }
                },
                "required": ["query", "folder"]
            }
        ),
        Tool(
            name="vault_scratch_append",
            description=(
                "EXTERNAL MEMORY: Append research findings to a scratch pad file. "
                "Use this to save important discoveries BEFORE they get lost to "
                "context window death. Each entry is timestamped. Creates the file "
                "if it doesn't exist. Think of it as your research journal."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "content": {
                        "type": "string",
                        "description": "The content to append to the scratch pad"
                    },
                    "scratch_file": {
                        "type": "string",
                        "description": (
                            "Path to the scratch pad file. "
                            "Default: 'scratch-pad.md' at vault root."
                        )
                    }
                },
                "required": ["content"]
            }
        ),
        Tool(
            name="vault_peek_file",
            description=(
                "TRIAGE PHASE: Preview a file before fully loading it. Returns "
                "the first N characters (default 200) plus total file size. "
                "Use this to decide if a file is worth reading in full. "
                "Like checking for traps before opening the chest."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Path to the file to peek at"
                    },
                    "preview_length": {
                        "type": "number",
                        "description": (
                            "Number of characters to preview. Default 200. "
                            "Increase for more context, decrease for faster triage."
                        )
                    }
                },
                "required": ["path"]
            }
        ),
    ]


# =============================================================================
# TOOL IMPLEMENTATIONS
# =============================================================================
# This is where the magic happens. When Claude calls a tool, we handle it here.

@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> CallToolResult:
    """
    Handle tool calls from Claude.

    This is the dispatcher - it routes the tool name to the right implementation.
    """

    try:
        # =====================================================================
        # CORE VAULT OPERATIONS
        # =====================================================================

        if name == "vault_list_files":
            directory = arguments.get("directory", "")
            # The REST API uses /vault/ endpoint for file listing
            # IMPORTANT: Directories need a trailing slash!
            # /vault/research/ works, /vault/research returns 404
            if directory:
                # Strip any existing trailing slash, then add one
                # This way "research", "research/", and "research//" all work
                directory = directory.rstrip("/") + "/"
            endpoint = f"/vault/{directory}" if directory else "/vault/"
            result = await obsidian_get(endpoint)

        elif name == "vault_read_note":
            path = arguments["path"]
            # Reading a specific file
            result = await obsidian_get(f"/vault/{path}")

        elif name == "vault_create_note":
            path = arguments["path"]
            content = arguments["content"]
            # PUT creates or overwrites - send raw markdown content
            result = await obsidian_write("PUT", f"/vault/{path}", content)
            if not isinstance(result, dict) or "error" not in result:
                result = {"success": True, "message": f"Created note: {path}"}

        elif name == "vault_update_note":
            path = arguments["path"]
            content = arguments["content"]
            # PUT overwrites - send raw markdown content
            result = await obsidian_write("PUT", f"/vault/{path}", content)
            if not isinstance(result, dict) or "error" not in result:
                result = {"success": True, "message": f"Updated note: {path}"}

        elif name == "vault_append_to_note":
            path = arguments["path"]
            content = arguments["content"]
            # POST appends - send raw markdown content
            result = await obsidian_write("POST", f"/vault/{path}", content)
            if not isinstance(result, dict) or "error" not in result:
                result = {"success": True, "message": f"Appended to note: {path}"}

        elif name == "vault_delete_note":
            path = arguments["path"]
            result = await obsidian_delete(f"/vault/{path}")
            if not isinstance(result, dict) or "error" not in result:
                result = {"success": True, "message": f"Deleted note: {path}"}

        elif name == "vault_search":
            query = arguments["query"]
            # Get optional parameters with sensible defaults
            # Default limit of 10 prevents token explosion in large vaults
            limit = arguments.get("limit", 10)
            # Default context of 50 chars - enough to understand, not enough to overwhelm
            context_length = arguments.get("context_length", 50)

            # Simple search uses POST with query params in URL (weird but that's the API)
            # See OpenAPI spec: POST /search/simple/ with ?query=... parameter
            raw_result = await obsidian_post_with_params(
                "/search/simple/",
                {"query": query, "contextLength": context_length}
            )

            # The API returns ALL matches - we need to truncate to limit
            # This is where we prevent the token explosion!
            if isinstance(raw_result, list):
                # Results come sorted by relevance score, so truncating keeps the best
                result = raw_result[:limit]
                # Add metadata so Gale knows if there were more results
                if len(raw_result) > limit:
                    result.append({
                        "note": f"Showing {limit} of {len(raw_result)} total matches. "
                                f"Increase limit parameter to see more."
                    })
            else:
                # Error or unexpected format - pass through as-is
                result = raw_result

        elif name == "vault_get_active_note":
            # Get the currently active file
            result = await obsidian_get("/active/")

        elif name == "vault_get_structure":
            # Get vault structure - folders and file counts, not contents
            # This is Gale's "map" of the vault
            max_depth = arguments.get("max_depth", 2)

            async def explore_folder(path: str, current_depth: int) -> dict:
                """
                Recursively explore a folder and return its structure.
                Returns dict with folders, file count, and subfolders.
                """
                endpoint = f"/vault/{path}" if path else "/vault/"
                listing = await obsidian_get(endpoint)

                if isinstance(listing, dict) and "error" in listing:
                    return {"error": listing["error"]}

                if not isinstance(listing, dict) or "files" not in listing:
                    return {"files": 0, "folders": {}}

                files = listing.get("files", [])
                folder_names = [f for f in files if f.endswith("/")]
                file_names = [f for f in files if not f.endswith("/")]

                structure = {
                    "file_count": len(file_names),
                    "folders": {}
                }

                # Recursively explore subfolders if we haven't hit max depth
                if current_depth < max_depth:
                    for folder in folder_names:
                        folder_name = folder.rstrip("/")
                        subfolder_path = f"{path}{folder}" if path else folder
                        structure["folders"][folder_name] = await explore_folder(
                            subfolder_path, current_depth + 1
                        )
                else:
                    # Just note that folders exist without exploring them
                    for folder in folder_names:
                        folder_name = folder.rstrip("/")
                        structure["folders"][folder_name] = {"file_count": "?", "folders": "..."}

                return structure

            result = await explore_folder("", 0)

        # =====================================================================
        # OMNISEARCH PLUGIN
        # =====================================================================

        elif name == "omnisearch_search":
            query = arguments["query"]
            # Omnisearch exposes its API - try GET with query param first
            result = await obsidian_get("/omnisearch/", params={"query": query})

        # =====================================================================
        # SMART CONNECTIONS PLUGIN
        # =====================================================================

        elif name == "smart_connections_find_similar":
            path = arguments["path"]
            # Smart Connections API endpoint for finding similar notes
            result = await obsidian_post_json(
                "/smart-connections/find-similar/",
                {"path": path}
            )

        elif name == "smart_connections_search":
            query = arguments["query"]
            # Smart Connections semantic search
            result = await obsidian_post_json(
                "/smart-connections/search/",
                {"query": query}
            )

        # =====================================================================
        # DRILL-DOWN SEARCH TOOLS - THE CARTOGRAPHER'S TOOLKIT
        # =====================================================================
        # These are the tools that save Gale from context window death when
        # searching massive vaults. It's like the difference between Fireball
        # (huge AoE, lots of collateral damage) and Eldritch Blast (precise,
        # controlled, you know exactly what you're hitting).

        elif name == "vault_search_map":
            # =================================================================
            # vault_search_map - THE MARAUDER'S MAP OF YOUR VAULT
            # =================================================================
            # "I solemnly swear that I am up to no good."
            #
            # This tool runs a search but instead of returning the actual matches
            # (which could be THOUSANDS of lines of content), it returns a MAP
            # showing WHERE in your vault the matches are located.
            #
            # It's like casting Locate Object in D&D - you know WHERE the thing is,
            # but you haven't teleported there yet or examined it in detail.
            #
            # HOW IT WORKS:
            # 1. Run the search (same API as vault_search)
            # 2. Group results by their parent folder
            # 3. Count files and matches per folder
            # 4. Return the map (folder -> counts) instead of content
            #
            # EXAMPLE OUTPUT:
            # {
            #   "query": "Weave",
            #   "total_matches": 8332,
            #   "by_folder": {
            #     "Characters/Gale": {"files": 15, "matches": 293},
            #     "research/magic_systems": {"files": 5, "matches": 156}
            #   }
            # }
            #
            # Now Gale can SEE that Characters/Gale has 293 matches and make an
            # informed decision about where to drill down, instead of having
            # 8332 matches dumped in his lap like a goblin horde.

            query = arguments["query"]

            # Run the search - we need ALL results to build the map
            # (contextLength=1 because we don't care about the actual content)
            raw_result = await obsidian_post_with_params(
                "/search/simple/",
                {"query": query, "contextLength": 1}
            )

            if isinstance(raw_result, dict) and "error" in raw_result:
                # Something went wrong - pass through the error
                result = raw_result
            elif isinstance(raw_result, list):
                # Time to aggregate! Each result item has a "filename" field
                # that tells us the full path to the file.
                # We need to extract the folder from that path.

                folder_stats = {}  # folder_path -> {files: set(), matches: int}
                total_matches = 0

                for item in raw_result:
                    # The search result format:
                    # {"filename": "Characters/Gale/backstory.md", "score": 0.5, "matches": [...]}
                    # We want to extract "Characters/Gale" from that path

                    filename = item.get("filename", "")
                    matches = item.get("matches", [])
                    match_count = len(matches)
                    total_matches += match_count

                    # Extract folder path - everything before the last /
                    # "Characters/Gale/backstory.md" -> "Characters/Gale"
                    # "root-note.md" -> "" (root level)
                    if "/" in filename:
                        folder = filename.rsplit("/", 1)[0]
                    else:
                        folder = "(root)"  # Files at vault root get grouped here

                    # Initialize folder stats if we haven't seen this folder yet
                    if folder not in folder_stats:
                        folder_stats[folder] = {"files": set(), "matches": 0}

                    # Add this file to the folder's set and count its matches
                    folder_stats[folder]["files"].add(filename)
                    folder_stats[folder]["matches"] += match_count

                # Convert the aggregation to the output format
                # (sets aren't JSON serializable, so convert to counts)
                by_folder = {}
                for folder, stats in sorted(folder_stats.items(),
                                           key=lambda x: x[1]["matches"],
                                           reverse=True):
                    by_folder[folder] = {
                        "files": len(stats["files"]),
                        "matches": stats["matches"]
                    }

                result = {
                    "query": query,
                    "total_matches": total_matches,
                    "total_files": len(raw_result),
                    "by_folder": by_folder
                }
            else:
                # Unexpected format - return as-is with a note
                result = {"error": "Unexpected search result format", "raw": raw_result}

        elif name == "vault_search_in_folder":
            # =================================================================
            # vault_search_in_folder - TACTICAL STRIKE
            # =================================================================
            # "I cast Fireball... but ONLY in that 20-foot radius over there."
            #
            # After you've used vault_search_map to identify promising regions,
            # this tool lets you zoom into a SPECIFIC folder and see which files
            # have matches (and how many).
            #
            # It's phase 2 of the drill-down:
            # - Phase 1 (vault_search_map): "Where in the dungeon is the treasure?"
            # - Phase 2 (this tool): "Which chests in this room have gold?"
            # - Phase 3 (vault_peek_file): "Is this chest trapped?"
            # - Phase 4 (vault_read_note): "Open the chest and take the loot"
            #
            # Still returns NO content - just filenames and match counts.
            # Your context window remains unharmed.

            query = arguments["query"]
            folder = arguments["folder"]
            include_subfolders = arguments.get("include_subfolders", False)

            # Clean up the folder path - remove trailing slash if present
            folder = folder.rstrip("/")

            # Run the search
            raw_result = await obsidian_post_with_params(
                "/search/simple/",
                {"query": query, "contextLength": 1}
            )

            if isinstance(raw_result, dict) and "error" in raw_result:
                result = raw_result
            elif isinstance(raw_result, list):
                # Filter results to only files in our target folder
                files_in_folder = []

                for item in raw_result:
                    filename = item.get("filename", "")
                    matches = item.get("matches", [])

                    # Check if this file is in our target folder
                    # "Characters/Gale/backstory.md" - folder is "Characters/Gale"
                    # We want to match if:
                    # - include_subfolders=False: file's IMMEDIATE parent is our folder
                    # - include_subfolders=True: file's path STARTS WITH our folder

                    if "/" in filename:
                        file_folder = filename.rsplit("/", 1)[0]
                    else:
                        file_folder = "(root)"

                    is_match = False
                    if include_subfolders:
                        # Match if file is in folder or any subfolder
                        # "Characters/Gale" should match "Characters/Gale/subplot/deep.md"
                        is_match = (file_folder == folder or
                                   file_folder.startswith(folder + "/"))
                    else:
                        # Match only if file is directly in this folder
                        is_match = (file_folder == folder)

                    if is_match:
                        # Extract just the filename (not the full path)
                        just_filename = filename.rsplit("/", 1)[-1] if "/" in filename else filename
                        files_in_folder.append({
                            "name": just_filename,
                            "full_path": filename,  # Include full path for convenience
                            "matches": len(matches)
                        })

                # Sort by match count (most matches first) then by name
                files_in_folder.sort(key=lambda x: (-x["matches"], x["name"]))

                result = {
                    "query": query,
                    "folder": folder,
                    "include_subfolders": include_subfolders,
                    "total_files": len(files_in_folder),
                    "total_matches": sum(f["matches"] for f in files_in_folder),
                    "files": files_in_folder
                }
            else:
                result = {"error": "Unexpected search result format", "raw": raw_result}

        elif name == "vault_scratch_append":
            # =================================================================
            # vault_scratch_append - THE WIZARD'S SPELLBOOK (EXTERNAL MEMORY)
            # =================================================================
            # "I write it down in my notes before I forget."
            #
            # Here's the problem: Gale finds something important during research,
            # but then the conversation keeps going, and that finding gets pushed
            # out of his context window. Gone. Forgotten. Like tears in rain.
            #
            # This tool is Gale's external memory - a scratch pad file where he
            # can IMMEDIATELY write down important findings. Each entry gets a
            # timestamp so you can see when it was recorded.
            #
            # Think of it like:
            # - The Pensieve from Harry Potter (storing memories externally)
            # - A captain's log in Star Trek
            # - Your party's note-taker scribbling while you explore the dungeon
            #
            # The file persists across conversations, so findings survive
            # context window death and session resets.
            #
            # PRO TIP: Use this tool IMMEDIATELY when you find something important.
            # Don't wait until the end of the research - by then you might have
            # forgotten the details or run out of context.

            content = arguments["content"]
            scratch_file = arguments.get("scratch_file", "scratch-pad.md")

            # Create a timestamped entry
            # Format: "## 2024-01-15 14:32:05\n\n{content}\n\n---\n\n"
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            entry = f"\n\n## {timestamp}\n\n{content}\n\n---\n"

            # Append to the scratch file
            # The Obsidian API's POST to /vault/path appends to the file
            # If the file doesn't exist, it creates it (with PUT first)

            # First, try to read the file to see if it exists
            existing = await obsidian_get(f"/vault/{scratch_file}")

            if isinstance(existing, dict) and "error" in existing:
                # File doesn't exist - create it with a header
                header = f"# Research Scratch Pad\n\nThis file is automatically managed by the vault_scratch_append tool.\nEntries are timestamped so you can track your research journey.\n\n---\n"
                create_result = await obsidian_write("PUT", f"/vault/{scratch_file}", header + entry)

                if isinstance(create_result, dict) and "error" in create_result:
                    result = create_result
                else:
                    result = {
                        "success": True,
                        "message": f"Created scratch pad and added entry",
                        "file": scratch_file,
                        "timestamp": timestamp
                    }
            else:
                # File exists - append to it
                append_result = await obsidian_write("POST", f"/vault/{scratch_file}", entry)

                if isinstance(append_result, dict) and "error" in append_result:
                    result = append_result
                else:
                    result = {
                        "success": True,
                        "message": "Appended entry to scratch pad",
                        "file": scratch_file,
                        "timestamp": timestamp
                    }

        elif name == "vault_peek_file":
            # =================================================================
            # vault_peek_file - CHECK FOR TRAPS BEFORE OPENING
            # =================================================================
            # "I search the chest for traps." - Every D&D rogue, ever.
            #
            # Before committing to loading an entire file (which could be
            # thousands of characters), this tool lets you PEEK at the beginning.
            # It returns:
            # - The first N characters (default 200)
            # - The total file size
            #
            # This helps you decide:
            # - "Is this the file I'm looking for?"
            # - "Is this file small enough to load fully?"
            # - "Does this look like it has the info I need?"
            #
            # It's like reading the back cover of a book before committing to
            # reading the whole thing. Or checking if that lever opens a door
            # or triggers a boulder trap.
            #
            # WORKFLOW:
            # 1. vault_search_map -> "Weave appears in Characters/Gale (293 matches)"
            # 2. vault_search_in_folder -> "backstory.md has 47 matches"
            # 3. vault_peek_file -> "# Gale Dekarios\n\nFormer Chosen of..." (15KB total)
            # 4. vault_read_note -> Actually load the file (if it looks worth it)

            path = arguments["path"]
            preview_length = arguments.get("preview_length", 200)

            # Read the full file
            full_content = await obsidian_get(f"/vault/{path}")

            if isinstance(full_content, dict) and "error" in full_content:
                result = full_content
            elif isinstance(full_content, str):
                # Success! Now truncate to preview length
                total_chars = len(full_content)
                preview = full_content[:preview_length]

                # Add ellipsis if we truncated
                if total_chars > preview_length:
                    preview += "..."

                result = {
                    "path": path,
                    "preview": preview,
                    "preview_characters": min(preview_length, total_chars),
                    "total_characters": total_chars,
                    "is_truncated": total_chars > preview_length
                }
            else:
                result = {"error": "Unexpected content format", "raw": str(full_content)[:100]}

        else:
            result = {"error": f"Unknown tool: {name}"}

        # Format the result for MCP
        if isinstance(result, dict):
            result_text = json.dumps(result, indent=2)
        elif isinstance(result, list):
            result_text = json.dumps(result, indent=2)
        else:
            result_text = str(result)

        return CallToolResult(
            content=[TextContent(type="text", text=result_text)]
        )

    except Exception as e:
        return CallToolResult(
            content=[TextContent(type="text", text=f"Error: {str(e)}")]
        )


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

async def main():
    """
    Start the MCP server.

    This runs the server using stdio transport - Claude Desktop connects to it
    by launching this script and communicating over stdin/stdout.
    """
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================
#
# 1. OBSIDIAN SETUP:
#    - Install "Local REST API" plugin from Community Plugins
#    - Enable it in settings
#    - Copy the API key from its settings
#    - (Optional) Install Omnisearch and/or Smart Connections for bonus features
#
# 2. INSTALL DEPENDENCIES:
#    pip install mcp httpx
#
# 3. CONFIGURE CLAUDE DESKTOP:
#    Add this to your Claude Desktop config (usually ~/Library/Application Support/Claude/claude_desktop_config.json on Mac):
#
#    {
#      "mcpServers": {
#        "obsidian": {
#          "command": "python",
#          "args": ["/path/to/this/server.py"],
#          "env": {
#            "OBSIDIAN_API_KEY": "your-api-key-here"
#          }
#        }
#      }
#    }
#
# 4. RESTART CLAUDE DESKTOP
#    The Obsidian tools should now be available!
#
# =============================================================================
