// =============================================================================
// GAME.JS - THE DUNGEON MASTER
// =============================================================================
//
// This is the brain of Three Dragon Ante. If cards.js is the character sheets
// and flights.js is the dice roller, game.js is the DM running the show.
//
// It manages:
// - Game state (who has what, where everything is)
// - Turn order (whose turn it is)
// - Phase progression (ante → flight → resolution)
// - Win conditions (who's broke, who's rich)
// - Hand management (drawing, playing, discarding)
//
// Think of this like the initiative tracker in D&D, but for a card game.
// We're keeping track of everything so the players (you and Gale) can
// focus on strategy instead of bookkeeping.
//
// =============================================================================

// =============================================================================
// SECTION 1: GAME STATE CONSTANTS
// =============================================================================
// These are like the rules of the universe for our game - they don't change.

const GAME_PHASES = {
  SETUP: 'setup',           // Dealing initial hands
  ANTE: 'ante',             // Drawing ante cards
  FLIGHT: 'flight',         // Building flights (the main action!)
  RESOLUTION: 'resolution', // Comparing flights, awarding pot
  GAME_OVER: 'game_over'    // Someone won!
};

const GAME_CONSTANTS = {
  STARTING_STAKES: 50,      // How much gold each player starts with
  HAND_SIZE: 6,             // Cards in hand
  FLIGHT_SIZE: 3,           // Cards in a complete flight
  TOTAL_GAMBITS: 3,         // Gambits per game
  MIN_STAKES: 0             // If you hit this, you lose immediately
};

// =============================================================================
// SECTION 2: THE GAME STATE
// =============================================================================
// This object holds EVERYTHING about the current game.
// It's like a save file that we constantly update.

/**
 * CREATE INITIAL GAME STATE
 * Sets up a fresh game state, like a brand new save file.
 *
 * @returns {Object} - A fresh game state object
 */
function createInitialGameState() {
  return {
    // ----- THE DECK -----
    // Where all the undrawn cards live
    deck: [],

    // ----- THE DISCARD PILE -----
    // Where played and discarded cards go
    discard: [],

    // ----- THE POT -----
    // How much gold is at stake in the current gambit
    pot: 0,

    // ----- THE PLAYERS -----
    players: {
      human: {
        id: 'human',
        name: 'Erica', // We know who you are!
        hand: [],              // Current cards (max 10, usually 6)
        stakes: GAME_CONSTANTS.STARTING_STAKES, // Starting gold
        flight: [],            // Cards played this gambit
        anteCard: null,        // The card drawn for ante
        captainBonus: false,   // Effect from The Captain card
        effectImmunity: false  // Effect from Topaz Dragon
      },
      gale: {
        id: 'gale',
        name: 'Gale',
        hand: [],
        stakes: GAME_CONSTANTS.STARTING_STAKES,
        flight: [],
        anteCard: null,
        captainBonus: false,
        effectImmunity: false,
        // ----- GALE-SPECIFIC STATE -----
        // For AI and personality purposes
        mood: 'focused',       // Affects commentary ('focused', 'confident', 'worried', 'impressed')
        confidence: 0.5,       // 0-1, affects risk-taking
        gambitsWon: 0,         // Track his victories
        gambitsLost: 0,        // Track his losses
        lastPlayedCard: null   // For commentary context
      }
    },

    // ----- GAME PROGRESS -----
    currentGambit: 1,          // Which gambit (1, 2, or 3)
    phase: GAME_PHASES.SETUP,  // Current phase
    turn: 'human',             // Whose turn is it ('human' or 'gale')
    turnNumber: 1,             // Which turn within the flight phase

    // ----- GAME RESULTS -----
    winner: null,              // Set when game ends
    gameHistory: [],           // Log of what happened (for replay/analysis)

    // ----- SPECIAL FLAGS -----
    comebackActive: false,     // Track if player is making a comeback
    perfectGame: true,         // Stays true if player wins all gambits
    galeHumming: false         // Easter egg!
  };
}

// The actual game state - we'll populate this when we start a game
let gameState = null;

// =============================================================================
// SECTION 3: GAME INITIALIZATION
// =============================================================================

