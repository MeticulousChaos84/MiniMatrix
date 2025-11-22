#!/usr/bin/env python3
"""
Lanceboard MCP Server - Chess for Claude Desktop
=================================================

An MCP server that lets you play chess (called "Lanceboard" in Faerûn) with
Claude/Gale. The board renders as ASCII text, and game state persists between
messages.

This solves the "artifact refresh" problem - the game lives HERE in the server,
not in the ephemeral chat window that forgets everything like a goldfish with
commitment issues.

In the Forgotten Realms, chess is called "Lanceboard" or "Castles" and is known
as the "king of games." The Red Knight herself is the Grandmaster of the
Lanceboard - goddess of strategy, tactics, and planning.

PIECE NAMES IN FAERÛN (for flavor):
- King = King (same deal, everyone wants him dead)
- Queen = Queen (still doing all the actual work)
- Rook = Castle (straightforward as a paladin's oath)
- Bishop = Priest (moves diagonally, like a cleric dodging questions)
- Knight = Knight-Errant (the L-shaped weirdo we all love)
- Pawn = Pawn (brave little cannon fodder)

Author: Cody @ MeticulousChaos Creative Labs
Glitch approves this strategem.

"All enemies have some chink in their armour, no matter how much they like
to believe themselves invulnerable. That's what we must find." - Gale Dekarios
"""

import json
from typing import Any
import chess
import chess.pgn
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)

# =============================================================================
# THE MCP SERVER ITSELF
# =============================================================================
# Like the Tavern in Candlekeep, this is where all the magic happens.
# The server communicates via stdio (standard input/output), which is how
# Claude Desktop talks to MCP servers - basically passing notes back and forth
# like you're in class but the teacher is an AI.

server = Server("lanceboard")

# =============================================================================
# GAME STATE - The Bag of Holding for Our Chess Game
# =============================================================================
# We keep the game state in memory. Think of this like the party inventory
# in Baldur's Gate - everything we need to know about the current game lives
# here. When the server restarts, the game is lost (like a Dark Souls death
# but for chess), but that's fine for now.
#
# In Phase 3 we could add persistence (save to file), but for now this works.

game_state = {
    # The actual chess board - this is a python-chess Board object that knows
    # ALL the rules. Move validation, check detection, castling, en passant,
    # the whole shebang. We don't have to code any of that ourselves because
    # we're smart enough to use libraries (work smarter, not harder).
    'board': None,          # chess.Board object (None until game starts)

    # Which color is Erica playing?
    # chess.WHITE = True, chess.BLACK = False
    # Defaults to WHITE because you go first, you absolute protagonist.
    'player_color': None,   # chess.WHITE or chess.BLACK

    # Has a game been started? Can't make moves without starting a game first,
    # that would be like rolling for initiative before the DM says there's combat.
    'started': False,

    # Game result - None while game is ongoing
    # '1-0' = White wins, '0-1' = Black wins, '1/2-1/2' = Draw
    # Like the end of a D&D campaign but less emotional
    'result': None
}


# =============================================================================
# BOARD RENDERING - The ASCII Art Gallery
# =============================================================================
# This is where we turn the chess.Board object into something that looks good
# in a text-only environment. Like painting a portrait but with characters.

