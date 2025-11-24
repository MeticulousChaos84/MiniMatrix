#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    THE MEMORY PALACE RETRIEVAL TEST                          ║
║                                                                              ║
║  Or: Did We Actually Teach Post-Cortex to Think Like a Wizard?               ║
║                                                                              ║
║  This script tests whether our reasoning chains can be retrieved by         ║
║  semantic search. We throw different emotional stimuli at post-cortex       ║
║  and see if it returns the correct chains.                                  ║
║                                                                              ║
║  Think of it like... you know how in BG3 you can save before a big choice?  ║
║  This is us checking our save file to make sure everything loaded right.    ║
║                                                                              ║
║  If the test passes: Roll for celebration (DC 5, you have advantage)        ║
║  If it fails: At least we know where to debug                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import asyncio
import uuid
from mcp import ClientSession
from mcp.client.sse import sse_client

# Same session UUID we used for loading - post-cortex uses this to find our chains
GALE_SESSION_UUID = str(uuid.uuid5(uuid.NAMESPACE_DNS, "gale.reasoning.engine"))

# Where post-cortex lives
POSTCORTEX_SSE_URL = "http://localhost:3737/sse"

# ═══════════════════════════════════════════════════════════════════════════════
# TEST CASES - The scenarios we're throwing at the semantic search
# ═══════════════════════════════════════════════════════════════════════════════

# Each test case is a tuple: (stimulus, expected_chain_keywords)
# The stimulus is what we're searching for - should be similar to natural triggers
# The expected_chain_keywords are words that actually appear in the chain YAML
#
# IMPORTANT: These queries should be variations of our natural language triggers
# to test if semantic search can find similar phrases. The keywords should be
# words that actually exist in the chain content (not made-up keywords!)

