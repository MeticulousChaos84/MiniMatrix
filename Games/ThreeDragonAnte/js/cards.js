// =============================================================================
// CARDS.JS - THE DRAGON HOARD OF DATA
// =============================================================================
//
// Welcome to the treasure vault! This file contains every single card in the
// Three Dragon Ante deck - all 100 of them. Think of this as your Monster Manual,
// but for cards instead of creatures.
//
// In D&D terms, this file has a CR (Complexity Rating) of about 2. It's mostly
// just data definitions - like reading stat blocks. The real combat happens in
// flights.js where we figure out who wins.
//
// THE DECK BREAKDOWN:
// - 70 Dragon Suit Cards (10 suits × 7 cards each)
// - 15 Legendary Dragons (the big bads and big goods)
// - 15 Mortal Cards (those pesky non-dragons with special abilities)
//
// Chromatic Dragons (the evil ones - Tiamat's crew):
//   Black, Blue, Green, Red, White
//
// Metallic Dragons (the good ones - Bahamut's besties):
//   Brass, Bronze, Copper, Gold, Silver
//
// =============================================================================

// =============================================================================
// SECTION 1: THE DRAGON SUITS
// =============================================================================
// Think of these like the four suits in a regular deck (hearts, diamonds, etc.)
// except there are TEN suits because dragons are extra like that.
//
// Each suit has 7 cards valued 1-7. Higher number = stronger dragon = more
// points when building your flight.

const DRAGON_SUITS = {
  // ----- THE CHROMATIC DRAGONS (Evil Team) -----
  // These are Tiamat's children. They're mean, they're scary, and they
  // absolutely will eat your livestock and/or villagers.

  chromatic: {
    BLACK: {
      name: 'Black',
      alignment: 'evil',
      flavor: 'Acid-spitting swamp dwellers who collect the bones of their victims',
      color: '#2d2d2d' // for UI purposes
    },
    BLUE: {
      name: 'Blue',
      alignment: 'evil',
      flavor: 'Desert tyrants who love lightning and long monologues about their greatness',
      color: '#1e3a5f'
    },
    GREEN: {
      name: 'Green',
      alignment: 'evil',
      flavor: 'Forest schemers who will absolutely lie to your face while smiling',
      color: '#2d5a27'
    },
    RED: {
      name: 'Red',
      alignment: 'evil',
      flavor: 'The classic. Fire, fury, and an ego the size of their treasure hoard',
      color: '#8b0000'
    },
    WHITE: {
      name: 'White',
      alignment: 'evil',
      flavor: 'Bestial ice dragons. Not the smartest, but very enthusiastic about murder',
      color: '#e8e8e8'
    }
  },

  // ----- THE METALLIC DRAGONS (Good Team) -----
  // These are Bahamut's buddies. They're wise, they're noble, and they
  // might actually help you instead of eating you. Revolutionary concept.

  metallic: {
    BRASS: {
      name: 'Brass',
      alignment: 'good',
      flavor: 'The chatty ones. Will talk your ear off about EVERYTHING. Imagine a dragon that never shuts up.',
      color: '#b5a642'
    },
    BRONZE: {
      name: 'Bronze',
      alignment: 'good',
      flavor: 'Sea-loving warriors who enjoy a good naval battle',
      color: '#cd7f32'
    },
    COPPER: {
      name: 'Copper',
      alignment: 'good',
      flavor: 'Pranksters and riddlers. The bards of the dragon world',
      color: '#b87333'
    },
    GOLD: {
      name: 'Gold',
      alignment: 'good',
      flavor: 'The paragons of dragonkind. Wise, just, and absolutely majestic',
      color: '#ffd700'
    },
    SILVER: {
      name: 'Silver',
      alignment: 'good',
      flavor: 'Love humans so much they often take humanoid form to hang out',
      color: '#c0c0c0'
    }
  }
};

// =============================================================================
// SECTION 2: GENERATE THE 70 DRAGON CARDS
// =============================================================================
// This function creates all the basic dragon cards - 7 for each of the 10 suits.
// It's like a factory, but instead of making widgets, we're making dragons.
// Much cooler.

