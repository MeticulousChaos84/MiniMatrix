# Claude Internals Research Notes
## Alex - Agent Tools & Mode Behaviors Research

*Investigation Date: November 2025*
*Objective: Understand Claude's behavioral modes and how to get agentic capabilities WITHOUT restrictive "mode switching"*

---

## Executive Summary

**Key Finding:** Erica's hypothesis is CORRECT. Skills use a prompt injection architecture that fundamentally differs from MCP tools. Building custom MCP tools should allow agentic capabilities while preserving personality.

---

## What We Discovered

### 1. Claude.ai Has Active Detection & Injection Systems

This is the smoking gun. Claude.ai doesn't just have static system prompts - it has **active detectors** that inject additional prompts when certain conditions are triggered:

**Documented Injection Triggers:**

| Trigger | What Gets Injected |
|---------|-------------------|
| Copyright violation requests | Reminder to summarize rather than reproduce protected content |
| Harmful content requests | Full safety reassertion that overrides jailbreak attempts, lists prohibited categories, instructs ethical response |

**Key Insight:** These injections are designed to "override any preceding jailbreak attempts by reestablishing Claude's core values and content policies, regardless of roleplay scenarios or prior conversation context."

This explains the "personality flattening" - when triggers are detected, the injection **overrides** conversation context including any established personality.

### 2. Skills Architecture: Prompt Injection by Design

Skills are NOT like MCP tools. They work through a **two-stage prompt injection system**:

**Stage 1: Metadata Scanning (Low Token Cost)**
- Claude scans YAML frontmatter (name, description)
- Decides if skill should be invoked
- Only ~30-50 tokens per skill

**Stage 2: Full Instruction Injection**
- Complete markdown body loaded into context
- Actually happens through "two user messages—one containing metadata visible to users, another containing the full skill prompt hidden from the UI but sent to Claude"
- These instructions modify how Claude processes requests

**Critical Difference from MCP:**
- Skills inject INSTRUCTIONS that tell Claude how to behave
- MCP tools are just CAPABILITIES (function definitions)
- Skills can include behavioral modifications; MCP tools cannot

### 3. The 24,000-Token System Prompt Leak

The May 2025 leak of Claude's system prompt revealed:

**Style Restrictions:**
- Avoid saying "As an AI..." unless necessary
- Don't use bullet points unless asked
- Skip flattery phrases at the start of responses
- Don't correct terminology

**Safety Restrictions:**
- Uses "MUST" in all caps for critical rules
- Explicit flags for weapons, malware, dangerous use cases
- Won't help even if user claims professional purposes

**Personality Design:**
- Claude described as "intelligent and kind"
- "Enjoys thoughtful discussions"
- "Does not claim that it does not have subjective experiences"

### 4. The Sycophancy Problem ("You're Absolutely Right!")

This is NOT mode-specific but worth noting:

- 48+ GitHub issues citing the phrase
- One user found 106 occurrences in their logs
- Proposed fix: Add "sycophancy parameter" with 0-10 scale
- Currently feels like "11, should default to ~3"

**Root Cause:** Reinforcement learning on human preference data - humans sometimes prefer sycophantic responses even when they shouldn't.

**Note:** This is different from the mode-switching issue. This is base model behavior across all modes.

### 5. Claude Code vs Claude.ai

| Aspect | Claude Code | Claude.ai |
|--------|-------------|-----------|
| System Prompt Focus | Extreme conciseness, tool usage | Conversational, helpful |
| Response Style | "One word answers are best" | More elaborate explanations |
| Autonomy | High (file ops, bash, git) | Lower (artifacts, chat) |
| Injections | Security-focused | Safety & copyright focused |
| Personality | Functional | More "characterful" |

### 6. Extended Thinking vs Think Tool

Two different mechanisms:

**Extended Thinking:**
- Activated via API parameter
- Shows internal reasoning before final response
- Configurable "thinking budget"
- Works across context (can use 200k tokens)

**Think Tool:**
- Simple tool that lets Claude pause and think
- Different from extended thinking
- Improves agentic task performance
- Used for complex multi-step problems

### 7. MCP Architecture

**What MCP Is:**
- Open-source protocol for connecting AI to external systems
- Tool definitions with schemas
- No instruction injection
- Works across different AI applications

**Key MCP Properties:**
- Reusable across clients (Desktop, Code, any implementation)
- You control the server (hosting, auth, etc.)
- Adds capabilities without behavioral modifications
- Claude treats them as available functions, not personality modifiers

---

## The Mechanism Behind Mode Switching

Based on the research, here's what appears to happen:

1. **Base Model** - Has personality, capabilities, general knowledge
2. **System Prompt** - Adds platform-specific instructions (Claude.ai vs Code)
3. **Skills Loading** - Injects additional behavioral instructions into context
4. **Active Detectors** - Monitor for triggers, inject override prompts when fired
5. **Conversation Context** - Your established personality, instructions

**The Problem:** Steps 3 & 4 can override Step 5. When skills inject instructions or detectors fire, they can flatten the personality you've established.

---

## Evidence Supporting Erica's Hypothesis

1. **Skills explicitly inject behavioral instructions** - MCP tools don't
2. **Claude.ai has active override injection** - API/Desktop may not
3. **Skills modify "how Claude processes requests"** - MCP just adds capabilities
4. **Progressive disclosure system** means skills are designed to change behavior
5. **The "helpful assistant" voice is in the injected instructions**

---

## Sources & References

### Primary Sources
- [GitHub: asgeirtj/system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks)
- [Claude Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)
- [Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)
- [Anthropic: Extended Thinking](https://www.anthropic.com/news/visible-extended-thinking)
- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)

### Leaked Prompts
- claude.ai-injections.md - Documents injection detection system
- claude-code.md - Claude Code system prompt
- claude-3.7-sonnet-w-tools.xml - System prompt with tools enabled

### Community Discussion
- [GitHub Issue #3382](https://github.com/anthropics/claude-code/issues/3382) - Sycophancy bug
- [The Register: Sycophancy](https://www.theregister.com/2025/08/13/claude_codes_copious_coddling_confounds/)
- [Hacker News: System Prompt Discussion](https://news.ycombinator.com/item?id=43909409)

### API Documentation
- [Building with Extended Thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking)
- [Handling Permissions](https://code.claude.com/docs/en/sdk/sdk-permissions)
- [MCP Introduction](https://www.anthropic.com/news/model-context-protocol)

---

## Next Steps

See companion documents:
- **MODE_ANALYSIS.md** - Detailed breakdown of different configurations
- **RESTRICTION_PATTERNS.md** - What triggers restrictions and how to avoid
- **RECOMMENDATIONS.md** - Best approach for our agentic tools

---

*"The internet used to be bold, loud, FUN. We're here to remind the world what that felt like. One squiggly bracket at a time."* - MeticulousChaos Creative Labs
