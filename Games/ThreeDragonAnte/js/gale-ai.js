// =============================================================================
// GALE-AI.JS - THE WIZARD'S BRAIN
// =============================================================================
//
// This is where Gale thinks! His AI decides which card to play based on
// the current game state. He's not going to be a grandmaster player (we
// want Erica to have fun and win sometimes!), but he should feel like
// he's making reasonable decisions.
//
// AI PHILOSOPHY:
// Gale is a wizard - he's smart and strategic, but not infallible.
// He should:
// - Try to complete flights (Color > Strength > Fellowship)
// - Block opponent's obvious plays when possible
// - Make occasional "mistakes" to keep it fun
// - Play stronger when confident, safer when worried
//
// =============================================================================

// =============================================================================
// SECTION 1: MAIN DECISION FUNCTION
// =============================================================================

/**
 * CHOOSE CARD
 * The main AI function - decides which card Gale should play.
 *
 * @param {Object} state - Full game state (unhidden)
 * @returns {number} - Index of the card to play from Gale's hand
 */
function chooseCard(state) {
  const gale = state.gale;
  const human = state.human;

  // If no cards, we have a problem
  if (!gale.hand || gale.hand.length === 0) {
    console.error("❌ Gale has no cards to play!");
    return 0;
  }

  // Get analysis of what Gale can build
  const handAnalysis = analyzeHand(gale.hand, gale.flight);

  // Get analysis of what human is building
  const threatAnalysis = analyzeOpponentFlight(human.flight);

  // Determine best play based on strategy
  let chosenIndex;

  // ----- STRATEGY SELECTION -----

  // Can we complete a flight?
  if (gale.flight.length === 2) {
    chosenIndex = findFlightCompletion(gale.hand, gale.flight);
    if (chosenIndex !== -1) {
      console.log("🧠 Gale: Completing my flight!");
      return chosenIndex;
    }
  }

  // Can we build toward a flight?
  if (gale.flight.length < 2) {
    chosenIndex = findFlightBuilder(gale.hand, gale.flight, handAnalysis);
    if (chosenIndex !== -1) {
      console.log("🧠 Gale: Building toward a flight.");
      return chosenIndex;
    }
  }

  // Should we play defensively?
  if (threatAnalysis.dangerous && gale.mood === 'worried') {
    chosenIndex = findDefensivePlay(gale.hand, threatAnalysis);
    if (chosenIndex !== -1) {
      console.log("🧠 Gale: Playing defensively.");
      return chosenIndex;
    }
  }

  // Default: play based on value and mood
  chosenIndex = findValuePlay(gale.hand, gale.mood);
  console.log("🧠 Gale: Playing by value.");

  return chosenIndex;
}

// =============================================================================
// SECTION 2: HAND ANALYSIS
// =============================================================================

/**
 * ANALYZE HAND
 * Figures out what flights Gale could potentially build.
 *
 * @param {Array} hand - Gale's current hand
 * @param {Array} currentFlight - Cards already played this gambit
 * @returns {Object} - Analysis results
 */
function analyzeHand(hand, currentFlight) {
  const analysis = {
    // Group cards by suit
    bySuit: {},
    // Group cards by value
    byValue: {},
    // Mortals for fellowship
    mortals: [],
    // Best potential flights
    potentialFlights: []
  };

  // Include current flight in analysis
  const allCards = [...currentFlight, ...hand];

  allCards.forEach(card => {
    // By suit
    if (card.suit) {
      if (!analysis.bySuit[card.suit]) {
        analysis.bySuit[card.suit] = [];
      }
      analysis.bySuit[card.suit].push(card);
    }

    // By value
    if (!analysis.byValue[card.value]) {
      analysis.byValue[card.value] = [];
    }
    analysis.byValue[card.value].push(card);

    // Mortals
    if (card.type === 'mortal') {
      analysis.mortals.push(card);
    }
  });

  // Find potential color flights (3+ of same suit)
  Object.entries(analysis.bySuit).forEach(([suit, cards]) => {
    if (cards.length >= 3) {
      const sorted = [...cards].sort((a, b) => b.value - a.value);
      const score = sorted[0].value + sorted[1].value + sorted[2].value;
      analysis.potentialFlights.push({
        type: 'color',
        suit: suit,
        cards: sorted.slice(0, 3),
        score: score
      });
    }
  });

  // Find potential strength flights (3+ of same value)
  Object.entries(analysis.byValue).forEach(([value, cards]) => {
    if (cards.length >= 3) {
      const numValue = parseInt(value);
      analysis.potentialFlights.push({
        type: 'strength',
        value: numValue,
        cards: cards.slice(0, 3),
        score: numValue * 3 + 10
      });
    }
  });

  // Fellowship potential
  if (analysis.mortals.length >= 3) {
    const sorted = [...analysis.mortals].sort((a, b) => b.value - a.value);
    const score = sorted[0].value + sorted[1].value + sorted[2].value + 15;
    analysis.potentialFlights.push({
      type: 'fellowship',
      cards: sorted.slice(0, 3),
      score: score
    });
  }

  // Sort potential flights by score
  analysis.potentialFlights.sort((a, b) => b.score - a.score);

  return analysis;
}

