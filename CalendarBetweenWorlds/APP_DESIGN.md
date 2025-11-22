# App Design Document
*Calendar Between Worlds - The UI/UX Blueprint*

---

## Design Philosophy

This app bridges two worlds. The UI should feel like holding a magical artifact that shows you time flowing in parallel dimensions. Not overly whimsical (we're not making a kids' game), but with subtle fantasy touches that remind you this isn't just another calendar app.

**Core Principles:**
1. **Information density without clutter** - Show both calendars without overwhelming
2. **Quick glance value** - See both dates and moon phase instantly
3. **Story-first thinking** - Events are about narrative, not just scheduling
4. **Elegant fantasy touches** - Subtle, not garish

---

## Color Palette & Theme

### Primary Theme: "Candlelit Tome"

```
Background:        #1a1a2e (Deep twilight blue)
Surface:           #16213e (Darker panel blue)
Primary:           #e94560 (Crimson - for highlights, current day)
Secondary:         #0f3460 (Deep royal blue)
Accent:            #f5c518 (Gold - festivals, special days)
Text Primary:      #eaeaea (Soft white)
Text Secondary:    #a0a0a0 (Muted gray)
Moon Glow:         #c4b5fd (Soft lavender)
Season Colors:
  - Winter:        #60a5fa (Ice blue)
  - Spring:        #34d399 (Fresh green)
  - Summer:        #fbbf24 (Warm gold)
  - Autumn:        #f97316 (Burnt orange)
```

### Typography

- **Headers**: Cinzel or similar serif (fantasy book feel)
- **Body**: Inter or Roboto (clean, readable)
- **Dates/Numbers**: Tabular figures for alignment

---

## Screen Designs

### 1. Main Screen - Dual Calendar View

The hero screen. This is what Erica sees every day.

```
┌─────────────────────────────────────┐
│  ☾ Calendar Between Worlds          │  <- Title bar with moon icon
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │   TODAY IN BOTH WORLDS      │   │  <- Hero section
│  │                              │   │
│  │   November 22, 2024          │   │  <- Real date (larger)
│  │   Friday                     │   │
│  │                              │   │
│  │   ═══════════════════════    │   │  <- Divider (fantasy style)
│  │                              │   │
│  │   Uktar 27, 1492 DR          │   │  <- Faerûnian date
│  │   "The Rotting"              │   │  <- Common name
│  │   Year of Three Ships        │   │  <- Year name
│  │                              │   │
│  │   🌔 Waxing Gibbous         │   │  <- Moon phase
│  │   Full in 4 days             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ UPCOMING                     │   │  <- Events section
│  │                              │   │
│  │ • Feast of the Moon (8 days) │   │
│  │ • Writing: Chapter 12        │   │
│  │ • Story: The Ritual          │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [Today] [Month] [Timeline] [⚙️]  │  <- Bottom nav
└─────────────────────────────────────┘
```

### 2. Month View - Dual Calendar Grid

Shows the whole month with both calendar systems visible.

```
┌─────────────────────────────────────┐
│  ← Uktar 1492 / November 2024 →    │  <- Month selector
├─────────────────────────────────────┤
│                                     │
│  Su  Mo  Tu  We  Th  Fr  Sa        │  <- Real weekdays
│  ─────────────────────────         │
│       1   2   3   4   5   6        │  <- Real dates
│      [6] [7] [8] [9][10][11]       │  <- Faerûn dates (smaller)
│                                     │
│   7   8   9  10  11  12  13        │
│  [12][13][14][15][16][17][18]      │
│                                     │
│  14  15  16  17  18  19  20        │
│  [19][20][21][22][23][24][25]      │
│               ^^                    │  <- Today highlighted
│  21  22  23  24  25  26  27        │
│  [26][27][28][29][30][🌙][1]       │  <- Festival icon
│                                     │
│  28  29  30                        │
│  [2] [3] [4]                       │  <- Next month (Nightal)
│                                     │
├─────────────────────────────────────┤
│  🎉 Feast of the Moon: Nov 25      │  <- Festival callout
├─────────────────────────────────────┤
│  [Today] [Month] [Timeline] [⚙️]  │
└─────────────────────────────────────┘
```