def render_board(board: chess.Board, perspective: chess.Color = chess.WHITE) -> str:
    """
    Render the board as ASCII art.

    Think of this as the Scrying spell of chess visualization - it shows you
    exactly what's happening on the board, just in a text format that won't
    break when you look at it.

    PIECE NOTATION (because we can't use actual chess piece Unicode):
    Uppercase = White pieces (the ones who had their morning coffee)
    Lowercase = Black pieces (the brooding mysterious ones)

    K/k = King (the one everyone's trying to kill, very protagonist energy)
    Q/q = Queen (doing all the actual work, as usual)
    R/r = Rook/Castle (moves in straight lines, very lawful good)
    B/b = Bishop/Priest (diagonal thinker, probably has controversial opinions)
    N/n = Knight (the L-shaped weirdo we love, chaotic energy)
    P/p = Pawn (brave little guys, most likely to become heroes)

    Args:
        board: The chess.Board object to render
        perspective: Which color's perspective to show from (WHITE = from bottom)
                    Default is WHITE because Erica usually plays white.

    Returns:
        A beautiful ASCII art string of the board with coordinates
    """
    # Start building our ASCII masterpiece
    # We'll add the column labels (a-h) at the top
    result = "    a   b   c   d   e   f   g   h\n"
    result += "  +---+---+---+---+---+---+---+---+\n"

    # Determine which ranks to iterate through based on perspective
    # If we're White (looking from rank 1), we show rank 8 at top, rank 1 at bottom
    # If we're Black, it's flipped (you see the board from your side)
    if perspective == chess.WHITE:
        ranks = range(7, -1, -1)  # 7 down to 0 (rank 8 down to rank 1)
    else:
        ranks = range(0, 8)       # 0 to 7 (rank 1 up to rank 8)

    # Loop through ranks (rows)
    for rank in ranks:
        # Add rank number on the left side (1-8, but python-chess uses 0-7 internally)
        # So we add 1 to convert from 0-indexed to human-readable
        result += f"{rank + 1} |"

        # Determine file order based on perspective
        if perspective == chess.WHITE:
            files = range(0, 8)   # a to h (left to right)
        else:
            files = range(7, -1, -1)  # h to a (mirrored for Black's view)

        # Loop through files (columns)
        for file in files:
            # Get the square index - python-chess uses 0-63 for squares
            # Square = file + (rank * 8)
            # a1 = 0, b1 = 1, ..., h8 = 63
            square = chess.square(file, rank)

            # Get the piece on this square (or None if empty)
            piece = board.piece_at(square)

            if piece:
                # There's a piece here! Get its symbol.
                # python-chess gives us uppercase for White, lowercase for Black
                # which is exactly what we want! How convenient.
                symbol = piece.symbol()
            else:
                # Empty square - use a space
                symbol = " "

            # Add the piece (or space) with padding for alignment
            result += f" {symbol} |"

        # End the row and add the horizontal separator
        result += "\n  +---+---+---+---+---+---+---+---+\n"

    return result


def get_game_status(board: chess.Board) -> str:
    """
    Get a human-readable status of the game.

    This is like the status screen in an RPG - tells you what's happening
    right now. Are you in check? Is the game over? Who's winning?

    Args:
        board: The chess.Board object to check

    Returns:
        A string describing the current game state
    """
    # First, check if the game is over
    if board.is_checkmate():
        # Someone got mated!
        if board.turn == chess.WHITE:
            return "Checkmate! Black wins!"
        else:
            return "Checkmate! White wins!"

    elif board.is_stalemate():
        # Stalemate - the "I'm not touching you" of chess endings
        return "Stalemate! The game is a draw."

    elif board.is_insufficient_material():
        # Not enough pieces to checkmate - like trying to win a fight
        # with only a rubber chicken and a napkin
        return "Draw by insufficient material!"

    elif board.is_fifty_moves():
        # 50 moves without a pawn move or capture
        # Even the Red Knight would be bored by now
        return "Draw by fifty-move rule!"

    elif board.is_repetition():
        # Same position three times - we're going in circles
        return "Draw by threefold repetition!"

    elif board.is_check():
        # Check! But the game isn't over yet.
        if board.turn == chess.WHITE:
            return "White is in check!"
        else:
            return "Black is in check!"

    else:
        # Normal position - whose turn is it?
        if board.turn == chess.WHITE:
            return "White to move."
        else:
            return "Black to move."