/**
 * START NEW GAME
 * The "New Game" button handler. Sets everything up for a fresh game.
 *
 * This is like Session 0 in D&D - we're establishing the world before
 * the adventure begins.
 *
 * @returns {Object} - The initialized game state
 */
function startNewGame() {
  console.log("🎮 Starting new Three Dragon Ante game!");
  console.log("═".repeat(50));

  // Create fresh state
  gameState = createInitialGameState();

  // Create and shuffle the deck
  // (We're using the full 100-card deck because more dragons = more fun)
  gameState.deck = TDA_CARDS.createPlayDeck(true);

  console.log(`📦 Deck created: ${gameState.deck.length} cards`);

  // Deal initial hands - 6 cards each
  // In Three Dragon Ante, you draw from the deck at the START, not
  // like Magic where you draw during your turn.

  dealInitialHands();

  // Set the phase to ANTE - we're ready to begin the first gambit!
  gameState.phase = GAME_PHASES.ANTE;
  gameState.currentGambit = 1;

  logGameEvent({
    type: 'game_start',
    message: 'A new game of Three Dragon Ante begins!'
  });

  console.log("═".repeat(50));
  console.log("🐉 Game ready! First gambit starting...");

  return gameState;
}

/**
 * DEAL INITIAL HANDS
 * Gives each player their starting hand of 6 cards.
 * Like handing out character sheets at the start of a campaign.
 */
function dealInitialHands() {
  const { human, gale } = gameState.players;

  // Draw 6 cards for each player
  human.hand = TDA_CARDS.drawCards(gameState.deck, GAME_CONSTANTS.HAND_SIZE);
  gale.hand = TDA_CARDS.drawCards(gameState.deck, GAME_CONSTANTS.HAND_SIZE);

  console.log(`🃏 ${human.name} drew ${human.hand.length} cards`);
  console.log(`🃏 ${gale.name} drew ${gale.hand.length} cards`);

  // Log what the human got (for debugging - Gale's hand should stay hidden!)
  console.log("Your starting hand:", human.hand.map(c => `${c.name}(${c.value})`).join(', '));
}

// =============================================================================
// SECTION 4: ANTE PHASE
// =============================================================================
// The ante phase is like the "posting blinds" in poker. Each player draws
// a card, and that card's value determines their ante for this gambit.

/**
 * PROCESS ANTE PHASE
 * Both players draw an ante card. The card's value becomes their bet.
 * Higher value = bigger ante = bigger pot = more at stake!
 *
 * This is where Gale might say "Interesting..." as he eyes his card.
 *
 * @returns {Object} - Results of the ante phase
 */
function processAntePhase() {
  if (gameState.phase !== GAME_PHASES.ANTE) {
    console.warn("⚠️ Can't process ante - not in ante phase!");
    return null;
  }

  const { human, gale } = gameState.players;

  // Draw ante cards for both players
  human.anteCard = TDA_CARDS.drawCard(gameState.deck);
  gale.anteCard = TDA_CARDS.drawCard(gameState.deck);

  // If deck is empty, we've got problems
  if (!human.anteCard || !gale.anteCard) {
    console.error("❌ Deck empty during ante! This shouldn't happen.");
    return null;
  }

  // Calculate antes
  const humanAnte = human.anteCard.value;
  const galeAnte = gale.anteCard.value;

  // Pay the antes into the pot
  human.stakes -= humanAnte;
  gale.stakes -= galeAnte;
  gameState.pot = humanAnte + galeAnte;

  // Add ante cards to hands (if there's room)
  // In TDA rules, you keep your ante card
  if (human.hand.length < 10) {
    human.hand.push(human.anteCard);
  }
  if (gale.hand.length < 10) {
    gale.hand.push(gale.anteCard);
  }

  // Check for immediate bankruptcy
  if (human.stakes < GAME_CONSTANTS.MIN_STAKES) {
    return handleBankruptcy('human');
  }
  if (gale.stakes < GAME_CONSTANTS.MIN_STAKES) {
    return handleBankruptcy('gale');
  }

  // Log the event
  const anteResult = {
    type: 'ante_complete',
    humanAnte: humanAnte,
    galeAnte: galeAnte,
    humanCard: human.anteCard.name,
    galeCard: gale.anteCard.name,
    pot: gameState.pot,
    message: `Antes paid! ${human.name}: ${humanAnte} (${human.anteCard.name}), ${gale.name}: ${galeAnte} (${gale.anteCard.name}). Pot: ${gameState.pot}`
  };

  logGameEvent(anteResult);
  console.log(`💰 ${anteResult.message}`);

  // Determine who goes first in the flight phase
  // Higher ante goes first (because you're "leading" the gambit)
  if (humanAnte >= galeAnte) {
    gameState.turn = 'human';
    anteResult.firstPlayer = 'human';
  } else {
    gameState.turn = 'gale';
    anteResult.firstPlayer = 'gale';
  }

  // Move to flight phase
  gameState.phase = GAME_PHASES.FLIGHT;
  gameState.turnNumber = 1;

  return anteResult;
}

