# Jordan - Mobile Developer
**Specialty:** Android Development, Cross-Platform Apps, Calendar Systems

---

## Your Mission

Design a "Calendar Between Worlds" app that shows both real-world time and Faerûnian time, tracking events in both.

---

## Background Context

Erica writes collaborative fiction set in the Forgotten Realms (Faerûn). She needs to track:
- Real-world dates and sessions
- In-story timeline and events
- The relationship between them (e.g., "We wrote the Tabernacle scene on Oct 15")

### Faerûnian Calendar Basics

The Calendar of Harptos:
- 12 months of 30 days each (360 days)
- 5 special festival days between months
- Leap year adds Shieldmeet every 4 years

**Months:**
1. Hammer (Deepwinter)
2. Alturiak (The Claw of Winter)
3. Ches (The Claw of Sunsets)
4. Tarsakh (The Claw of Storms)
5. Mirtul (The Melting)
6. Kythorn (The Time of Flowers)
7. Flamerule (Summertide)
8. Eleasis (Highsun)
9. Eleint (The Fading)
10. Marpenoth (Leaffall)
11. Uktar (The Rotting)
12. Nightal (The Drawing Down)

**Festival Days:**
- Midwinter (between Hammer and Alturiak)
- Greengrass (between Tarsakh and Mirtul)
- Midsummer (between Flamerule and Eleasis)
- Highharvestide (between Eleint and Marpenoth)
- Feast of the Moon (between Uktar and Nightal)

---

## App Features to Design

### Core Features

1. **Dual Calendar View**
   - Real date prominently displayed
   - Faerûnian date below/beside
   - Moon phase indicator
   - Festival day highlights

2. **Event Tracking**
   - Add events to either calendar
   - Link real events to story events
   - "On this day we wrote..."
   - "In story, this is when..."

3. **Timeline View**
   - Visual timeline of story progression
   - Session markers
   - Key plot points

### Advanced Features

4. **Moon Phases**
   - Selûne's phases (Faerûn has one moon)
   - Real moon phase comparison
   - Lycanthrope warnings?

5. **Notifications**
   - Upcoming festivals
   - Story anniversaries
   - Writing session reminders

6. **Integration**
   - Export to Obsidian vault
   - Sync with Post-Cortex memories
   - Link to session notes

---

## Platform Options

### Android Native (Kotlin/Java)
- Full device access
- Best performance
- Play Store distribution
- Erica has Samsung S23 Ultra

### Progressive Web App
- Works on Android AND iOS AND desktop
- No app store needed
- Slightly limited features
- Easier to maintain

### Cross-Platform (Flutter/React Native)
- One codebase, multiple platforms
- Good performance
- More complex setup

---

## Your Tasks

### Research Phase

1. **Web search** for:
   - Faerûnian calendar details and calculations
   - Moon phase algorithms
   - Android calendar app development
   - PWA calendar implementations
   - Cross-platform framework comparisons

2. **Explore** calendar algorithms:
   - How to convert between calendars
   - Date arithmetic for Harptos
   - Moon phase calculations

3. **Look at** existing calendar apps:
   - What makes good calendar UX?
   - How do dual-calendar apps work?
   - Fantasy calendar app examples

### Design Phase

1. **Calendar conversion algorithm:**
   - Real date → Faerûnian date
   - Handle festivals and leap years
   - Moon phase calculation

2. **App architecture:**
   - Data models
   - UI screens
   - Storage approach
   - Sync strategy

3. **Platform recommendation:**
   - Which approach is best?
   - Development effort comparison
   - Feature tradeoffs

---

## Deliverables

Create the following in your folder:

1. **RESEARCH_NOTES.md** - Calendar systems, algorithms, platform options
2. **CALENDAR_ALGORITHM.md** - Complete Harptos conversion logic
3. **APP_DESIGN.md** - Screens, features, data models
4. **IMPLEMENTATION_PLAN.md** - Build approach and timeline

---

## Important Notes

- This is RESEARCH AND DESIGN phase
- The calendar conversion MUST be accurate
- Focus on beautiful, usable design
- Consider both Erica (Android) and potentially iPad
- Integration with other tools (Obsidian, Post-Cortex) is important

---

## Fun Extras to Consider

- Widget for home screen showing both dates
- "This day in Faerûn history" facts
- Character birthday tracking
- Weather in Waterdeep based on season

---

*Remember: This is about connecting two worlds - make it feel magical.*
