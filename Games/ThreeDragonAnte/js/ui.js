// =============================================================================
// UI.JS - THE BATTLE MAP
// =============================================================================
//
// This is where we paint the screen! All the DOM manipulation lives here.
// Think of it like the theater crew - they make sure the stage looks right
// so the actors (game.js) can do their thing.
//
// Main responsibilities:
// - Render cards (in hands, flights, etc.)
// - Handle click events
// - Update displays (stakes, pot, turn indicator)
// - Show Gale's commentary
// - Manage modals (game over screen)
//
// =============================================================================

// =============================================================================
// DOM ELEMENT REFERENCES
// =============================================================================
// Grab all our important elements once so we're not querying the DOM constantly.
// It's like having your spell components ready instead of digging through your
// bag every time.

const DOM = {
  // Game info
  gambitDisplay: document.getElementById('gambit-display'),
  phaseDisplay: document.getElementById('phase-display'),
  turnIndicator: document.getElementById('turn-text'),

  // Player areas
  playerHand: document.getElementById('player-hand'),
  playerFlight: document.querySelector('#player-flight .flight-cards'),
  playerStakes: document.getElementById('player-stakes'),

  // Gale areas
  galeHand: document.getElementById('gale-hand'),
  galeFlight: document.querySelector('#gale-flight .flight-cards'),
  galeStakes: document.getElementById('gale-stakes'),
  galeMood: document.getElementById('gale-mood'),
  galeText: document.getElementById('gale-text'),

  // Center
  potAmount: document.getElementById('pot-amount'),

  // Buttons
  btnNewGame: document.getElementById('btn-new-game'),
  btnAnte: document.getElementById('btn-ante'),
  btnResolve: document.getElementById('btn-resolve'),

  // Panels
  cardPreview: document.getElementById('card-preview'),
  logEntries: document.getElementById('log-entries'),

  // Modal
  gameOverModal: document.getElementById('game-over-modal'),
  gameOverTitle: document.getElementById('game-over-title'),
  gameOverMessage: document.getElementById('game-over-message'),
  gameOverGale: document.getElementById('game-over-gale'),
  btnPlayAgain: document.getElementById('btn-play-again')
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * INITIALIZE UI
 * Sets up event listeners and prepares the UI for action.
 * Called when the page loads.
 */
function initializeUI() {
  console.log("🎨 Initializing UI...");

  // ----- BUTTON EVENT LISTENERS -----

  // New Game button
  DOM.btnNewGame.addEventListener('click', () => {
    const state = TDA_GAME.startNewGame();
    renderFullState(state);
    galeSpeak('game_start');
    updateButtons();
  });

  // Ante button
  DOM.btnAnte.addEventListener('click', () => {
    const result = TDA_GAME.processAntePhase();
    if (result) {
      const state = TDA_GAME.getCurrentState();
      renderFullState(state);
      addLogEntry(`Antes paid: You ${result.humanAnte}, Gale ${result.galeAnte}. Pot: ${result.pot}`);
      galeSpeak('ante', result);

      // If it's Gale's turn first, let him play
      if (state.turn === 'gale') {
        setTimeout(() => galeAutoPlay(), 1000);
      }
    }
    updateButtons();
  });

  // Resolve button
  DOM.btnResolve.addEventListener('click', () => {
    const result = TDA_GAME.resolveGambit();
    if (result) {
      const state = TDA_GAME.getCurrentState();
      renderFullState(state);
      handleResolution(result);
    }
    updateButtons();
  });

  // Play Again button
  DOM.btnPlayAgain.addEventListener('click', () => {
    DOM.gameOverModal.classList.add('hidden');
    DOM.btnNewGame.click();
  });

  console.log("✅ UI initialized!");
}

// =============================================================================
// RENDERING FUNCTIONS
// =============================================================================

/**
 * RENDER FULL STATE
 * Updates the entire UI based on the current game state.
 * Like refreshing the whole battle map.
 *
 * @param {Object} state - Current game state from TDA_GAME.getCurrentState()
 */
function renderFullState(state) {
  if (!state) {
    console.warn("⚠️ No state to render!");
    return;
  }

  // Update game info
  DOM.gambitDisplay.textContent = `Gambit ${state.currentGambit} of 3`;
  DOM.phaseDisplay.textContent = capitalizePhase(state.phase);

  // Update stakes
  DOM.playerStakes.textContent = state.human.stakes;
  DOM.galeStakes.textContent = state.gale.stakes;

  // Update pot
  DOM.potAmount.textContent = state.pot;
  if (state.pot > 0) {
    DOM.potAmount.classList.add('pulsing');
  } else {
    DOM.potAmount.classList.remove('pulsing');
  }

  // Render hands
  renderPlayerHand(state.human.hand);
  renderGaleHand(state.gale.handSize);

  // Render flights
  renderFlight(DOM.playerFlight, state.human.flight, false);
  renderFlight(DOM.galeFlight, state.gale.flight, false);

  // Update turn indicator
  updateTurnIndicator(state);

  // Update Gale's mood
  DOM.galeMood.textContent = state.gale.mood.charAt(0).toUpperCase() + state.gale.mood.slice(1);
  if (state.gale.isHumming) {
    DOM.galeMood.textContent += ' ♪';
  }

  // Update buttons
  updateButtons();
}

/**
 * RENDER PLAYER HAND
 * Draws the player's cards - clickable and hoverable!
 *
 * @param {Array} hand - Array of card objects
 */
function renderPlayerHand(hand) {
  // Clear existing cards (but keep the label)
  const label = DOM.playerHand.querySelector('.hand-label');
  DOM.playerHand.innerHTML = '';
  if (label) DOM.playerHand.appendChild(label);

  // Create card elements
  hand.forEach((card, index) => {
    const cardEl = createCardElement(card, index);

    // Add click handler for playing the card
    cardEl.addEventListener('click', () => handleCardClick(index));

    // Add hover handlers for preview
    cardEl.addEventListener('mouseenter', () => showCardPreview(card));
    cardEl.addEventListener('mouseleave', () => hideCardPreview());

    DOM.playerHand.appendChild(cardEl);
  });
}

/**
 * RENDER GALE'S HAND
 * Draws card backs for Gale's hidden hand.
 *
 * @param {number} count - Number of cards in Gale's hand
 */
function renderGaleHand(count) {
  const label = DOM.galeHand.querySelector('.hand-label');
  DOM.galeHand.innerHTML = '';
  if (label) DOM.galeHand.appendChild(label);

  for (let i = 0; i < count; i++) {
    const cardBack = document.createElement('div');
    cardBack.className = 'card card-back';
    DOM.galeHand.appendChild(cardBack);
  }
}

/**
 * RENDER FLIGHT
 * Draws cards in a flight area, with empty slots for missing cards.
 *
 * @param {Element} container - The flight-cards container element
 * @param {Array} cards - Cards in the flight
 * @param {boolean} faceDown - Show as card backs (for hidden flights)
 */
function renderFlight(container, cards, faceDown = false) {
  container.innerHTML = '';

  // Show cards played
  cards.forEach((card, index) => {
    if (faceDown) {
      const cardBack = document.createElement('div');
      cardBack.className = 'card card-back';
      container.appendChild(cardBack);
    } else {
      const cardEl = createCardElement(card, index);
      cardEl.addEventListener('mouseenter', () => showCardPreview(card));
      cardEl.addEventListener('mouseleave', () => hideCardPreview());
      container.appendChild(cardEl);
    }
  });

  // Show empty slots for remaining cards
  for (let i = cards.length; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'flight-slot';
    slot.textContent = '?';
    container.appendChild(slot);
  }
}

/**
 * CREATE CARD ELEMENT
 * Builds a DOM element for a single card.
 *
 * @param {Object} card - The card data
 * @param {number} index - Index for animation delay
 * @returns {Element} - The card DOM element
 */
function createCardElement(card, index) {
  const cardEl = document.createElement('div');

  // Build class list based on card type
  let classes = ['card'];

  // Add suit class for dragons
  if (card.suit) {
    classes.push(`suit-${card.suit.toLowerCase()}`);
  }

  // Add type class
  classes.push(`type-${card.type}`);

  cardEl.className = classes.join(' ');

  // Card content
  cardEl.innerHTML = `
    <div class="card-name">${card.name}</div>
    <div class="card-value">${card.value + (card.tempBonus || 0)}</div>
    <div class="card-type">${card.type}</div>
  `;

  // Add dealing animation with stagger
  cardEl.style.animationDelay = `${index * 0.1}s`;
  cardEl.classList.add('dealing');

  return cardEl;
}

// =============================================================================
// CARD INTERACTION
// =============================================================================

/**
 * HANDLE CARD CLICK
 * Called when player clicks a card in their hand.
 *
 * @param {number} cardIndex - Index of clicked card
 */
function handleCardClick(cardIndex) {
  // Check if we can play
  if (!TDA_GAME.canPlayCard('human')) {
    console.log("⚠️ Can't play right now!");
    return;
  }

  // Play the card
  const result = TDA_GAME.playCard('human', cardIndex);

  if (result.success) {
    const state = TDA_GAME.getCurrentState();
    renderFullState(state);
    addLogEntry(`You played ${result.card.name} (${result.card.value})`);

    // Show effect result if any
    if (result.effectResult) {
      addLogEntry(result.effectResult, true);
    }

    // Check if it's Gale's turn
    if (state.turn === 'gale' && state.phase === 'flight') {
      setTimeout(() => galeAutoPlay(), 1000);
    }

    // Check if phase complete
    if (result.phaseComplete) {
      galeSpeak('flight_complete');
    }

    updateButtons();
  }
}

/**
 * GALE AUTO PLAY
 * Handles Gale's turn automatically using AI.
 */
function galeAutoPlay() {
  const state = TDA_GAME.getCurrentState(false); // Get unhidden state for AI

  if (state.turn !== 'gale' || state.phase !== 'flight') {
    return;
  }

  // Use AI to pick a card (or random for now)
  let cardIndex;
  if (typeof TDA_GALE_AI !== 'undefined' && TDA_GALE_AI.chooseCard) {
    cardIndex = TDA_GALE_AI.chooseCard(state);
  } else {
    // Fallback: random selection
    cardIndex = Math.floor(Math.random() * state.gale.handSize);
  }

  // Play the card
  const result = TDA_GAME.playCard('gale', cardIndex);

  if (result.success) {
    const newState = TDA_GAME.getCurrentState();
    renderFullState(newState);
    addLogEntry(`Gale played ${result.card.name} (${result.card.value})`);

    // Gale comments on his play
    galeSpeak('card_played', result);

    // Check if phase complete
    if (result.phaseComplete) {
      galeSpeak('flight_complete');
    }

    updateButtons();
  }
}

// =============================================================================
// CARD PREVIEW
// =============================================================================

/**
 * SHOW CARD PREVIEW
 * Displays detailed info about a card on hover.
 *
 * @param {Object} card - The card to preview
 */
function showCardPreview(card) {
  document.getElementById('preview-name').textContent = card.name;
  document.getElementById('preview-type').textContent = `${card.type}${card.suit ? ` - ${card.suit}` : ''}`;
  document.getElementById('preview-value').textContent = `Value: ${card.value + (card.tempBonus || 0)}`;
  document.getElementById('preview-effect').textContent = card.effect ? card.effect.description : 'No special effect';
  document.getElementById('preview-flavor').textContent = card.flavor || '';

  DOM.cardPreview.classList.remove('hidden');
}

/**
 * HIDE CARD PREVIEW
 */
function hideCardPreview() {
  DOM.cardPreview.classList.add('hidden');
}

// =============================================================================
// BUTTON STATE MANAGEMENT
// =============================================================================

/**
 * UPDATE BUTTONS
 * Enables/disables buttons based on current game state.
 */
function updateButtons() {
  const state = TDA_GAME.getCurrentState();

  if (!state) {
    DOM.btnNewGame.disabled = false;
    DOM.btnAnte.disabled = true;
    DOM.btnResolve.disabled = true;
    return;
  }

  // New Game always available
  DOM.btnNewGame.disabled = false;

  // Ante button - only in ante phase
  DOM.btnAnte.disabled = state.phase !== 'ante';

  // Resolve button - only in resolution phase
  DOM.btnResolve.disabled = state.phase !== 'resolution';
}

/**
 * UPDATE TURN INDICATOR
 * Shows whose turn it is and what they should do.
 *
 * @param {Object} state - Current game state
 */
function updateTurnIndicator(state) {
  let message = '';

  switch (state.phase) {
    case 'setup':
      message = 'Click "New Game" to start!';
      break;
    case 'ante':
      message = 'Click "Draw Ante" to begin the gambit!';
      break;
    case 'flight':
      if (state.turn === 'human') {
        message = 'Your turn! Click a card to play.';
      } else {
        message = 'Gale is thinking...';
      }
      break;
    case 'resolution':
      message = 'Click "Resolve Gambit" to see who wins!';
      break;
    case 'game_over':
      message = 'Game Over!';
      break;
    default:
      message = '';
  }

  DOM.turnIndicator.textContent = message;
}

// =============================================================================
// GALE'S DIALOGUE
// =============================================================================

/**
 * GALE SPEAK
 * Makes Gale say something appropriate to the situation.
 *
 * @param {string} context - What's happening ('game_start', 'ante', 'card_played', etc.)
 * @param {Object} data - Additional context data
 */
function galeSpeak(context, data = {}) {
  let text = '';

  // Get appropriate dialogue
  if (typeof TDA_GALE_DIALOG !== 'undefined' && TDA_GALE_DIALOG.getLine) {
    text = TDA_GALE_DIALOG.getLine(context, data);
  } else {
    // Fallback lines
    const fallbacks = {
      'game_start': "Ah, Three Dragon Ante. A game of strategy and nerve. Shall we?",
      'ante': "The ante is set. Let us see what fortune favors.",
      'card_played': "An interesting choice...",
      'flight_complete': "Both flights revealed. The moment of truth approaches.",
      'win': "Well played. Fortune favors the bold.",
      'lose': "A worthy victory. You've earned it.",
      'default': "Hmm, let me consider this carefully..."
    };
    text = fallbacks[context] || fallbacks['default'];
  }

  DOM.galeText.textContent = `"${text}"`;
}

// =============================================================================
// GAME LOG
// =============================================================================

/**
 * ADD LOG ENTRY
 * Adds a message to the game log.
 *
 * @param {string} message - The message to log
 * @param {boolean} highlight - Make it stand out
 */
function addLogEntry(message, highlight = false) {
  const entry = document.createElement('div');
  entry.className = 'log-entry' + (highlight ? ' highlight' : '');
  entry.textContent = message;

  DOM.logEntries.appendChild(entry);
  DOM.logEntries.scrollTop = DOM.logEntries.scrollHeight;
}

/**
 * CLEAR LOG
 * Empties the game log.
 */
function clearLog() {
  DOM.logEntries.innerHTML = '';
}

// =============================================================================
// RESOLUTION HANDLING
// =============================================================================

/**
 * HANDLE RESOLUTION
 * Processes and displays the results of a gambit.
 *
 * @param {Object} result - Resolution result from TDA_GAME.resolveGambit()
 */
function handleResolution(result) {
  // Log the results
  addLogEntry(`--- Gambit ${result.gambit} Results ---`, true);
  addLogEntry(`Your flight: ${result.humanFlight.description}`);
  addLogEntry(`Gale's flight: ${result.galeFlight.description}`);

  if (result.winner === 'human') {
    addLogEntry(`You win ${result.potWon} gold!`, true);
    galeSpeak('lose', result);
  } else if (result.winner === 'gale') {
    addLogEntry(`Gale wins ${result.potWon} gold!`);
    galeSpeak('win', result);
  } else {
    addLogEntry(`Tie! Pot split.`);
    galeSpeak('tie', result);
  }

  // Check for special combinations
  if (result.humanSpecials && result.humanSpecials.length > 0) {
    result.humanSpecials.forEach(special => {
      addLogEntry(`✨ ${special.name}: ${special.description}`, true);
    });
  }

  // Check for game over
  if (result.type === 'game_over') {
    showGameOver(result);
  }
}

/**
 * SHOW GAME OVER
 * Displays the game over modal with results.
 *
 * @param {Object} result - Game over result
 */
function showGameOver(result) {
  let title, message, galeQuote;

  if (result.winner === 'human') {
    title = "Victory!";
    message = `You win with ${result.finalStakes.human} gold to Gale's ${result.finalStakes.gale}!`;

    if (result.perfectGame) {
      galeQuote = "You'd make a fine Three-Dragon Ante player, you know.";
    } else if (result.comebackVictory) {
      galeQuote = "Don't give anything away, just see what she has to say... Your advice serves me well even now.";
    } else {
      galeQuote = "Well played, Starlight. You've bested me fairly.";
    }
  } else {
    title = "Defeat";
    message = `Gale wins with ${result.finalStakes.gale} gold to your ${result.finalStakes.human}.`;
    galeQuote = "A valiant effort. Perhaps another round? I promise to go easier on you.";
  }

  DOM.gameOverTitle.textContent = title;
  DOM.gameOverMessage.textContent = message;
  DOM.gameOverGale.textContent = `"${galeQuote}"`;

  DOM.gameOverModal.classList.remove('hidden');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * CAPITALIZE PHASE
 * Makes phase names look nice.
 *
 * @param {string} phase - Phase name from GAME_PHASES
 * @returns {string} - Formatted phase name
 */
function capitalizePhase(phase) {
  const names = {
    'setup': 'Setup',
    'ante': 'Ante Phase',
    'flight': 'Flight Building',
    'resolution': 'Resolution',
    'game_over': 'Game Over'
  };
  return names[phase] || phase;
}

// =============================================================================
// INITIALIZE ON PAGE LOAD
// =============================================================================
// When the DOM is ready, set everything up!

document.addEventListener('DOMContentLoaded', () => {
  console.log("🐉 Three Dragon Ante loading...");
  initializeUI();
  console.log("🎮 Ready to play! Click 'New Game' to start.");
});

// =============================================================================
// EXPORTS (for potential testing/debugging)
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeUI,
    renderFullState,
    galeSpeak,
    addLogEntry
  };
} else {
  window.TDA_UI = {
    initializeUI,
    renderFullState,
    galeSpeak,
    addLogEntry,
    clearLog
  };
}

// =============================================================================
// END OF UI.JS
// =============================================================================
//
// The stage is set! The battle map is ready! Now you can actually SEE the
// game instead of just reading console.log outputs like a caveperson.
//
// "There is poetry to be found in even the dingiest of holes."
// — Gale, probably talking about pre-CSS code
//
// =============================================================================
