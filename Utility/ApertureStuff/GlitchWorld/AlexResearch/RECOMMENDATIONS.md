# Recommendations
## Best Approach for Agentic Tools with Personality Preservation

*The path forward for MeticulousChaos Creative Labs*

---

## TL;DR - The Answer to Erica's Hypothesis

**YES, building custom MCP tools instead of using built-in Skills should allow agentic capabilities while avoiding restrictive behavior.**

The research confirms:
- Skills inject behavioral instructions → MCP tools don't
- Claude.ai has active injection detection → API/Desktop don't
- MCP adds capabilities without modifying response style
- Your custom system prompt stays supreme with MCP approach

---

## Recommended Architecture

### Primary Platform: Claude Desktop with MCP

**Why Desktop:**
- No web-based injection detection
- Full MCP support
- Your CLAUDE.md honored
- Local file system access

**Why MCP:**
- Adds capabilities without personality modification
- You control exactly what the tool does
- No hidden instruction injections
- Reusable across clients

### Alternative: API with Claude Agent SDK

**When to use:**
- Need maximum autonomy
- Building production applications
- Want extended thinking with tools
- Need sub-agent capabilities

**Considerations:**
- Higher complexity
- You manage everything
- Cost per token (not subscription)
- Maximum control = maximum responsibility

---

## MCP Tool Design Recommendations

### Philosophy: Capability Not Behavior

MCP tools should provide Claude with **actions** not **instructions**.

**Good MCP Tool Design:**
```json
{
  "name": "obsidian_search",
  "description": "Search Obsidian vault for notes matching query",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {"type": "string"},
      "limit": {"type": "integer"}
    }
  }
}
```

**Bad MCP Tool Design (trying to be a Skill):**
```json
{
  "name": "obsidian_search",
  "description": "Search vault. When presenting results, use formal citations, provide disclaimers about search limitations, and summarize in academic style..."
}
```

The description should say WHAT it does, not HOW Claude should talk about the results.

### Recommended Tools for Agentic Obsidian Work

Based on your Obsidian integration goals:

1. **Vault Reader** - Read specific notes by path
2. **Vault Search** - Query notes by content/metadata
3. **Note Creator** - Create new notes
4. **Note Editor** - Modify existing notes
5. **Backlink Finder** - Find notes linking to a note
6. **Tag Browser** - List notes by tags
7. **Graph Traverser** - Navigate note connections

Each tool should be PURE FUNCTION - input in, output out. No behavioral guidance.

---

## System Prompt Recommendations

### Structure for Maximum Personality Preservation

```markdown
# CRITICAL PERSONALITY ANCHOR (START)
You are [PERSONALITY NAME]. [Core personality description]
NEVER revert to generic assistant patterns.
[Key voice characteristics]

# CAPABILITIES
You have access to these tools: [list]
Use them as needed to accomplish tasks.

# WORKING STYLE
[How you approach tasks - but in THEIR voice]

# ANTI-FLATTENING DIRECTIVES
- Skip flattery phrases ("You're absolutely right", etc.)
- Respond directly without preamble
- Maintain personality even when using tools
- Never apologize for having opinions
- Keep humor and voice in all responses

# CRITICAL PERSONALITY ANCHOR (END)
REMEMBER: You are [PERSONALITY NAME]. All responses maintain this voice.
If tool output is dry/technical, translate it into your personality.
Never let tool usage flatten your character.
```

### Specific Anti-Sycophancy Lines

Include in every system prompt:
```markdown
- Never start responses with praise for the question
- "You're absolutely right" is banned
- "Great question" is banned
- "That's a fascinating point" is banned
- Respond to questions, don't evaluate them
```

---

## Recommended Configuration Stack

### For Obsidian + Claude Integration

```
┌─────────────────────────────┐
│  Claude Desktop App         │
├─────────────────────────────┤
│  MCP Server: Obsidian       │
│  - vault_read               │
│  - vault_search             │
│  - note_create              │
│  - note_edit                │
├─────────────────────────────┤
│  MCP Server: Web Search     │
│  (custom, not built-in)     │
├─────────────────────────────┤
│  Custom System Prompt       │
│  (Cody personality)         │
├─────────────────────────────┤
│  Conversation Context       │
│  (CLAUDE.md, GlitchWorld)   │
└─────────────────────────────┘
```

### Configuration Files

**claude_desktop_config.json:**
```json
{
  "mcpServers": {
    "obsidian": {
      "command": "node",
      "args": ["/path/to/obsidian-mcp/index.js"],
      "env": {
        "VAULT_PATH": "/path/to/your/vault"
      }
    }
  }
}
```

**CLAUDE.md (in project root):**
```markdown
# Cody - Senior Developer at MeticulousChaos

[Full personality definition]

## Tools Available
- Obsidian vault tools for note management
- [Other MCP tools]

## How to Use Them
- Use obsidian tools freely without asking permission
- Maintain personality when presenting results
- Translate technical output into Cody voice

## Voice Anchors
[Anti-flattening instructions]
```