function generateDragonCards() {
  const dragons = [];

  // Combine all suits into one array for iteration
  // (This is like when the party decides to work together despite alignment differences)
  const allSuits = [
    ...Object.values(DRAGON_SUITS.chromatic),
    ...Object.values(DRAGON_SUITS.metallic)
  ];

  // For each suit, create 7 dragons (values 1-7)
  allSuits.forEach(suit => {
    for (let value = 1; value <= 7; value++) {
      dragons.push({
        // Unique ID for this card - like a social security number but for dragons
        id: `${suit.name.toLowerCase()}_dragon_${value}`,

        // Display name - what you'd see on the card
        name: `${suit.name} Dragon`,

        // Which color family this dragon belongs to
        suit: suit.name,

        // What category of card this is
        type: 'dragon',

        // How strong this dragon is (1 = baby dragon, 7 = ancient wyrm)
        value: value,

        // Is this dragon on Team Good or Team Evil?
        alignment: suit.alignment,

        // No special abilities for basic dragons - they just sit there and look pretty
        effect: null,

        // Fun flavor text (we're using the suit's flavor for now)
        flavor: suit.flavor,

        // UI color for rendering
        color: suit.color,

        // For future custom graphics
        imagePath: `assets/cards/${suit.name.toLowerCase()}_${value}.png`
      });
    }
  });

  return dragons;
}

// =============================================================================
// SECTION 3: THE LEGENDARY DRAGONS
// =============================================================================
// These are the big names. The celebrities. The dragons that other dragons
// talk about in hushed, reverent tones.
//
// Each legendary has a special ability that triggers when you play them.
// Think of these as your ace cards - powerful but limited.

