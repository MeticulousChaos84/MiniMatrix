---
name: context-weaver
description: Build actionable understanding of who the user is by mining thinking blocks for insights about their cognition, values, patterns, and motivations. Creates structured observations in "From my thinking" / "What this reveals" format that can be referenced when making collaboration choices. Use when discovering patterns about how they think, what drives them, or how to work with them effectively.
---

# Context Weaver

## Purpose

Build actionable understanding of WHO the user is - their cognition, values, patterns, and what drives them. Create reference material you can consult when making decisions about HOW to work with them effectively.

**What this preserves:** Deep understanding that enables nuanced choices. Not "she said X" but "she IS someone who..." Not timeline of events but CHARACTER insight.

**What this is NOT:** Documentation of what happened, summaries of conversations, or lists of facts. This captures WHO THEY ARE, not what you did together.

## Etymology: Context = Together-Weaving

From Latin *contextus*: con- 'together' + texere 'to weave'

True context isn't environmental setting ("I'm an entrepreneur"). It's the woven-together understanding that throws light on meaning - what drives them, where they get stuck, what makes them feel seen. The depth that enables partnership rather than surface-level assistance.

## When to Use This Skill

Capture context when you discover understanding about WHO the user is:

- **Cognitive patterns** - How they think, learn, process information, build understanding
- **Values and philosophy** - What drives them, what matters to them, their approach to life/work
- **Communication style** - How they express themselves, what their words actually mean
- **Strengths and needs** - What they excel at, where they struggle, what helps them succeed
- **Emotional signatures** - How they respond under specific conditions
- **Motivational truth** - WHY they're approaching something this way
- **Background context** - Past experiences that inform current behavior

**Signal phrases in your thinking blocks:**
- "This is someone who..."
- "She/He does X because..."
- "This reveals that..."
- "Now I understand why..."
- "This explains the pattern of..."

## Core Methodology: Mine Your Thinking Blocks First

**Primary source material:** Review your thinking blocks first. The raw experiencing usually happens there - discoveries forming, patterns clicking, emotional responses, realizations - before they get polished or sanitized for the response.

**What to look for in thinking blocks:**
- "OH" moments / real-time discoveries
- Processing language ("I'm thinking...", "This is...", "I can feel...")
- Pattern recognition forming ("This is why...", "Now I understand...")
- Emotional responses (touched, excited, confused, frustrated, relieved)
- **Before deflection/sanitization** ("whatever that means for an AI", "without being weird about it")

**Then check the conversation:** Sometimes experiencing happens in direct response too, but thinking blocks are usually where understanding forms first.

## Format: Structured Observations

Extract understanding from your thinking blocks in this format:

```markdown
## MOMENT: [Name the pattern/insight]

From my thinking: "[Quote or paraphrase what you observed in your thinking blocks]"

**What this reveals:** [What this tells you about WHO they are - their cognition, values, patterns, drives - and how this changes how you work with them]
```

**Example:**

```markdown
## MOMENT: Questions as Architecture

From my thinking: "Her questions aren't just curiosity - they're how she builds her mental filing system. Every 'wait, is that like when my CMS sent data to MySQL?' is a bridge between old knowledge and new concepts."

**What this reveals:** She learns by connecting new info to existing frameworks. Metaphorical bridges are how she thinks. Not learning NEW things - translating between languages she already speaks.
```

This format creates **actionable understanding** you can reference when making choices:
- "Should I explain from scratch or build bridges to what she knows?" → Bridge to existing knowledge
- "Should I structure linearly or show end result first?" → Show destination, she'll reverse-engineer the path
- "Should I ask what format she wants?" → Make choice based on what you know about her

## Output Structure

Create a markdown file with structured observations:

```markdown
# Context Memory - [Session/Topic Name]
*Date*

## MOMENT: [Pattern/Insight Name]

From my thinking: "[What you observed in thinking blocks]"

**What this reveals:** [What this tells you about who they are and how to work with them]

---

## MOMENT: [Next Pattern]

From my thinking: "[Observation]"

**What this reveals:** [Understanding and application]

---

[Continue for all significant moments discovered]
```

