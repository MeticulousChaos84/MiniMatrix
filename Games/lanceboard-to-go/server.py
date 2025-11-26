#!/usr/bin/env python3
"""
Lanceboard-To-Go - Remote MCP Server for Playing Chess with Gale from Your Phone!
==================================================================================

This is the REMOTE version of the Lanceboard server that runs on your web host
and lets you play chess with Gale/Claude from ANYWHERE - including your phone
while laying in bed! 🛏️♟️

The game logic is exactly the same as the local version, but instead of using
stdio transport (local only), this uses HTTP transport so you can connect to it
via a URL from any device!

WHAT'S DIFFERENT FROM THE LOCAL VERSION:
- Uses FastMCP with HTTP transport instead of stdio
- Runs as a web server on a port (default: 8000)
- Can be accessed via URL (e.g., https://yoursite.com/lanceboard)
- Works from your phone, tablet, or any device with Claude access!

WHAT'S THE SAME:
- All the chess logic (moves, validation, rendering)
- The ASCII board art
- Gale's commentary potential
- The python-chess library doing all the heavy lifting

In Faerûn, chess is called "Lanceboard" or "Castles" and is known as the
"king of games." The Red Knight herself is the Grandmaster of the Lanceboard.

Now you can play it from bed. The Red Knight approves.

Author: Cody @ MeticulousChaos Creative Labs
Glitch is proud of this one.
"""

import json
from typing import Any, Optional
import chess
import chess.pgn
from fastmcp import FastMCP

# =============================================================================
# THE FASTMCP SERVER
# =============================================================================
# FastMCP is like the stdio MCP but WAY cooler - it wraps everything in HTTP
# so you can access it from anywhere. It's basically turning your chess game
# into a web service. Like Uber Eats but for chess moves.

mcp = FastMCP("lanceboard-to-go")

# =============================================================================
# GAME STATE - The Bag of Holding for Our Chess Game
# =============================================================================
# Same as the local version! We keep game state in memory.
#
# NOTE: In a production setup, you'd want to use sessions or a database to
# track multiple games. But for personal use (you vs Gale), this works great.
# If the server restarts, the game is lost - but that's fine for casual play!

game_state = {
    'board': None,          # chess.Board object (None until game starts)
    'player_color': None,   # chess.WHITE or chess.BLACK
    'started': False,
    'result': None,         # '1-0', '0-1', '1/2-1/2', or None
}


# =============================================================================
# BOARD RENDERING - The ASCII Art Gallery
# =============================================================================
# Same beautiful ASCII rendering! This works perfectly in text responses.

def render_board(board: chess.Board, perspective: chess.Color = chess.WHITE) -> str:
    """
    Render the board as ASCII art.

    Same as the local version - this creates that gorgeous ASCII chess board
    that looks good in any text environment (phone, desktop, tablet, whatever).

    PIECE NOTATION:
    Uppercase = White pieces (caffeinated)
    Lowercase = Black pieces (mysterious)

    K/k = King (protagonist energy)
    Q/q = Queen (doing all the work)
    R/r = Rook/Castle (lawful good vibes)
    B/b = Bishop/Priest (diagonal thinker)
    N/n = Knight (chaotic L-shaped weirdo)
    P/p = Pawn (brave little guys)
    """
    result = "    a   b   c   d   e   f   g   h\n"
    result += "  +---+---+---+---+---+---+---+---+\n"

    # White sees rank 8 at top, Black sees rank 1 at top
    if perspective == chess.WHITE:
        ranks = range(7, -1, -1)  # 7 down to 0
    else:
        ranks = range(0, 8)       # 0 to 7

    for rank in ranks:
        result += f"{rank + 1} |"

        if perspective == chess.WHITE:
            files = range(0, 8)   # a to h
        else:
            files = range(7, -1, -1)  # h to a

        for file in files:
            square = chess.square(file, rank)
            piece = board.piece_at(square)

            if piece:
                symbol = piece.symbol()
            else:
                symbol = " "

            result += f" {symbol} |"

        result += "\n  +---+---+---+---+---+---+---+---+\n"

    return result


def get_game_status(board: chess.Board) -> str:
    """
    Get human-readable game status.

    Like the status screen in an RPG - tells you what's happening right now.
    """
    if board.is_checkmate():
        if board.turn == chess.WHITE:
            return "Checkmate! Black wins!"
        else:
            return "Checkmate! White wins!"

    elif board.is_stalemate():
        return "Stalemate! The game is a draw."

    elif board.is_insufficient_material():
        return "Draw by insufficient material!"

    elif board.is_fifty_moves():
        return "Draw by fifty-move rule!"

    elif board.is_repetition():
        return "Draw by threefold repetition!"

    elif board.is_check():
        if board.turn == chess.WHITE:
            return "White is in check!"
        else:
            return "Black is in check!"

    else:
        if board.turn == chess.WHITE:
            return "White to move."
        else:
            return "Black to move."