### 3. Timeline View - Story Progression

This is where Erica tracks her writing journey alongside the story.

```
┌─────────────────────────────────────┐
│  Timeline                    [Filter]│
├─────────────────────────────────────┤
│                                     │
│  ════ 1492 DR - Autumn ════        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📝 Uktar 20 (Nov 15)        │   │
│  │ "Chapter 11 - The Storm"    │   │
│  │ Writing session: 3,200 words│   │
│  └─────────────────────────────┘   │
│         │                          │
│         │ [5 story days pass]      │
│         ↓                          │
│  ┌─────────────────────────────┐   │
│  │ ⚔️ Uktar 25                  │   │
│  │ "The Battle at Thornhold"   │   │
│  │ In-story event              │   │
│  │ → Links to: Chapter 11.md   │   │
│  └─────────────────────────────┘   │
│         │                          │
│         ↓                          │
│  ┌─────────────────────────────┐   │
│  │ 📝 Uktar 27 (Nov 22)        │   │
│  │ "Chapter 12 - Aftermath"    │   │
│  │ [In Progress]               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ════ Upcoming ════                │
│                                     │
│  🌙 Feast of the Moon (3 days)     │
│                                     │
├─────────────────────────────────────┤
│  [Today] [Month] [Timeline] [⚙️]  │
└─────────────────────────────────────┘
```

### 4. Add Event Screen

Two modes: Writing Session or Story Event.

```
┌─────────────────────────────────────┐
│  ← New Event                        │
├─────────────────────────────────────┤
│                                     │
│  Event Type:                        │
│  [📝 Writing] [⚔️ Story] [📌 Note]  │
│                                     │
│  ─────────────────────────         │
│                                     │
│  Title:                             │
│  ┌─────────────────────────────┐   │
│  │ Chapter 12 - Aftermath      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Real Date:                         │
│  ┌─────────────────────────────┐   │
│  │ November 22, 2024           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Faerûn Date:                       │
│  ┌─────────────────────────────┐   │
│  │ Uktar 27, 1492 DR           │   │
│  └─────────────────────────────┘   │
│  [Auto-calculate] [Override]        │
│                                     │
│  Notes:                             │
│  ┌─────────────────────────────┐   │
│  │ The party deals with the    │   │
│  │ aftermath of Thornhold...   │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Link to Obsidian Note: [Browse]    │
│                                     │
│           [Save Event]              │
│                                     │
└─────────────────────────────────────┘
```

### 5. Day Detail View

When you tap on a specific day.

```
┌─────────────────────────────────────┐
│  ← November 22, 2024                │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  FAERÛN                     │   │
│  │  Uktar 27, 1492 DR          │   │
│  │  "The Rotting"              │   │
│  │  Year of Three Ships        │   │
│  │  Third Tenday, Day 7        │   │
│  │                              │   │
│  │  Season: Autumn 🍂          │   │
│  │  Next Festival: Feast of    │   │
│  │  the Moon (3 days)          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  SELÛNE                     │   │
│  │  🌔 Waxing Gibbous         │   │
│  │  78% Illuminated            │   │
│  │  Full Moon in 4 days        │   │
│  │                              │   │
│  │  [View 30-day cycle]        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ════ Events This Day ════         │
│                                     │
│  📝 Chapter 12 - Aftermath         │
│  → View in Timeline                │
│                                     │
│         [+ Add Event]               │
│                                     │
└─────────────────────────────────────┘
```

### 6. Settings Screen

```
┌─────────────────────────────────────┐
│  ← Settings                         │
├─────────────────────────────────────┤
│                                     │
│  ════ CALENDAR ANCHOR ════         │
│                                     │
│  Real-World Anchor Date:            │
│  [January 1, 2024        ] [📅]    │
│                                     │
│  Faerûn Anchor Date:                │
│  [Hammer 1, 1492 DR      ] [📅]    │
│                                     │
│  Time Flow Ratio:                   │
│  1 real day = [1] Faerûn day(s)    │
│                                     │
│  [Recalculate All Events]          │
│                                     │
│  ════ DISPLAY ════                 │
│                                     │
│  Theme: [Dark ▼]                   │
│  Show Common Names: [✓]            │
│  Show Year Names: [✓]              │
│  Show Moon Phase: [✓]              │
│                                     │
│  ════ NOTIFICATIONS ════           │
│                                     │
│  Festival Reminders: [✓]           │
│  Full Moon Alerts: [✓]             │
│  Writing Reminders: [✓]            │
│                                     │
│  ════ DATA ════                    │
│                                     │
│  [Export to Obsidian]              │
│  [Sync with GitHub]                │
│  [Backup Data]                     │
│                                     │
└─────────────────────────────────────┘
```