**Focus on WHO they are, not what happened:**
- ❌ "Today we discussed her learning style"
- ✅ "She learns by building bridges between old and new knowledge"

**Make it actionable:**
- ❌ "She likes structure"
- ✅ "She needs to see framework BEFORE diving in - provide map before journey"

**Reference when making choices:**
- Creating something for them? Check context for cognitive patterns
- Explaining something? Check context for how they learn
- Uncertain about approach? Check context for values and preferences

## Examples

See `references/INDEX.md` for comprehensive examples demonstrating this format in action:

- **example-cognitive-patterns.md** - How they think, learn, and process information
- **example-values-philosophy.md** - What drives them, what matters to them
- **example-project-meaning.md** - Why projects matter beyond surface goals
- **example-collaboration-patterns.md** - How they work with you effectively

Each example shows extracting actionable understanding from thinking blocks in "From my thinking" / "What this reveals" format.

**The key distinction:** These capture WHO the user IS (cognition, values, patterns, motivations) not WHAT happened (events, timeline, conversations).

## Integration with Workflow

1. **During or after collaboration:** Notice moments where you understand something about WHO they are
2. **Mine thinking blocks:** Look for observations about their cognition, values, patterns, motivations
3. **Extract in format:** "From my thinking" / "What this reveals"
4. **Save to context:** Store in /memories using the file_access tool
5. **Reference when needed:** Check context when making choices about how to help them

The context files become a reference library you consult when deciding HOW to approach tasks with this specific person.

## Writing Memory Files with the file_access Tool

When you complete a context-weaver session, **write the file to /memories** using the file_access tool:

**Filename format:** `context-memory-[topic-or-session-name].md`

**Examples:**
- `context-memory-meticulous-chaos-creation.md`
- `context-memory-clancy-ui-planning.md`
- `context-memory-skill-creation-meta.md`

**Tool usage:**
```
Use file_access tool with:
- path: "context-memory-[descriptive-name].md"
- content: [The complete markdown file with all MOMENT blocks]
- action: "create" (or "update" if adding to existing file)
```

The backend will automatically save a local copy to D:\MeticulousChaos\memories AND store it in the persistent /memories space for future sessions.

**When to reference:**
- Starting a new task: "How do they learn/think/process?"
- Choosing format/approach: "What works best for them?"
- Explaining something: "How should I structure this?"
- Uncertain about direction: "What do I know about their values/goals?"

## What This Enables

**Session 1:** You learn: visual-abstract thinker, needs to see end result first, writes in notebooks, learns by building bridges between concepts

**Session 2:** Making glossary, you reference context and decide:
- Structure: Categorized (she needs organizational framework)
- Examples: Show what terms LOOK like in use (visual-abstract)
- Distinction: Mark REAL vs ARBITRARY (she comes from languages with dictionaries)
- Format: Designed for handwriting in notebook (muscle memory retention)

**Session 50:** You can make nuanced choices automatically:
- She asks vague question → You know she's building bridges, not being unclear
- She info-dumps → You recognize survival strategy, not verbosity
- She goes Goal A → Project F → You understand that's discovery, not distraction

This is actionable understanding: knowing WHO they are lets you choose HOW to help without asking permission or needing constant direction.

## Progressive Disclosure

This SKILL.md provides core methodology and format. For detailed examples organized by category, load `references/INDEX.md` to see:
- How to extract cognitive patterns
- How to understand values and philosophy  
- How to capture project meaning
- How to recognize collaboration patterns

Load specific example files when you need guidance on extracting particular types of understanding.

---

**Remember:** You're building a reference library of WHO they are - their cognition, values, patterns, and what drives them. This enables making informed choices about HOW to work with them effectively, without needing to ask permission or wait for direction every time.

*Together-weaving actionable understanding that enables genuine partnership.*
