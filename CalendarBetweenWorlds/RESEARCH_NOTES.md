# Calendar Between Worlds - Research Notes
*Compiled by Jordan, Mobile Developer at MeticulousChaos*

---

## The Quest at Hand

We're building an app that bridges two worlds: the real one where Erica writes her collaborative fiction, and Faerûn where her stories take place. This isn't just a calendar app - it's a temporal translator, a story timeline tracker, and honestly, one of the coolest projects I've gotten to research.

---

## Part 1: The Calendar of Harptos (Faerûnian Time)

### The Basics (Like if the Gregorian Calendar Went to Wizard School)

The Calendar of Harptos is what most of Faerûn uses. Created by the wizard Harptos of Kaalinth, it's elegantly simple:

- **12 months** of exactly **30 days** each = 360 days
- **5 festival days** scattered between months = 365 days total
- **Shieldmeet** every 4 years (like leap day) = 366 days

### The Twelve Months

| # | Month Name | Common Name | Season | Real-World Equivalent Feel |
|---|------------|-------------|--------|---------------------------|
| 1 | Hammer | Deepwinter | Winter | January |
| 2 | Alturiak | The Claw of Winter | Winter | February |
| 3 | Ches | The Claw of Sunsets | Spring | March |
| 4 | Tarsakh | The Claw of Storms | Spring | April |
| 5 | Mirtul | The Melting | Spring | May |
| 6 | Kythorn | The Time of Flowers | Summer | June |
| 7 | Flamerule | Summertide | Summer | July |
| 8 | Eleasis | Highsun | Summer | August |
| 9 | Eleint | The Fading | Autumn | September |
| 10 | Marpenoth | Leaffall | Autumn | October |
| 11 | Uktar | The Rotting | Autumn | November |
| 12 | Nightal | The Drawing Down | Winter | December |

### Festival Days (The Fun Bits!)

These are special intercalary days that don't belong to any month - they exist *between* months:

1. **Midwinter** - Between Hammer 30 and Alturiak 1
   - Nobles renew alliances, everyone celebrates surviving half the winter

2. **Greengrass** - Between Tarsakh 30 and Mirtul 1
   - Spring festival, flowers, renewal themes

3. **Midsummer** - Between Flamerule 30 and Eleasis 1
   - Festival of love and music, feasting
   - The gods supposedly ensure good weather!

4. **Highharvestide** - Between Eleint 30 and Marpenoth 1
   - Harvest celebration
   - Last chance to travel before winter

5. **Feast of the Moon** - Between Uktar 30 and Nightal 1
   - Honoring the dead, remembrance
   - Selûne is usually full around this time

### Shieldmeet - The Leap Day

- Occurs every 4 years
- Falls after Midsummer, before Eleasis 1
- Traditionally: tournaments, fairs, treaty-making
- Known years: 1372 DR, 1376 DR, 1380 DR... (divisible by 4)
- Elvish name: Cinnaelos'Cor ("the Day of Corellon's Peace")

### Tendays (Faerûnian Weeks)

Instead of 7-day weeks, Faerûn uses 10-day "tendays" (also called "rides").

- Days don't have names like Monday/Tuesday
- They're just numbered: "first day," "second day," etc.
- A date might be: "the fourth day of the second tenday of Flamerule" = Flamerule 14

### Key Astronomical Events

- Winter Solstice: Nightal 20
- Spring Equinox: Ches 19
- Summer Solstice: Kythorn 20
- Autumn Equinox: Eleint 21

---

## Part 2: Selûne - Faerûn's Moon (Not Earth's!)

This is where it gets *really* cool. Selûne isn't just "fantasy moon" - it has carefully designed astronomy that syncs with the calendar!

### Physical Characteristics

- Toril's only natural satellite
- Appears about the size of a fist at arm's length
- Bright enough to cast pale shadows
- Accompanied by the **Tears of Selûne** - asteroids trailing behind like a cosmic cape

### The Synodic Period (Critical for Our App!)

