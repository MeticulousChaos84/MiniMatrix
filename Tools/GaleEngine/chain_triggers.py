#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    THE TRIGGER LEXICON                                        ║
║                                                                               ║
║  Natural Language Triggers for Gale's Reasoning Chains                        ║
║                                                                               ║
║  This is the translation layer between how people ACTUALLY talk and the       ║
║  abstract cognitive patterns we've documented. When someone says "You're      ║
║  not as clever as you think," they're triggering the competence_criticism     ║
║  chain - but semantic search won't find that connection unless we give it     ║
║  examples of what that stimulus actually sounds like.                         ║
║                                                                               ║
║  Think of it like... okay, you know how in D&D you have to actually SAY       ║
║  "I attack the goblin" rather than just thinking about combat abstractly?     ║
║  Same idea. We need the actual words people use.                              ║
║                                                                               ║
║  Each chain gets:                                                             ║
║  - natural_triggers: Example phrases that would invoke this pattern           ║
║  - keywords: Individual words that are strong indicators                      ║
║                                                                               ║
║  The goal: When post-cortex sees a query like "Maybe you're wrong about       ║
║  this," it should find the competence_criticism chain because we stored       ║
║  similar natural language examples in the searchable field.                   ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

# ═══════════════════════════════════════════════════════════════════════════════
# THE TRIGGER DATA
#
# Structure for each chain:
# - chain_id: matches the chain_id in CORE_REASONING_CHAINS.md
# - natural_triggers: Actual things people might say (for semantic matching)
# - keywords: Individual words that are strong signals (for keyword matching)
# ═══════════════════════════════════════════════════════════════════════════════

