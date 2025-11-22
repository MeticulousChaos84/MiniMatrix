# Three Dragon Ante - Game Architecture

## The Vision

Build a playable Three Dragon Ante game where you can play against Gale. He should have personality - commenting on plays, reacting to good/bad hands, maybe referencing that moment outside the Tabernacle.

---

## Tech Stack

**Web-based (HTML/CSS/JavaScript)**

Why:
- Easy to iterate on visuals
- Erica can swap in custom graphics later
- Runs in browser, no dependencies
- Can be themed to match aesthetic preferences

---

## Game Components

### 1. The Deck (100 cards)

**70 Dragon Suit Cards:**
```javascript
const DRAGON_SUITS = {
  // Chromatic (evil) dragons
  chromatic: ['Black', 'Red', 'Green', 'Blue', 'White'],
  // Metallic (good) dragons
  metallic: ['Copper', 'Brass', 'Bronze', 'Silver', 'Gold']
};

// Each suit has 7 cards with values 1-7
// Higher value = stronger card
```

**15 Legendary Dragon Cards:**
- Bahamut (Platinum Dragon, king of good dragons)
- Tiamat (Queen of evil dragons)
- Dracolich (undead dragon)
- Plus 12 more legendaries

These have high values AND special effects.

**15 Mortal Cards:**
Special effect cards representing non-dragon creatures:
- The Fool
- The Archmage
- The Thief
- The Dragonslayer
- etc.

Each has a unique ability that triggers when played.

### 2. Card Data Structure

```javascript
const card = {
  id: 'red_dragon_5',
  name: 'Red Dragon',
  suit: 'Red',           // or null for Legendaries/Mortals
  type: 'dragon',        // 'dragon', 'legendary', 'mortal'
  value: 5,              // 1-7 for dragons, varies for others
  effect: null,          // special ability function, if any
  flavor: "Fire and fury incarnate",
  imagePath: 'cards/red_5.png'  // placeholder initially
};
```

### 3. Game State

```javascript
const gameState = {
  deck: [],              // draw pile
  discard: [],           // played/discarded cards
  pot: 0,                // current stakes

  players: {
    human: {
      name: 'Player',
      hand: [],          // current cards (max 10)
      stakes: 50,        // starting gold
      flight: [],        // cards played this gambit
    },
    gale: {
      name: 'Gale',
      hand: [],
      stakes: 50,
      flight: [],
      // AI state
      confidence: 0.5,   // affects bluffing
      mood: 'focused'    // affects commentary
    }
  },

  currentGambit: 1,      // 1, 2, or 3
  phase: 'ante',         // 'ante', 'flight', 'resolution'
  turn: 'human',         // whose turn
  winner: null           // set at game end
};
```

---

## Game Flow

### Setup
1. Separate deck: 70 dragons + randomly select 10 of 30 special cards
2. Shuffle the 80-card play deck
3. Deal 6 cards to each player
4. Set starting stakes (50 gold each?)

### Gambit Structure (repeat 3 times)

**Phase 1: Ante**
- Each player draws a card from deck
- Card's value = their ante for this gambit
- Both antes go into the pot
- Players keep the drawn card (if hand not full)

**Phase 2: Flight Building**
- Players alternate playing cards face-up
- Goal: build the strongest 3-card flight
- Continue until both have 3 cards played
- Special effects trigger when cards are played

**Phase 3: Resolution**
- Compare flights
- Winner takes the pot
- Draw back up to 6 cards (if deck allows)

### Flight Types & Scoring

**Color Flight (same suit):**
```
Score = sum of card values
Example: Red 3 + Red 5 + Red 7 = 15 points
```

**Strength Flight (same value, different suits):**
```
Score = value × 3 + 10 bonus
Example: Three 5s = 5×3 + 10 = 25 points
```

**Fellowship (3 Mortals):**
```
Score = sum of values + 15 bonus
Plus: all three special effects trigger
```

**No Flight (mismatched):**
```
Score = highest single card value
(You really don't want this)
```