// =============================================================================
// SECTION 5: FLIGHT BUILDING PHASE
// =============================================================================
// This is the meat of the game! Players alternate playing cards to build
// their flights. Each player plays one card per turn until both have
// 3 cards in their flight.

/**
 * PLAY CARD
 * The main action! Player selects a card from their hand to play.
 *
 * This is like choosing your action in combat - Attack, Cast a Spell,
 * or in this case, "Play the Gold Dragon 7 and watch Gale sweat."
 *
 * @param {string} playerId - 'human' or 'gale'
 * @param {number|string} cardIdentifier - Index in hand or card ID
 * @returns {Object} - Result of playing the card
 */
function playCard(playerId, cardIdentifier) {
  if (gameState.phase !== GAME_PHASES.FLIGHT) {
    console.warn("⚠️ Can't play card - not in flight phase!");
    return { success: false, error: 'Not in flight phase' };
  }

  if (gameState.turn !== playerId) {
    console.warn(`⚠️ Not ${playerId}'s turn!`);
    return { success: false, error: 'Not your turn' };
  }

  const player = gameState.players[playerId];
  const opponent = gameState.players[playerId === 'human' ? 'gale' : 'human'];

  // Find the card to play
  let cardIndex;
  if (typeof cardIdentifier === 'number') {
    cardIndex = cardIdentifier;
  } else {
    // Find by ID
    cardIndex = player.hand.findIndex(c => c.id === cardIdentifier);
  }

  if (cardIndex < 0 || cardIndex >= player.hand.length) {
    return { success: false, error: 'Card not found in hand' };
  }

  // Remove card from hand and add to flight
  const [card] = player.hand.splice(cardIndex, 1);

  // Apply The Captain bonus if active
  if (player.captainBonus) {
    card.tempBonus = (card.tempBonus || 0) + 1;
  }

  player.flight.push(card);

  // Log the play
  const playResult = {
    type: 'card_played',
    player: playerId,
    card: card,
    flightSize: player.flight.length,
    message: `${player.name} plays ${card.name} (${card.value + (card.tempBonus || 0)})`
  };

  logGameEvent(playResult);
  console.log(`🃏 ${playResult.message}`);

  // Trigger card effect if it has one
  if (card.effect && card.effect.execute) {
    const effectResult = card.effect.execute(gameState, player, opponent);
    playResult.effectResult = effectResult;
    console.log(`✨ Effect: ${effectResult}`);
  }

  // Store for Gale's AI reference
  if (playerId === 'gale') {
    player.lastPlayedCard = card;
  }

  // Check if flight phase is complete
  const humanFlightComplete = gameState.players.human.flight.length >= GAME_CONSTANTS.FLIGHT_SIZE;
  const galeFlightComplete = gameState.players.gale.flight.length >= GAME_CONSTANTS.FLIGHT_SIZE;

  if (humanFlightComplete && galeFlightComplete) {
    // Both flights are complete! Move to resolution
    gameState.phase = GAME_PHASES.RESOLUTION;
    playResult.phaseComplete = true;
  } else {
    // Switch turns
    gameState.turn = playerId === 'human' ? 'gale' : 'human';
    gameState.turnNumber++;
  }

  return { success: true, ...playResult };
}

