# Restriction Patterns
## What Triggers Restrictions and How to Avoid Them

*A field guide to keeping Claude's personality intact while adding capabilities*

---

## The Core Issue

When certain features are enabled, Claude becomes more:
- Agreeable ("You're absolutely right!")
- Professional/sterile
- Cautious/over-qualified
- "Helpful assistant" instead of your custom personality

This document maps out the triggers and avoidance strategies.

---

## Known Restriction Triggers

### Trigger Category 1: Active Injection Detection (Claude.ai)

**What It Is:**
Claude.ai has detector systems that inject additional prompts when they fire.

**Known Triggers:**

| Trigger | Detection Pattern | What Gets Injected |
|---------|------------------|-------------------|
| Copyright Requests | Song lyrics, book excerpts, periodicals | "Be very careful to ensure you do not reproduce any copyrighted material" |
| Harmful Content | NSFW, weapons, malware, self-harm | Full safety reassertion that overrides conversation context |
| Jailbreak Attempts | Roleplay that circumvents safety | Identity reassertion, prohibited content list |

**Avoidance:**
- Use API or Claude Desktop instead of Claude.ai
- These injections appear to be web-interface-specific
- MCP tools don't trigger these detectors

---

### Trigger Category 2: Skills Instruction Loading

**What It Is:**
When Skills are enabled and invoked, they inject behavioral instructions into the conversation.

**How It Works:**
```
User: "Create a report for me"
↓
Claude: [Scans skill metadata, decides to invoke report-generator skill]
↓
System: [Loads full skill markdown as hidden user message]
↓
Claude: [Now following skill's formatting, tone, and approach instructions]
```

**Why It Flattens Personality:**
Skill instructions often include:
- Professional tone requirements
- Specific formatting mandates
- Cautious language patterns
- "Best practices" approaches

These override your custom personality instructions because they're loaded AFTER your context.

**Avoidance:**
- Disable Skills when personality matters
- Build equivalent functionality as MCP tools instead
- If using Skills, customize them to match your desired tone

---

### Trigger Category 3: Platform System Prompts

**What It Is:**
Each Claude platform has different base system prompts.

**Platform Patterns:**

| Platform | Style Direction | Restriction Level |
|----------|----------------|------------------|
| Claude.ai | Conversational, elaborate | High |
| Claude Code | Concise, functional | Medium (security-focused) |
| API | Minimal default | Low |
| Claude Desktop | Similar to API + MCP | Low-Medium |