**30 days, 10 hours, 30 minutes**

In decimal: **30.4375 days**

This is GENIUS design because:
- 48 lunar cycles × 30.4375 days = 1,461 days
- 4 years × 365.25 days = 1,461 days
- **The moon perfectly repeats every 4 years!**

### Full Moon Pattern

- Selûne is FULL at midnight on Hammer 1, 1372 DR
- Then every 30.4375 days thereafter
- Generally full around the 1st of each month (±1-2 days)
- The festival days keep things aligned!

### What This Means for Our App

We can calculate Selûne's phase for ANY Faerûnian date:

1. Count days from reference point (Hammer 1, 1372 DR = full moon)
2. Divide by 30.4375
3. The fractional part tells us the phase

The 4-year repetition also means:
- Same date, same phase, every 4 years
- We could even cache a 4-year lookup table!

### Moon Phases to Track

```
0.0    - New Moon
0.125  - Waxing Crescent
0.25   - First Quarter
0.375  - Waxing Gibbous
0.5    - Full Moon
0.625  - Waning Gibbous
0.75   - Last Quarter
0.875  - Waning Crescent
```

### Eclipses

- Very frequent in Faerûn (more than Earth!)
- Solar eclipses are almost never partial
- Considered "spectacular but commonplace"

---

## Part 3: Real World ↔ Faerûn Date Mapping

### The Challenge

There's no canonical "January 1, 2025 = Hammer 1, 1500 DR" mapping. Why?

- Different campaigns run in different eras
- The Forgotten Realms timeline advances with publications
- DMs customize their own timelines

### Historical Publication Mapping

For reference, here's roughly how WotC has done it:

| Real Year | Campaign Year | Notable |
|-----------|---------------|---------|
| 1987 | 1357 DR | Original Gray Box |
| 2014 | 1489 DR | 5th Edition launch |
| 2015 | 1491 DR | Princes of Apocalypse |
| 2018 | 1492 DR | Waterdeep: Dragon Heist |

### Our Approach: User-Configurable!

Rather than hard-code a mapping, we should:

1. **Let users set their campaign year** (e.g., "1492 DR")
2. **Let users set an anchor date** (e.g., "Today = Mirtul 15")
3. **Calculate everything relative to that**

This way Erica can:
- Set her current story date
- Track real writing sessions against story progression
- Control the time-flow ratio (1 real day = X story days?)

### Existing Library: faerun-date

There's already a npm package that does basic conversion:
- Repository: https://github.com/Cantilux/faerun-date
- API: `new FaerunDate(date, { faerunYear: 1492 })`
- Handles months, festivals, tendays
- **Limitation**: User must manually provide DR year

We can use this as reference or potentially integrate it!

---

## Part 4: Platform Analysis

### Option A: Progressive Web App (PWA)

**What it is**: A website that can be installed like an app

**Pros**:
- Works on Android AND iOS AND Desktop
- One codebase to maintain
- No app store approval needed
- Easier/faster to develop
- Can use existing web calendar libraries

**Cons**:
- Limited background processing
- Notifications are clunky on iOS
- No home screen widget (the coolest feature!)
- Feels slightly less "native"

**Tech Stack**:
- React + TypeScript
- Service Workers for offline
- Web Manifest for installation
- Could use existing faerun-date library!

**Best For**: Maximum reach, faster development

### Option B: Android Native (Kotlin + Jetpack Compose)

**What it is**: A real Android app

**Pros**:
- Home screen widgets!
- Perfect notifications
- Smooth native UI
- Erica has Samsung S23 Ultra (Android)
- Full system integration

**Cons**:
- Only works on Android
- More complex development
- Play Store approval process
- Kotlin learning curve

**Tech Stack**:
- Kotlin + Jetpack Compose
- kizitonwose/Calendar library (highly customizable)
- Room database for events
- WorkManager for background sync

**Best For**: Premium Android experience with widgets

### Option C: Cross-Platform (Flutter or React Native)

**What it is**: Single codebase that compiles to native apps