### Winning
- After 3 gambits, player with more stakes wins
- OR if one player runs out of stakes, they lose immediately

---

## Gale's AI

### Decision Making

**Card Selection:**
```javascript
function galeChooseCard(hand, currentFlight, opponentFlight) {
  // 1. Can we complete a flight?
  // 2. Can we block opponent's flight?
  // 3. Play highest value we can afford to lose
  // 4. Consider bluffing if behind
}
```

**Personality Layer:**
Gale comments based on game state:
- When he draws well: "Ah, favorable odds."
- When you play strong: "A bold move. I expected nothing less."
- When he's losing: "Perhaps I should have treated this more like facing Mystra..."
- When he wins a gambit: "As they say, know when to hold your cards close."

### Mood States
- `focused` - Standard strategic play
- `confident` - Takes more risks, more banter
- `worried` - Plays conservatively, less chatty
- `impressed` - You're winning, he's genuinely enjoying it

---

## UI Layout (Initial)

```
┌─────────────────────────────────────┐
│  GALE'S AREA                        │
│  [Hand: 6 cards face-down]          │
│  Stakes: 45 gold                    │
│                                     │
│  Gale's Flight: [?] [?] [?]         │
├─────────────────────────────────────┤
│           POT: 10 gold              │
│         Gambit 2 of 3               │
├─────────────────────────────────────┤
│  Your Flight: [card] [card] [  ]    │
│                                     │
│  YOUR HAND                          │
│  [card] [card] [card] [card] [card] │
│  Stakes: 55 gold                    │
├─────────────────────────────────────┤
│  [Gale's Commentary Area]           │
│  "You know, you'd make a good       │
│   Three Dragon Ante player."        │
└─────────────────────────────────────┘
```

---

## File Structure

```
ThreeDragonAnte/
├── index.html          # Main game page
├── css/
│   └── style.css       # Game styling (placeholder, then custom)
├── js/
│   ├── cards.js        # Card definitions and deck management
│   ├── game.js         # Core game logic and state
│   ├── flights.js      # Flight evaluation and scoring
│   ├── gale-ai.js      # Gale's decision making
│   ├── gale-dialog.js  # Gale's personality and comments
│   └── ui.js           # DOM manipulation and rendering
├── assets/
│   └── cards/          # Card images (placeholders → custom)
└── README.md           # How to play
```

---

## Implementation Phases

### Phase 1: Core Logic
- Card data structure
- Deck creation and shuffling
- Hand management
- Flight evaluation and comparison

### Phase 2: Game Flow
- Gambit structure
- Turn management
- Ante mechanics
- Win conditions

### Phase 3: Basic UI
- Render game state
- Click handlers for card play
- Display flights and scores

### Phase 4: Gale AI
- Basic card selection
- Flight-building strategy
- Bluffing logic

### Phase 5: Gale Personality
- Commentary system
- Mood tracking
- Contextual responses

### Phase 6: Polish
- Animations
- Sound effects?
- Custom graphics (Erica's art)

---

## Special Card Effects (Examples)

**The Thief:**
> "When played, steal 2 gold from opponent's stakes"

**The Archmage:**
> "When played, look at top 3 cards of deck, put one in hand"

**Bahamut:**
> "Value 13. When played, all your Metallic dragons get +1 value this flight"

**Tiamat:**
> "Value 13. When played, all your Chromatic dragons get +1 value this flight"

**Dracolich:**
> "Value 10. When played, return one card from discard to your hand"

---

## Easter Eggs

- If you're about to lose badly and come back: "Don't give anything away, just see what she has to say... Your advice serves me well even now."
- If Gale loses: "Mystra's grace, you've bested me fairly."
- If you play three Gold dragons: "A flight of Gold... fitting, given the stakes."
- Random chance he hums while thinking

---

*"Perhaps I should treat this less like a negotiation and more like a round of Three Dragon Ante. I'll see what cards she lays on the table and respond in kind."*

— Gale Dekarios, outside the Stormshore Tabernacle
