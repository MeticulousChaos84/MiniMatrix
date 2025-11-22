#!/usr/bin/env python3
"""
ACT 2 DIALOGUE EXTRACTOR FOR GALE'S MEMORY BANKS
================================================
Think of this like a Mind Flayer's dream journal - we're pulling out all the
juicy conversational bits from the Shadow-Cursed Lands and beyond!

This script reads BG3 dialogue HTML files and converts them to nice
markdown summaries for Gale to "remember."

Created by Cody @ MeticulousChaos for Erica's BG3 project
"""

import re
import os
from pathlib import Path
from html import unescape

# ============================================================================
# CONFIGURATION SECTION - Like rolling for initiative, but for file paths
# ============================================================================
SOURCE_DIR = Path("/home/user/MiniMatrix/SourceMaterials/game-dialogue-files/raw-files/general/act2/")
OUTPUT_DIR = Path("/home/user/MiniMatrix/SourceMaterials/game-dialogue-files/general/act2/")

# The Chosen 27 - our target files (like Ketheric's hit list, but less murdery)
FILES_TO_PROCESS = [
    "HAV_WrootRequest_UnfortunateGnome.html",
    "HAV_WrootRequest_Wulbren.html",
    "MOO_Assault_BossFightIntro.html",
    "MOO_Assault_Jaheira.html",
    "MOO_Audience_Ketheric.html",
    "MOO_BalthazarLab_Circle.html",
    "MOO_BugBearVendor.html",
    "MOO_CatBusiness.html",
    "MOO_Execution.html",
    "MOO_Executioner.html",
    "MOO_InfernalVendor.html",
    "MOO_Jailbreak_Boat.html",
    "MOO_Jailbreak_Lover.html",
    "MOO_Jailbreak_ProdigySister.html",
    "MOO_Jailbreak_Warden.html",
    "MOO_Jailbreak_Wulbren.html",
    "MOO_MintharaFate_Torture.html",
    "MOO_WallTentacle_Tentacle.html",
    "SCE_Alfira.html",
    "SCE_IsobelNightsongReunion.html",
    "SCE_Jaheira_Debrief.html",
    "SCE_Jergal_Debrief.html",
    "SCE_Mattis.html",
    "SCE_Minthara.html",
    "SCE_UnfortunateGnome.html",
    "SCE_Wulbren.html",
    "SHA_AcademyAltar.html",
]

# ============================================================================
# HELPER FUNCTIONS - The arcane components that make the spell work
# ============================================================================

def clean_html_text(text):
    """
    Scrubs HTML like Gale scrubs magical artifacts from his memory.
    Removes tags, decodes entities, and makes everything nice and readable.
    """
    # Strip HTML tags (but keep the content - we're not monsters)
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities like &lt; becomes < (basic transmutation magic)
    text = unescape(text)
    # Clean up whitespace (tidying up like Shadowheart organizes her... nevermind)
    text = ' '.join(text.split())
    return text.strip()


def extract_synopsis(html_content):
    """
    Finds the synopsis section - the TL;DR of what this conversation is about.
    Like reading the back of a D&D module before you run it.
    """
    match = re.search(r"<span class='synopsis'>(.*?)</span>", html_content, re.DOTALL)
    if match:
        return clean_html_text(match.group(1))
    return "No synopsis available."


def extract_trigger_info(html_content):
    """
    Gets the 'how to trigger' info - basically the walkthrough for finding this dialogue.
    Like knowing which barrel to examine in a dungeon.
    """
    match = re.search(r"<span class='howtotrigger'>(.*?)</span>", html_content, re.DOTALL)
    if match:
        text = match.group(1)
        # Clean up but preserve line breaks for readability
        text = re.sub(r'<br\s*/?>', '\n', text)
        text = re.sub(r'<[^>]+>', '', text)
        return unescape(text).strip()
    return ""


def find_starting_node(html_content):
    """
    Finds the first dialogue node - like finding the quest giver in a tavern.
    Returns the node number or '1' if we can't figure it out.
    """
    # Look for the first nodeid
    match = re.search(r"<span class='nodeid'>(\d+)\.", html_content)
    if match:
        return match.group(1)
    return "1"


