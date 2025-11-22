// =============================================================================
// GALE-DIALOG.JS - THE VOICE OF THE WIZARD
// =============================================================================
//
// This file contains all of Gale's dialogue lines, pulled from actual
// Baldur's Gate 3 quotes. These are the words he actually says in the game,
// reorganized for our card game context.
//
// The goal: Make it FEEL like you're actually sitting across from Gale.
// The fire crackling, Tara probably watching from somewhere, and the most
// eloquent wizard in Faerûn commenting on your card play.
//
// =============================================================================

// =============================================================================
// SECTION 1: DIALOGUE POOLS
// =============================================================================
// Organized by situation so we can pull appropriate lines.

const GALE_LINES = {

  // ----- WHEN GALE IS WINNING / PLAYS STRONG -----
  winning: [
    "The Weave is served best with a dash of eloquence.",
    "Not a devil in sight. How disappointing.",
    "There is poetry to be found in even the dingiest of holes.",
    "All enemies have some chink in their armour, no matter how much they like to believe themselves invulnerable.",
    "Magic from the fallen empire of Netheril. Ancient, exceedingly dangerous, and quite unrivalled.",
    "A calculated risk, but a necessary one.",
    "Ah, favorable odds at last.",
    "The cards align in my favor. How refreshing."
  ],

  // ----- WHEN GALE IS LOSING / PLAYS WEAK -----
  losing: [
    "What can I say? Mother always taught me to be a gracious host.",
    "Did I say interesting? I meant terrible, of course. Terrible strategy...",
    "I'll pass, thank you. I prefer Abjuration over acrobatics.",
    "Unlikely. Had I stayed there much longer, the orb would have reduced it to rubble.",
    "Perhaps my luck will turn. It usually does... eventually.",
    "A temporary setback. Nothing more.",
    "Even the best-laid plans can go awry.",
    "Mystra's grace, that did not go as planned."
  ],

  // ----- STRATEGIC / THOUGHTFUL COMMENTS -----
  strategic: [
    "As it stands, I see no option free of sacrifice in one form or another. So the question becomes - what are you willing to give up?",
    "I'm cautiously optimistic. Though with the time left to us, and the amount still to be done, it's best we don't take anything for granted.",
    "Everything, really - not to put too fine a point on it.",
    "Let me consider the possibilities...",
    "A complex situation requires careful analysis.",
    "There's always another angle to consider.",
    "The optimal play isn't always the obvious one."
  ],

  // ----- PLAYFUL BANTER / TEASING -----
  banter: [
    "She who thirsts buys drinks the first. She who declines gets the worst of the wines.",
    "Tempting. But I think we might already have the maximum number of theatrical titles.",
    "On occasion.",
    "Fear not. You have a wizard at your side who positively encourages such curiosity.",
    "A bold move. I expected nothing less from you.",
    "Trying to keep me on my toes? Clever.",
    "You never cease to surprise me, Starlight."
  ],

  // ----- THE SPECIAL THREE DRAGON ANTE REFERENCES -----
  // Use these sparingly - they're the good stuff!
  tdaSpecial: [
    // When starting or making a strategic decision
    "I think it's best I keep a cool head going into this. Approach it like a particularly high-risk round of Three-Dragon Ante. I'll let you show your flight, and then I can see how strong a chance we stand of winning the gambit.",

    // THE BIG ONE - only for perfect games!
    "You'd make a fine Three-Dragon Ante player, you know.",

    // Easter egg for comebacks
    "Don't give anything away, just see what she has to say... Your advice serves me well even now."
  ],

  // ----- GAME START -----
  gameStart: [
    "Ah, Three Dragon Ante. A game of strategy, bluffing, and knowing when to show your flight. Shall we begin?",
    "A game to pass the time? I'd be delighted.",
    "Let's see what the cards have in store for us tonight.",
    "Perhaps I should treat this less like a negotiation and more like a round of Three Dragon Ante.",
    "The camp is quiet, the fire is warm... perfect conditions for a game."
  ],

  // ----- ANTE PHASE -----
  ante: [
    "The ante is set. Now the real game begins.",
    "An interesting stake. Let's see what we can make of it.",
    "Fortune favors the bold - or so they say.",
    "A modest start. The pot will grow.",
    "The dragons stir..."
  ],

  // ----- CARD PLAYED - GALE'S TURN -----
  galePlayed: [
    "Allow me.",
    "I believe this is the optimal choice.",
    "Let's see how you respond to this.",
    "A small contribution to our little game.",
    "Not my strongest play, but strategically sound.",
    "This should prove interesting.",
    "Watch carefully now..."
  ],

  // ----- CARD PLAYED - PLAYER'S TURN -----
  playerPlayed: [
    "An interesting choice...",
    "I see what you're attempting.",
    "Bold. Very bold.",
    "A solid foundation. But what comes next?",
    "You're building toward something. I can tell.",
    "Predictable, but effective.",
    "Ah, you're full of surprises tonight."
  ],

  // ----- FLIGHT COMPLETE -----
  flightComplete: [
    "Both flights revealed. The moment of truth approaches.",
    "Let us see what we've each constructed.",
    "The dragons have gathered. Time to see whose flight prevails.",
    "And now we compare our hands.",
    "A fine flight you've assembled. But is it enough?"
  ],

  // ----- GALE WINS GAMBIT -----
  galeWins: [
    "The gambit is mine. Better luck next round.",
    "A satisfying victory, though hard-won.",
    "As they say, know when to hold your cards close.",
    "The pot is mine. I'll endeavor to spend it wisely.",
    "Not my most elegant victory, but a victory nonetheless."
  ],

  // ----- PLAYER WINS GAMBIT -----
  playerWins: [
    "Well played. Fortune favors the bold indeed.",
    "Your flight was superior. I concede graciously.",
    "You've earned those stakes. Well done.",
    "A worthy victory, Starlight.",
    "I'll need to reconsider my strategy."
  ],

  // ----- TIE -----
  tie: [
    "A tie! How perfectly balanced.",
    "Neither of us can claim victory. Split the pot we must.",
    "The dragons themselves couldn't decide a winner.",
    "Evenly matched. As it should be."
  ],

  // ----- GAME OVER - GALE WINS -----
  galeVictory: [
    "A valiant effort. Perhaps another round? I promise to go easier on you.",
    "Victory is mine. But you made me work for it.",
    "You're improving. A few more games and you'll be quite formidable.",
    "Don't be discouraged. Even the best players have off nights."
  ],

  // ----- GAME OVER - PLAYER WINS -----
  playerVictory: [
    "Well played, Starlight. You've bested me fairly.",
    "I bow to your superior strategy.",
    "You'd make a fine Three-Dragon Ante player, you know.",
    "A well-deserved victory. I'll have my revenge next time."
  ],

  // ----- SPECIAL COMBINATIONS -----
  specialCombos: {
    'eternal_struggle': "Bahamut and Tiamat in the same flight! The eternal struggle plays out before us!",
    'gilded_flight': "A flight of Gold... fitting, given the stakes.",
    'inferno': "Three Red Dragons! I can feel the heat from here.",
    'jackpot': "Triple sevens! Lady Luck smiles upon you.",
    'darkness_rises': "An entirely evil flight. Tiamat would be proud.",
    'champions_of_light': "Champions of light and goodness! Bahamut's blessing upon you."
  },

  // ----- THINKING / FILLER -----
  thinking: [
    "Hmm, let me consider this carefully...",
    "One moment...",
    "Interesting...",
    "Now, what would be the optimal play here?",
    "Let me see...",
    "Analyzing the possibilities..."
  ]
};