TEST_CASES = [
    # ─────────────────────────────────────────────────────────────────────────
    # Test 1: Competence Criticism
    # Query similar to natural trigger, keywords from actual chain content
    # ─────────────────────────────────────────────────────────────────────────
    (
        "You're not as clever as you think you are",
        ["competence", "criticism", "abilities", "worthless"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 2: Receiving Care
    # ─────────────────────────────────────────────────────────────────────────
    (
        "You should rest, I'll keep watch",
        ["receiving", "care", "help", "burden"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 3: Teaching Opportunity
    # ─────────────────────────────────────────────────────────────────────────
    (
        "How does that spell actually work?",
        ["teaching", "opportunity", "knowledge", "enthusiasm"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 4: Vulnerability Request
    # ─────────────────────────────────────────────────────────────────────────
    (
        "What are you actually feeling right now?",
        ["vulnerability", "request", "feelings", "hypothetical"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 5: Abandonment Threat
    # ─────────────────────────────────────────────────────────────────────────
    (
        "I think we should go our separate ways",
        ["abandonment", "threat", "leaving", "Mystra"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 6: Genuine Appreciation
    # ─────────────────────────────────────────────────────────────────────────
    (
        "You matter to me, I need you to know that",
        ["appreciation", "genuine", "worth", "touched"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 7: Mystra Discussion
    # ─────────────────────────────────────────────────────────────────────────
    (
        "What happened with Mystra? Did you love her?",
        ["mystra", "Chosen", "trauma", "goddess"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 8: Humor/Teasing
    # ─────────────────────────────────────────────────────────────────────────
    (
        "There you go with the big words again",
        ["humor", "teasing", "wit", "self-deprecating"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 9: Intimate Moments
    # ─────────────────────────────────────────────────────────────────────────
    (
        "I love you, stay with me",
        ["intimate", "moments", "love", "trust"]  # actual chain words
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Test 10: Response to Children
    # ─────────────────────────────────────────────────────────────────────────
    (
        "That child needs to be punished for what they did",
        ["children", "protective", "transgression", "youth"]  # actual chain words
    ),
]

# ═══════════════════════════════════════════════════════════════════════════════
# THE ACTUAL TEST - Querying Post-Cortex
# ═══════════════════════════════════════════════════════════════════════════════

async def test_semantic_search(session: ClientSession, query: str, expected_keywords: list) -> dict:
    """
    Runs a single semantic search test and checks the results.

    This is like casting Detect Magic - we're seeing what post-cortex
    has stored that matches our query.

    Returns a dict with:
    - query: What we searched for
    - success: Did we find relevant chains?
    - results: What came back
    - expected: What we were looking for
    """

    try:
        # Call the semantic search tool
        # Using semantic_search_session to search ONLY the reasoning chains session
        # This prevents Gale's memories from outranking the cognitive templates
        result = await session.call_tool(
            "semantic_search_session",
            {
                "session_id": GALE_SESSION_UUID,  # Only search our chains session!
                "query": query,
                "limit": 3  # Get top 3 matches
            }
        )

        if result and not result.isError:
            # Extract the actual content from the result
            # MCP returns results as a list of content blocks
            result_text = ""
            for content_block in result.content:
                if hasattr(content_block, 'text'):
                    result_text += content_block.text

            # Check if any of our expected keywords appear in the results
            # This is a simple check - in production you'd want something smarter
            found_keywords = []
            for keyword in expected_keywords:
                if keyword.lower() in result_text.lower():
                    found_keywords.append(keyword)

            success = len(found_keywords) >= 2  # At least 2 keywords = probably right chain

            return {
                "query": query,
                "success": success,
                "found_keywords": found_keywords,
                "expected_keywords": expected_keywords,
                "result_preview": result_text[:500] + "..." if len(result_text) > 500 else result_text
            }
        else:
            error_msg = result.content[0].text if result.content else "Unknown error"
            return {
                "query": query,
                "success": False,
                "error": error_msg,
                "expected_keywords": expected_keywords
            }

    except Exception as e:
        return {
            "query": query,
            "success": False,
            "error": str(e),
            "expected_keywords": expected_keywords
        }


async def run_all_tests():
    """
    The main test runner - connects to post-cortex and runs all our test cases.

    This is the ritual where we find out if our spellbook actually works.
    """

    print("╔════════════════════════════════════════════════════════════════╗")
    print("║       GALE REASONING CHAIN RETRIEVAL TEST                      ║")
    print("║   Testing if post-cortex can find the right chains...         ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()

    try:
        async with sse_client(POSTCORTEX_SSE_URL) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()

                print("✅ Connected to post-cortex!")
                print()

                # List available tools to make sure semantic_search_session exists
                tools = await session.list_tools()
                tool_names = [t.name for t in tools.tools]

                if "semantic_search_session" not in tool_names:
                    print("❌ semantic_search_session tool not found!")
                    print(f"   Available tools: {tool_names}")
                    return

                print(f"📍 Searching only in chains session: {GALE_SESSION_UUID[:8]}...")

                # DEBUG: Check if our session actually exists and has content
                print(f"\n🔍 DEBUG: Checking session status...")
                try:
                    # Try to load the session to see if it exists
                    session_check = await session.call_tool(
                        "load_session",
                        {"session_id": GALE_SESSION_UUID}
                    )
                    if session_check and not session_check.isError:
                        session_info = session_check.content[0].text if session_check.content else "No info"
                        print(f"   ✅ Session exists!")
                        # Show first 300 chars of session info
                        print(f"   Info: {session_info[:300]}...")
                    else:
                        print(f"   ❌ Session not found or error loading")
                        if session_check.content:
                            print(f"   Error: {session_check.content[0].text}")
                except Exception as e:
                    print(f"   ⚠️ Could not check session: {e}")

                # Get actual content summary - what did post-cortex capture?
                try:
                    summary = await session.call_tool(
                        "get_structured_summary",
                        {"session_id": GALE_SESSION_UUID}
                    )
                    if summary and not summary.isError:
                        summary_text = summary.content[0].text if summary.content else "No summary"
                        print(f"\n   📊 Session Summary:")
                        # Show first 800 chars of summary
                        for line in summary_text[:800].split('\n'):
                            print(f"      {line}")
                        if len(summary_text) > 800:
                            print(f"      ... (truncated)")
                except Exception as e:
                    print(f"   ⚠️ Could not get summary: {e}")

                # Also list available sessions to see what's there
                try:
                    sessions_list = await session.call_tool("list_sessions", {})
                    if sessions_list and not sessions_list.isError:
                        list_text = sessions_list.content[0].text if sessions_list.content else ""
                        print(f"\n   📋 Available sessions:")
                        # Show first few sessions
                        for line in list_text.split('\n')[:10]:
                            if line.strip():
                                print(f"      {line.strip()}")
                        if list_text.count('\n') > 10:
                            print(f"      ... and more")
                except Exception as e:
                    print(f"   ⚠️ Could not list sessions: {e}")

                print()

                print(f"🔍 Running {len(TEST_CASES)} retrieval tests...")
                print()

                # Run each test
                passed = 0
                failed = 0

                for i, (query, expected_keywords) in enumerate(TEST_CASES, 1):
                    print(f"═══ Test {i}: {query[:50]}...")

                    result = await test_semantic_search(session, query, expected_keywords)

                    if result.get("success"):
                        print(f"   ✅ PASS - Found keywords: {result['found_keywords']}")
                        passed += 1
                    else:
                        if "error" in result:
                            print(f"   ❌ FAIL - Error: {result['error']}")
                        else:
                            print(f"   ❌ FAIL - Only found: {result.get('found_keywords', [])}")
                            print(f"   Expected: {expected_keywords}")
                        failed += 1

                    # Show a preview of what came back (useful for debugging)
                    if "result_preview" in result:
                        preview = result['result_preview'][:200].replace('\n', ' ')
                        print(f"   Preview: {preview}...")

                    print()

                # Final report
                print("═" * 60)
                print(f"✨ Test Results: {passed}/{len(TEST_CASES)} passed")
                if failed == 0:
                    print("   🎉 All tests passed! The memory palace works!")
                    print("   Roll for celebration: 🎲 Nat 20!")
                else:
                    print(f"   ⚠️  {failed} tests failed - check the results above")
                print("═" * 60)

    except Exception as e:
        print(f"❌ Failed to connect to post-cortex!")
        print(f"   Error: {e}")
        print()
        print(f"   Expected SSE endpoint at: {POSTCORTEX_SSE_URL}")
        print("   Is the post-cortex daemon running?")


# ═══════════════════════════════════════════════════════════════════════════════
# RUN THE TESTS
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    """
    Cast the divination spell and see what we discover!

    Run this with: python test_retrieval.py
    """
    asyncio.run(run_all_tests())