def extract_dialogue_lines(html_content):
    """
    Pulls out all the dialogue lines with their speakers.
    This is the meat of the conversation - who says what to whom.

    Returns a list of tuples: (speaker_name, dialogue_text, is_player)
    """
    dialogues = []

    # Pattern for NPC lines - they have the nested div structure
    # This regex is more arcane than anything in Gale's spellbook
    npc_pattern = r"<div class='npc'[^>]*>([^<]+)</div>.*?<span class='dialog'>([^<]*(?:<i>[^<]*</i>[^<]*)*)</span>"

    for match in re.finditer(npc_pattern, html_content, re.DOTALL):
        speaker = clean_html_text(match.group(1))
        dialogue = clean_html_text(match.group(2))
        if dialogue:  # Only add if there's actual dialogue
            dialogues.append((speaker, dialogue, False))

    # Pattern for Player lines
    player_pattern = r"<span class='npcplayer'>Player</span><span>: </span><span class='dialog'>([^<]*(?:<i>[^<]*</i>[^<]*)*)</span>"

    for match in re.finditer(player_pattern, html_content):
        dialogue = clean_html_text(match.group(1))
        if dialogue:
            dialogues.append(("Player", dialogue, True))

    return dialogues


def extract_companion_interjections(html_content):
    """
    Specifically hunts for Gale and Astarion dialogue lines.
    Like looking for your favorite characters in a movie credits.

    The pattern 'npc'.*>Gale< catches lines where these companions speak.
    """
    interjections = {"Gale": [], "Astarion": []}

    # Pattern to find NPC dialogue where the speaker is Gale or Astarion
    for companion in ["Gale", "Astarion"]:
        # This pattern captures the whole dialogue block for our beloved companions
        pattern = rf"<div class='npc'[^>]*>{companion}</div>.*?<span class='dialog'>([^<]*(?:<i>[^<]*</i>[^<]*)*)</span>"

        for match in re.finditer(pattern, html_content, re.DOTALL):
            dialogue = clean_html_text(match.group(1))
            if dialogue and dialogue not in interjections[companion]:
                interjections[companion].append(dialogue)

    return interjections


def generate_narrative_summary(dialogues, synopsis):
    """
    Takes all those dialogue lines and weaves them into a narrative summary.
    Like a bard retelling a tavern conversation, but more accurate.
    """
    if not dialogues:
        return synopsis

    # Group dialogues by speaker to create flow
    narrative_parts = []

    # Get unique NPCs (not including Player)
    npcs = list(set(speaker for speaker, _, is_player in dialogues if not is_player))

    if npcs:
        narrative_parts.append(f"This conversation features: {', '.join(npcs)}.")

    # Add the synopsis as the main description
    narrative_parts.append("")
    narrative_parts.append(synopsis)
    narrative_parts.append("")

    # Show key dialogue examples
    narrative_parts.append("**Key Dialogue Excerpts:**")

    # Get first few NPC lines and player choices
    npc_lines = [(s, d) for s, d, p in dialogues if not p][:5]
    player_choices = [(s, d) for s, d, p in dialogues if p][:3]

    for speaker, dialogue in npc_lines:
        narrative_parts.append(f"- **{speaker}:** \"{dialogue}\"")

    if player_choices:
        narrative_parts.append("")
        narrative_parts.append("**Sample Player Choices:**")
        for _, dialogue in player_choices:
            narrative_parts.append(f"- \"{dialogue}\"")

    return "\n".join(narrative_parts)


def get_descriptive_title(filename):
    """
    Transforms a filename like 'MOO_Jailbreak_Wulbren.html' into a nice title
    like 'Moonrise Towers - Jailbreak: Wulbren'

    This is basically Name Generator magic for file titles.
    """
    # Remove extension
    name = filename.replace('.html', '')

    # Location prefixes (like reading a map of the Shadow-Cursed Lands)
    prefix_map = {
        'HAV': 'Last Light Inn',
        'MOO': 'Moonrise Towers',
        'SCE': 'Post-Moonrise',  # Scene after the assault
        'SHA': 'Shadow-Cursed Lands',
        'COL': 'Colony',
        'TWN': 'Reithwin Town',
    }

    parts = name.split('_')
    location = prefix_map.get(parts[0], parts[0])

    # Build the rest of the title
    rest = ' - '.join(parts[1:])
    rest = rest.replace('_', ': ')

    return f"{location} - {rest}"