/**
 * ANALYZE OPPONENT FLIGHT
 * Looks at what the human is building to assess threat level.
 *
 * @param {Array} humanFlight - Human's current flight cards
 * @returns {Object} - Threat assessment
 */
function analyzeOpponentFlight(humanFlight) {
  const threat = {
    dangerous: false,
    type: null,
    estimatedScore: 0,
    cards: humanFlight
  };

  if (humanFlight.length === 0) {
    return threat;
  }

  // Check what they might be building
  if (humanFlight.length >= 2) {
    const [card1, card2] = humanFlight;

    // Same suit?
    if (card1.suit && card1.suit === card2.suit) {
      threat.type = 'color';
      threat.estimatedScore = card1.value + card2.value + 5; // Assume medium 3rd card
      threat.dangerous = threat.estimatedScore > 15;
    }

    // Same value?
    if (card1.value === card2.value) {
      threat.type = 'strength';
      threat.estimatedScore = card1.value * 3 + 10;
      threat.dangerous = threat.estimatedScore > 20;
    }

    // Both mortals?
    if (card1.type === 'mortal' && card2.type === 'mortal') {
      threat.type = 'fellowship';
      threat.estimatedScore = card1.value + card2.value + 5 + 15;
      threat.dangerous = true; // Fellowships are always dangerous
    }
  }

  return threat;
}

// =============================================================================
// SECTION 3: CARD SELECTION STRATEGIES
// =============================================================================

/**
 * FIND FLIGHT COMPLETION
 * Looks for a card that completes Gale's flight.
 *
 * @param {Array} hand - Cards in hand
 * @param {Array} flight - Current flight (should be 2 cards)
 * @returns {number} - Index of completing card, or -1
 */
function findFlightCompletion(hand, flight) {
  if (flight.length !== 2) return -1;

  const [card1, card2] = flight;

  // Check for color flight completion
  if (card1.suit && card1.suit === card2.suit) {
    const matchIndex = hand.findIndex(c => c.suit === card1.suit);
    if (matchIndex !== -1) return matchIndex;
  }

  // Check for strength flight completion
  if (card1.value === card2.value) {
    const matchIndex = hand.findIndex(c => c.value === card1.value);
    if (matchIndex !== -1) return matchIndex;
  }

  // Check for fellowship completion
  if (card1.type === 'mortal' && card2.type === 'mortal') {
    const matchIndex = hand.findIndex(c => c.type === 'mortal');
    if (matchIndex !== -1) return matchIndex;
  }

  return -1;
}

/**
 * FIND FLIGHT BUILDER
 * Chooses a card that helps build toward a potential flight.
 *
 * @param {Array} hand - Cards in hand
 * @param {Array} flight - Current flight
 * @param {Object} analysis - Hand analysis
 * @returns {number} - Index of chosen card, or -1
 */
function findFlightBuilder(hand, flight, analysis) {
  // If we have good potential flights, play toward the best one
  if (analysis.potentialFlights.length > 0) {
    const bestFlight = analysis.potentialFlights[0];

    // Find a card from hand that's part of this flight
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];

      // Check if this card is in our target flight
      if (bestFlight.cards.some(c => c.id === card.id)) {
        // Don't play it if it's already in the flight
        if (!flight.some(f => f.id === card.id)) {
          return i;
        }
      }
    }
  }

  // If first card of flight, start with something good
  if (flight.length === 0) {
    // Find cards we have multiples of
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];

      // Check if we have more of this suit
      if (card.suit) {
        const suitCount = hand.filter(c => c.suit === card.suit).length;
        if (suitCount >= 2) return i;
      }

      // Check if we have more of this value
      const valueCount = hand.filter(c => c.value === card.value).length;
      if (valueCount >= 2) return i;
    }
  }

  return -1;
}

