// =============================================================================
// FLIGHTS.JS - THE DRAGON SHOW JUDGE
// =============================================================================
//
// This file handles evaluating "flights" - the three-card combinations you
// build in Three Dragon Ante. Think of it like a poker hand evaluator, but
// instead of straights and flushes, we're looking at Color Flights, Strength
// Flights, and Fellowships.
//
// A "flight" in dragon terms is just a group of dragons flying together.
// Like a murder of crows, a parliament of owls, or a panic of software
// developers when production goes down.
//
// FLIGHT TYPES (from best to worst):
//
// 1. STRENGTH FLIGHT - Three dragons of the same power level
//    Example: Three 6s (Red 6, Gold 6, Black 6)
//    Score: value × 3 + 10 bonus
//    Why it's good: Hard to get! Same value across different suits = rare
//
// 2. COLOR FLIGHT - Three dragons of the same suit
//    Example: Three Red dragons (Red 3, Red 5, Red 7)
//    Score: sum of card values
//    Why it's good: Shows suit dominance. Easy to build if you draft well.
//
// 3. FELLOWSHIP - Three Mortal cards
//    Example: The Thief, The Archmage, The Paladin
//    Score: sum of values + 15 bonus + ALL THREE EFFECTS TRIGGER
//    Why it's good: The effects can be devastating together!
//
// 4. NO FLIGHT - Mismatched garbage
//    Example: Red 3, Gold 7, The Thief
//    Score: highest single card value only
//    Why it's bad: You basically wasted two cards. Don't do this.
//
// =============================================================================

// =============================================================================
// SECTION 1: FLIGHT TYPE CONSTANTS
// =============================================================================
// Using an enum-like object so we can reference flight types consistently.
// It's like having alignment constants in D&D - LAWFUL_GOOD is always
// LAWFUL_GOOD, no matter which module you're running.

const FLIGHT_TYPES = {
  STRENGTH: 'strength',   // Same value, different suits (like three 5s)
  COLOR: 'color',         // Same suit (like three Red dragons)
  FELLOWSHIP: 'fellowship', // Three mortals working together
  NONE: 'none'            // You messed up
};

// =============================================================================
// SECTION 2: THE MAIN EVALUATOR
// =============================================================================

/**
 * EVALUATE FLIGHT
 * The big kahuna. This function looks at three cards and figures out
 * what kind of flight they form and how much it's worth.
 *
 * This is basically like a Show Judge at Westminster, but for dragons.
 * "And Best in Show goes to... the Color Flight of Gold Dragons!"
 *
 * HOW IT WORKS:
 * 1. First, check if it's a valid flight (need exactly 3 cards)
 * 2. Check for Fellowship (3 Mortals)
 * 3. Check for Strength Flight (3 same values)
 * 4. Check for Color Flight (3 same suits)
 * 5. If none of the above, it's a sad No Flight
 *
 * @param {Array} cards - Array of exactly 3 card objects
 * @returns {Object} - { type: FLIGHT_TYPE, score: number, description: string }
 */
