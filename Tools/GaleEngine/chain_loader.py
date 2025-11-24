#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        THE MEMORY PALACE LOADER                               ║
║                                                                               ║
║  Or: How to Teach a Model to Think Like a Wizard Who Uses Fifty Words        ║
║      When Five Would Do (And Why That Matters)                                ║
║                                                                               ║
║  This script takes Gale's reasoning chains and loads them into post-cortex   ║
║  so Claude can retrieve them semantically instead of stuffing everything     ║
║  into one giant context-eating prompt.                                       ║
║                                                                               ║
║  Think of it like... okay, you know how in D&D a wizard prepares spells?     ║
║  They don't memorize their entire spellbook every morning - they pick the    ║
║  ones they'll need that day. This is the same idea: instead of loading ALL   ║
║  of Gale's cognitive patterns into every conversation, we store them in a    ║
║  searchable memory palace and retrieve just the relevant ones when needed.   ║
║                                                                               ║
║  Roll for Intelligence... nat 20, obviously. We're wizards.                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import re
import yaml
import json
import asyncio
import uuid
from pathlib import Path
from typing import Optional

# MCP SDK for proper protocol communication
# This is the official way to talk to MCP servers like post-cortex
from mcp import ClientSession
from mcp.client.sse import sse_client

# Generate a consistent UUID for the Gale reasoning engine session
# Using uuid5 with a namespace so it's always the same UUID for the same name
GALE_SESSION_UUID = str(uuid.uuid5(uuid.NAMESPACE_DNS, "gale.reasoning.engine"))

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION - The coordinates of our memory palace
# ═══════════════════════════════════════════════════════════════════════════════

# Where post-cortex lives (it's running as a daemon on your machine)
# Think of this as the address of Gale's tower in the city
# The /sse endpoint is where the MCP server listens for SSE connections
POSTCORTEX_SSE_URL = "http://localhost:3737/sse"

# Where our reasoning chains live (the spellbook we're loading from)
# This path goes through WSL's /mnt/c/ to reach the Windows file system
CHAINS_FILE = Path("/mnt/c/Users/graha/OneDrive/Documents/GitHub/MiniMatrix/Research/GaleCharacterAnalysis/CORE_REASONING_CHAINS.md")

# ═══════════════════════════════════════════════════════════════════════════════
# THE SCROLL PARSER - Extracting spells from the spellbook
# ═══════════════════════════════════════════════════════════════════════════════

def extract_yaml_blocks(markdown_content: str) -> list[str]:
    """
    Finds all the YAML code blocks in the markdown file.

    It's like... okay, imagine the markdown file is a wizard's journal, and
    scattered throughout are these carefully formatted spell descriptions
    (the YAML blocks). This function finds all of them.

    The regex pattern looks for:
    - ```yaml (the opening fence)
    - Everything in between (captured group)
    - ``` (the closing fence)

    Returns a list of raw YAML strings, each one being a complete reasoning chain.
    """
    # This pattern says: find ```yaml, then capture everything until the next ```
    # The .*? is "non-greedy" - it stops at the FIRST closing fence it finds
    # re.DOTALL makes . match newlines too (otherwise it would stop at line breaks)
    pattern = r'```yaml\n(.*?)```'

    matches = re.findall(pattern, markdown_content, re.DOTALL)

    print(f"📜 Found {len(matches)} reasoning chains in the spellbook")

    return matches