def html_to_markdown_filename(html_filename):
    """
    Converts 'MOO_Jailbreak_Wulbren.html' to 'moo_jailbreak_wulbren.md'
    Lowercase with underscores, just like the task requested.
    """
    return html_filename.replace('.html', '.md').lower()


def process_single_file(html_filename):
    """
    The main extraction spell for a single file.
    Like casting Identify on a mysterious dialogue tree.

    Returns the output filename if successful, None if it fails.
    """
    source_path = SOURCE_DIR / html_filename

    # Check if the source file exists (don't want to cast on empty air)
    if not source_path.exists():
        print(f"  [!] Source file not found: {html_filename}")
        return None

    # Read the HTML content
    with open(source_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # Extract all the juicy bits
    synopsis = extract_synopsis(html_content)
    starting_node = find_starting_node(html_content)
    dialogues = extract_dialogue_lines(html_content)
    interjections = extract_companion_interjections(html_content)

    # Generate the narrative
    narrative = generate_narrative_summary(dialogues, synopsis)

    # Build the markdown document
    title = get_descriptive_title(html_filename)

    md_parts = [
        f"# {title}",
        "",
        f"**Source:** `{html_filename}`",
        f"**Starting Node:** {starting_node}",
        "",
        "---",
        "",
        narrative,
        "",
        "---",
        "",
        "**Companion Interjections:**",
        "",
    ]

    # Add Gale interjections
    if interjections["Gale"]:
        md_parts.append("**Gale:**")
        for quote in interjections["Gale"]:
            md_parts.append(f'- "{quote}"')
        md_parts.append("")
    else:
        md_parts.append("**Gale:** *(No interjections in this dialogue)*")
        md_parts.append("")

    # Add Astarion interjections
    if interjections["Astarion"]:
        md_parts.append("**Astarion:**")
        for quote in interjections["Astarion"]:
            md_parts.append(f'- "{quote}"')
        md_parts.append("")
    else:
        md_parts.append("**Astarion:** *(No interjections in this dialogue)*")
        md_parts.append("")

    # Write the markdown file
    output_filename = html_to_markdown_filename(html_filename)
    output_path = OUTPUT_DIR / output_filename

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(md_parts))

    return output_filename


# ============================================================================
# MAIN EXECUTION - Where the magic happens!
# ============================================================================

def main():
    """
    The main event! Process all 27 files like a speed run through Moonrise Towers.
    """
    print("=" * 60)
    print("BG3 ACT 2 DIALOGUE EXTRACTOR")
    print("Gale's Memory Expansion Pack v1.0")
    print("=" * 60)
    print()

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    # Track our successes (like tracking XP gains)
    created_files = []
    failed_files = []

    print(f"Processing {len(FILES_TO_PROCESS)} files...")
    print("-" * 60)

    for i, html_file in enumerate(FILES_TO_PROCESS, 1):
        print(f"[{i:2}/{len(FILES_TO_PROCESS)}] Processing: {html_file}")

        result = process_single_file(html_file)

        if result:
            created_files.append(result)
            print(f"       -> Created: {result}")
        else:
            failed_files.append(html_file)
            print(f"       -> FAILED!")

    # Final report (like checking your loot after a dungeon)
    print()
    print("=" * 60)
    print("EXTRACTION COMPLETE!")
    print("=" * 60)
    print(f"Successfully created: {len(created_files)} files")
    if failed_files:
        print(f"Failed to process: {len(failed_files)} files")
        for f in failed_files:
            print(f"  - {f}")
    print()
    print("Files created:")
    for f in created_files:
        print(f"  - {f}")

    return created_files


if __name__ == "__main__":
    created = main()