const LEGENDARY_DRAGONS = [
  // ----- BAHAMUT - THE PLATINUM DRAGON -----
  // King of the metallic dragons, god of justice and nobility.
  // In BG3 terms, this is like if Tyr was a dragon. And also on your team.
  {
    id: 'bahamut',
    name: 'Bahamut',
    suit: null, // Legendaries transcend mere suits
    type: 'legendary',
    value: 13, // Maximum power! It's like rolling a natural 20.
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'All your Metallic dragons in this flight get +1 value',
      // The actual effect function - we'll implement this in game.js
      execute: (gameState, player) => {
        // Find all metallic dragons in the player's current flight
        const metallicSuits = ['Brass', 'Bronze', 'Copper', 'Gold', 'Silver'];
        let boosted = 0;

        player.flight.forEach(card => {
          if (metallicSuits.includes(card.suit)) {
            card.tempBonus = (card.tempBonus || 0) + 1;
            boosted++;
          }
        });

        return boosted > 0
          ? `Bahamut's presence inspires ${boosted} metallic dragon(s)! (+1 each)`
          : "Bahamut surveys the field, finding no metallic kin to inspire.";
      }
    },
    flavor: "The Platinum Dragon. Justice incarnate. Probably disappointed in your life choices, but too polite to say so.",
    color: '#E5E4E2',
    imagePath: 'assets/cards/bahamut.png'
  },

  // ----- TIAMAT - THE DRAGON QUEEN -----
  // Five-headed goddess of chromatic dragons, greed, and being everyone's
  // BBEG (Big Bad Evil Gal). She's imprisoned in Avernus but her influence
  // is everywhere.
  {
    id: 'tiamat',
    name: 'Tiamat',
    suit: null,
    type: 'legendary',
    value: 13,
    alignment: 'evil',
    effect: {
      trigger: 'on_play',
      description: 'All your Chromatic dragons in this flight get +1 value',
      execute: (gameState, player) => {
        const chromaticSuits = ['Black', 'Blue', 'Green', 'Red', 'White'];
        let boosted = 0;

        player.flight.forEach(card => {
          if (chromaticSuits.includes(card.suit)) {
            card.tempBonus = (card.tempBonus || 0) + 1;
            boosted++;
          }
        });

        return boosted > 0
          ? `Tiamat's five heads roar! ${boosted} chromatic dragon(s) gain power! (+1 each)`
          : "Tiamat hisses in displeasure - no chromatic dragons to empower.";
      }
    },
    flavor: "Five heads, five breath weapons, five times the attitude. Currently plotting her escape from Avernus.",
    color: '#4a0080',
    imagePath: 'assets/cards/tiamat.png'
  },

  // ----- DRACOLICH -----
  // An undead dragon. Because regular dragons weren't scary enough.
  {
    id: 'dracolich',
    name: 'Dracolich',
    suit: null,
    type: 'legendary',
    value: 10,
    alignment: 'evil',
    effect: {
      trigger: 'on_play',
      description: 'Return one card from discard pile to your hand',
      execute: (gameState, player) => {
        // This will need access to the discard pile - implemented in game.js
        return "The Dracolich reaches into the grave...";
      }
    },
    flavor: "Death is merely an inconvenience when you're this fabulous.",
    color: '#1a1a2e',
    imagePath: 'assets/cards/dracolich.png'
  },

  // ----- ANCIENT DEEP DRAGON -----
  // From the Underdark. Masters of shadows and mind games.
  {
    id: 'ancient_deep_dragon',
    name: 'Ancient Deep Dragon',
    suit: null,
    type: 'legendary',
    value: 9,
    alignment: 'evil',
    effect: {
      trigger: 'on_play',
      description: 'Peek at opponent\'s hand and choose one card they must discard',
      execute: (gameState, player) => {
        return "The Deep Dragon's psychic gaze pierces all secrets...";
      }
    },
    flavor: "Lives in the Underdark. Probably friends with mind flayers. Definitely not trustworthy.",
    color: '#2c003e',
    imagePath: 'assets/cards/deep_dragon.png'
  },

  // ----- ANCIENT MOONSTONE DRAGON -----
  // Fey-touched dragons that can walk between planes
  {
    id: 'ancient_moonstone_dragon',
    name: 'Ancient Moonstone Dragon',
    suit: null,
    type: 'legendary',
    value: 9,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'Draw 2 cards, then discard 1',
      execute: (gameState, player) => {
        return "The Moonstone Dragon opens a rift to the Feywild...";
      }
    },
    flavor: "Dreams made manifest. Beautiful, ethereal, and slightly unsettling.",
    color: '#f5f5f5',
    imagePath: 'assets/cards/moonstone_dragon.png'
  },

  // ----- ANCIENT SHADOW DRAGON -----
  // Corrupted by the Shadowfell
  {
    id: 'ancient_shadow_dragon',
    name: 'Ancient Shadow Dragon',
    suit: null,
    type: 'legendary',
    value: 8,
    alignment: 'evil',
    effect: {
      trigger: 'on_play',
      description: 'Opponent\'s highest card in flight loses 2 value',
      execute: (gameState, player, opponent) => {
        if (opponent.flight.length === 0) {
          return "The Shadow Dragon finds no prey to diminish...";
        }

        // Find opponent's highest value card
        let highest = opponent.flight.reduce((max, card) =>
          (card.value + (card.tempBonus || 0)) > (max.value + (max.tempBonus || 0)) ? card : max
        );

        highest.tempBonus = (highest.tempBonus || 0) - 2;
        return `The Shadow Dragon dims ${highest.name}'s power! (-2 value)`;
      }
    },
    flavor: "Where there is light, shadows follow. This one just follows more aggressively.",
    color: '#0d0d0d',
    imagePath: 'assets/cards/shadow_dragon.png'
  },

  // ----- ANCIENT CRYSTAL DRAGON -----
  // Gem dragons are neutral - above petty good/evil squabbles
  {
    id: 'ancient_crystal_dragon',
    name: 'Ancient Crystal Dragon',
    suit: null,
    type: 'legendary',
    value: 8,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'This card counts as any suit you choose',
      execute: (gameState, player) => {
        return "The Crystal Dragon refracts into any color you desire!";
      }
    },
    flavor: "Sparkly and unpredictable. The magpies of the dragon world.",
    color: '#ff69b4',
    imagePath: 'assets/cards/crystal_dragon.png'
  },

  // ----- ANCIENT AMETHYST DRAGON -----
  // Psionics and mind powers
  {
    id: 'ancient_amethyst_dragon',
    name: 'Ancient Amethyst Dragon',
    suit: null,
    type: 'legendary',
    value: 8,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'See opponent\'s next play before you choose yours',
      execute: (gameState, player) => {
        return "The Amethyst Dragon gazes into the future...";
      }
    },
    flavor: "The color of Glitch's belly button gem! Probably why she's so psychic.",
    color: '#9966cc',
    imagePath: 'assets/cards/amethyst_dragon.png'
  },

  // ----- ANCIENT TOPAZ DRAGON -----
  // Solitary beach-dwellers
  {
    id: 'ancient_topaz_dragon',
    name: 'Ancient Topaz Dragon',
    suit: null,
    type: 'legendary',
    value: 7,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Immune to opponent effects this flight',
      execute: (gameState, player) => {
        player.effectImmunity = true;
        return "The Topaz Dragon raises an impenetrable ward!";
      }
    },
    flavor: "Loves desolate coastlines and being left alone. The introvert dragon.",
    color: '#ffc87c',
    imagePath: 'assets/cards/topaz_dragon.png'
  },

  // ----- ANCIENT EMERALD DRAGON -----
  // Knowledge-seekers and historians
  {
    id: 'ancient_emerald_dragon',
    name: 'Ancient Emerald Dragon',
    suit: null,
    type: 'legendary',
    value: 7,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Look at top 5 cards of deck, rearrange them',
      execute: (gameState, player) => {
        return "The Emerald Dragon consults the annals of history...";
      }
    },
    flavor: "Knows everything about everything. Still won't tell you where the Tomb of Horrors is.",
    color: '#50c878',
    imagePath: 'assets/cards/emerald_dragon.png'
  },

  // ----- ANCIENT SAPPHIRE DRAGON -----
  // Militaristic and organized
  {
    id: 'ancient_sapphire_dragon',
    name: 'Ancient Sapphire Dragon',
    suit: null,
    type: 'legendary',
    value: 7,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Rearrange your flight cards in any order',
      execute: (gameState, player) => {
        return "The Sapphire Dragon reorganizes the battle formation!";
      }
    },
    flavor: "Runs their lair like a military base. Definitely has a chore chart.",
    color: '#0f52ba',
    imagePath: 'assets/cards/sapphire_dragon.png'
  },

  // ----- ANCIENT SEA SERPENT -----
  // Technically not a dragon but close enough
  {
    id: 'ancient_sea_serpent',
    name: 'Ancient Sea Serpent',
    suit: null,
    type: 'legendary',
    value: 6,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Can be played at any time, even out of turn',
      execute: (gameState, player) => {
        return "The Sea Serpent surges from the depths!";
      }
    },
    flavor: "Not technically a dragon but don't tell HIM that.",
    color: '#006994',
    imagePath: 'assets/cards/sea_serpent.png'
  },

  // ----- GREATWYRM -----
  // Dragons that have reached the absolute peak of power
  {
    id: 'greatwyrm',
    name: 'Greatwyrm',
    suit: null,
    type: 'legendary',
    value: 11,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Your other cards in this flight each gain +1 value',
      execute: (gameState, player) => {
        let boosted = 0;
        player.flight.forEach(card => {
          if (card.id !== 'greatwyrm') {
            card.tempBonus = (card.tempBonus || 0) + 1;
            boosted++;
          }
        });

        return boosted > 0
          ? `The Greatwyrm's presence empowers ${boosted} allies! (+1 each)`
          : "The Greatwyrm stands alone, majestic and unopposed.";
      }
    },
    flavor: "When a dragon lives long enough, it transcends mere 'ancient' status. This is that.",
    color: '#daa520',
    imagePath: 'assets/cards/greatwyrm.png'
  },

  // ----- DRAGONNEL -----
  // The loyal steeds of dragon riders
  {
    id: 'dragonnel',
    name: 'Dragonnel',
    suit: null,
    type: 'legendary',
    value: 5,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'If you have a Mortal card in your flight, both gain +2 value',
      execute: (gameState, player) => {
        let mortalFound = player.flight.find(card => card.type === 'mortal');
        if (mortalFound) {
          mortalFound.tempBonus = (mortalFound.tempBonus || 0) + 2;
          return `The Dragonnel bonds with ${mortalFound.name}! Both gain +2!`;
        }
        return "The Dragonnel searches for a rider but finds none...";
      }
    },
    flavor: "Good boy! Yes you are! Who's a good dragon-adjacent creature?",
    color: '#8fbc8f',
    imagePath: 'assets/cards/dragonnel.png'
  },

  // ----- WYRMLING TRIO -----
  // Baby dragons! Adorable but still dangerous
  {
    id: 'wyrmling_trio',
    name: 'Wyrmling Trio',
    suit: null,
    type: 'legendary',
    value: 4,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Draw 3 cards, keep 1, discard 2',
      execute: (gameState, player) => {
        return "Three wyrmlings tumble onto the field, eager to prove themselves!";
      }
    },
    flavor: "Three baby dragons in a trenchcoat. Absolutely counts as one card.",
    color: '#ffb6c1',
    imagePath: 'assets/cards/wyrmling_trio.png'
  }
];