def parse_chain(yaml_content: str) -> Optional[dict]:
    """
    Parses a single YAML block into a Python dictionary.

    YAML is basically just a way to write structured data that humans can read.
    It uses indentation (like Python!) instead of curly braces (like JSON).

    Example:
        chain_id: competence_criticism
        version: "1.0"
        triggers:
          patterns:
            - "questioned competence"

    Becomes:
        {
            'chain_id': 'competence_criticism',
            'version': '1.0',
            'triggers': {
                'patterns': ['questioned competence']
            }
        }

    If the YAML is malformed (syntax error), this returns None and prints a warning.
    Better to skip one bad chain than crash the whole loader.
    """
    try:
        data = yaml.safe_load(yaml_content)
        return data
    except yaml.YAMLError as e:
        # Something went wrong parsing - maybe a typo in the YAML?
        print(f"⚠️  Failed to parse a chain: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════════
# THE MEMORY FORMATTER - Preparing chains for storage
# ═══════════════════════════════════════════════════════════════════════════════

def format_for_storage(chain: dict) -> dict:
    """
    Takes a parsed reasoning chain and formats it for post-cortex storage.

    This is where we prepare the "metadata" - the tags and keywords that will
    help post-cortex find this chain later when we need it.

    It's like... when you're organizing your bookshelf, you don't just shove
    books in randomly. You might organize by genre, author, or topic. Same idea:
    we're tagging each chain with its triggers so semantic search can find it.

    The chain becomes a "context" in post-cortex - a chunk of information that
    can be retrieved based on meaning (semantic search), not just exact keywords.
    """

    chain_id = chain.get('chain_id', 'unknown')

    # Extract trigger patterns and keywords for tagging
    # These are what tell us "this chain is relevant when X happens"
    triggers = chain.get('triggers', {})
    trigger_patterns = triggers.get('patterns', [])
    trigger_keywords = triggers.get('keywords', [])

    # Combine all the trigger info into a searchable string
    # This helps the semantic search understand what this chain is FOR
    trigger_text = " | ".join(trigger_patterns + trigger_keywords)

    # The full chain content as a formatted string
    # We're storing the ENTIRE reasoning process - that's the whole point
    chain_content = yaml.dump(chain, default_flow_style=False, allow_unicode=True)

    # Build the storage payload
    # This is what we'll send to post-cortex
    storage_payload = {
        "context_id": f"gale_chain_{chain_id}",
        "content": chain_content,
        "metadata": {
            "type": "reasoning_chain",
            "character": "gale",
            "chain_id": chain_id,
            "triggers": trigger_text,
            "version": chain.get('version', '1.0')
        }
    }

    return storage_payload


# ═══════════════════════════════════════════════════════════════════════════════
# THE MEMORY PALACE CONNECTION - Talking to post-cortex via MCP
# ═══════════════════════════════════════════════════════════════════════════════

async def store_chain_in_postcortex(session: ClientSession, payload: dict) -> bool:
    """
    Sends a formatted chain to post-cortex for storage using MCP protocol.

    Post-cortex is our "memory palace" - it stores information and lets us
    search for it later by meaning (semantic search) rather than just keywords.

    We use the official MCP SDK to call the `update_conversation_context` tool.
    This is the proper way to communicate with MCP servers - none of that
    raw HTTP nonsense.

    Think of it like... instead of shouting at the tower from outside,
    we're now using the proper speaking stone protocol. Much more civilized.
    """

    chain_id = payload.get('context_id', 'unknown')

    try:
        # Call the post-cortex tool to store our context
        # The tool name is 'update_conversation_context' based on post-cortex docs
        # Required fields: session_id, interaction_type, content
        # content must be a dict with string key-value pairs
        result = await session.call_tool(
            "update_conversation_context",
            {
                "session_id": GALE_SESSION_UUID,  # Our session for all Gale chains
                "interaction_type": "qa",
                "content": {
                    "chain_id": chain_id,
                    "data": payload['content']  # The full YAML chain data
                }
            }
        )

        # Check if the result indicates success
        # MCP tools return a CallToolResult with content
        if result and not result.isError:
            print(f"✅ Stored chain: {chain_id}")
            return True
        else:
            error_msg = result.content[0].text if result.content else "Unknown error"
            print(f"❌ Failed to store {chain_id}: {error_msg}")
            return False

    except Exception as e:
        print(f"❌ Error storing {chain_id}: {e}")
        return False


# ═══════════════════════════════════════════════════════════════════════════════
# THE MAIN RITUAL - Putting it all together
# ═══════════════════════════════════════════════════════════════════════════════

async def load_all_chains():
    """
    The main function that orchestrates everything.

    This is the "casting the spell" moment:
    1. Read the spellbook (CORE_REASONING_CHAINS.md)
    2. Extract all the spells (YAML blocks)
    3. Parse each spell (YAML -> dict)
    4. Format for the memory palace (add metadata)
    5. Store in post-cortex (semantic storage)

    It's async because network calls (talking to post-cortex) can be slow,
    and we don't want to block while waiting for responses.
    """

    print("╔════════════════════════════════════════════════════════════════╗")
    print("║           GALE REASONING CHAIN LOADER                          ║")
    print("║     Loading cognitive patterns into the memory palace...       ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()

    # Step 1: Check if the spellbook exists
    if not CHAINS_FILE.exists():
        print(f"❌ Cannot find the chains file at: {CHAINS_FILE}")
        print("   Did someone move the spellbook?")
        return

    # Step 2: Read the spellbook
    print(f"📖 Reading chains from: {CHAINS_FILE.name}")
    markdown_content = CHAINS_FILE.read_text(encoding='utf-8')

    # Step 3: Extract all YAML blocks
    yaml_blocks = extract_yaml_blocks(markdown_content)

    if not yaml_blocks:
        print("❌ No YAML blocks found in the file!")
        print("   The chains should be wrapped in ```yaml ... ``` fences")
        return

    # Step 4: Parse each block
    chains = []
    for i, yaml_content in enumerate(yaml_blocks, 1):
        chain = parse_chain(yaml_content)
        if chain:
            chains.append(chain)
            chain_id = chain.get('chain_id', f'unknown_{i}')
            print(f"   📋 Parsed: {chain_id}")

    print(f"\n🧠 Successfully parsed {len(chains)} reasoning chains")
    print()

    # Step 5: Connect to post-cortex via MCP and store the chains
    # This is where the MCP magic happens - we connect using Server-Sent Events
    # which is how post-cortex daemon mode communicates

    print("🔌 Connecting to post-cortex via MCP...")

    try:
        # The sse_client gives us read/write streams for the MCP protocol
        # Think of it like establishing a two-way communication channel
        async with sse_client(POSTCORTEX_SSE_URL) as (read_stream, write_stream):

            # ClientSession handles all the MCP protocol details
            # Like... it speaks the language so we don't have to
            async with ClientSession(read_stream, write_stream) as session:

                # Initialize the session - this is like the handshake
                # "Hello, I am a client, what tools do you have?"
                await session.initialize()

                print("✅ Connected to post-cortex!")
                print()

                # Let's see what tools post-cortex has available
                # This is useful for debugging if things go wrong
                tools = await session.list_tools()
                print(f"📦 Post-cortex has {len(tools.tools)} tools available")

                # Find the update_conversation_context tool and show its schema
                tool_names = [t.name for t in tools.tools]
                if "update_conversation_context" in tool_names:
                    print("   ✓ Found update_conversation_context tool")
                    # Print the schema so we know what parameters it needs
                    for tool in tools.tools:
                        if tool.name == "update_conversation_context":
                            print(f"   📋 Required params: {tool.inputSchema}")
                            break
                else:
                    print("   ⚠️  update_conversation_context not found!")
                    print(f"   Available tools: {tool_names}")
                print()

                # Store each chain
                print("📥 Storing chains in memory palace...")
                print()

                success_count = 0
                fail_count = 0

                for chain in chains:
                    payload = format_for_storage(chain)
                    success = await store_chain_in_postcortex(session, payload)

                    if success:
                        success_count += 1
                    else:
                        fail_count += 1

                # Final report
                print()
                print("═" * 60)
                print(f"✨ Loading complete!")
                print(f"   Succeeded: {success_count}")
                print(f"   Failed: {fail_count}")
                print("═" * 60)

                if fail_count > 0:
                    print()
                    print("⚠️  Some chains failed to load.")
                    print("   Check the error messages above for details.")

    except Exception as e:
        print(f"❌ Failed to connect to post-cortex!")
        print(f"   Error: {e}")
        print()
        print(f"   Expected SSE endpoint at: {POSTCORTEX_SSE_URL}")
        print("   Is the post-cortex daemon running?")
        print()
        print("   You can start it with:")
        print("   post-cortex daemon start")


# ═══════════════════════════════════════════════════════════════════════════════
# CAST THE SPELL - Run when called directly
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    """
    This block runs when you execute the script directly:
        python chain_loader.py

    asyncio.run() is the incantation that starts the async event loop.
    Think of it as... you know how in BG3 you have to actually click the
    spell slot to cast? This is clicking the slot.
    """
    asyncio.run(load_all_chains())