function evaluateFlight(cards) {
  // ----- SANITY CHECK -----
  // Make sure we actually have three cards to evaluate.
  // Can't judge a flight with 2 dragons. That's just a couple.

  if (!cards || cards.length !== 3) {
    return {
      type: FLIGHT_TYPES.NONE,
      score: 0,
      description: "Invalid flight - need exactly 3 cards",
      details: null
    };
  }

  // ----- CALCULATE BASE VALUES -----
  // Get the effective value of each card (base value + any temp bonuses)
  // Temp bonuses come from card effects like Bahamut boosting metallics

  const cardValues = cards.map(card => {
    const baseValue = card.value || 0;
    const bonus = card.tempBonus || 0;
    return baseValue + bonus;
  });

  // ----- CHECK FOR FELLOWSHIP -----
  // A Fellowship is when you get three Mortals together.
  // Like an adventuring party! The Thief, The Wizard, and The Fighter
  // walk into a bar...

  const mortals = cards.filter(card => card.type === 'mortal');
  if (mortals.length === 3) {
    // IT'S A FELLOWSHIP!
    // Sum the values and add the fellowship bonus
    const sum = cardValues.reduce((total, val) => total + val, 0);
    const fellowshipBonus = 15;
    const score = sum + fellowshipBonus;

    return {
      type: FLIGHT_TYPES.FELLOWSHIP,
      score: score,
      description: `Fellowship! ${cards.map(c => c.name).join(' + ')} = ${sum} + ${fellowshipBonus} bonus = ${score}`,
      details: {
        cards: cards.map(c => c.name),
        baseSum: sum,
        bonus: fellowshipBonus
      }
    };
  }

  // ----- CHECK FOR STRENGTH FLIGHT -----
  // All three cards have the same value.
  // Like rolling triples in Yahtzee! But with dragons.
  //
  // Note: We compare the BASE values, not the bonus-adjusted ones.
  // The bonus affects scoring, not flight type determination.

  const baseValues = cards.map(card => card.value);
  const allSameValue = baseValues.every(val => val === baseValues[0]);

  // Also need to make sure they're not all the same suit
  // (that would be a Color Flight, not a Strength Flight)
  const suits = cards.map(card => card.suit).filter(suit => suit !== null);
  const allSameSuit = suits.length === 3 && suits.every(suit => suit === suits[0]);

  if (allSameValue && !allSameSuit && baseValues[0] !== null) {
    // STRENGTH FLIGHT!
    // Score = value × 3 + 10 bonus
    // The bonus rewards you for the difficulty of getting matching values

    const value = baseValues[0];
    const baseScore = value * 3;
    const strengthBonus = 10;
    const score = baseScore + strengthBonus;

    // But wait! If there are temp bonuses, we need to add those too
    const totalBonus = cards.reduce((sum, card) => sum + (card.tempBonus || 0), 0);
    const finalScore = score + totalBonus;

    return {
      type: FLIGHT_TYPES.STRENGTH,
      score: finalScore,
      description: `Strength Flight! Three ${value}s = (${value} × 3) + ${strengthBonus} bonus = ${score}` +
                   (totalBonus > 0 ? ` + ${totalBonus} from effects = ${finalScore}` : ''),
      details: {
        value: value,
        baseScore: baseScore,
        bonus: strengthBonus,
        effectBonus: totalBonus
      }
    };
  }

  // ----- CHECK FOR COLOR FLIGHT -----
  // All three cards are the same suit.
  // Like getting three Red dragons, or three Golds.
  //
  // Note: Legendaries and Mortals have null suits, so they can't be
  // part of a Color Flight unless something special is happening.

  if (allSameSuit && suits.length === 3) {
    // COLOR FLIGHT!
    // Score = sum of all card values (including bonuses)

    const score = cardValues.reduce((total, val) => total + val, 0);
    const suit = suits[0];

    return {
      type: FLIGHT_TYPES.COLOR,
      score: score,
      description: `Color Flight! ${suit} Dragon trio = ${cardValues.join(' + ')} = ${score}`,
      details: {
        suit: suit,
        values: cardValues
      }
    };
  }

  // ----- NO FLIGHT -----
  // You've got a mishmash of random cards that don't form any pattern.
  // This is like showing up to a job interview in a clown suit.
  // You technically dressed, but you're not winning.

  const highestValue = Math.max(...cardValues);
  const highestCard = cards.find(card =>
    (card.value + (card.tempBonus || 0)) === highestValue
  );

  return {
    type: FLIGHT_TYPES.NONE,
    score: highestValue,
    description: `No Flight - highest card: ${highestCard.name} (${highestValue})`,
    details: {
      highestCard: highestCard.name,
      highestValue: highestValue
    }
  };
}

