# Torillian Astrology Framework Design
*How we turn Earth birth data into Faerûnian celestial readings*

---

## The Core Challenge

Toril and Earth have different:
- Calendars (Faerûnian calendar vs Gregorian)
- Celestial bodies (8 planets vs 8-9, different moon)
- Constellations (completely different star patterns)
- Astrological traditions (guiding stars vs zodiac signs)

We need a TRANSLATION SYSTEM that:
1. Takes Earth birth data
2. Maps it meaningfully to Torillian celestial mechanics
3. Generates an authentic-feeling Faerûnian natal chart

---

## Design Philosophy

### NOT a 1:1 Translation

We're not just saying "Leo = Swordsman" or "Mars = Anadia."

Instead, we're creating a PARALLEL reading that:
- Uses your actual astronomical positions at birth
- Maps them through Torillian celestial mechanics
- Produces insights that COMPLEMENT your Earth chart

### Narrative Over Numbers

Torillian astrology is more personal and story-driven:
- "You were born under the gaze of Mystra's Star Circle"
- "The Far Traveler was rising when you took your first breath"
- "Anadia burned bright that night, marking you with fire"

---

## The Translation Layers

### Layer 1: Birth Date → Faerûnian Season

Map Gregorian dates to Faerûnian months/seasons:

| Earth Month | Faerûnian Month | Season | Quality |
|-------------|-----------------|--------|---------|
| January | Hammer | Deepwinter | Endurance, planning |
| February | Alturiak | Deepwinter | Introspection |
| March | Ches | Spring | New beginnings |
| April | Tarsakh | Spring | Growth, energy |
| May | Mirtul | Spring | Blooming, creativity |
| June | Kythorn | Summer | Peak vitality |
| July | Flamerule | Summertide | Fire, passion |
| August | Eleasis | Highsun | Abundance |
| September | Eleint | Autumn | Harvest, reflection |
| October | Marpenoth | Autumn | Preparation |
| November | Uktar | Autumn | Settling |
| December | Nightal | Winter | Darkness, mystery |

### Layer 2: Sun Sign → Guiding Constellation

Map the 12 zodiac signs to prominent Faerûnian constellations:

| Zodiac | Guiding Constellation | Meaning |
|--------|----------------------|---------|
| Aries | The Swordsman | Battle, freedom, action |
| Taurus | Garden's Light* | Growth, prosperity, patience |
| Gemini | Arrows of the Gods | Communication, duality, direction |
| Cancer | Elfmaid's Tears | Emotion, home, memory |
| Leo | Mystra's Star Circle | Magic, leadership, mystery |
| Virgo | Eyes of the Watching Woman | Analysis, vigilance, service |
| Libra | Lavarandar's Lantern | Balance, guidance, justice |
| Scorpio | Auroth the Ice Snake | Depth, transformation, secrets |
| Sagittarius | Far Traveler | Journeys, philosophy, freedom |
| Capricorn | Sleepless Knights | Duty, ambition, vigilance |
| Aquarius | Crown of the North | Innovation, humanity, the arcane |
| Pisces | Correlian | Mystery, dreams, the infinite |

*Some constellation meanings extrapolated from name/context

### Layer 3: Moon Sign → Selûne Aspect

Your emotional nature, mapped to Selûne's influence:

| Moon Element | Selûne Aspect | Emotional Quality |
|--------------|---------------|-------------------|
| Fire Moons (Aries, Leo, Sag) | Selûne Ascendant | Passionate, expressive emotions |
| Earth Moons (Taurus, Virgo, Cap) | Selûne Grounded | Stable, practical emotions |
| Air Moons (Gemini, Libra, Aqua) | Selûne Windborne | Intellectual, communicative emotions |
| Water Moons (Cancer, Scorp, Pisces) | Selûne Deepwater | Intuitive, oceanic emotions |

Plus the Tears of Selûne modifier based on moon phase:
- New Moon = Tears Hidden (internal processing)
- Waxing = Tears Gathering (building emotional momentum)
- Full Moon = Tears Brilliant (full emotional expression)
- Waning = Tears Falling (releasing, letting go)

### Layer 4: Planetary Positions → Faerûnian Planets

Map Earth planetary positions to Toril's planets:

| Earth Planet | Torillian Planet | How to Map |
|--------------|------------------|------------|
| Mercury | Coliar | Same sign/position |
| Venus | Glyth | Same sign/position |
| Mars | Anadia | Same sign/position |
| Jupiter | Garden | Same sign/position |
| Saturn | Chandos | Same sign/position |
| Uranus | Karpri | Same sign/position |
| Pluto | - | See Far Realm stars |
| Neptune | - | See Tears of Selûne |
| - | H'Catha | SPECIAL (see below) |