/**
 * FIND DEFENSIVE PLAY
 * Chooses a card to minimize losses when opponent is winning.
 *
 * @param {Array} hand - Cards in hand
 * @param {Object} threat - Threat analysis
 * @returns {number} - Index of chosen card, or -1
 */
function findDefensivePlay(hand, threat) {
  // If opponent is building something strong, we need to match or exceed
  // Play our highest value card
  let highestIndex = 0;
  let highestValue = hand[0].value;

  for (let i = 1; i < hand.length; i++) {
    if (hand[i].value > highestValue) {
      highestValue = hand[i].value;
      highestIndex = i;
    }
  }

  return highestIndex;
}

/**
 * FIND VALUE PLAY
 * Default strategy - pick based on card values and Gale's mood.
 *
 * @param {Array} hand - Cards in hand
 * @param {string} mood - Gale's current mood
 * @returns {number} - Index of chosen card
 */
function findValuePlay(hand, mood) {
  // Sort hand by value
  const sorted = hand.map((card, index) => ({ card, index }))
    .sort((a, b) => b.card.value - a.card.value);

  switch (mood) {
    case 'confident':
      // Play strong - second highest (save best for later)
      return sorted.length > 1 ? sorted[1].index : sorted[0].index;

    case 'worried':
      // Play safe - medium value
      return sorted[Math.floor(sorted.length / 2)].index;

    case 'impressed':
      // Mix it up - slight randomness
      const range = Math.min(3, sorted.length);
      return sorted[Math.floor(Math.random() * range)].index;

    case 'focused':
    default:
      // Balanced - upper-middle
      return sorted[Math.floor(sorted.length / 3)].index;
  }
}

// =============================================================================
// SECTION 4: UTILITY FUNCTIONS
// =============================================================================

/**
 * ADD RANDOMNESS
 * Sometimes Gale makes suboptimal plays to keep it fun.
 * A small chance to pick a different card than the "best" one.
 *
 * @param {number} optimalIndex - The strategically best choice
 * @param {number} handSize - Size of Gale's hand
 * @returns {number} - Final card index (might be different!)
 */
function addRandomness(optimalIndex, handSize) {
  // 15% chance to pick a random card instead
  if (Math.random() < 0.15) {
    return Math.floor(Math.random() * handSize);
  }
  return optimalIndex;
}

/**
 * EVALUATE PLAY
 * Scores a potential play for debugging/tuning.
 *
 * @param {Object} card - The card being considered
 * @param {Array} currentFlight - Current flight state
 * @param {Object} analysis - Hand analysis
 * @returns {number} - Score for this play
 */
function evaluatePlay(card, currentFlight, analysis) {
  let score = card.value;

  // Bonus for completing a flight
  if (currentFlight.length === 2) {
    const [c1, c2] = currentFlight;
    if (c1.suit && c1.suit === c2.suit && card.suit === c1.suit) {
      score += 20; // Color flight completion
    }
    if (c1.value === c2.value && card.value === c1.value) {
      score += 25; // Strength flight completion
    }
  }

  // Bonus for building toward a flight
  if (currentFlight.length === 1) {
    const c1 = currentFlight[0];
    if (c1.suit && card.suit === c1.suit) score += 10;
    if (c1.value === card.value) score += 10;
  }

  // Bonus for special effects
  if (card.effect) {
    score += 5;
  }

  return score;
}

// =============================================================================
// EXPORTS
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    chooseCard,
    analyzeHand,
    analyzeOpponentFlight
  };
} else {
  window.TDA_GALE_AI = {
    chooseCard,
    analyzeHand,
    analyzeOpponentFlight
  };
}

// =============================================================================
// END OF GALE-AI.JS
// =============================================================================
//
// Gale now has thoughts! He'll try to build flights, respond to your
// plays, and occasionally make strategic "mistakes" so you can win.
//
// He's smart, but he's not a perfect player - and that's intentional.
// Games should be fun, not frustrating!
//
// "As it stands, I see no option free of sacrifice in one form or another.
// So the question becomes - what are you willing to give up?"
//
// =============================================================================