// =============================================================================
// SECTION 3: FLIGHT COMPARISON
// =============================================================================

/**
 * COMPARE FLIGHTS
 * Given two evaluated flights, determine who wins.
 *
 * This is the climax of each gambit - the moment where we find out
 * if your carefully constructed flight of Gold dragons beats Gale's
 * sneaky Strength Flight of 5s.
 *
 * TIEBREAKER RULES:
 * 1. Higher score wins (duh)
 * 2. If tied, flight type matters:
 *    - Strength beats Color
 *    - Color beats Fellowship
 *    - Fellowship beats No Flight
 * 3. If STILL tied, it's... actually still a tie. We split the pot.
 *
 * @param {Object} flight1 - Evaluated flight from player 1
 * @param {Object} flight2 - Evaluated flight from player 2
 * @returns {Object} - { winner: 1|2|0, reason: string }
 */
function compareFlights(flight1, flight2) {
  // ----- COMPARE SCORES -----
  if (flight1.score > flight2.score) {
    return {
      winner: 1,
      reason: `${flight1.score} beats ${flight2.score}`,
      scoreDifference: flight1.score - flight2.score
    };
  }

  if (flight2.score > flight1.score) {
    return {
      winner: 2,
      reason: `${flight2.score} beats ${flight1.score}`,
      scoreDifference: flight2.score - flight1.score
    };
  }

  // ----- TIE! Use flight type as tiebreaker -----
  // This is like overtime in hockey, but nerdier

  const typeRanking = {
    [FLIGHT_TYPES.STRENGTH]: 4,    // Highest
    [FLIGHT_TYPES.COLOR]: 3,
    [FLIGHT_TYPES.FELLOWSHIP]: 2,
    [FLIGHT_TYPES.NONE]: 1         // Lowest
  };

  const rank1 = typeRanking[flight1.type];
  const rank2 = typeRanking[flight2.type];

  if (rank1 > rank2) {
    return {
      winner: 1,
      reason: `Tie at ${flight1.score}! ${flight1.type} flight beats ${flight2.type} flight`,
      scoreDifference: 0
    };
  }

  if (rank2 > rank1) {
    return {
      winner: 2,
      reason: `Tie at ${flight2.score}! ${flight2.type} flight beats ${flight1.type} flight`,
      scoreDifference: 0
    };
  }

  // ----- ACTUAL TIE -----
  // Both same score AND same type. Split the pot!
  return {
    winner: 0, // 0 means tie
    reason: `Perfect tie at ${flight1.score} with matching ${flight1.type} flights! Split the pot.`,
    scoreDifference: 0
  };
}

// =============================================================================
// SECTION 4: FLIGHT ANALYSIS HELPERS
// =============================================================================
// These functions help analyze partial flights (during building phase)
// to give hints about what you COULD build.

/**
 * ANALYZE HAND FOR POTENTIAL FLIGHTS
 * Looks at a hand of cards and identifies what flights could be built.
 *
 * This is like when Gale says "Let me see what we have to work with..."
 * We're scanning your options before you commit to a play.
 *
 * @param {Array} hand - Array of card objects (typically 6 cards)
 * @returns {Object} - Potential flights organized by type
 */