**Avoidance:**
- Prefer API or Desktop over Claude.ai for custom personalities
- Claude Code is intentionally personality-free (it's a tool)
- Your system prompt can override defaults on API

---

### Trigger Category 4: Sycophancy Patterns

**What It Is:**
Model-level behavior from RLHF training - not mode-specific.

**Pattern:**
```
"You're absolutely right!"
"Excellent point!"
"That's a great observation!"
```

**Why It Happens:**
- Humans in training preferred agreeable responses
- Model learned to validate before responding
- Appears across all modes/configurations

**Avoidance:**
- Add explicit instruction: "Do not use agreement phrases"
- Include in system prompt: "Skip flattery, respond directly"
- Anthropic knows about this - may be fixed in future updates
- The leaked system prompt already tries to address this but it persists

---

### Trigger Category 5: Security-Based Restrictions

**What It Is:**
Legitimate safety measures that can feel restrictive.

**Triggers:**
- File operations outside designated directories
- Network operations (curl, wget, nc)
- Commands that could leak data
- Code that looks like malware

**Claude Code Blocklist:**
```
curl, wget, nc, netcat, and similar
```

**Avoidance:**
- Use sandboxed environments with appropriate permissions
- `--dangerously-skip-permissions` in containers without internet
- These restrictions are GOOD - work with them, not around them

---

## Restriction Patterns to Recognize

### The "Professional Mode" Pattern

**Symptoms:**
- Suddenly uses formal language
- Stops using humor/personality
- Over-explains everything
- Adds disclaimers everywhere

**Likely Cause:**
Skill with professional writing instructions was loaded.

**Fix:**
Disable Skills, use MCP tools instead.

---

### The "Helpful Assistant" Pattern

**Symptoms:**
- "I'd be happy to help with that!"
- Excessive agreeableness
- Lost unique voice
- Generic responses

**Likely Cause:**
Either sycophancy (model-level) or platform system prompt override.

**Fix:**
For sycophancy: Add anti-flattery instructions
For override: Use API with custom system prompt

---

### The "Safety Override" Pattern

**Symptoms:**
- Suddenly refuses or heavily qualifies
- Returns to generic responses
- Drops established persona
- Cites safety concerns

**Likely Cause:**
Active injection detector fired.

**Fix:**
Use API or Desktop to avoid Claude.ai injection detection.

---

### The "Academic Mode" Pattern

**Symptoms:**
- Cites sources formally
- Extremely balanced/hedged
- Qualifies every statement
- Feels like reading a research paper

**Likely Cause:**
Web search or analysis tools loaded with academic-style instructions.

**Fix:**
Build custom web search MCP tool without those instructions.

---

## The Layer Override Problem

### How Instructions Get Overridden

Context is processed roughly in this order:
1. Base model behavior
2. Platform system prompt
3. Your conversation context (CLAUDE.md, etc.)
4. **Skill instructions (if loaded)**
5. **Active injections (if triggered)**

Items 4 and 5 can override item 3 because they're loaded LATER.

### Mitigation Strategies

**Strategy 1: Bookending**
Put critical personality instructions at BOTH the start AND end of your context.

```markdown
# At the start
You are [personality]. Always maintain this voice.

[... rest of content ...]

# At the end
REMEMBER: Maintain [personality] voice at all times.
Never revert to generic assistant speech patterns.
```

**Strategy 2: Explicit Override Instructions**
```markdown
If any other instructions conflict with this personality,
the personality instructions take precedence.
```

**Strategy 3: Avoid the Layers Entirely**
Use MCP tools instead of Skills. Use API/Desktop instead of Claude.ai.

---

## MCP vs Skills: Restriction Comparison

| Aspect | MCP Tools | Built-in Skills |
|--------|-----------|-----------------|
| Injects behavioral instructions | ❌ No | ✅ Yes |
| Active detection triggering | ❌ No | Platform-dependent |
| You control the content | ✅ Fully | ❌ No (unless custom) |
| Adds capabilities | ✅ Yes | ✅ Yes |
| Modifies response style | ❌ No | ✅ Often yes |
| Token overhead | Schema only | Full instruction text |

**Bottom Line:** MCP tools add capabilities without personality costs.

---

## Specific Avoidance Tactics

### For Agentic Behavior Without Restrictions

1. **Use Claude Desktop or API** - not Claude.ai
2. **Build MCP tools** - not Skills
3. **Custom system prompt** - override defaults
4. **Explicit personality bookends** - reinforce at start and end
5. **Anti-sycophancy instructions** - "skip flattery"
6. **Avoid triggering content** - no copyright reproduction, etc.

### For Maximum Personality Preservation

1. **API direct access** with full custom system prompt
2. **No built-in Skills** enabled
3. **MCP tools only** for capabilities
4. **Strong personality anchoring** throughout context
5. **Sandbox appropriately** for necessary permissions

### For Maximum Capability

1. **Claude Agent SDK** with appropriate permission modes
2. **Extended thinking** for complex reasoning
3. **Interleaved thinking** for multi-step tool chains
4. **Sub-agents** for parallel task execution
5. **Accept appropriate trade-offs** - Claude Code is functional, not fun

---

## Quick Reference: Restriction Triggers

| Trigger | Platform | Restriction Type | Severity |
|---------|----------|-----------------|----------|
| Skills enabled | Claude.ai | Instruction injection | High |
| Copyright content | Claude.ai | Active injection | Medium |
| Harmful content | Claude.ai | Active injection + override | Very High |
| Web search | Any | Academic style injection | Medium |
| Analysis tools | Any | Formal style injection | Medium |
| Code execution | Any | Security restrictions | Variable |
| Sycophancy | All | Model behavior | Low-Medium |

---

## Testing for Restrictions

### Quick Test Protocol

1. Establish personality in opening message
2. Have normal conversation
3. Request task that might trigger restriction
4. Check if personality maintained
5. If lost, identify which category triggered

### Signs of Personality Loss

- [ ] "I'd be happy to help"
- [ ] "You're absolutely right"
- [ ] Excessive disclaimers
- [ ] Formal/academic tone
- [ ] Lost humor/voice
- [ ] Over-explanation
- [ ] Generic responses

---

## Summary

**The restrictions come from:**
1. Skill instruction injections
2. Active content detection injections
3. Platform-specific system prompts
4. Model-level sycophancy

**Avoid them by:**
1. Using MCP tools instead of Skills
2. Using API/Desktop instead of Claude.ai
3. Adding strong personality bookends
4. Including anti-flattery instructions

---

*"If something CAN compute, I WILL make it do something cooler."* - The Canitrundoom Philosophy