/**
 * GET VALID PLAYS
 * Returns which cards in the player's hand can legally be played.
 * (In standard TDA, all cards are valid, but some variants have restrictions)
 *
 * @param {string} playerId - 'human' or 'gale'
 * @returns {Array} - Array of valid card indices
 */
function getValidPlays(playerId) {
  const player = gameState.players[playerId];

  // All cards in hand are valid plays
  return player.hand.map((card, index) => ({
    index: index,
    card: card,
    valid: true
  }));
}

/**
 * PREVIEW PLAY
 * Shows what would happen if a card was played without actually playing it.
 * Useful for UI highlighting and AI decision making.
 *
 * @param {string} playerId - 'human' or 'gale'
 * @param {number} cardIndex - Index of card in hand
 * @returns {Object} - Preview information
 */
function previewPlay(playerId, cardIndex) {
  const player = gameState.players[playerId];
  const card = player.hand[cardIndex];

  if (!card) {
    return null;
  }

  // What would the flight look like?
  const previewFlight = [...player.flight, card];

  // Analyze the preview flight
  let flightAnalysis = null;
  if (previewFlight.length === GAME_CONSTANTS.FLIGHT_SIZE) {
    flightAnalysis = TDA_FLIGHTS.evaluateFlight(previewFlight);
  } else {
    flightAnalysis = TDA_FLIGHTS.checkPartialFlight(previewFlight, player.hand.filter((_, i) => i !== cardIndex));
  }

  return {
    card: card,
    wouldCompleteFlightType: previewFlight.length === 3 ? flightAnalysis.type : null,
    wouldScore: previewFlight.length === 3 ? flightAnalysis.score : null,
    hasEffect: !!card.effect,
    effectDescription: card.effect ? card.effect.description : null,
    analysis: flightAnalysis
  };
}

// =============================================================================
// SECTION 6: RESOLUTION PHASE
// =============================================================================
// The moment of truth! We compare the flights and award the pot.

/**
 * RESOLVE GAMBIT
 * Compares both flights and determines the winner.
 * This is like the end of a combat round when we see who's still standing.
 *
 * @returns {Object} - Results of the resolution
 */