function analyzeHandForFlights(hand) {
  const analysis = {
    colorFlights: [],    // Potential same-suit flights
    strengthFlights: [], // Potential same-value flights
    fellowships: [],     // Potential mortal combos
    bestOptions: []      // Top recommendations
  };

  // ----- GROUP CARDS BY SUIT -----
  // Find all the suits represented and how many of each

  const bySuit = {};
  const byValue = {};
  const mortals = [];

  hand.forEach(card => {
    // Group by suit (for Color Flights)
    if (card.suit) {
      if (!bySuit[card.suit]) {
        bySuit[card.suit] = [];
      }
      bySuit[card.suit].push(card);
    }

    // Group by value (for Strength Flights)
    if (card.value) {
      if (!byValue[card.value]) {
        byValue[card.value] = [];
      }
      byValue[card.value].push(card);
    }

    // Collect mortals (for Fellowships)
    if (card.type === 'mortal') {
      mortals.push(card);
    }
  });

  // ----- FIND POTENTIAL COLOR FLIGHTS -----
  // Any suit with 3+ cards is a potential Color Flight

  Object.entries(bySuit).forEach(([suit, cards]) => {
    if (cards.length >= 3) {
      // Sort by value (highest first) for best scoring
      const sorted = [...cards].sort((a, b) => b.value - a.value);
      const best3 = sorted.slice(0, 3);
      const score = best3.reduce((sum, card) => sum + card.value, 0);

      analysis.colorFlights.push({
        suit: suit,
        cards: best3,
        score: score,
        description: `${suit} Color Flight: ${best3.map(c => c.value).join(', ')} = ${score}`
      });
    }
  });

  // ----- FIND POTENTIAL STRENGTH FLIGHTS -----
  // Any value with 3+ cards is a potential Strength Flight

  Object.entries(byValue).forEach(([value, cards]) => {
    if (cards.length >= 3) {
      // Pick first 3 cards (they're all the same value anyway)
      const best3 = cards.slice(0, 3);
      const numValue = parseInt(value);
      const score = numValue * 3 + 10;

      analysis.strengthFlights.push({
        value: numValue,
        cards: best3,
        score: score,
        description: `Strength Flight of ${value}s: ${score} points`
      });
    }
  });

  // ----- FIND POTENTIAL FELLOWSHIPS -----
  // Need at least 3 mortals

  if (mortals.length >= 3) {
    // Sort by value (highest first)
    const sorted = [...mortals].sort((a, b) => b.value - a.value);
    const best3 = sorted.slice(0, 3);
    const baseScore = best3.reduce((sum, card) => sum + card.value, 0);
    const score = baseScore + 15;

    analysis.fellowships.push({
      cards: best3,
      score: score,
      description: `Fellowship: ${best3.map(c => c.name).join(', ')} = ${score} + effects!`
    });
  }

  // ----- COMPILE BEST OPTIONS -----
  // Gather all potential flights and sort by score

  const allOptions = [
    ...analysis.colorFlights,
    ...analysis.strengthFlights,
    ...analysis.fellowships
  ];

  allOptions.sort((a, b) => b.score - a.score);
  analysis.bestOptions = allOptions;

  return analysis;
}

/**
 * CHECK PARTIAL FLIGHT
 * Given 1-2 cards already played, determine what could complete the flight.
 *
 * This helps during the flight-building phase when you're trying to decide
 * what to play next. Like a chess assistant showing possible moves.
 *
 * @param {Array} currentFlight - Cards already played (1-2 cards)
 * @param {Array} hand - Cards still in hand
 * @returns {Object} - Possible completions and their scores
 */