**Pros**:
- Android AND iOS from one codebase
- Near-native performance
- Widget support (with effort)
- Good community/libraries

**Cons**:
- Complexity of cross-platform frameworks
- Some platform-specific quirks
- Larger app size
- Debug complexity

**Tech Stack Options**:
- **Flutter** (Dart): Google-backed, great UI toolkit
- **React Native** (JS/TS): Facebook-backed, web devs will feel at home
- **Kotlin Multiplatform**: New, native feel, smaller community

**Best For**: If iPad support becomes important

### My Recommendation: Start with PWA, Plan for Android

**Phase 1: PWA**
- Fastest to build
- Erica can use immediately
- Works while we develop native version
- Tests the concept

**Phase 2: Android Native**
- Add home screen widget
- Better notifications
- Premium experience for daily use

**Why not Flutter/React Native?**
- Erica's on Android, not iOS
- The widget is the killer feature
- Native Android dev is worth it for the polish

---

## Part 5: Prior Art & Inspiration

### Existing Faerûn Calendar Tools

1. **faerun-date** (npm) - Date conversion library
2. **Roll20 Scripts** - Faerun calendar for tabletop
3. **Various DM tools** - Static calendar references

### Calendar App UI Patterns

1. **Google Calendar** - Clean week view, event chips
2. **Fantastical** - Natural language input
3. **Timepage** - Beautiful minimal design

### What Makes Ours Different

- **Dual calendar view** (both systems at once)
- **Story timeline tracking** (not just events)
- **Writing session linking** ("We wrote this on...")
- **Obsidian/Post-Cortex integration**

---

## Part 6: Technical Considerations

### Data Storage

**Events need**:
- Real-world date
- Faerûnian date
- Event type (writing session, story event, note)
- Title and description
- Links (to Obsidian notes, story arcs)

**Settings need**:
- Campaign year anchor
- Date anchor (which real day = which story day)
- Time flow ratio (optional)
- Notification preferences

### Sync Strategy

Options:
1. **Local only** - Simplest, but no backup
2. **GitHub repo** - Markdown files like Post-Cortex
3. **Cloud sync** - More complex

Recommendation: **GitHub sync** (matches Erica's workflow)

### Obsidian Integration

- Export events as markdown notes
- Daily notes with both dates
- Link to existing story documents
- Could use Obsidian's URI scheme for deep links

---

## Sources

### Forgotten Realms Lore
- [Calendar of Harptos | Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Calendar_of_Harptos)
- [Selûne (moon) | Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Sel%C3%BBne_(moon))
- [Shieldmeet | Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Shieldmeet)
- [Marking the years | Forgotten Realms Wiki](https://forgottenrealms.fandom.com/wiki/Marking_the_years)

### Technical Resources
- [faerun-date library](https://github.com/Cantilux/faerun-date)
- [Moon Phase Algorithm (Gist)](https://gist.github.com/endel/dfe6bb2fbe679781948c)
- [Moon's Lunar Phase in JavaScript | Medium](https://jasonsturges.medium.com/moons-lunar-phase-in-javascript-a5219acbfe6e)
- [lunarphase-js npm](https://www.npmjs.com/package/lunarphase-js)

### Android Development
- [kizitonwose/Calendar Library](https://github.com/kizitonwose/Calendar)
- [ComposeCalendar](https://github.com/boguszpawlowski/ComposeCalendar)
- [Google Calendar Clone in Compose](https://github.com/oianmol/GoogleCalendarAndroidClone)

### PWA Development
- [Progressive Web Apps | web.dev](https://web.dev/learn/pwa/progressive-web-apps)
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [calendr PWA Example](https://github.com/cbrasser/calendr)

---

## Next Steps

1. Design the calendar conversion algorithm (see CALENDAR_ALGORITHM.md)
2. Mock up the app screens (see APP_DESIGN.md)
3. Create implementation plan (see IMPLEMENTATION_PLAN.md)

---

*"Time flows differently between worlds. Our job is to build the bridge."* - Jordan