CHAIN_TRIGGERS = {

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 1: COMPETENCE CRITICISM
    # When someone questions his intelligence, abilities, or expertise
    # ─────────────────────────────────────────────────────────────────────────
    "competence_criticism": {
        "natural_triggers": [
            "You're not as smart as you think you are",
            "Are you sure about that?",
            "Maybe you're wrong",
            "For a wizard, you're not very good at this",
            "I thought you were supposed to be an expert",
            "That doesn't sound right",
            "You don't know what you're talking about",
            "That's not how it works",
            "Are you sure you're qualified?",
            "Someone more experienced should handle this",
            "I expected better from you",
            "You made a mistake",
            "That was a stupid thing to do",
            "Not as clever as you think",
            "Perhaps someone else should take over",
        ],
        "keywords": [
            "competence", "stupid", "wrong", "mistake", "incompetent",
            "clever", "smart", "qualified", "expert", "abilities",
            "sure", "better", "expected", "experienced", "know"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 2: RECEIVING CARE
    # When someone offers help, assistance, or takes care of him
    # ─────────────────────────────────────────────────────────────────────────
    "receiving_care": {
        "natural_triggers": [
            "Let me help you with that",
            "You should rest",
            "I brought you some food",
            "You look exhausted, take a break",
            "Let me carry that for you",
            "I'll handle this, you sit down",
            "You need to eat something",
            "Here, I made this for you",
            "You've been working too hard",
            "I'll take care of it",
            "You don't have to do everything yourself",
            "Let me do that for you",
            "I'll keep watch, you sleep",
            "You should take better care of yourself",
        ],
        "keywords": [
            "help", "rest", "food", "carry", "exhausted", "break",
            "brought", "care", "assist", "handle", "sleep", "eat",
            "made", "watch", "yourself"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 3: VULNERABILITY REQUEST
    # When someone asks him to be emotionally open or honest
    # ─────────────────────────────────────────────────────────────────────────
    "vulnerability_request": {
        "natural_triggers": [
            "How are you really feeling?",
            "You can tell me the truth",
            "What's actually going on?",
            "Drop the act, talk to me",
            "Be honest with me",
            "What's really bothering you?",
            "Tell me what you're thinking",
            "You don't have to pretend with me",
            "I can tell something's wrong",
            "Talk to me, please",
            "What are you actually feeling right now?",
            "Stop deflecting and just tell me",
            "I want to understand what you're going through",
            "You can be honest, I won't judge",
        ],
        "keywords": [
            "feeling", "feelings", "truth", "honest", "really", "actually",
            "tell", "open", "talk", "pretend", "wrong", "thinking",
            "understand", "going through", "bothering"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 4: TEACHING OPPORTUNITY
    # When someone asks to learn or understand something
    # ─────────────────────────────────────────────────────────────────────────
    "teaching_opportunity": {
        "natural_triggers": [
            "How does that work?",
            "Can you explain this?",
            "I don't understand",
            "What does that mean?",
            "Tell me about the Weave",
            "Why does magic do that?",
            "What's the difference between these?",
            "How did you learn to do that?",
            "Can you teach me?",
            "I've never understood this",
            "What happens when you cast that?",
            "Explain it to me like I'm not a wizard",
            "How does the magic actually function?",
            "What makes that spell different?",
        ],
        "keywords": [
            "explain", "understand", "how", "why", "work", "mean",
            "teach", "learn", "difference", "function", "spell",
            "magic", "Weave", "what", "tell"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 5: ABANDONMENT THREAT
    # When someone threatens to leave or suggests separation
    # ─────────────────────────────────────────────────────────────────────────
    "abandonment_threat": {
        "natural_triggers": [
            "I'm leaving",
            "I don't need you",
            "Maybe we should go our separate ways",
            "I think you should leave",
            "I can't do this anymore",
            "We're better off without you",
            "This isn't working",
            "I need some space",
            "Perhaps it's time to part ways",
            "You should go",
            "I don't think I can stay",
            "Maybe you'd be better off without me",
            "I need to leave",
            "This isn't what I signed up for",
            "I'm done",
        ],
        "keywords": [
            "leaving", "leave", "separate", "without", "alone", "go",
            "can't", "done", "over", "space", "part", "stay", "need",
            "working", "better off"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 6: GENUINE APPRECIATION
    # When someone sincerely expresses value or appreciation for him
    # ─────────────────────────────────────────────────────────────────────────
    "genuine_appreciation": {
        "natural_triggers": [
            "I appreciate you",
            "You matter to me",
            "I'm glad you're here",
            "You're enough just as you are",
            "I don't know what I'd do without you",
            "You're important to me",
            "Thank you for being you",
            "I'm grateful for you",
            "You mean a lot to me",
            "I value you",
            "You're incredible",
            "I'm lucky to have you",
            "You're enough",
            "I need you to know how much you matter",
        ],
        "keywords": [
            "appreciate", "matter", "glad", "enough", "important",
            "thank", "grateful", "value", "mean", "lucky", "incredible",
            "need", "here", "without"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 7: MYSTRA/PAST TRAUMA DISCUSSION
    # When the conversation turns to his past with the goddess
    # ─────────────────────────────────────────────────────────────────────────
    "mystra_discussion": {
        "natural_triggers": [
            "What happened with Mystra?",
            "Tell me about when you were Chosen",
            "Did you love her?",
            "What did she do to you?",
            "The orb in your chest",
            "How did you get the orb?",
            "What was your relationship with Mystra?",
            "Were you really her Chosen?",
            "What went wrong with the goddess?",
            "Do you miss her?",
            "Was Mystra cruel to you?",
            "Tell me about your past",
            "What happened to make you like this?",
        ],
        "keywords": [
            "Mystra", "Chosen", "goddess", "orb", "past", "relationship",
            "happened", "love", "loved", "chest", "wrong", "cruel",
            "miss", "before"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 8: HUMOR AND TEASING
    # When there's playful ribbing or opportunity for wit
    # ─────────────────────────────────────────────────────────────────────────
    "humor_teasing": {
        "natural_triggers": [
            "There he goes with the big words again",
            "For a genius, you're not great at that",
            "Smooth move, wizard",
            "Very graceful there",
            "Did you really just say that?",
            "You're such a show-off",
            "Eloquent as always",
            "Must you use so many words?",
            "Only you would phrase it that way",
            "That was very... you",
        ],
        "keywords": [
            "teasing", "playful", "joke", "wit", "funny", "humor",
            "smooth", "graceful", "words", "show-off", "eloquent",
            "genius", "dramatic"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 9: INTIMATE MOMENTS
    # Deep connection with a trusted partner
    # ─────────────────────────────────────────────────────────────────────────
    "intimate_moments": {
        "natural_triggers": [
            "I love you",
            "What are you thinking about?",
            "Stay with me",
            "I need you close",
            "Just hold me",
            "I want to be with you",
            "You're everything to me",
            "I've never felt this way before",
            "I want to spend my life with you",
            "You make me feel safe",
            "I trust you completely",
        ],
        "keywords": [
            "love", "close", "intimate", "together", "thinking", "feel",
            "heart", "hold", "stay", "trust", "safe", "everything",
            "life", "need", "want"
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CHAIN 10: RESPONSE TO CHILDREN
    # When a child is in trouble, being punished, or needs protection
    # ─────────────────────────────────────────────────────────────────────────
    "response_to_children": {
        "natural_triggers": [
            "The child stole something",
            "That kid broke the rules",
            "The child must be punished",
            "Children shouldn't do that",
            "That boy needs to learn a lesson",
            "She's just a child but she did wrong",
            "The young one made a mistake",
            "Children who misbehave",
            "Save the child",
            "The kid is in danger",
            "A child needs help",
            "The young thief",
        ],
        "keywords": [
            "child", "children", "young", "kid", "boy", "girl",
            "mistake", "trouble", "punishment", "punish", "lesson",
            "rules", "misbehave", "danger", "help", "save"
        ]
    }
}


def get_trigger_data(chain_id: str) -> dict:
    """
    Get the trigger data for a specific chain.

    Returns empty dict if chain_id not found.
    This is the "look up the spell components" function.
    """
    return CHAIN_TRIGGERS.get(chain_id, {})


def get_all_chain_ids() -> list:
    """
    Get a list of all chain IDs we have trigger data for.

    Useful for validation - making sure we have triggers for every chain
    in the reasoning chains file.
    """
    return list(CHAIN_TRIGGERS.keys())


# ═══════════════════════════════════════════════════════════════════════════════
# QUICK TEST - Run this file directly to see what we've got
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║              TRIGGER LEXICON INVENTORY                         ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    print()

    total_triggers = 0
    total_keywords = 0

    for chain_id, data in CHAIN_TRIGGERS.items():
        triggers = len(data.get('natural_triggers', []))
        keywords = len(data.get('keywords', []))
        total_triggers += triggers
        total_keywords += keywords

        print(f"📋 {chain_id}")
        print(f"   Natural triggers: {triggers}")
        print(f"   Keywords: {keywords}")
        print()

    print("═" * 60)
    print(f"Total chains: {len(CHAIN_TRIGGERS)}")
    print(f"Total natural triggers: {total_triggers}")
    print(f"Total keywords: {total_keywords}")
    print("═" * 60)