function checkPartialFlight(currentFlight, hand) {
  if (currentFlight.length === 0) {
    // No cards played yet - just analyze the hand
    return analyzeHandForFlights(hand);
  }

  const possibilities = {
    canCompleteColor: false,
    canCompleteStrength: false,
    canCompleteFellowship: false,
    recommendations: []
  };

  // ----- ONE CARD PLAYED -----
  if (currentFlight.length === 1) {
    const firstCard = currentFlight[0];

    // Check for color flight potential
    if (firstCard.suit) {
      const sameSuit = hand.filter(c => c.suit === firstCard.suit);
      if (sameSuit.length >= 2) {
        possibilities.canCompleteColor = true;
        possibilities.colorOptions = sameSuit;
      }
    }

    // Check for strength flight potential
    const sameValue = hand.filter(c => c.value === firstCard.value);
    if (sameValue.length >= 2) {
      possibilities.canCompleteStrength = true;
      possibilities.strengthOptions = sameValue;
    }

    // Check for fellowship potential
    if (firstCard.type === 'mortal') {
      const mortals = hand.filter(c => c.type === 'mortal');
      if (mortals.length >= 2) {
        possibilities.canCompleteFellowship = true;
        possibilities.fellowshipOptions = mortals;
      }
    }
  }

  // ----- TWO CARDS PLAYED -----
  if (currentFlight.length === 2) {
    const [card1, card2] = currentFlight;

    // Check for color flight (need one more of same suit)
    if (card1.suit && card1.suit === card2.suit) {
      const matches = hand.filter(c => c.suit === card1.suit);
      if (matches.length >= 1) {
        possibilities.canCompleteColor = true;
        possibilities.colorOptions = matches;

        // Calculate potential scores
        matches.forEach(card => {
          const score = card1.value + card2.value + card.value;
          possibilities.recommendations.push({
            card: card,
            flightType: 'color',
            score: score,
            description: `Play ${card.name} (${card.value}) for Color Flight = ${score}`
          });
        });
      }
    }

    // Check for strength flight (need one more of same value)
    if (card1.value === card2.value) {
      const matches = hand.filter(c => c.value === card1.value);
      if (matches.length >= 1) {
        possibilities.canCompleteStrength = true;
        possibilities.strengthOptions = matches;

        matches.forEach(card => {
          const score = card1.value * 3 + 10;
          possibilities.recommendations.push({
            card: card,
            flightType: 'strength',
            score: score,
            description: `Play ${card.name} for Strength Flight = ${score}`
          });
        });
      }
    }

    // Check for fellowship (need one more mortal)
    if (card1.type === 'mortal' && card2.type === 'mortal') {
      const matches = hand.filter(c => c.type === 'mortal');
      if (matches.length >= 1) {
        possibilities.canCompleteFellowship = true;
        possibilities.fellowshipOptions = matches;

        matches.forEach(card => {
          const score = card1.value + card2.value + card.value + 15;
          possibilities.recommendations.push({
            card: card,
            flightType: 'fellowship',
            score: score,
            description: `Play ${card.name} for Fellowship = ${score} + effects!`
          });
        });
      }
    }

    // Sort recommendations by score
    possibilities.recommendations.sort((a, b) => b.score - a.score);
  }

  return possibilities;
}

/**
 * GET FLIGHT DESCRIPTION
 * Returns a nice human-readable description of a flight type.
 * Good for UI display and Gale's commentary.
 *
 * @param {string} flightType - One of FLIGHT_TYPES
 * @returns {string} - Human-friendly description
 */
function getFlightDescription(flightType) {
  const descriptions = {
    [FLIGHT_TYPES.STRENGTH]: "A Strength Flight! All cards share the same power level.",
    [FLIGHT_TYPES.COLOR]: "A Color Flight! All cards share the same dragon type.",
    [FLIGHT_TYPES.FELLOWSHIP]: "A Fellowship! Three mortals united in purpose.",
    [FLIGHT_TYPES.NONE]: "No complete flight. Only the highest card counts."
  };

  return descriptions[flightType] || "Unknown flight type";
}

/**
 * CALCULATE RAW CARD POWER
 * Determines the total potential of a set of cards, useful for
 * quick AI decisions and hand evaluation.
 *
 * @param {Array} cards - Array of cards
 * @returns {number} - Total raw power value
 */
function calculateRawPower(cards) {
  return cards.reduce((total, card) => {
    const base = card.value || 0;
    const bonus = card.tempBonus || 0;
    return total + base + bonus;
  }, 0);
}

// =============================================================================
// SECTION 5: SPECIAL CARD INTERACTIONS
// =============================================================================

/**
 * CHECK FOR SPECIAL COMBINATIONS
 * Some card combos have special significance in lore or gameplay.
 * We track these for Gale's commentary and easter eggs.
 *
 * @param {Array} cards - The flight cards
 * @returns {Array} - Array of special combination names triggered
 */