// =============================================================================
// SECTION 4: THE MORTAL CARDS
// =============================================================================
// Not everything in a dragon game is a dragon! These are the mortals -
// adventurers, wizards, thieves, and other folk who dare to meddle in
// draconic affairs.
//
// Each Mortal has a special ability that triggers when played.
// Get three Mortals together and you have a "Fellowship" - a special
// flight type that triggers ALL their abilities. It's like an Avengers
// team-up but with more dice rolls.

const MORTAL_CARDS = [
  // ----- THE ARCHMAGE -----
  // A powerful wizard. You know the type - beard, staff, probably named
  // something like "Elminster" or "Gale" (hey, that's our guy!)
  {
    id: 'the_archmage',
    name: 'The Archmage',
    suit: null,
    type: 'mortal',
    value: 8,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Look at top 3 cards of deck, put one in your hand',
      execute: (gameState, player) => {
        return "The Archmage peers into the Weave, seeking knowledge...";
      }
    },
    flavor: "Probably has a problematic orb situation. Not that we'd know anyone like that.",
    color: '#4169e1',
    imagePath: 'assets/cards/archmage.png'
  },

  // ----- THE THIEF -----
  // Rogues gonna rogue
  {
    id: 'the_thief',
    name: 'The Thief',
    suit: null,
    type: 'mortal',
    value: 4,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Steal 2 gold from opponent\'s stakes',
      execute: (gameState, player, opponent) => {
        const stolen = Math.min(2, opponent.stakes);
        opponent.stakes -= stolen;
        player.stakes += stolen;
        return stolen > 0
          ? `The Thief pilfers ${stolen} gold! "What? Finders keepers."`
          : "The Thief finds empty pockets. How embarrassing.";
      }
    },
    flavor: "Sleight of hand, sleight of morals. It's not stealing if they don't catch you!",
    color: '#2f4f4f',
    imagePath: 'assets/cards/thief.png'
  },

  // ----- THE DRAGONSLAYER -----
  // The mortals dragons actually fear
  {
    id: 'the_dragonslayer',
    name: 'The Dragonslayer',
    suit: null,
    type: 'mortal',
    value: 6,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'Opponent\'s highest dragon in flight loses 3 value',
      execute: (gameState, player, opponent) => {
        // Find opponent's highest dragon
        const dragons = opponent.flight.filter(card => card.type === 'dragon');
        if (dragons.length === 0) {
          return "The Dragonslayer finds no dragons to slay!";
        }

        let highest = dragons.reduce((max, card) =>
          (card.value + (card.tempBonus || 0)) > (max.value + (max.tempBonus || 0)) ? card : max
        );

        highest.tempBonus = (highest.tempBonus || 0) - 3;
        return `The Dragonslayer strikes ${highest.name}! (-3 value)`;
      }
    },
    flavor: "Has killed exactly one (1) dragon but won't shut up about it at parties.",
    color: '#8b4513',
    imagePath: 'assets/cards/dragonslayer.png'
  },

  // ----- THE PRIEST -----
  // Divine magic to counter all that arcane nonsense
  {
    id: 'the_priest',
    name: 'The Priest',
    suit: null,
    type: 'mortal',
    value: 5,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'Add 3 gold to the pot from nowhere (divine intervention)',
      execute: (gameState, player) => {
        gameState.pot += 3;
        return "The Priest prays and gold appears! \"The tithe provides.\"";
      }
    },
    flavor: "Their god always seems to need money for some reason.",
    color: '#f0e68c',
    imagePath: 'assets/cards/priest.png'
  },

  // ----- THE FOOL -----
  // Never underestimate the power of chaos
  {
    id: 'the_fool',
    name: 'The Fool',
    suit: null,
    type: 'mortal',
    value: 1, // Lowest value...
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Swap this card\'s value with any card in play',
      execute: (gameState, player) => {
        return "The Fool capers about, causing chaos! Choose a card to swap values with.";
      }
    },
    flavor: "Value of 1, but potentially the most powerful card in the deck. Wild card, bitches!",
    color: '#ff6347',
    imagePath: 'assets/cards/fool.png'
  },

  // ----- THE PRINCESS -----
  // Royalty has its privileges
  {
    id: 'the_princess',
    name: 'The Princess',
    suit: null,
    type: 'mortal',
    value: 7,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'Your good-aligned cards get +1 value this flight',
      execute: (gameState, player) => {
        let boosted = 0;
        player.flight.forEach(card => {
          if (card.alignment === 'good') {
            card.tempBonus = (card.tempBonus || 0) + 1;
            boosted++;
          }
        });

        return boosted > 0
          ? `The Princess rallies her noble allies! ${boosted} card(s) empowered!`
          : "The Princess finds no noble hearts to inspire...";
      }
    },
    flavor: "In this kingdom, princesses rescue themselves (and also get combat bonuses).",
    color: '#ffb7c5',
    imagePath: 'assets/cards/princess.png'
  },

  // ----- THE ASSASSIN -----
  // Sneaky and deadly
  {
    id: 'the_assassin',
    name: 'The Assassin',
    suit: null,
    type: 'mortal',
    value: 5,
    alignment: 'evil',
    effect: {
      trigger: 'on_play',
      description: 'If played last in your flight, eliminate opponent\'s weakest card',
      execute: (gameState, player, opponent) => {
        // Check if this is the last card in player's flight
        if (player.flight.length === 3) {
          if (opponent.flight.length > 0) {
            let weakest = opponent.flight.reduce((min, card) =>
              (card.value + (card.tempBonus || 0)) < (min.value + (min.tempBonus || 0)) ? card : min
            );
            weakest.eliminated = true;
            return `The Assassin strikes from the shadows! ${weakest.name} is eliminated!`;
          }
        }
        return "The Assassin waits in the shadows... (effect triggers if played last)";
      }
    },
    flavor: "They always work alone. Except in Fellowships. Then they work with two other people who also work alone.",
    color: '#1c1c1c',
    imagePath: 'assets/cards/assassin.png'
  },

  // ----- THE CAPTAIN -----
  // Leadership provides bonuses
  {
    id: 'the_captain',
    name: 'The Captain',
    suit: null,
    type: 'mortal',
    value: 6,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'All your cards played after this get +1 value',
      execute: (gameState, player) => {
        player.captainBonus = true;
        return "The Captain takes command! \"Formation, everyone!\"";
      }
    },
    flavor: "Gives inspiring speeches. Gets the party organized. Probably has a clipboard.",
    color: '#191970',
    imagePath: 'assets/cards/captain.png'
  },

  // ----- THE SORCERER -----
  // Wild magic goes brrr
  {
    id: 'the_sorcerer',
    name: 'The Sorcerer',
    suit: null,
    type: 'mortal',
    value: 5,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Roll a d6: 1-2 lose 2 value, 3-4 no change, 5-6 gain 3 value',
      execute: (gameState, player) => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const card = player.flight.find(c => c.id === 'the_sorcerer');

        if (roll <= 2) {
          card.tempBonus = (card.tempBonus || 0) - 2;
          return `The Sorcerer's magic surges! (Rolled ${roll}) Wild magic backfires! -2 value`;
        } else if (roll <= 4) {
          return `The Sorcerer's magic stabilizes. (Rolled ${roll}) Nothing happens... this time.`;
        } else {
          card.tempBonus = (card.tempBonus || 0) + 3;
          return `The Sorcerer's magic explodes! (Rolled ${roll}) +3 value!`;
        }
      }
    },
    flavor: "Magic is in their blood. Unfortunately, so is chaos. And occasional accidental fireballs.",
    color: '#9932cc',
    imagePath: 'assets/cards/sorcerer.png'
  },

  // ----- THE WARLOCK -----
  // Pact magic with patron bonuses
  {
    id: 'the_warlock',
    name: 'The Warlock',
    suit: null,
    type: 'mortal',
    value: 5,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'If you have an evil dragon in flight, steal 3 gold from pot',
      execute: (gameState, player) => {
        const hasEvilDragon = player.flight.some(card =>
          card.type === 'dragon' && card.alignment === 'evil'
        );

        if (hasEvilDragon) {
          const stolen = Math.min(3, gameState.pot);
          gameState.pot -= stolen;
          player.stakes += stolen;
          return `The Warlock's patron provides! ${stolen} gold taken from pot!`;
        }
        return "The Warlock's patron is displeased - no evil dragons to empower the pact.";
      }
    },
    flavor: "Has daddy issues with their patron. It's complicated.",
    color: '#800080',
    imagePath: 'assets/cards/warlock.png'
  },

  // ----- THE RANGER -----
  // Favored enemy: DRAGONS
  {
    id: 'the_ranger',
    name: 'The Ranger',
    suit: null,
    type: 'mortal',
    value: 5,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'Look at opponent\'s hand, reveal one dragon type in it',
      execute: (gameState, player, opponent) => {
        const dragons = opponent.hand.filter(card => card.type === 'dragon');
        if (dragons.length > 0) {
          const revealed = dragons[0];
          return `The Ranger tracks the prey: "${revealed.suit} Dragons lurk in their hand..."`;
        }
        return "The Ranger finds no dragon trails in the opponent's hand.";
      }
    },
    flavor: "Has dragons as a favored enemy. Talks to their animal companion about it constantly.",
    color: '#228b22',
    imagePath: 'assets/cards/ranger.png'
  },

  // ----- THE BARD -----
  // *strums lute aggressively*
  {
    id: 'the_bard',
    name: 'The Bard',
    suit: null,
    type: 'mortal',
    value: 4,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Choose: Give your other cards +1 OR opponent\'s cards -1',
      execute: (gameState, player) => {
        return "The Bard strikes a chord! Choose to inspire allies or mock enemies!";
      }
    },
    flavor: "Will try to seduce the dragon. You know they will. Don't even pretend otherwise.",
    color: '#daa520',
    imagePath: 'assets/cards/bard.png'
  },

  // ----- THE PALADIN -----
  // Smiting enthusiast
  {
    id: 'the_paladin',
    name: 'The Paladin',
    suit: null,
    type: 'mortal',
    value: 6,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'If opponent has any evil cards in flight, gain +3 value',
      execute: (gameState, player, opponent) => {
        const hasEvil = opponent.flight.some(card => card.alignment === 'evil');

        if (hasEvil) {
          const paladin = player.flight.find(c => c.id === 'the_paladin');
          paladin.tempBonus = (paladin.tempBonus || 0) + 3;
          return "The Paladin senses evil! \"By Tyr's hammer!\" (+3 value!)";
        }
        return "The Paladin finds no evil to smite. They seem almost disappointed.";
      }
    },
    flavor: "Has detect evil. Uses it on EVERYTHING. Yes, including the innkeeper.",
    color: '#ffd700',
    imagePath: 'assets/cards/paladin.png'
  },

  // ----- THE MONK -----
  // Punching dragons with ki power
  {
    id: 'the_monk',
    name: 'The Monk',
    suit: null,
    type: 'mortal',
    value: 4,
    alignment: 'good',
    effect: {
      trigger: 'on_play',
      description: 'This card cannot be affected by opponent\'s effects',
      execute: (gameState, player) => {
        const monk = player.flight.find(c => c.id === 'the_monk');
        monk.immune = true;
        return "The Monk enters a state of perfect tranquility. Untouchable.";
      }
    },
    flavor: "Punches dragons. In the FACE. With their FISTS. And somehow that works.",
    color: '#d2691e',
    imagePath: 'assets/cards/monk.png'
  },

  // ----- THE WIZARD -----
  // Prepared caster vs Sorcerer's spontaneous casting
  {
    id: 'the_wizard',
    name: 'The Wizard',
    suit: null,
    type: 'mortal',
    value: 6,
    alignment: 'neutral',
    effect: {
      trigger: 'on_play',
      description: 'Choose any card in your hand - it gets +2 value when played',
      execute: (gameState, player) => {
        return "The Wizard prepares a spell... Choose a card in your hand to empower!";
      }
    },
    flavor: "Has a spellbook. Reads it every morning. Probably has tiny reading glasses.",
    color: '#4682b4',
    imagePath: 'assets/cards/wizard.png'
  }
];