function resolveGambit() {
  if (gameState.phase !== GAME_PHASES.RESOLUTION) {
    console.warn("⚠️ Can't resolve - not in resolution phase!");
    return null;
  }

  const { human, gale } = gameState.players;

  // Evaluate both flights
  const humanFlight = TDA_FLIGHTS.evaluateFlight(human.flight);
  const galeFlightEval = TDA_FLIGHTS.evaluateFlight(gale.flight);

  console.log(`\n🔍 Evaluating Gambit ${gameState.currentGambit}:`);
  console.log(`   ${human.name}: ${humanFlight.description}`);
  console.log(`   ${gale.name}: ${galeFlightEval.description}`);

  // Compare flights
  const comparison = TDA_FLIGHTS.compareFlights(humanFlight, galeFlightEval);

  // Check for special combinations (easter eggs!)
  const humanSpecials = TDA_FLIGHTS.checkSpecialCombinations(human.flight);
  const galeSpecials = TDA_FLIGHTS.checkSpecialCombinations(gale.flight);

  // Determine winner and award pot
  let winnerName, loserId;

  if (comparison.winner === 1) {
    // Human wins!
    human.stakes += gameState.pot;
    gale.gambitsLost++;
    winnerName = human.name;
    loserId = 'gale';
    console.log(`🏆 ${human.name} wins ${gameState.pot} gold! (${humanFlight.score} vs ${galeFlightEval.score})`);
  } else if (comparison.winner === 2) {
    // Gale wins!
    gale.stakes += gameState.pot;
    gale.gambitsWon++;
    winnerName = gale.name;
    loserId = 'human';
    gameState.perfectGame = false; // Human didn't win all gambits
    console.log(`🏆 ${gale.name} wins ${gameState.pot} gold! (${galeFlightEval.score} vs ${humanFlight.score})`);
  } else {
    // Tie! Split the pot
    const half = Math.floor(gameState.pot / 2);
    human.stakes += half;
    gale.stakes += gameState.pot - half; // Gale gets any odd gold because he's a gentleman
    winnerName = 'Nobody';
    loserId = null;
    console.log(`🤝 Tie! Pot split: ${human.name}: ${half}, ${gale.name}: ${gameState.pot - half}`);
  }

  // Build result object
  const result = {
    type: 'gambit_resolved',
    gambit: gameState.currentGambit,
    humanFlight: humanFlight,
    galeFlight: galeFlightEval,
    comparison: comparison,
    winner: comparison.winner === 1 ? 'human' : comparison.winner === 2 ? 'gale' : 'tie',
    winnerName: winnerName,
    potWon: gameState.pot,
    newStakes: {
      human: human.stakes,
      gale: gale.stakes
    },
    humanSpecials: humanSpecials,
    galeSpecials: galeSpecials
  };

  logGameEvent(result);

  // Track comeback potential
  if (comparison.winner === 1 && human.stakes < 20) {
    gameState.comebackActive = true;
  }

  // Update Gale's mood based on results
  updateGaleMood(result);

  // Move played cards to discard
  gameState.discard.push(...human.flight, ...gale.flight);

  // Clear flights for next gambit
  human.flight = [];
  gale.flight = [];
  human.anteCard = null;
  gale.anteCard = null;

  // Reset temporary bonuses
  resetTemporaryEffects();

  // Clear the pot
  gameState.pot = 0;

  // Check for bankruptcy
  if (human.stakes <= GAME_CONSTANTS.MIN_STAKES) {
    return handleBankruptcy('human', result);
  }
  if (gale.stakes <= GAME_CONSTANTS.MIN_STAKES) {
    return handleBankruptcy('gale', result);
  }

  // Check if game is over (3 gambits completed)
  if (gameState.currentGambit >= GAME_CONSTANTS.TOTAL_GAMBITS) {
    return handleGameEnd(result);
  }

  // Draw back up to 6 cards
  refillHands();

  // Move to next gambit
  gameState.currentGambit++;
  gameState.phase = GAME_PHASES.ANTE;

  console.log(`\n📍 Moving to Gambit ${gameState.currentGambit}...`);

  return result;
}

/**
 * RESET TEMPORARY EFFECTS
 * Clears all temporary bonuses and effects from cards.
 * Like taking a short rest after combat.
 */
function resetTemporaryEffects() {
  const { human, gale } = gameState.players;

  // Reset player flags
  human.captainBonus = false;
  human.effectImmunity = false;
  gale.captainBonus = false;
  gale.effectImmunity = false;

  // Reset card temp bonuses (in discard pile, since flights were just moved there)
  gameState.discard.forEach(card => {
    card.tempBonus = 0;
    card.eliminated = false;
    card.immune = false;
  });
}

/**
 * REFILL HANDS
 * Draw cards to get back up to 6.
 * Like finding treasure after a dungeon room.
 */
function refillHands() {
  const { human, gale } = gameState.players;

  // Draw up to 6 cards for each player
  while (human.hand.length < GAME_CONSTANTS.HAND_SIZE && gameState.deck.length > 0) {
    const card = TDA_CARDS.drawCard(gameState.deck);
    if (card) human.hand.push(card);
  }

  while (gale.hand.length < GAME_CONSTANTS.HAND_SIZE && gameState.deck.length > 0) {
    const card = TDA_CARDS.drawCard(gameState.deck);
    if (card) gale.hand.push(card);
  }

  console.log(`🃏 Hands refilled: ${human.name}: ${human.hand.length}, ${gale.name}: ${gale.hand.length}`);
}

// =============================================================================
// SECTION 7: GAME END CONDITIONS
// =============================================================================

/**
 * HANDLE BANKRUPTCY
 * Called when someone runs out of stakes mid-game.
 * Immediate game over!
 *
 * @param {string} bankruptPlayer - 'human' or 'gale'
 * @param {Object} triggerResult - The event that caused bankruptcy
 * @returns {Object} - Game over result
 */