def format_move_history(board: chess.Board) -> str:
    """
    Format the move history in a nice readable way.

    This is like the "Previously on..." recap at the start of a TV episode.
    Shows all the moves that got us to this point.

    Args:
        board: The chess.Board object

    Returns:
        A formatted string of the move history, or "No moves yet" if empty
    """
    if not board.move_stack:
        return "No moves yet."

    # We need to walk through the moves to get proper SAN notation
    # This is because SAN depends on the board state at the time of the move
    temp_board = chess.Board()
    moves = []

    for i, move in enumerate(board.move_stack):
        # Get the SAN for this move
        san = temp_board.san(move)

        # Format as "1. e4 e5" style (move number for White's moves)
        move_number = (i // 2) + 1
        if i % 2 == 0:
            # White's move - include the move number
            moves.append(f"{move_number}. {san}")
        else:
            # Black's move - just the move
            moves.append(san)

        # Make the move on our temp board
        temp_board.push(move)

    # Join them all together
    return " ".join(moves)


# =============================================================================
# TOOL DEFINITIONS
# =============================================================================
# This is where we tell the MCP protocol what tools we offer.
# Claude Desktop reads this list and knows what it can ask us to do.
# Think of it as our spell list - these are our available actions.

@server.list_tools()
async def list_tools() -> list[Tool]:
    """
    Return the list of tools this MCP server provides.

    Each tool has:
    - name: What Claude calls it (like a spell name)
    - description: What it does (like spell description)
    - inputSchema: What parameters it needs (like spell components)
    """
    return [
        # =====================================================================
        # LANCEBOARD TOOLS - The Chess Spellbook
        # =====================================================================

        Tool(
            name="lanceboard_new_game",
            description=(
                "Start a new game of Lanceboard (chess). "
                "Specify which color the player wants (white or black). "
                "Returns the initial board position. "
                "If the player chose black, Gale plays first as white."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "player_color": {
                        "type": "string",
                        "description": (
                            "Which color the player wants to play: 'white' or 'black'. "
                            "Default is 'white' (player moves first)."
                        ),
                        "enum": ["white", "black"],
                        "default": "white"
                    }
                },
                "required": []
            }
        ),

        Tool(
            name="lanceboard_move",
            description=(
                "Make a move in the current Lanceboard game. "
                "Uses standard algebraic notation (e.g., 'e4', 'Nf3', 'O-O', 'Qxd7', 'e8=Q'). "
                "The move will be validated - illegal moves are rejected with an explanation. "
                "Returns the updated board and game status."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "move": {
                        "type": "string",
                        "description": (
                            "The move in standard algebraic notation. Examples: "
                            "'e4' (pawn to e4), 'Nf3' (knight to f3), "
                            "'Bxc6' (bishop takes c6), 'O-O' (kingside castle), "
                            "'e8=Q' (pawn promotes to queen)"
                        )
                    }
                },
                "required": ["move"]
            }
        ),

        Tool(
            name="lanceboard_show",
            description=(
                "Display the current Lanceboard (chess) board state. "
                "Shows the board, whose turn it is, game status, and move history. "
                "Use this when you need to see the current position without making a move."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),

        Tool(
            name="lanceboard_get_moves",
            description=(
                "Get all legal moves in the current position, or legal moves for a specific piece. "
                "Useful for showing options or checking if a move is possible."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "square": {
                        "type": "string",
                        "description": (
                            "Optional: specific square to get moves for (e.g., 'e2'). "
                            "If not specified, returns ALL legal moves in the position."
                        )
                    }
                },
                "required": []
            }
        ),

        Tool(
            name="lanceboard_resign",
            description=(
                "Resign the current game, forfeiting to the opponent. "
                "A noble retreat when defeat is inevitable. "
                "Returns the final board position and result."
            ),
            inputSchema={
                "type": "object",
                "properties": {},
                "required": []
            }
        ),
    ]


# =============================================================================
# TOOL IMPLEMENTATIONS
# =============================================================================
# This is where the magic happens. When Claude calls a tool, this function
# routes it to the right code. It's like a dispatcher at a taxi company,
# but instead of cabs we're dispatching chess logic.