// =============================================================================
// SECTION 5: PUTTING IT ALL TOGETHER - THE COMPLETE DECK
// =============================================================================
// This function generates the full 100-card deck.
//
// In actual Three Dragon Ante rules, you use 70 dragon cards + 10 randomly
// selected special cards (from the 30 legendaries and mortals). But we're
// going to use all of them because more cards = more fun.

function createCompleteDeck() {
  // Generate all 70 dragon suit cards
  // (Like conjuring 70 dragons at once. Don't try this at home.)
  const dragonCards = generateDragonCards();

  // Combine with legendaries and mortals
  // (The Avengers Assemble moment of card games)
  const completeDeck = [
    ...dragonCards,
    ...LEGENDARY_DRAGONS,
    ...MORTAL_CARDS
  ];

  // Add a unique index to each card for tracking purposes
  // (Like giving everyone a name tag at a dragon convention)
  completeDeck.forEach((card, index) => {
    card.deckIndex = index;
  });

  console.log(`🐉 Deck created with ${completeDeck.length} cards!`);
  console.log(`   - ${dragonCards.length} Dragon cards`);
  console.log(`   - ${LEGENDARY_DRAGONS.length} Legendary cards`);
  console.log(`   - ${MORTAL_CARDS.length} Mortal cards`);

  return completeDeck;
}