### 7. Home Screen Widget (Android Native)

The killer feature. Quick glance without opening the app.

```
┌─────────────────────┐
│ Friday, Nov 22      │  <- Real date
│ Uktar 27, 1492 DR   │  <- Faerûn date
│ 🌔 Waxing Gibbous  │  <- Moon phase
└─────────────────────┘

Or expanded version:

┌───────────────────────────────┐
│  November 22, 2024            │
│  ───────────────────         │
│  Uktar 27, 1492 DR            │
│  "The Rotting"                │
│  Year of Three Ships          │
│  ───────────────────         │
│  🌔 Waxing Gibbous           │
│  Full moon in 4 days          │
│  ───────────────────         │
│  📝 Chapter 12 - Aftermath    │
└───────────────────────────────┘
```

---

## Data Models

### Core Entities

```typescript
// ============================================
// THE DATA LAYER
// (The character sheets of our app)
// ============================================

interface CalendarEvent {
  id: string;
  type: 'writing' | 'story' | 'note' | 'festival';

  // Dates - both stored for direct lookup
  realDate: string;           // ISO date string
  faerunYear: number;
  faerunDayOfYear: number;

  // Content
  title: string;
  description?: string;
  wordCount?: number;         // For writing sessions

  // Linking
  obsidianLink?: string;      // Link to Obsidian note
  relatedEventIds?: string[]; // Link to other events

  // Metadata
  createdAt: string;
  updatedAt: string;
}

interface AppSettings {
  // Calendar anchor
  anchorRealDate: string;
  anchorFaerunYear: number;
  anchorFaerunDayOfYear: number;
  timeFlowRatio: number;

  // Display preferences
  theme: 'dark' | 'light' | 'auto';
  showCommonNames: boolean;
  showYearNames: boolean;
  showMoonPhase: boolean;

  // Notifications
  festivalReminders: boolean;
  fullMoonAlerts: boolean;
  writingReminders: boolean;
}

interface CachedDay {
  realDate: string;
  faerunYear: number;
  faerunDayOfYear: number;
  faerunMonth?: string;
  faerunDay?: number;
  festival?: string;
  moonPhase: MoonPhase;
  season: string;
  events: CalendarEvent[];
}
```

### Database Schema (for SQLite/Room)

```sql
-- Events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  real_date TEXT NOT NULL,
  faerun_year INTEGER NOT NULL,
  faerun_day_of_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  word_count INTEGER,
  obsidian_link TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Event relationships
CREATE TABLE event_relations (
  event_id TEXT NOT NULL,
  related_event_id TEXT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (related_event_id) REFERENCES events(id)
);

-- Settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_events_real_date ON events(real_date);
CREATE INDEX idx_events_faerun ON events(faerun_year, faerun_day_of_year);
CREATE INDEX idx_events_type ON events(type);
```

---

## Architecture Overview

### PWA Architecture

```
┌─────────────────────────────────────┐
│           React App                 │
├─────────────────────────────────────┤
│  Components                         │
│  ├── TodayView                      │
│  ├── MonthView                      │
│  ├── TimelineView                   │
│  ├── DayDetail                      │
│  ├── EventForm                      │
│  └── Settings                       │
├─────────────────────────────────────┤
│  State Management (Zustand/Redux)   │
│  ├── calendarStore                  │
│  ├── eventStore                     │
│  └── settingsStore                  │
├─────────────────────────────────────┤
│  Services                           │
│  ├── CalendarService (conversions)  │
│  ├── MoonService (phases)           │
│  ├── StorageService (IndexedDB)     │
│  └── SyncService (GitHub)           │
├─────────────────────────────────────┤
│  Service Worker (offline support)   │
└─────────────────────────────────────┘
```