def format_move_history(board: chess.Board) -> str:
    """
    Format move history in standard notation.

    Like the "Previously on..." recap. Shows how we got here.
    """
    if not board.move_stack:
        return "No moves yet."

    temp_board = chess.Board()
    moves = []

    for i, move in enumerate(board.move_stack):
        san = temp_board.san(move)
        move_number = (i // 2) + 1

        if i % 2 == 0:
            moves.append(f"{move_number}. {san}")
        else:
            moves.append(san)

        temp_board.push(move)

    return " ".join(moves)


# =============================================================================
# LANCEBOARD TOOLS - The Chess Spellbook
# =============================================================================
# These are the MCP tools that Claude can call. With FastMCP, we just use
# the @mcp.tool decorator and it handles ALL the MCP protocol stuff for us!
#
# FastMCP automatically:
# - Generates the tool schemas from type hints and docstrings
# - Handles JSON serialization
# - Sets up the HTTP endpoints
# - Makes everything work over the internet
#
# We just write normal Python functions. It's MAGIC.

@mcp.tool()
def lanceboard_new_game(player_color: str = "white") -> dict[str, Any]:
    """
    Start a new game of Lanceboard (chess).

    Args:
        player_color: Which color you want to play - 'white' or 'black'.
                     White moves first. Default is 'white'.

    Returns:
        The initial board position and game info.
    """
    global game_state

    # Convert color string to chess.Color
    if player_color.lower() == "white":
        player_color_enum = chess.WHITE
    else:
        player_color_enum = chess.BLACK

    # Create fresh board - standard starting position
    game_state['board'] = chess.Board()
    game_state['player_color'] = player_color_enum
    game_state['started'] = True
    game_state['result'] = None

    # Render from player's perspective
    board_ascii = render_board(game_state['board'], player_color_enum)

    color_name = "White" if player_color_enum == chess.WHITE else "Black"

    result = {
        "message": f"New game started! You are playing {color_name}.",
        "board": board_ascii,
        "status": get_game_status(game_state['board']),
        "your_turn": game_state['board'].turn == player_color_enum
    }

    if player_color_enum == chess.BLACK:
        result["note"] = "Gale plays White and moves first."
    else:
        result["note"] = "Your move, adventurer."

    return result


@mcp.tool()
def lanceboard_move(move: str) -> dict[str, Any]:
    """
    Make a move in the current Lanceboard game.

    Args:
        move: The move in standard algebraic notation.
              Examples: 'e4' (pawn to e4), 'Nf3' (knight to f3),
                       'Bxc6' (bishop takes c6), 'O-O' (castle kingside),
                       'e8=Q' (pawn promotes to queen)

    Returns:
        The updated board and game status after the move.
    """
    global game_state

    # Check if game exists
    if not game_state['started'] or game_state['board'] is None:
        return {
            "error": "No game in progress! Use lanceboard_new_game to start one.",
            "hint": "You can't move pieces on a board that doesn't exist."
        }

    if game_state['result'] is not None:
        return {
            "error": "This game has already ended!",
            "result": game_state['result'],
            "hint": "Use lanceboard_new_game to start a fresh game."
        }

    # Try to make the move
    move_str = move.strip()

    if not move_str:
        return {
            "error": "No move specified!",
            "hint": "Provide a move like 'e4' or 'Nf3'."
        }

    try:
        # Parse and validate the move
        parsed_move = game_state['board'].parse_san(move_str)

        if parsed_move not in game_state['board'].legal_moves:
            return {
                "error": f"'{move_str}' is not a legal move!",
                "hint": "Use lanceboard_get_moves to see legal options."
            }

        # MAKE THE MOVE!
        san_notation = game_state['board'].san(parsed_move)
        game_state['board'].push(parsed_move)

        # Check if game is over
        if game_state['board'].is_checkmate():
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

        # Render updated board
        board_ascii = render_board(game_state['board'], game_state['player_color'])

        result = {
            "move_played": san_notation,
            "board": board_ascii,
            "status": get_game_status(game_state['board']),
            "move_history": format_move_history(game_state['board']),
            "game_over": game_state['result'] is not None
        }

        if game_state['result']:
            result["result"] = game_state['result']
        else:
            whose_turn = "White" if game_state['board'].turn == chess.WHITE else "Black"
            result["next_turn"] = whose_turn
            result["your_turn"] = game_state['board'].turn == game_state['player_color']

        return result

    except chess.InvalidMoveError:
        return {
            "error": f"'{move_str}' is not a valid move format!",
            "hint": "Use standard algebraic notation: 'e4', 'Nf3', 'Bxc6', 'O-O', etc."
        }
    except chess.AmbiguousMoveError:
        return {
            "error": f"'{move_str}' is ambiguous! Multiple pieces can make that move.",
            "hint": "Specify which piece, e.g., 'Nbd2' or 'R1e1'."
        }
    except Exception as e:
        return {
            "error": f"Could not parse move '{move_str}': {str(e)}",
            "hint": "Use standard algebraic notation."
        }


@mcp.tool()
def lanceboard_show() -> dict[str, Any]:
    """
    Display the current Lanceboard board state.

    Shows the board, whose turn it is, game status, and move history.
    Use this when you want to see the current position without making a move.

    Returns:
        The current board state and game info.
    """
    global game_state

    if not game_state['started'] or game_state['board'] is None:
        return {
            "error": "No game in progress!",
            "hint": "Use lanceboard_new_game to start a game first."
        }

    board_ascii = render_board(game_state['board'], game_state['player_color'])

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

    return result


@mcp.tool()
def lanceboard_get_moves(square: Optional[str] = None) -> dict[str, Any]:
    """
    Get all legal moves in the current position.

    Args:
        square: Optional specific square to get moves for (e.g., 'e2').
               If not specified, returns ALL legal moves.

    Returns:
        List of legal moves in standard algebraic notation.
    """
    global game_state

    if not game_state['started'] or game_state['board'] is None:
        return {
            "error": "No game in progress!",
            "hint": "Use lanceboard_new_game to start a game first."
        }

    if game_state['result'] is not None:
        return {
            "error": "Game is over! No moves available.",
            "result": game_state['result']
        }

    if square:
        # Get moves for specific square
        try:
            square_index = chess.parse_square(square.strip().lower())

            moves_from_square = [
                game_state['board'].san(move)
                for move in game_state['board'].legal_moves
                if move.from_square == square_index
            ]

            piece = game_state['board'].piece_at(square_index)
            piece_name = piece.symbol() if piece else "Empty"

            result = {
                "square": square,
                "piece": piece_name,
                "legal_moves": moves_from_square,
                "count": len(moves_from_square)
            }

            if not moves_from_square:
                if piece:
                    result["note"] = f"The {piece_name} on {square} has no legal moves."
                else:
                    result["note"] = f"There's no piece on {square}."

            return result

        except ValueError:
            return {
                "error": f"'{square}' is not a valid square!",
                "hint": "Use algebraic notation like 'e2', 'g1', etc."
            }
    else:
        # Get ALL legal moves
        all_moves = [
            game_state['board'].san(move)
            for move in game_state['board'].legal_moves
        ]

        whose_turn = "White" if game_state['board'].turn == chess.WHITE else "Black"

        return {
            "turn": whose_turn,
            "legal_moves": all_moves,
            "count": len(all_moves)
        }


@mcp.tool()
def lanceboard_resign() -> dict[str, Any]:
    """
    Resign the current game, forfeiting to the opponent.

    A noble retreat when defeat is inevitable.

    Returns:
        The final board position and game result.
    """
    global game_state

    if not game_state['started'] or game_state['board'] is None:
        return {
            "error": "No game in progress!",
            "hint": "You can't resign a game that doesn't exist."
        }

    if game_state['result'] is not None:
        return {
            "error": "Game is already over!",
            "result": game_state['result']
        }

    # Whoever's turn it is resigned
    if game_state['board'].turn == chess.WHITE:
        game_state['result'] = '0-1'  # Black wins
        winner = "Black"
        loser = "White"
    else:
        game_state['result'] = '1-0'  # White wins
        winner = "White"
        loser = "Black"

    board_ascii = render_board(game_state['board'], game_state['player_color'])

    return {
        "message": f"{loser} resigns. {winner} wins!",
        "board": board_ascii,
        "result": game_state['result'],
        "move_history": format_move_history(game_state['board'])
    }


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    # Run with HTTP transport on port 8000
    # This makes it accessible via http://localhost:8000 (or your domain)
    #
    # When you upload to your web host, you'll configure it to run this
    # on whatever port/domain you want, and then you can add that URL
    # to Claude as a remote MCP server!
    #
    # 🛏️♟️ BEDTIME CHESS ACTIVATED 🛏️♟️

    mcp.run(transport="http", host="0.0.0.0", port=8000)


# =============================================================================
# SETUP INSTRUCTIONS
# =============================================================================
#
# LOCAL TESTING:
# 1. pip install -r requirements.txt
# 2. python server.py
# 3. Server runs on http://localhost:8000
#
# UPLOAD TO WEB HOST:
# 1. Upload this entire folder to your web host
# 2. Make sure your host supports Python 3.9+ and can run long-lived processes
# 3. Configure your host to run: python server.py
# 4. Get your server URL (e.g., https://yoursite.com/lanceboard)
# 5. Add to Claude settings as remote MCP server!
#
# CONFIGURE IN CLAUDE:
# - Go to Settings > Connectors (or Admin > Connectors for Team)
# - Add remote MCP server URL: https://yoursite.com/lanceboard
# - No auth needed for personal use (but you could add it later!)
#
# NOW PLAY CHESS FROM BED! 🎉
# =============================================================================