@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> CallToolResult:
    """
    Handle tool calls from Claude.

    This is the grand central station of our MCP server. Every tool call
    comes through here and gets routed to the appropriate handler.

    It's like being the DM - you receive the player's declared action,
    figure out what they're trying to do, and resolve the result.
    """
    global game_state

    try:
        # =====================================================================
        # lanceboard_new_game - Roll for initiative!
        # =====================================================================
        if name == "lanceboard_new_game":
            # What color does the player want?
            color_str = arguments.get("player_color", "white").lower()

            # Convert to chess.Color (True = WHITE, False = BLACK)
            if color_str == "white":
                player_color = chess.WHITE
            else:
                player_color = chess.BLACK

            # Create a fresh board - standard starting position
            # This is like wiping the tavern table clean before a new game
            game_state['board'] = chess.Board()
            game_state['player_color'] = player_color
            game_state['started'] = True
            game_state['result'] = None

            # Render the board from the player's perspective
            board_ascii = render_board(game_state['board'], player_color)

            # Build the response
            color_name = "White" if player_color == chess.WHITE else "Black"
            result = {
                "message": f"New game started! You are playing {color_name}.",
                "board": board_ascii,
                "status": get_game_status(game_state['board']),
                "your_turn": game_state['board'].turn == player_color
            }

            if player_color == chess.BLACK:
                result["note"] = "Gale plays White and moves first."
            else:
                result["note"] = "Your move, adventurer."

        # =====================================================================
        # lanceboard_move - "I attack with my Queen!"
        # =====================================================================
        elif name == "lanceboard_move":
            # First, make sure we have an active game
            if not game_state['started'] or game_state['board'] is None:
                result = {
                    "error": "No game in progress! Use lanceboard_new_game to start one.",
                    "hint": "You can't move pieces on a board that doesn't exist. "
                           "That's like trying to cast a spell without a spellbook."
                }
            elif game_state['result'] is not None:
                # Game is already over
                result = {
                    "error": "This game has already ended!",
                    "result": game_state['result'],
                    "hint": "Use lanceboard_new_game to start a fresh game."
                }
            else:
                # We have an active game! Try to make the move.
                move_str = arguments.get("move", "").strip()

                if not move_str:
                    result = {
                        "error": "No move specified!",
                        "hint": "Provide a move in algebraic notation like 'e4' or 'Nf3'."
                    }
                else:
                    # Try to parse the move
                    # python-chess is smart enough to understand SAN (Nf3) and UCI (g1f3)
                    try:
                        # First try standard algebraic notation (SAN)
                        move = game_state['board'].parse_san(move_str)

                        # Check if it's legal (parse_san should only return legal moves,
                        # but let's be paranoid like a rogue checking for traps)
                        if move not in game_state['board'].legal_moves:
                            result = {
                                "error": f"'{move_str}' is not a legal move!",
                                "hint": "Use lanceboard_get_moves to see legal options."
                            }
                        else:
                            # MAKE THE MOVE! This is it, the moment of truth!
                            # Like declaring your attack in combat
                            san_before = game_state['board'].san(move)  # Get SAN before pushing
                            game_state['board'].push(move)

                            # Check if the game is over after this move
                            if game_state['board'].is_checkmate():
                                # The current turn lost (they're in checkmate)
                                if game_state['board'].turn == chess.WHITE:
                                    game_state['result'] = '0-1'  # Black wins
                                else:
                                    game_state['result'] = '1-0'  # White wins
                            elif game_state['board'].is_stalemate():
                                game_state['result'] = '1/2-1/2'
                            elif game_state['board'].is_insufficient_material():
                                game_state['result'] = '1/2-1/2'
                            elif game_state['board'].is_fifty_moves():
                                game_state['result'] = '1/2-1/2'
                            elif game_state['board'].is_repetition():
                                game_state['result'] = '1/2-1/2'

                            # Render the updated board
                            board_ascii = render_board(
                                game_state['board'],
                                game_state['player_color']
                            )

                            result = {
                                "move_played": san_before,
                                "board": board_ascii,
                                "status": get_game_status(game_state['board']),
                                "move_history": format_move_history(game_state['board']),
                                "game_over": game_state['result'] is not None
                            }

                            if game_state['result']:
                                result["result"] = game_state['result']
                            else:
                                # Indicate whose turn it is
                                whose_turn = "White" if game_state['board'].turn == chess.WHITE else "Black"
                                is_player_turn = game_state['board'].turn == game_state['player_color']
                                result["next_turn"] = whose_turn
                                result["your_turn"] = is_player_turn

                    except chess.InvalidMoveError:
                        result = {
                            "error": f"'{move_str}' is not a valid move format!",
                            "hint": "Use standard algebraic notation: 'e4', 'Nf3', 'Bxc6', 'O-O', etc."
                        }
                    except chess.AmbiguousMoveError:
                        result = {
                            "error": f"'{move_str}' is ambiguous! Multiple pieces can make that move.",
                            "hint": "Specify which piece, e.g., 'Nbd2' or 'R1e1'."
                        }
                    except ValueError as e:
                        result = {
                            "error": f"Could not parse move '{move_str}': {str(e)}",
                            "hint": "Use standard algebraic notation."
                        }

        # =====================================================================
        # lanceboard_show - "What does the board look like?"
        # =====================================================================
        elif name == "lanceboard_show":
            if not game_state['started'] or game_state['board'] is None:
                result = {
                    "error": "No game in progress!",
                    "hint": "Use lanceboard_new_game to start a game first."
                }
            else:
                board_ascii = render_board(
                    game_state['board'],
                    game_state['player_color']
                )

                result = {
                    "board": board_ascii,
                    "status": get_game_status(game_state['board']),
                    "move_history": format_move_history(game_state['board']),
                    "total_moves": len(game_state['board'].move_stack),
                    "your_color": "White" if game_state['player_color'] == chess.WHITE else "Black"
                }

                if game_state['result']:
                    result["result"] = game_state['result']
                    result["game_over"] = True
                else:
                    whose_turn = "White" if game_state['board'].turn == chess.WHITE else "Black"
                    result["next_turn"] = whose_turn
                    result["your_turn"] = game_state['board'].turn == game_state['player_color']

        # =====================================================================
        # lanceboard_get_moves - "What are my options here?"
        # =====================================================================
        elif name == "lanceboard_get_moves":
            if not game_state['started'] or game_state['board'] is None:
                result = {
                    "error": "No game in progress!",
                    "hint": "Use lanceboard_new_game to start a game first."
                }
            elif game_state['result'] is not None:
                result = {
                    "error": "Game is over! No moves available.",
                    "result": game_state['result']
                }
            else:
                square_str = arguments.get("square", "").strip().lower()

                if square_str:
                    # Get moves for a specific square
                    try:
                        # Parse the square (e.g., "e2" -> square index)
                        square = chess.parse_square(square_str)

                        # Get all legal moves from this square
                        moves_from_square = [
                            game_state['board'].san(move)
                            for move in game_state['board'].legal_moves
                            if move.from_square == square
                        ]

                        # What piece is on this square?
                        piece = game_state['board'].piece_at(square)
                        piece_name = piece.symbol() if piece else "Empty"

                        result = {
                            "square": square_str,
                            "piece": piece_name,
                            "legal_moves": moves_from_square,
                            "count": len(moves_from_square)
                        }

                        if not moves_from_square:
                            if piece:
                                result["note"] = f"The {piece_name} on {square_str} has no legal moves."
                            else:
                                result["note"] = f"There's no piece on {square_str}."

                    except ValueError:
                        result = {
                            "error": f"'{square_str}' is not a valid square!",
                            "hint": "Use algebraic notation like 'e2', 'g1', etc."
                        }
                else:
                    # Get ALL legal moves
                    all_moves = [
                        game_state['board'].san(move)
                        for move in game_state['board'].legal_moves
                    ]

                    whose_turn = "White" if game_state['board'].turn == chess.WHITE else "Black"

                    result = {
                        "turn": whose_turn,
                        "legal_moves": all_moves,
                        "count": len(all_moves)
                    }

        # =====================================================================
        # lanceboard_resign - "I yield!"
        # =====================================================================
        elif name == "lanceboard_resign":
            if not game_state['started'] or game_state['board'] is None:
                result = {
                    "error": "No game in progress!",
                    "hint": "You can't resign a game that doesn't exist. "
                           "That's like surrendering to an empty room."
                }
            elif game_state['result'] is not None:
                result = {
                    "error": "Game is already over!",
                    "result": game_state['result']
                }
            else:
                # Who resigned?
                # We assume the person whose turn it is resigned
                # (since they're the one who would call this)
                if game_state['board'].turn == chess.WHITE:
                    game_state['result'] = '0-1'  # Black wins by resignation
                    winner = "Black"
                    loser = "White"
                else:
                    game_state['result'] = '1-0'  # White wins by resignation
                    winner = "White"
                    loser = "Black"

                board_ascii = render_board(
                    game_state['board'],
                    game_state['player_color']
                )

                result = {
                    "message": f"{loser} resigns. {winner} wins!",
                    "board": board_ascii,
                    "result": game_state['result'],
                    "move_history": format_move_history(game_state['board'])
                }

        # =====================================================================
        # Unknown tool - "I don't know that spell"
        # =====================================================================
        else:
            result = {
                "error": f"Unknown tool: {name}",
                "hint": "Available tools: lanceboard_new_game, lanceboard_move, "
                       "lanceboard_show, lanceboard_get_moves, lanceboard_resign"
            }

        # Format the result for MCP
        if isinstance(result, dict):
            result_text = json.dumps(result, indent=2)
        else:
            result_text = str(result)

        return CallToolResult(
            content=[TextContent(type="text", text=result_text)]
        )

    except Exception as e:
        # Something went horribly wrong - like a Wild Magic surge but for code
        return CallToolResult(
            content=[TextContent(
                type="text",
                text=json.dumps({
                    "error": f"Server error: {str(e)}",
                    "hint": "Please report this to Cody. Glitch is disappointed."
                }, indent=2)
            )]
        )


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