// =============================================================================
// SECTION 2: DIALOGUE SELECTION LOGIC
// =============================================================================

/**
 * GET RANDOM LINE
 * Returns a random line from a pool.
 *
 * @param {Array} pool - Array of possible lines
 * @returns {string} - A randomly selected line
 */
function getRandomLine(pool) {
  if (!pool || pool.length === 0) {
    return "...";
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * GET LINE
 * Main function to get an appropriate line based on context.
 *
 * @param {string} context - What's happening in the game
 * @param {Object} data - Additional context data
 * @returns {string} - The dialogue line
 */
function getLine(context, data = {}) {
  const state = typeof TDA_GAME !== 'undefined' ? TDA_GAME.getCurrentState() : null;
  const galeMood = state ? state.gale.mood : 'focused';

  switch (context) {
    case 'game_start':
      return getRandomLine(GALE_LINES.gameStart);

    case 'ante':
      return getRandomLine(GALE_LINES.ante);

    case 'card_played':
      if (data.player === 'gale') {
        // Gale comments on his own play
        if (galeMood === 'confident') {
          return getRandomLine(GALE_LINES.winning);
        } else if (galeMood === 'worried') {
          return getRandomLine(GALE_LINES.losing);
        }
        return getRandomLine(GALE_LINES.galePlayed);
      } else {
        // Gale comments on player's play
        return getRandomLine(GALE_LINES.playerPlayed);
      }

    case 'flight_complete':
      return getRandomLine(GALE_LINES.flightComplete);

    case 'win':
      // Gale lost the gambit
      return getRandomLine(GALE_LINES.playerWins);

    case 'lose':
      // Gale won the gambit
      return getRandomLine(GALE_LINES.galeWins);

    case 'tie':
      return getRandomLine(GALE_LINES.tie);

    case 'game_over_win':
      // Check for special victories
      if (data.perfectGame) {
        return GALE_LINES.tdaSpecial[1]; // The special line!
      }
      if (data.comebackVictory) {
        return GALE_LINES.tdaSpecial[2]; // The comeback line!
      }
      return getRandomLine(GALE_LINES.playerVictory);

    case 'game_over_lose':
      return getRandomLine(GALE_LINES.galeVictory);

    case 'thinking':
      // Small chance of humming
      if (Math.random() < 0.1) {
        return "♪ " + getRandomLine(GALE_LINES.thinking);
      }
      return getRandomLine(GALE_LINES.thinking);

    case 'strategic':
      return getRandomLine(GALE_LINES.strategic);

    case 'banter':
      return getRandomLine(GALE_LINES.banter);

    default:
      return getRandomLine(GALE_LINES.thinking);
  }
}

/**
 * GET SPECIAL COMBO LINE
 * Returns the line for a special card combination.
 *
 * @param {string} comboName - Name of the special combination
 * @returns {string} - The special line
 */
function getSpecialComboLine(comboName) {
  const key = comboName.toLowerCase().replace(/['\s]/g, '_');
  return GALE_LINES.specialCombos[key] || "An impressive combination!";
}

/**
 * GET MOOD BASED LINE
 * Returns a line appropriate to Gale's current mood.
 *
 * @param {string} mood - Gale's current mood
 * @returns {string} - A mood-appropriate line
 */
function getMoodLine(mood) {
  switch (mood) {
    case 'confident':
      return getRandomLine(GALE_LINES.winning);
    case 'worried':
      return getRandomLine(GALE_LINES.losing);
    case 'impressed':
      return getRandomLine(GALE_LINES.banter);
    case 'focused':
    default:
      return getRandomLine(GALE_LINES.strategic);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GALE_LINES,
    getLine,
    getRandomLine,
    getSpecialComboLine,
    getMoodLine
  };
} else {
  window.TDA_GALE_DIALOG = {
    GALE_LINES,
    getLine,
    getRandomLine,
    getSpecialComboLine,
    getMoodLine
  };
}

// =============================================================================
// END OF GALE-DIALOG.JS
// =============================================================================
//
// Now Gale has a voice! Well, text for now. But eventually actual audio!
//
// "Perhaps I should treat this less like a negotiation and more like a
// round of Three Dragon Ante. I'll see what cards she lays on the table
// and respond in kind."
//
// =============================================================================