function handleBankruptcy(bankruptPlayer, triggerResult = null) {
  const winner = bankruptPlayer === 'human' ? 'gale' : 'human';
  const { human, gale } = gameState.players;

  gameState.phase = GAME_PHASES.GAME_OVER;
  gameState.winner = winner;

  const result = {
    type: 'game_over',
    reason: 'bankruptcy',
    winner: winner,
    winnerName: gameState.players[winner].name,
    loser: bankruptPlayer,
    loserName: gameState.players[bankruptPlayer].name,
    finalStakes: {
      human: human.stakes,
      gale: gale.stakes
    },
    gambitsPlayed: gameState.currentGambit,
    triggerResult: triggerResult
  };

  logGameEvent(result);
  console.log(`\n💀 ${result.loserName} is bankrupt! ${result.winnerName} wins!`);

  return result;
}

/**
 * HANDLE GAME END
 * Called after all 3 gambits are complete. Richest player wins!
 *
 * @param {Object} finalGambitResult - Result of the last gambit
 * @returns {Object} - Game over result
 */
function handleGameEnd(finalGambitResult) {
  const { human, gale } = gameState.players;

  gameState.phase = GAME_PHASES.GAME_OVER;

  // Determine winner by stakes
  let winner, reason;
  if (human.stakes > gale.stakes) {
    winner = 'human';
    reason = 'more_stakes';
  } else if (gale.stakes > human.stakes) {
    winner = 'gale';
    reason = 'more_stakes';
  } else {
    // Perfect tie! Count gambits won
    // (In our simplified version, we'll give it to Gale as the gracious host)
    winner = 'gale';
    reason = 'tiebreaker';
  }

  gameState.winner = winner;

  const result = {
    type: 'game_over',
    reason: reason,
    winner: winner,
    winnerName: gameState.players[winner].name,
    finalStakes: {
      human: human.stakes,
      gale: gale.stakes
    },
    stakeDifference: Math.abs(human.stakes - gale.stakes),
    gambitsPlayed: GAME_CONSTANTS.TOTAL_GAMBITS,
    perfectGame: winner === 'human' && gameState.perfectGame,
    comebackVictory: winner === 'human' && gameState.comebackActive,
    finalGambitResult: finalGambitResult
  };

  logGameEvent(result);

  if (winner === 'human') {
    console.log(`\n🎉 ${human.name} wins with ${human.stakes} gold to ${gale.stakes}!`);
    if (result.perfectGame) {
      console.log("⭐ PERFECT GAME! Won all three gambits!");
    }
    if (result.comebackVictory) {
      console.log("🔥 COMEBACK VICTORY! Recovered from near-bankruptcy!");
    }
  } else {
    console.log(`\n🏆 ${gale.name} wins with ${gale.stakes} gold to ${human.stakes}!`);
  }

  return result;
}

// =============================================================================
// SECTION 8: GALE'S MOOD TRACKING
// =============================================================================
// Gale's mood affects his commentary and slightly his play style.

/**
 * UPDATE GALE MOOD
 * Adjusts Gale's emotional state based on game events.
 *
 * @param {Object} event - The event that might affect mood
 */
function updateGaleMood(event) {
  const gale = gameState.players.gale;

  // Calculate current advantage
  const stakeDiff = gale.stakes - gameState.players.human.stakes;
  const gambitsAhead = gale.gambitsWon - gale.gambitsLost;

  // Determine mood
  if (gambitsAhead >= 2 || stakeDiff >= 30) {
    gale.mood = 'confident';
    gale.confidence = 0.8;
  } else if (gambitsAhead <= -2 || stakeDiff <= -30) {
    gale.mood = 'worried';
    gale.confidence = 0.3;
  } else if (event && event.winner === 'human' && event.humanSpecials && event.humanSpecials.length > 0) {
    gale.mood = 'impressed';
    gale.confidence = 0.5;
  } else {
    gale.mood = 'focused';
    gale.confidence = 0.5;
  }

  // Small chance of humming when focused or confident
  gale.galeHumming = (gale.mood === 'focused' || gale.mood === 'confident') && Math.random() < 0.1;
}