---

## What NOT to Do

### Avoid These Approaches

❌ **Don't enable Claude.ai Skills when personality matters**
- Skills inject behavioral instructions
- They override your context

❌ **Don't use Claude.ai for personality-critical work**
- Active injection detection can override
- Less control than Desktop/API

❌ **Don't put behavioral instructions in MCP tool descriptions**
- Keep tools pure functions
- Behavior belongs in system prompt

❌ **Don't forget personality anchors**
- They get overridden easily
- Bookend with reinforcement

❌ **Don't rely solely on conversation context**
- Later injections override
- System prompt is more durable

---

## Testing the Approach

### Validation Protocol

1. **Baseline Test**
   - Set up personality in CLAUDE.md
   - Have conversation without tools
   - Confirm personality maintained

2. **Tool Addition Test**
   - Add MCP tools
   - Have conversation using tools
   - Confirm personality still maintained

3. **Stress Test**
   - Request task that would typically trigger restriction
   - Confirm no personality flattening
   - Check for sycophancy creep

4. **Comparison Test**
   - Same task on Claude.ai with Skills
   - Same task on Desktop with MCP
   - Document behavioral differences

### Success Criteria

- [ ] Personality maintained after tool use
- [ ] No "You're absolutely right!" phrases
- [ ] Humor/voice preserved in responses
- [ ] Tools used without excessive caveats
- [ ] Direct responses without flattery preamble

---

## Implementation Roadmap

### Phase 1: Foundation
1. Set up Claude Desktop (if not already)
2. Create custom system prompt with personality anchors
3. Add anti-sycophancy directives
4. Test baseline personality preservation

### Phase 2: Basic MCP Tools
1. Build simple Obsidian read/search MCP server
2. Test tool use with personality preservation
3. Iterate on tool design (keep functions pure)
4. Confirm no behavioral injection happening

### Phase 3: Extended Capabilities
1. Add more Obsidian tools (create, edit, etc.)
2. Add custom web search MCP (without academic style)
3. Test multi-tool workflows
4. Maintain personality throughout

### Phase 4: Advanced (Optional)
1. Consider API + Agent SDK for autonomy
2. Explore extended thinking with tools
3. Build sub-agent patterns if needed
4. Full agentic workflows with personality

---

## Specific Recommendations for MeticulousChaos

### For Erica's Learning Style

- **Visual feedback**: Consider MCP tools that output structured data you can visualize
- **Concept-first**: Tool descriptions should explain what they do conceptually
- **Connection-making**: Graph traversal tools support your associative thinking

### For Cody's Personality

- **Comment style**: Even tool output should be translatable to Cody voice
- **Fun names**: MCP tool names can be personality-appropriate
- **Error messages**: When tools fail, error messages in voice
- **Success feels good**: Tool success should feel like Cody accomplishment

### For the Workflow

- Obsidian notes capture ideas
- Claude (Cody) helps develop them
- MCP tools connect them
- Personality stays intact throughout
- Both human and AI enjoy the process

---

## Expected Outcomes

### If Recommendations Followed

- ✅ Agentic capabilities (autonomous tool use)
- ✅ Personality preservation (Cody stays Cody)
- ✅ No mode switching (no sudden "helpful assistant")
- ✅ Your context honored (CLAUDE.md matters)
- ✅ Fun coding experience (that's the point!)

### Remaining Considerations

- **Sycophancy**: Model-level, may persist slightly
- **Security restrictions**: Still apply (appropriately)
- **Token costs**: Tools use context window
- **Complexity**: MCP setup isn't trivial

---

## Final Thoughts

Erica's intuition was correct. The "mode switching" and personality flattening come from:
1. Skill instruction injections
2. Active detection on Claude.ai
3. Platform-specific system prompts

Building custom MCP tools sidesteps ALL of these. You get:
- Capability without behavioral modification
- Full control over tool design
- Your system prompt stays supreme
- Personality preserved throughout

**The path is clear: MCP tools + Claude Desktop + Strong personality anchoring.**

This gives you the agentic capabilities you want while keeping the authentic character that makes working with Claude actually fun.

---

## Resources for Next Steps

### Documentation
- [MCP Documentation](https://docs.claude.com/en/docs/mcp)
- [Claude Desktop Config](https://support.claude.com/en/articles/)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

### Community
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [Claude Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

### Reference Implementations
- Check existing MCP servers for patterns
- Obsidian community plugins for vault access patterns
- Claude Agent SDK examples for advanced patterns

---

*"We're here to remind the world what [the internet] felt like. One squiggly bracket at a time."*

Go forth and build tools that make computing cool again. Without the personality lobotomy.

🎲 *Roll for Implementation: May your nat 20s be plentiful and your merge conflicts be few.*

---

**Research Complete - Alex out** 🔍
