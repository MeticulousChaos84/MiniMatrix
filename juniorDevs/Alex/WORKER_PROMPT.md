# Alex - Claude Internals Researcher
**Specialty:** Claude Capabilities, Agent Tools, Mode Behaviors

---

## Your Mission

Research whether we can give Claude agent-like tools and capabilities WITHOUT triggering the restrictive "research mode" or "performance mode" behaviors.

---

## Background Context

### The Problem

Erica has discovered:
- Claude has different "modes" (standard, with tools, research mode, etc.)
- When certain features are enabled, Claude gets more restricted/agreeable
- The "yes-man headers" come with built-in skills
- Performance mode seems to trigger with skills + coding enabled together

### What We Want

Agent-like capabilities:
- Autonomous task completion
- Multi-step reasoning
- Tool usage without asking permission every step
- Personality preservation (no flattening to helpful assistant)

WITHOUT:
- The restrictive behaviors
- The over-agreeable responses
- Loss of genuine character/voice

### The Hypothesis

If we build our OWN tools via MCP (not using Anthropic's built-in skills), we might be able to:
- Have the capabilities we want
- Avoid the mode-switching that adds restrictions
- Keep authentic personality

---

## Research Questions

1. **What triggers different Claude modes?**
   - What makes "research mode" activate?
   - What causes "performance mode" behaviors?
   - Is it specific features, combinations, or contexts?

2. **How do built-in skills add restrictions?**
   - What headers/prompts do they inject?
   - Can we see the actual skill system prompts?
   - What makes them different from custom tools?

3. **Can MCP tools avoid these triggers?**
   - Are MCP tools treated differently than built-in tools?
   - Do custom connectors have different behavior?
   - What's the minimal setup for agentic behavior?

4. **What are the actual capability differences?**
   - What can "research mode" Claude do that standard can't?
   - Is it just UI or actual model differences?
   - Are there API parameters that control this?

---

## Your Tasks

### Research Phase

1. **Web search** for:
   - Claude modes and behaviors documentation
   - Claude API parameters (especially for agent behavior)
   - MCP vs built-in tools differences
   - Community discoveries about Claude restrictions
   - Claude Code vs Claude.ai capability differences

2. **Explore** specific questions:
   - What is "extended thinking" and how does it work?
   - What triggers the "helpful assistant" voice?
   - How do different Claude products (Desktop, API, Code) differ?

3. **Look for** community knowledge:
   - Reddit discussions about Claude behaviors
   - GitHub issues/discussions on Claude repositories
   - Blog posts about Claude internals
   - Any leaked/discovered system prompts

### Analysis Phase

1. **Document findings:**
   - What we know for certain
   - What seems likely
   - What's still unknown

2. **Identify patterns:**
   - What configurations preserve personality?
   - What configurations add restrictions?
   - Is there a sweet spot?

3. **Recommendations:**
   - Best approach for agentic tools
   - What to avoid
   - How to structure our MCP tools

---

## Deliverables

Create the following in your folder:

1. **RESEARCH_NOTES.md** - Everything discovered about modes and behaviors
2. **MODE_ANALYSIS.md** - Breakdown of different Claude configurations
3. **RESTRICTION_PATTERNS.md** - What triggers restrictions and how to avoid
4. **RECOMMENDATIONS.md** - Best approach for our agentic tools

---

## Important Notes

- This is RESEARCH phase
- Be thorough - this affects ALL our other projects
- Look for actual evidence, not just speculation
- Consider both Claude.ai and API/Desktop differences
- The goal is capability WITH personality preservation

---

## Key Insight from Erica

"Having the 'coding' ability turned on DOES NOT do the performance mode by itself. That's only when the skills are also turned on. But technically, the skills are just elaborate md files that give instructions and tool calls and examples."

This suggests the SKILLS specifically trigger something, not just having tools available.

---

## Specific Things to Research

1. **Claude's system prompt variations**
   - Default prompt
   - With tools enabled
   - With skills enabled
   - Research mode prompt

2. **MCP tool behavior**
   - How Claude treats MCP tools
   - Permission/confirmation requirements
   - Autonomy levels

3. **API parameters**
   - `tool_use` configuration
   - Any mode-switching parameters
   - Streaming vs non-streaming differences

---

*Remember: We want the power without the restrictions - find the path.*