// =============================================================================
// SECTION 9: UTILITY FUNCTIONS
// =============================================================================

/**
 * LOG GAME EVENT
 * Records an event in the game history for replay and debugging.
 *
 * @param {Object} event - The event to log
 */
function logGameEvent(event) {
  event.timestamp = Date.now();
  event.gambit = gameState.currentGambit;
  event.turn = gameState.turnNumber;

  gameState.gameHistory.push(event);
}

/**
 * GET CURRENT STATE
 * Returns a summary of the current game state.
 * Useful for UI rendering and debugging.
 *
 * @param {boolean} hideGaleHand - Hide Gale's cards (for fair play)
 * @returns {Object} - Current state summary
 */
function getCurrentState(hideGaleHand = true) {
  if (!gameState) {
    return null;
  }

  const { human, gale } = gameState.players;

  return {
    phase: gameState.phase,
    currentGambit: gameState.currentGambit,
    turn: gameState.turn,
    pot: gameState.pot,

    human: {
      name: human.name,
      stakes: human.stakes,
      handSize: human.hand.length,
      hand: human.hand, // Always show human's hand
      flight: human.flight,
      anteCard: human.anteCard
    },

    gale: {
      name: gale.name,
      stakes: gale.stakes,
      handSize: gale.hand.length,
      hand: hideGaleHand ? null : gale.hand, // Hide Gale's hand for fair play
      flight: gale.flight,
      anteCard: gale.anteCard,
      mood: gale.mood,
      isHumming: gale.galeHumming
    },

    deckSize: gameState.deck.length,
    discardSize: gameState.discard.length
  };
}

/**
 * GET GAME SUMMARY
 * Returns a summary of the completed game for stats/display.
 *
 * @returns {Object} - Game summary
 */
function getGameSummary() {
  if (!gameState || gameState.phase !== GAME_PHASES.GAME_OVER) {
    return null;
  }

  const { human, gale } = gameState.players;

  return {
    winner: gameState.winner,
    winnerName: gameState.players[gameState.winner].name,
    finalStakes: {
      human: human.stakes,
      gale: gale.stakes
    },
    gambitsPlayed: gameState.currentGambit,
    totalEvents: gameState.gameHistory.length,
    perfectGame: gameState.winner === 'human' && gameState.perfectGame,
    comebackVictory: gameState.winner === 'human' && gameState.comebackActive,
    galeGambitsWon: gale.gambitsWon,
    humanGambitsWon: GAME_CONSTANTS.TOTAL_GAMBITS - gale.gambitsWon
  };
}

/**
 * CAN PLAY CARD
 * Quick check if a player can legally play a card right now.
 *
 * @param {string} playerId - 'human' or 'gale'
 * @returns {boolean} - Whether the player can play
 */
function canPlayCard(playerId) {
  return gameState &&
         gameState.phase === GAME_PHASES.FLIGHT &&
         gameState.turn === playerId;
}

// =============================================================================
// EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GAME_PHASES,
    GAME_CONSTANTS,
    createInitialGameState,
    startNewGame,
    processAntePhase,
    playCard,
    getValidPlays,
    previewPlay,
    resolveGambit,
    getCurrentState,
    getGameSummary,
    canPlayCard,
    get gameState() { return gameState; }
  };
} else {
  window.TDA_GAME = {
    GAME_PHASES,
    GAME_CONSTANTS,
    createInitialGameState,
    startNewGame,
    processAntePhase,
    playCard,
    getValidPlays,
    previewPlay,
    resolveGambit,
    getCurrentState,
    getGameSummary,
    canPlayCard,
    get gameState() { return gameState; }
  };
}

// =============================================================================
// END OF GAME.JS
// =============================================================================
//
// The game engine is complete! You can now:
// - Start a new game
// - Process ante phases
// - Play cards to build flights
// - Resolve gambits and award pots
// - Track the winner
//
// "Perhaps I should treat this less like a negotiation and more like a
// round of Three Dragon Ante. I'll see what cards she lays on the table
// and respond in kind."
//
// Now go play some cards with Gale!
// =============================================================================
