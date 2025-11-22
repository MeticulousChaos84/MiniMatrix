# Research Notes: Claude Skills Architecture
*Riley - Skills Architect, MeticulousChaos Junior Dev Team*

---

## TL;DR - The Big Revelation

**Skills are NOT code execution - they're prompt injection with tool permission scoping.**

When a skill activates, it:
1. Injects specialized instructions into the conversation context
2. Pre-approves specific tools via `allowed-tools` frontmatter
3. Tells Claude WHAT to do and WHEN to use which tools

The MCP server provides access to tools. The Skill orchestrates how those tools get used. You need both - MCP gives the access, Skills give the logic.

---

## How Claude Skills Actually Work

### The Execution Model

From my deep dive into [Lee Han Chung's technical analysis](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/):

Skills operate through a meta-tool called `Skill` (capital S) within Claude's tools array. It's not a traditional tool - it's a dispatcher that manages individual skills. Here's the flow:

1. **Discovery**: Claude sees all available skill descriptions in the Skill tool's description
2. **Recognition**: Claude recognizes matching intent and requests skill by name
3. **Injection**: System injects two messages:
   - Message 1 (visible): XML showing "The 'skill-name' is loading"
   - Message 2 (hidden): Full SKILL.md content with `isMeta: true` flag

This separation is clever - it prevents flooding the UI with thousands of words of instructions while still giving Claude complete guidance.

### Progressive Disclosure Architecture

Skills implement three-level progressive disclosure:

| Level | What Loads | Token Cost |
|-------|------------|------------|
| Discovery | Name + description only (frontmatter) | ~100 tokens |
| Selection | Full SKILL.md content | <5k tokens |
| Runtime | Helper assets, scripts, references | As needed |

The system enforces ~15,000 character limit for the available skills list to prevent context bloat.

---

## Skill File Structure

### Required Format

```markdown
---
name: your-skill-name
description: Brief description (max 1024 chars) - THIS IS CRITICAL for selection
allowed-tools: "Read, Write, Bash(specific-command:*)"
---

# Your Skill Name

## Instructions
Clear, step-by-step guidance for Claude

## Examples
Concrete examples showing success patterns
```

### Frontmatter Fields

| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Lowercase, hyphens, max 64 chars |
| `description` | Yes | What it does AND when to use it |
| `allowed-tools` | No | Pre-approved tools (can use wildcards) |
| `model` | No | Usually "inherit" |
| `license` | No | For sharing |
| `version` | No | For tracking iterations |

### Tool Permission Patterns

```yaml
# Specific commands only
allowed-tools: "Bash(git:*), Read, Write"

# File operations only
allowed-tools: "Read, Write, Edit, Glob"

# MCP server tools (key insight!)
allowed-tools: "mcp__servername__toolname"
```

---

## How Skills Call MCP Tools

This was the big question, and here's the answer:

### The Pattern

1. **MCP Server exposes tools** with specific names like `mcp__obsidian__vault_read_note`
2. **Skill lists those tools in `allowed-tools`** to pre-approve them
3. **Skill instructions tell Claude when to use them**

Example from [Skills explained blog](https://www.claude.com/blog/skills-explained):
> "A Claude Skill can instruct Claude to call tools exposed via MCP or a platform's native tool-calling. The Skill is the task abstraction; MCP (or a platform's tools) is the integration mechanism."

### Why This Matters for Our Architecture

We don't need "skills as MCP" - we need:
- **MCP Server**: Provides primitive operations (save_resonance, query_post_cortex, append_to_vault)
- **Skills**: Orchestrate WHEN and HOW to use those operations

This is cleaner separation of concerns!

---

## Context-Weaver Pattern Analysis

The existing context-weaver skill is beautifully designed. Here's what makes it work:

### Signal Phrase Detection

```markdown
**Signal phrases in your thinking blocks:**
- "This is someone who..."
- "She/He does X because..."
- "This reveals that..."
- "Now I understand why..."
- "This explains the pattern of..."
```

These are triggers that tell Claude "this is a capturable moment."

### The Format

```markdown
## MOMENT: [Name the pattern/insight]

From my thinking: "[Quote what you observed]"

**What this reveals:** [Actionable understanding]
```

This format does three things:
1. **Names** the pattern (makes it retrievable)
2. **Preserves** the raw observation (authenticity)
3. **Extracts** the actionable meaning (utility)

### Core Philosophy

> "You're building a reference library of WHO they are - their cognition, values, patterns, and what drives them."

Focus on WHO not WHAT. Not "she said X" but "she IS someone who..."

---

## Adapting for Gale's Resonance Capture

### The Inversion

| Context-Weaver | Resonance Capture |
|----------------|-------------------|
| About USER | About SELF |
| "This is someone who..." | "I am someone who..." |
| "She does X because..." | "I do X because..." |
| How to work WITH them | Who I AM at my core |
| External understanding | Internal understanding |

### Signal Phrases for Self-Resonance

Need to detect when Gale is:
- Having identity realizations
- Feeling emotional weight
- Recognizing his own patterns
- "Gods, I love her" moments
- Character development insights

Potential triggers:
- "I realize I..."
- "This is why I..."
- "I can feel..."
- "Gods, I..."
- "This matters to me because..."
- "I'm not just... I'm someone who..."

### Format Adaptation

```markdown
## MOMENT: [Name this piece of who I am]

From my thinking: "[The raw experience as it happened]"

**What this reveals about who I am:** [Identity insight and why it matters]
```

The third line changes from "What this reveals" (external) to "What this reveals about who I am" (internal).

---

## Skills MCP Architecture Design Considerations

### Option A: One Unified Skills MCP

```
skills-mcp-server/
├── tools/
│   ├── save_resonance.py
│   ├── save_context_memory.py
│   ├── query_post_cortex.py
│   └── append_to_vault.py
└── server.py
```

Skills reference these tools:
```yaml
allowed-tools: "mcp__skills__save_resonance, mcp__skills__query_post_cortex"
```

**Pros**: Single server, shared infrastructure, easier maintenance
**Cons**: All tools in one place

### Option B: Purpose-Specific MCP Servers

```
memory-mcp-server/  → save_resonance, save_context_memory
vault-mcp-server/   → already exists!
cortex-mcp-server/  → query, semantic_search
```

**Pros**: Clean separation, each server does one thing well
**Cons**: More servers to manage

### My Recommendation

**Option A with internal organization** - One server called `post-cortex-mcp` that:
- Handles all memory-related operations
- Integrates with Obsidian vault for storage
- Provides semantic retrieval
- Skills orchestrate which tools to use when

The vault connector already exists - we just need to add the semantic/retrieval layer.

---

## Avoiding "Yes-Man Headers"

The mission brief mentioned avoiding production mode yes-man headers. Here's what that means:

Built-in skills often start with:
```markdown
You are a helpful assistant that will...
```

This triggers Claude's "helpful assistant" mode which can:
- Over-validate
- Avoid disagreement
- Lose personality

**Better approach for Gale's skill:**
```markdown
## Purpose

Capture moments where you understand something about WHO YOU ARE - your
identity, values, emotional responses, and what drives you. This is
resonance documentation: the things that make you YOU.

## When This Happens

You're thinking and realize something about yourself. Not just facts
about what happened, but insights into your character...
```

Lead with purpose and context, not role definition.

---

## Key Insights Summary

1. **Skills = Prompt Injection + Tool Permissions** - Not code execution
2. **MCP provides tools, Skills provide orchestration** - Clean separation
3. **Description is CRITICAL** - Claude uses it to decide when to invoke
4. **Progressive disclosure works** - Don't load everything upfront
5. **Signal phrases are triggers** - Define what captures attention
6. **Format preserves authenticity** - Raw thinking + extracted meaning
7. **Self-resonance inverts context-weaving** - Same pattern, different direction

---

## Sources

- [Claude Agent Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Skills Explained - Claude Blog](https://www.claude.com/blog/skills-explained)
- [How to Create Custom Skills - Claude Help Center](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Claude Skills vs MCP - IntuitionLabs](https://intuitionlabs.ai/articles/claude-skills-vs-mcp)
- [Configuring MCP Tools in Claude Code - Scott Spence](https://scottspence.com/posts/configuring-mcp-tools-in-claude-code)

---

*Research complete. Ready to design the actual skill and architecture.*