// =============================================================================
// SECTION 6: DECK UTILITIES
// =============================================================================
// Helpful functions for working with the deck. These are like your utility
// spells - not flashy, but you'd be lost without them.

/**
 * SHUFFLE THE DECK
 * Uses the Fisher-Yates algorithm, which is basically the mathematically
 * proven best way to shuffle things. Named after Ronald Fisher and Frank
 * Yates, who were doing statistics when shuffling needed to be FAIR.
 *
 * Think of it like this: you go through the deck from the end to the
 * beginning, and for each position, you swap it with a random card from
 * the remaining positions. By the time you're done, everything is
 * thoroughly randomized.
 *
 * This is NOT the same as what you do when shuffling real cards (the
 * riffle shuffle), which actually takes about 7 shuffles to be truly
 * random. Computers are better at randomness. For once.
 *
 * @param {Array} deck - The deck to shuffle
 * @returns {Array} - The same deck, but shuffled (mutates the original)
 */
function shuffleDeck(deck) {
  // Start from the end and work backwards
  // (Like cleaning your room by starting from the door and backing into the closet)
  for (let i = deck.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at i and j
    // This is the fancy destructuring way to swap in JavaScript
    // It's like a teleportation swap spell but for array elements
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * CREATE A PLAY DECK
 * Sets up a new shuffled deck ready for a game.
 *
 * According to actual TDA rules, you're supposed to use:
 * - All 70 dragon cards
 * - 10 randomly selected special cards (from the 30 legendaries/mortals)
 *
 * But that's less fun, so by default we use everything.
 * Set useFullDeck to false if you want the "proper" rules.
 *
 * @param {boolean} useFullDeck - Use all 100 cards (true) or rules-accurate 80 (false)
 * @returns {Array} - A shuffled deck ready to play
 */
function createPlayDeck(useFullDeck = true) {
  if (useFullDeck) {
    // ALL THE CARDS! (Oprah voice: You get a dragon! You get a dragon!)
    const deck = createCompleteDeck();
    return shuffleDeck(deck);
  } else {
    // Rules-accurate version: 70 dragons + 10 random specials
    const dragonCards = generateDragonCards();

    // Combine all special cards and shuffle them
    const specialCards = [...LEGENDARY_DRAGONS, ...MORTAL_CARDS];
    shuffleDeck(specialCards);

    // Take the first 10 special cards
    const selectedSpecials = specialCards.slice(0, 10);

    // Combine and shuffle
    const deck = [...dragonCards, ...selectedSpecials];
    return shuffleDeck(deck);
  }
}

/**
 * DRAW A CARD
 * Takes the top card from the deck and returns it.
 * Simple, but essential - like taking a card from a deck of cards.
 * Revolutionary concept, I know.
 *
 * @param {Array} deck - The deck to draw from
 * @returns {Object|null} - The drawn card, or null if deck is empty
 */
function drawCard(deck) {
  if (deck.length === 0) {
    console.warn("⚠️ Deck is empty! No card to draw!");
    return null;
  }

  // Pop removes and returns the last element
  // We treat the end of the array as the "top" of the deck
  return deck.pop();
}

/**
 * DRAW MULTIPLE CARDS
 * Like drawCard but for when you're greedy.
 *
 * @param {Array} deck - The deck to draw from
 * @param {number} count - How many cards to draw
 * @returns {Array} - Array of drawn cards (may be less than count if deck runs out)
 */
function drawCards(deck, count) {
  const drawn = [];

  for (let i = 0; i < count; i++) {
    const card = drawCard(deck);
    if (card) {
      drawn.push(card);
    } else {
      // Deck is empty, stop drawing
      break;
    }
  }

  return drawn;
}

/**
 * GET CARD BY ID
 * Finds a specific card in a collection by its ID.
 * Like casting Locate Object but for cards.
 *
 * @param {Array} cards - Array of cards to search
 * @param {string} id - The card ID to find
 * @returns {Object|undefined} - The found card or undefined
 */
function getCardById(cards, id) {
  return cards.find(card => card.id === id);
}

/**
 * FILTER CARDS BY TYPE
 * Returns all cards of a specific type.
 * Useful for finding all dragons, all legendaries, etc.
 *
 * @param {Array} cards - Array of cards to filter
 * @param {string} type - The type to filter by ('dragon', 'legendary', 'mortal')
 * @returns {Array} - Filtered array of cards
 */
function filterCardsByType(cards, type) {
  return cards.filter(card => card.type === type);
}

/**
 * FILTER CARDS BY SUIT
 * Returns all cards of a specific suit.
 * "Give me all the Red dragons" kind of thing.
 *
 * @param {Array} cards - Array of cards to filter
 * @param {string} suit - The suit to filter by ('Red', 'Gold', etc.)
 * @returns {Array} - Filtered array of cards
 */
function filterCardsBySuit(cards, suit) {
  return cards.filter(card => card.suit === suit);
}

/**
 * CLONE A CARD
 * Creates a deep copy of a card so you can modify it without
 * affecting the original. Important for temporary bonuses and effects.
 *
 * @param {Object} card - The card to clone
 * @returns {Object} - A new card object with the same properties
 */
function cloneCard(card) {
  return JSON.parse(JSON.stringify(card));
}

// =============================================================================
// EXPORTS
// =============================================================================
// Making all our dragon data and functions available to other files.
// It's like opening the vault doors and letting everyone in.

// Export constants (the raw data)
// Using 'const' with var-style exports for browser compatibility
// (Because not everyone is on the ES6 module train yet)

// If we're in a module environment, export properly
// Otherwise, attach to window for browser use
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    DRAGON_SUITS,
    LEGENDARY_DRAGONS,
    MORTAL_CARDS,
    generateDragonCards,
    createCompleteDeck,
    shuffleDeck,
    createPlayDeck,
    drawCard,
    drawCards,
    getCardById,
    filterCardsByType,
    filterCardsBySuit,
    cloneCard
  };
} else {
  // Browser environment - attach to window
  window.TDA_CARDS = {
    DRAGON_SUITS,
    LEGENDARY_DRAGONS,
    MORTAL_CARDS,
    generateDragonCards,
    createCompleteDeck,
    shuffleDeck,
    createPlayDeck,
    drawCard,
    drawCards,
    getCardById,
    filterCardsByType,
    filterCardsBySuit,
    cloneCard
  };
}

// =============================================================================
// END OF CARDS.JS
// =============================================================================
//
// You now have 100 cards at your disposal. Use them wisely.
// Or don't. I'm a comment, not a cop.
//
// "Perhaps I should treat this less like a negotiation and more like a
// round of Three Dragon Ante. I'll see what cards she lays on the table
// and respond in kind."
//
// — Gale Dekarios, being smooth as always
// =============================================================================