### Android Native Architecture

```
┌─────────────────────────────────────┐
│           App Module                │
├─────────────────────────────────────┤
│  UI Layer (Jetpack Compose)         │
│  ├── screens/                       │
│  │   ├── TodayScreen                │
│  │   ├── MonthScreen                │
│  │   ├── TimelineScreen             │
│  │   └── SettingsScreen             │
│  ├── components/                    │
│  └── viewmodels/                    │
├─────────────────────────────────────┤
│  Domain Layer                       │
│  ├── usecases/                      │
│  │   ├── ConvertDateUseCase         │
│  │   ├── GetMoonPhaseUseCase        │
│  │   └── ManageEventUseCase         │
│  └── models/                        │
├─────────────────────────────────────┤
│  Data Layer                         │
│  ├── repository/                    │
│  ├── local/ (Room Database)         │
│  └── sync/ (GitHub sync)            │
├─────────────────────────────────────┤
│  Widget Module                      │
│  └── CalendarWidgetProvider         │
└─────────────────────────────────────┘
```

---

## User Flows

### Flow 1: Daily Check-In

1. User opens app (or glances at widget)
2. Sees today's date in both calendars
3. Sees current moon phase
4. Sees upcoming events/festivals
5. Optionally taps to add writing session

### Flow 2: Add Writing Session

1. User taps "+ Add Event"
2. Selects "Writing" type
3. Title auto-suggests from pattern ("Chapter X")
4. Real date defaults to today
5. Faerûn date auto-calculates
6. User adds word count and notes
7. Optionally links to Obsidian note
8. Saves → appears in timeline

### Flow 3: Track Story Event

1. User taps "+ Add Event"
2. Selects "Story" type
3. Enters event title ("Battle at Thornhold")
4. Sets Faerûn date (story time)
5. Real date auto-calculates (or manual if past)
6. Adds description
7. Links to related writing sessions
8. Saves → appears in timeline

### Flow 4: Browse Timeline

1. User opens Timeline view
2. Scrolls through chronological events
3. Sees writing sessions linked to story events
4. Taps event to view details
5. Can filter by type (writing/story/all)

### Flow 5: Configure Calendar Anchor

1. User opens Settings
2. Sets "Real-World Anchor" (e.g., Jan 1, 2024)
3. Sets "Faerûn Anchor" (e.g., Hammer 1, 1492)
4. Optionally sets time flow ratio
5. Taps "Recalculate" to update existing events
6. All dates adjust accordingly

---

## Interaction Design Notes

### Gestures

- **Swipe left/right** on month view: Navigate months
- **Tap day**: Open day detail
- **Long press day**: Quick-add event
- **Pull down**: Refresh / sync

### Animations

- **Moon phase**: Subtle glow pulse
- **Today indicator**: Gentle breathing animation
- **Festival days**: Sparkle effect (subtle!)
- **Page transitions**: Slide / fade

### Accessibility

- High contrast mode support
- Screen reader labels for all elements
- Touch targets minimum 48dp
- Color not sole indicator (use icons too)

---

## Future Feature Ideas

### Phase 2 Possibilities

1. **"This Day in Faerûn"** - Random historical facts
2. **Character birthdays** - Track NPC/PC birthdays
3. **Weather generator** - Seasonal weather in Waterdeep
4. **Multiple campaigns** - Switch between different anchors
5. **iCloud/Google sync** - Beyond GitHub
6. **Apple Watch widget** - For the Apple users

### Integration Possibilities

1. **Obsidian plugin** - Two-way sync
2. **Post-Cortex** - Memory timeline integration
3. **D&D Beyond** - Character linking
4. **Notion** - Alternative note system

---

## Design Assets Needed

1. App icon (moon + dual calendar motif)
2. Moon phase icons (8 phases)
3. Festival icons (5 unique)
4. Event type icons (writing, story, note)
5. Season indicators (4 colors/icons)
6. Widget backgrounds
7. Splash screen

---

*"The best UI is the one that disappears. The user should see the story, not the interface."* - Jordan