async def main():
    """
    Start the MCP server.

    This runs the server using stdio transport - Claude Desktop connects to it
    by launching this script and communicating over stdin/stdout.

    Think of it as opening the tavern doors for business. The sign says
    "Lanceboard games played here" and Claude is our first customer.
    """
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================
#
# 1. INSTALL DEPENDENCIES:
#    pip install python-chess mcp
#
# 2. CONFIGURE CLAUDE DESKTOP:
#    Add this to your Claude Desktop config:
#
#    {
#      "mcpServers": {
#        "lanceboard": {
#          "command": "python",
#          "args": ["/path/to/Games/Lanceboard/server.py"]
#        }
#      }
#    }
#
# 3. RESTART CLAUDE DESKTOP
#    The Lanceboard tools should now be available!
#
# 4. PLAY!
#    Just say "Let's play Lanceboard!" and Gale will know what to do.
#
# =============================================================================
# FUTURE ENHANCEMENTS (Phase 2 & 3)
# =============================================================================
#
# Phase 2:
# - Better draw handling (offer draw, claim draw)
# - Time controls? (might be overkill)
#
# Phase 3:
# - lanceboard_save: Export game to PGN file
# - Save to Obsidian vault for game records
# - Load saved games
#
# The Red Knight would approve of this roadmap.
# =============================================================================