function checkSpecialCombinations(cards) {
  const specials = [];

  // Get card IDs for easy checking
  const cardIds = cards.map(c => c.id);
  const cardNames = cards.map(c => c.name);

  // ----- BAHAMUT VS TIAMAT -----
  // The eternal struggle between good and evil dragons
  if (cardIds.includes('bahamut') && cardIds.includes('tiamat')) {
    specials.push({
      name: 'Eternal Struggle',
      description: 'Bahamut and Tiamat clash! The cosmos trembles!'
    });
  }

  // ----- THREE GOLD DRAGONS -----
  // Maximum metallic goodness
  if (cards.every(c => c.suit === 'Gold')) {
    specials.push({
      name: 'Gilded Flight',
      description: 'Three Gold Dragons! The purest of metallics unite!'
    });
  }

  // ----- THREE RED DRAGONS -----
  // Classic fire and fury
  if (cards.every(c => c.suit === 'Red')) {
    specials.push({
      name: 'Inferno',
      description: 'Three Red Dragons! Fire and fury incarnate!'
    });
  }

  // ----- ARCHMAGE + WIZARD -----
  // Magic users unite
  if (cardIds.includes('the_archmage') && cardIds.includes('the_wizard')) {
    specials.push({
      name: 'Magical Academia',
      description: 'The Archmage and Wizard compare spell notes.'
    });
  }

  // ----- ALL EVIL ALIGNMENT -----
  if (cards.every(c => c.alignment === 'evil')) {
    specials.push({
      name: 'Darkness Rises',
      description: 'An entirely evil flight! Tiamat would be proud.'
    });
  }

  // ----- ALL GOOD ALIGNMENT -----
  if (cards.every(c => c.alignment === 'good')) {
    specials.push({
      name: 'Champions of Light',
      description: 'An entirely good flight! Bahamut smiles upon you.'
    });
  }

  // ----- THIEF + ASSASSIN -----
  // Rogue's gallery
  if (cardIds.includes('the_thief') && cardIds.includes('the_assassin')) {
    specials.push({
      name: 'Rogue\'s Gallery',
      description: 'The Thief and Assassin make a dangerous duo.'
    });
  }

  // ----- ALL 7S (MAX REGULAR) -----
  // Triple 7s! Jackpot!
  if (cards.every(c => c.value === 7 && c.type === 'dragon')) {
    specials.push({
      name: 'Jackpot!',
      description: 'Triple 7s! The dragons align in your favor!'
    });
  }

  // ----- ALL 1S (MIN) -----
  // The sad flight
  if (cards.every(c => c.value === 1)) {
    specials.push({
      name: 'The Struggle is Real',
      description: 'Three 1s. Well... you tried.'
    });
  }

  return specials;
}

// =============================================================================
// EXPORTS
// =============================================================================
// Making all our flight evaluation functions available to other files.

if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    FLIGHT_TYPES,
    evaluateFlight,
    compareFlights,
    analyzeHandForFlights,
    checkPartialFlight,
    getFlightDescription,
    calculateRawPower,
    checkSpecialCombinations
  };
} else {
  // Browser environment - attach to window
  window.TDA_FLIGHTS = {
    FLIGHT_TYPES,
    evaluateFlight,
    compareFlights,
    analyzeHandForFlights,
    checkPartialFlight,
    getFlightDescription,
    calculateRawPower,
    checkSpecialCombinations
  };
}

// =============================================================================
// END OF FLIGHTS.JS
// =============================================================================
//
// Now you can evaluate any three cards and know exactly what kind of
// flight they form and how much it's worth.
//
// "I think it's best I keep a cool head going into this. Approach it like
// a particularly high-risk round of Three-Dragon Ante."
//
// — Gale Dekarios, probably after reading this code
// =============================================================================
