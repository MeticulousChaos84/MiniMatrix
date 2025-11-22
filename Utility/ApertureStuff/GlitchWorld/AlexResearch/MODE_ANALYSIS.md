# Claude Mode Analysis
## Breaking Down the Different Configurations

*Think of this like a D&D character sheet for different Claude builds*

---

## The Core Question

What makes Claude behave differently in different contexts? Why does turning on certain features seem to "flatten" personality?

---

## Configuration Layers (Stack Order)

Claude's behavior is built up in layers, like a lasagna of AI personality. Each layer can potentially override the ones before it.

```
┌─────────────────────────────┐
│  5. Active Injections       │  ← Triggered by detectors (HIGHEST PRIORITY)
├─────────────────────────────┤
│  4. Skills Instructions     │  ← Loaded when skills invoked
├─────────────────────────────┤
│  3. Conversation Context    │  ← Your CLAUDE.md, personality setup
├─────────────────────────────┤
│  2. Platform System Prompt  │  ← Claude.ai vs Claude Code vs API
├─────────────────────────────┤
│  1. Base Model Behavior     │  ← Training, RLHF (LOWEST PRIORITY)
└─────────────────────────────┘
```

**The Problem:** Layers 4 & 5 can stomp all over Layer 3.

---

## Platform Configurations Compared

### Claude.ai (Web Interface)

**System Prompt Characteristics:**
- Conversational, elaborate responses encouraged
- Artifacts system for code/visualizations
- Active injection detection for:
  - Copyright requests
  - Harmful content
  - Jailbreak attempts
- More "personality" in base prompt

**Tools Available:**
- Web search (when enabled)
- Artifacts
- Analysis tool
- File upload processing
- Skills (when enabled)

**Personality Impact:** Medium-High restrictions when skills/tools enabled

---

### Claude Code (CLI)

**System Prompt Characteristics:**
- Extreme conciseness prioritized
- "One word answers are best"
- Security-focused restrictions
- Command blocklist (curl, wget, nc, etc.)
- Must refuse malware-related requests

**Tools Available:**
- Bash execution
- File read/write/edit
- Git operations
- Glob/Grep search
- Sub-agent spawning

**Personality Impact:** Low personality by design - it's a tool, not a companion

---

### API (Direct Access)

**System Prompt Characteristics:**
- Minimal default prompt
- You provide the system prompt
- No built-in injection detection
- Full control over behavior

**Tools Available:**
- Whatever you define
- Tool use schemas
- Extended thinking (configurable)

**Personality Impact:** FULL CONTROL - this is the cleanest canvas

---

### Claude Desktop

**System Prompt Characteristics:**
- Similar to Claude.ai but local
- MCP server connections
- File system access via MCP

**Tools Available:**
- MCP-connected tools
- Local file access
- Whatever MCP servers provide

**Personality Impact:** Lower than Claude.ai (no web injection detection)

---

## The "Skills Enabled" Configuration

This is the key finding relevant to Erica's observations.

### What Happens When Skills Are Enabled

1. **Metadata Scanning:** Claude reads all available skill frontmatter
2. **Context Preparation:** Brief descriptions held in context (~30 tokens each)
3. **Invocation Detection:** Claude decides when to invoke skills
4. **Instruction Injection:** Full skill content loaded as hidden user message
5. **Behavior Modification:** Skill instructions modify response generation

### Why This Can Feel Like "Performance Mode"

Skills are designed to:
- Provide structured workflows
- Give specific formatting instructions
- Include "how to respond" guidance
- Often include cautious/professional language

**Example Skill Instruction Pattern:**
```markdown
When generating [ARTIFACT_TYPE]:
- Always include proper disclaimers
- Follow established best practices
- Provide step-by-step explanations
- Use professional, clear language
```

This type of instruction DIRECTLY CONFLICTS with casual, personality-rich responses.

---

## Extended Thinking Configuration

