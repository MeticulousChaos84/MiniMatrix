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
import httpx
import asyncio
from pathlib import Path
from typing import Optional

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION - The coordinates of our memory palace
# ═══════════════════════════════════════════════════════════════════════════════

# Where post-cortex lives (it's running as a daemon on your machine)
# Think of this as the address of Gale's tower in the city
POSTCORTEX_URL = "http://localhost:3737"

# Where our reasoning chains live (the spellbook we're loading from)
CHAINS_FILE = Path("/home/user/MiniMatrix/Research/GaleCharacterAnalysis/CORE_REASONING_CHAINS.md")

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
# THE MEMORY PALACE CONNECTION - Talking to post-cortex
# ═══════════════════════════════════════════════════════════════════════════════

async def store_chain_in_postcortex(client: httpx.AsyncClient, payload: dict) -> bool:
    """
    Sends a formatted chain to post-cortex for storage.

    Post-cortex is our "memory palace" - it stores information and lets us
    search for it later by meaning (semantic search) rather than just keywords.

    This function:
    1. Takes the formatted payload
    2. Sends it to post-cortex's storage endpoint
    3. Returns True if it worked, False if something went wrong

    NOTE: The exact API endpoint might need adjustment based on post-cortex's
    actual API. If this doesn't work, we'll check the docs and fix it!
    """

    chain_id = payload.get('context_id', 'unknown')

    try:
        # Try the MCP-style tool call endpoint
        # Post-cortex exposes tools via MCP, so we need to call the right tool

        # This is the MCP tool call format
        tool_call = {
            "method": "tools/call",
            "params": {
                "name": "update_conversation_context",
                "arguments": {
                    "context": payload['content'],
                    "context_id": payload['context_id']
                }
            }
        }

        response = await client.post(
            f"{POSTCORTEX_URL}/mcp",
            json=tool_call,
            timeout=30.0
        )

        if response.status_code == 200:
            print(f"✅ Stored chain: {chain_id}")
            return True
        else:
            print(f"❌ Failed to store {chain_id}: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False

    except httpx.RequestError as e:
        print(f"❌ Network error storing {chain_id}: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error storing {chain_id}: {e}")
        return False


async def check_postcortex_connection(client: httpx.AsyncClient) -> bool:
    """
    Quick health check to make sure post-cortex is actually running.

    Like... before you teleport to a destination, you want to make sure
    the destination exists, right? Same idea.
    """
    try:
        # Try a simple request to see if post-cortex responds
        response = await client.get(f"{POSTCORTEX_URL}/health", timeout=5.0)
        return response.status_code == 200
    except:
        # If there's no /health endpoint, try the SSE endpoint
        try:
            response = await client.get(f"{POSTCORTEX_URL}/sse", timeout=5.0)
            return True  # If it responds at all, it's running
        except:
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

    # Step 5: Connect to post-cortex and store
    async with httpx.AsyncClient() as client:

        # Check if post-cortex is running
        print("🔌 Checking connection to post-cortex...")
        is_connected = await check_postcortex_connection(client)

        if not is_connected:
            print("❌ Cannot connect to post-cortex!")
            print(f"   Expected it at: {POSTCORTEX_URL}")
            print("   Is the daemon running?")
            print()
            print("   You can start it with:")
            print("   post-cortex daemon start")
            return

        print("✅ Connected to post-cortex")
        print()

        # Store each chain
        print("📥 Storing chains in memory palace...")
        print()

        success_count = 0
        fail_count = 0

        for chain in chains:
            payload = format_for_storage(chain)
            success = await store_chain_in_postcortex(client, payload)

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
            print("   This might be an API endpoint issue.")
            print("   Check the post-cortex docs for the correct tool names.")


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