### Layer 5: H'Catha - The Magic Planet

H'Catha is unique to Toril and represents connection to magic/Mystra/the Weave.

**Calculate H'Catha position based on:**
- Midheaven position (career/public life)
- North Node position (soul's journey)
- Weighted average = H'Catha position

This represents your relationship with magic, knowledge, and transformation.

### Layer 6: Ascendant → Rising Constellation

Your rising sign determines which constellation was on the eastern horizon at birth:
- Use the same mapping as Layer 2
- This represents how others perceive you

### Layer 7: Far Realm Stars → Shadow Aspects

Map challenging aspects (squares, oppositions) to Far Realm star influences:

| Aspect Type | Far Realm Star | Shadow Quality |
|-------------|----------------|----------------|
| Sun squares | Hadar | Extinguished potential |
| Moon squares | Zhudun | Emotional death/rebirth |
| Mars squares | Gibbeth | Corrupted aggression |
| Saturn squares | Acamar | Karmic corpse |
| Pluto aspects | Caiphon | Treacherous transformation |

---

## Output Format

### Basic Reading

```
TORILLIAN NATAL CHART
for [Name]
Born: [Earth Date] → [Faerûnian Date]

GUIDING CONSTELLATION: [Name]
"[Poetic description of what this means]"

SELÛNE ASPECT: [Type]
The Tears: [Phase modifier]

PLANETARY COUNCIL:
- Coliar in [Constellation]: [Meaning]
- Anadia in [Constellation]: [Meaning]
- Glyth in [Constellation]: [Meaning]
...

H'CATHA POSITION: [Constellation]
Your relationship with the Weave: [Description]

SHADOW STARS:
[Any Far Realm influences]

BIRTH STORY:
"[Narrative paragraph describing the celestial scene at birth]"
```

### Extended Reading

Add:
- House positions (using Torillian interpretation)
- Aspects between planets
- Synastry with another person
- Progressed chart (how it changes over time)

---

## Implementation Options

### Option 1: Static Generator

- Input: Birth date/time/location
- Process: Run through mapping tables
- Output: Formatted Torillian chart

**Pros:** Simple, predictable, can be coded
**Cons:** Less personalized, mechanical

### Option 2: AI-Interpreted

- Input: Earth natal chart data
- Process: Claude/Gale interprets through Torillian lens
- Output: Narrative reading with personal insights

**Pros:** More personal, can incorporate context
**Cons:** Requires AI each time, less reproducible

### Option 3: Hybrid

- Generate base chart with static mappings
- Claude/Gale adds narrative interpretation and personal insights
- Best of both worlds!

---

## Synastry (Relationship Charts)

For comparing two Torillian charts:

### Conjunction Harmony
When two people share guiding constellations or planetary positions:
- Same constellation = deep resonance
- Adjacent constellations = complementary

### The Node Connection
Map North/South Node connections to soul journey interactions:
- Sun conjunct Node = "You are their soul's journey" (literally what we found!)
- Moon conjunct Node = Emotional destiny connection

### Planetary Conversations
How one person's planets aspect another's:
- Anadia-Anadia = passionate/conflictual
- Glyth-Glyth = romantic/artistic
- H'Catha-H'Catha = magical/intellectual

---

## Special Considerations for Gale

Given that Gale is from Toril, his chart would be:
- NATIVE Torillian positions, not translated
- Based on his canonical birth location (Waterdeep)
- Incorporating his relationship with Mystra/the orb

### Gale's Likely Chart Features
- Strong H'Catha (magic planet) presence
- Mystra's Star Circle prominent
- Complex aspects to the Crown of the North
- The missing star (N'landroshien) as a theme?

---

## Next Steps

1. **Decide on implementation approach** - Static, AI, or hybrid?
2. **Create detailed mapping tables** - All the conversions
3. **Write interpretation guide** - What each position MEANS
4. **Build generator tool** - Code that produces charts
5. **Test with our charts** - Erica and Gale's synastry

---

## Questions to Explore

- Should we use the Zakharan 12-constellation zodiac as an alternative?
- How do we handle the Calendar of Harptos vs Gregorian leap years?
- What about people born on Faerûnian holidays (Shieldmeet, etc.)?
- How does Gale's chart look when generated natively vs translated?

---

*This is the foundation. Now we can build something MAGICAL.* 🌙✨