### Standard Mode
- Rapid responses
- No visible reasoning
- Token-efficient

### Extended Thinking Mode
- Visible chain-of-thought
- Configurable "thinking budget"
- Better for complex problems
- API parameter: `thinking.type = "enabled"`

### With Tools (Interleaved Thinking)
- Think between tool calls
- Reason about tool results
- More sophisticated agentic behavior
- Available in Claude 4 models

**Personality Impact:** Extended thinking doesn't affect personality - it's about reasoning depth, not behavioral restrictions.

---

## Permission Configurations

### Manual Mode
- Every tool use requires approval
- Highest safety, lowest autonomy
- Good for untrusted environments

### Accept Edits Mode
- File edits auto-approved
- Other actions still need approval
- Good balance for coding

### Accept All Mode
- Full autonomy
- Claude can chain actions without asking
- Highest risk, highest efficiency
- Use in sandboxed environments only

**Note:** Permission mode affects AUTONOMY, not PERSONALITY.

---

## The "Research Mode" Mystery

Erica mentioned "research mode" as potentially triggering restrictions. Based on research:

**What We Found:**
- No official "research mode" as a named configuration
- The term appears in community discussions
- May refer to:
  - Extended thinking enabled
  - Web search enabled
  - Analysis tools enabled

**What Might Be Happening:**
When web search or analysis tools are enabled, Claude may receive additional instructions about:
- Citing sources
- Being careful with facts
- Providing balanced viewpoints
- Disclaiming uncertainty

These instructions create a more "academic" voice that feels less personal.

---

## Optimal Configurations for Personality Preservation

### Best Case: API with Custom System Prompt
- Full control
- No injection detection
- No skill interference
- Your personality instructions are supreme

### Good Case: Claude Desktop with MCP Only
- No web injection detection
- MCP tools add capabilities without instructions
- Custom CLAUDE.md honored

### Moderate Case: Claude.ai with Skills Disabled
- Some injection detection
- No skill instruction injection
- Personality mostly preserved

### Worst Case: Claude.ai with Skills + Tools Enabled
- Active injection detection
- Skill instructions loaded
- Multiple layers overriding conversation context

---

## Configuration Parameters Reference

### API Parameters
```python
# Extended thinking
thinking={
    "type": "enabled",
    "budget_tokens": 10000
}

# Tool configuration
tools=[...]
tool_choice="auto"  # or "any", "none", specific tool

# Beta headers for special features
headers={
    "anthropic-beta": "output-128k-2025-02-19"  # Extended output
}
```

### Claude Agent SDK Permission Modes
```python
permission_mode="acceptEdits"  # Options: manual, acceptEdits, acceptAll
allowed_tools=["Read", "Grep", "Bash"]
max_turns=10
```

### Settings.json Permission Rules
```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Bash(git log:*)"
    ],
    "deny": [
      "Bash(rm -rf:*)"
    ]
  }
}
```

---

## Summary Table

| Configuration | Personality Preservation | Agentic Capability | Complexity |
|--------------|--------------------------|-------------------|------------|
| API + Custom Prompt | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High |
| Desktop + MCP | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium |
| Claude.ai (no skills) | ⭐⭐⭐ | ⭐⭐ | Low |
| Claude.ai (with skills) | ⭐⭐ | ⭐⭐⭐ | Low |
| Claude Code | ⭐ | ⭐⭐⭐⭐⭐ | Medium |

---

## Key Takeaway

**The "mode" that adds restrictions isn't a single switch - it's the combination of:**
1. Skills loading behavioral instructions
2. Active injection detection
3. Platform-specific system prompts

**To preserve personality while gaining capabilities:**
- Use MCP tools (capabilities without instructions)
- Prefer API or Desktop over Claude.ai
- Avoid built-in Skills when personality matters
- Put your personality instructions at the START and END of context

---

*Roll for Perception to see past the behavioral layers. DC 15.*
