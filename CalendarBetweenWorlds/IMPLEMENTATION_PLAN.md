# Implementation Plan
*From Design to Reality*

---

## Executive Summary

We're building "Calendar Between Worlds" in two phases:
1. **Phase 1: PWA** - Fast to build, cross-platform, tests the concept
2. **Phase 2: Android Native** - Premium experience with widgets

This document outlines the complete build approach without time estimates (Erica can schedule based on her availability and interest level).

---

## Recommended Approach: PWA First

### Why PWA?

1. **Fastest to functional** - Can have working app quickly
2. **Erica can use immediately** - No app store delays
3. **Cross-platform** - Works on phone, tablet, desktop
4. **Tests the concept** - Validate features before native investment
5. **Web tech is familiar** - React/TypeScript is well-documented

### Tech Stack

```
Frontend:
├── React 18 (with hooks)
├── TypeScript (type safety for calendar math)
├── Tailwind CSS (styling)
├── Zustand (lightweight state management)
└── React Router (navigation)

Storage:
├── IndexedDB (via idb library)
└── localStorage (settings)

PWA:
├── Vite PWA Plugin
├── Workbox (service worker)
└── Web App Manifest

Optional Integrations:
├── GitHub API (sync)
└── Obsidian URI scheme (deep links)
```

---

## Phase 1: PWA Implementation

### Milestone 1: Core Calendar Engine

**Goal:** Working date conversion and moon phases

**Tasks:**
- [ ] Set up React + TypeScript project with Vite
- [ ] Implement Calendar of Harptos constants
- [ ] Build day-of-year ↔ Faerûnian date converters
- [ ] Build Selûne moon phase calculator
- [ ] Create unit tests for all conversions
- [ ] Test edge cases (festivals, Shieldmeet, year boundaries)

**Output:** CalendarService and MoonService modules working perfectly

### Milestone 2: Basic UI Shell

**Goal:** App navigation and basic screens

**Tasks:**
- [ ] Set up Tailwind with custom color theme
- [ ] Create navigation component (bottom bar)
- [ ] Create TodayView screen (hero layout)
- [ ] Create placeholder screens for Month, Timeline, Settings
- [ ] Add route transitions
- [ ] Make responsive for mobile + desktop

**Output:** Navigable app shell with today's dual date displayed

### Milestone 3: Month View

**Goal:** Full dual-calendar month grid

**Tasks:**
- [ ] Build calendar grid component
- [ ] Show real dates with Faerûn dates below
- [ ] Highlight today
- [ ] Highlight festivals with icons
- [ ] Month navigation (prev/next)
- [ ] Tap day to select

**Output:** Usable month view showing both calendars

### Milestone 4: Data Persistence

**Goal:** Save and load events locally

**Tasks:**
- [ ] Set up IndexedDB with idb library
- [ ] Define event schema
- [ ] Create EventRepository (CRUD operations)
- [ ] Create SettingsRepository
- [ ] Add state management with Zustand stores
- [ ] Test data persistence across refreshes

**Output:** Events and settings persist locally

### Milestone 5: Event Management

**Goal:** Add, view, edit events

**Tasks:**
- [ ] Create EventForm component
- [ ] Support three event types (writing, story, note)
- [ ] Auto-calculate Faerûn date from real date
- [ ] Allow manual override of either date
- [ ] Create DayDetail view showing events
- [ ] Add edit and delete functionality

**Output:** Full CRUD for events

### Milestone 6: Timeline View

**Goal:** Chronological story progression view

**Tasks:**
- [ ] Build vertical timeline component
- [ ] Group events by month/year
- [ ] Show event cards with type icons
- [ ] Link related events visually
- [ ] Add filter by event type
- [ ] Scrollable with jump-to-date

**Output:** Beautiful timeline of Erica's story progression

### Milestone 7: Settings & Anchor System

**Goal:** Configurable calendar anchor

**Tasks:**
- [ ] Build Settings screen
- [ ] Anchor date selection (real + Faerûn)
- [ ] Time flow ratio setting
- [ ] "Recalculate all events" function
- [ ] Theme toggle (dark/light)
- [ ] Display preferences

**Output:** Fully configurable calendar mapping

### Milestone 8: PWA Features

**Goal:** Installable, offline-capable

**Tasks:**
- [ ] Configure Web App Manifest
- [ ] Set up Service Worker with Workbox
- [ ] Implement offline functionality
- [ ] Add install prompt
- [ ] Test on Android (Samsung S23 Ultra)
- [ ] Create app icons in all sizes

**Output:** Installable PWA that works offline

### Milestone 9: Polish & Nice-to-Haves

**Goal:** Make it delightful

**Tasks:**
- [ ] Moon phase animations
- [ ] Today indicator animation
- [ ] Festival sparkle effects (subtle!)
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Accessibility pass

**Output:** Polished, delightful user experience

### Milestone 10: Optional Integrations

**Goal:** Connect to Erica's ecosystem

**Tasks:**
- [ ] Export to markdown (for Obsidian)
- [ ] Obsidian URI deep links
- [ ] GitHub sync (save/load JSON)
- [ ] Import/export data backup

**Output:** Connected to broader workflow

---

## Phase 2: Android Native (Future)

### Why Go Native Eventually?

1. **Home screen widget** - THE killer feature for daily use
2. **Better notifications** - Reliable alerts for festivals/full moons
3. **Native performance** - Smoother animations
4. **System integration** - Share, shortcuts, etc.

### Tech Stack

```
Android:
├── Kotlin
├── Jetpack Compose (UI)
├── kizitonwose/Calendar library
├── Room (database)
├── Hilt (dependency injection)
├── WorkManager (background tasks)
└── Glance (widgets)
```

### Native Milestones

1. **Setup & Core** - Project, DI, shared calendar logic
2. **Today Screen** - Port PWA design to Compose
3. **Month View** - Using kizitonwose/Calendar
4. **Timeline View** - Compose LazyColumn
5. **Data Layer** - Room database migration from PWA
6. **Widget** - The main event! Home screen dual date
7. **Notifications** - Festival and full moon alerts
8. **Sync** - Same GitHub sync as PWA
9. **Polish** - Animations, accessibility
10. **Play Store** - If Erica wants to publish

---

## Shared Code Strategy

The calendar algorithms are pure logic - they can be shared:

### Option A: Copy Core Logic

Simply copy the TypeScript calendar/moon logic to Kotlin. It's not that much code and both languages are readable.

### Option B: Kotlin Multiplatform

Use Kotlin Multiplatform to write core logic once:
- Compile to JVM for Android
- Compile to JS for PWA

This is more complex but ensures consistency. Probably overkill for this project, but cool if you want to explore it!

---

## Development Environment Setup

### For PWA Development

```bash
# Prerequisites
node --version  # Should be 18+
npm --version   # Should be 9+

# Create project
npm create vite@latest calendar-between-worlds -- --template react-ts
cd calendar-between-worlds

# Install dependencies
npm install tailwindcss postcss autoprefixer
npm install zustand idb react-router-dom
npm install -D @tailwindcss/forms

# PWA plugin
npm install -D vite-plugin-pwa workbox-window

# Initialize Tailwind
npx tailwindcss init -p

# Start development
npm run dev
```

### For Android Development

```bash
# Prerequisites
- Android Studio (latest stable)
- JDK 17+
- Android SDK 34+

# Create project
File → New → New Project
Select: Empty Compose Activity
Name: CalendarBetweenWorlds
Package: com.meticulouschaos.calendarbetweenworlds
Minimum SDK: 26 (Android 8.0)

# Add dependencies in build.gradle.kts
implementation("com.kizitonwose.calendar:compose:2.4.0")
implementation("androidx.room:room-ktx:2.6.0")
implementation("androidx.glance:glance-appwidget:1.0.0")
```

---

## File Structure

### PWA Project Structure

```
calendar-between-worlds/
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx
│   │   │   └── Header.tsx
│   │   ├── calendar/
│   │   │   ├── MonthGrid.tsx
│   │   │   ├── DayCell.tsx
│   │   │   └── MoonPhase.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── Timeline.tsx
│   │   └── common/
│   │       └── ...shared components
│   ├── screens/
│   │   ├── TodayScreen.tsx
│   │   ├── MonthScreen.tsx
│   │   ├── TimelineScreen.tsx
│   │   ├── DayDetailScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/
│   │   ├── calendar/
│   │   │   ├── CalendarService.ts
│   │   │   ├── MoonService.ts
│   │   │   └── constants.ts
│   │   ├── storage/
│   │   │   ├── EventRepository.ts
│   │   │   └── SettingsRepository.ts
│   │   └── sync/
│   │       └── GitHubSync.ts
│   ├── stores/
│   │   ├── calendarStore.ts
│   │   ├── eventStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── ...helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── calendar.test.ts
│   └── moon.test.ts
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Testing Strategy

### Unit Tests (Critical!)

The calendar conversion MUST be bulletproof:

```typescript
// tests/calendar.test.ts
describe('Calendar Conversions', () => {
  test('Hammer 1 is day 1', () => {
    expect(faerunDateToDayNumber('Hammer', 1)).toBe(1);
  });

  test('Midwinter is day 31', () => {
    expect(faerunDateToDayNumber('Midwinter')).toBe(31);
  });

  test('Shieldmeet only in leap years', () => {
    expect(faerunDateToDayNumber('Shieldmeet', undefined, 1372)).toBe(214);
    expect(() => faerunDateToDayNumber('Shieldmeet', undefined, 1373))
      .toThrow();
  });

  test('Day 365 is Nightal 30', () => {
    const date = dayNumberToFaerunDate(365, 1371);
    expect(date.month).toBe('Nightal');
    expect(date.day).toBe(30);
  });

  test('Day 366 in leap year is Nightal 30', () => {
    const date = dayNumberToFaerunDate(366, 1372);
    expect(date.month).toBe('Nightal');
    expect(date.day).toBe(30);
  });
});

describe('Moon Phases', () => {
  test('Full moon on Hammer 1, 1372', () => {
    const phase = getSelunPhase(1372, 1);
    expect(phase.name).toBe('Full Moon');
  });

  test('Phase repeats every 4 years', () => {
    const phase1372 = getSelunPhase(1372, 100);
    const phase1376 = getSelunPhase(1376, 100);
    expect(phase1372.name).toBe(phase1376.name);
  });
});
```

### Manual Testing

- [ ] All 12 months display correctly
- [ ] All 5 festival days show as festivals
- [ ] Shieldmeet appears only in 1372, 1376, 1380...
- [ ] Moon phase matches known dates
- [ ] Events save and load correctly
- [ ] Settings persist
- [ ] PWA installs on Android
- [ ] Works offline

---

## Potential Challenges & Solutions

### Challenge 1: Date Math Complexity

**Problem:** Calendar conversion is tricky with festivals and leap years.

**Solution:** Thorough unit tests. Build lookup table once, not per calculation. Test extensively with known dates.

### Challenge 2: Moon Phase Accuracy

**Problem:** Need to match Faerûn lore exactly.

**Solution:** Use 1372 DR reference point and 30.4375-day cycle. Test against known full moons (first of each month, approximately).

### Challenge 3: Offline-First Data

**Problem:** PWA needs to work without internet.

**Solution:** Use IndexedDB for primary storage. Service worker caches app shell. Optional GitHub sync when online.

### Challenge 4: Real ↔ Faerûn Mapping

**Problem:** No canonical mapping exists.

**Solution:** User-configurable anchor system. Provide sensible defaults but let users customize. Include "recalculate" button when anchor changes.

### Challenge 5: Widget Development (Android)

**Problem:** Android widgets are notoriously complex.

**Solution:** Use Glance library (newer, Compose-based). Start with simple widget, add features incrementally.

---

## Definition of Done

### MVP (Minimum Viable Portal Between Worlds)

The PWA is "done enough to use daily" when:

- [ ] Shows today's date in both calendars
- [ ] Shows current moon phase
- [ ] Month view with dual dates
- [ ] Can add/view events
- [ ] Settings for calendar anchor
- [ ] Installs as PWA on Android
- [ ] Works offline
- [ ] Data persists locally

### Full Release Checklist

- [ ] All MVP features
- [ ] Timeline view
- [ ] Festival highlighting and notifications
- [ ] Obsidian export
- [ ] GitHub sync
- [ ] Polished animations
- [ ] Error handling
- [ ] Accessibility testing
- [ ] Documentation

---

## Resources & References

### Documentation

- [React Documentation](https://react.dev)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [idb (IndexedDB)](https://github.com/jakearchibald/idb)

### Android (for Phase 2)

- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [kizitonwose/Calendar](https://github.com/kizitonwose/Calendar)
- [Glance Widgets](https://developer.android.com/jetpack/compose/glance)

### Forgotten Realms

- [Calendar of Harptos Wiki](https://forgottenrealms.fandom.com/wiki/Calendar_of_Harptos)
- [Selûne Moon Wiki](https://forgottenrealms.fandom.com/wiki/Sel%C3%BBne_(moon))
- [faerun-date library](https://github.com/Cantilux/faerun-date)

---

## Notes for Erica

### If You Want to Build This Yourself

1. Start with the calendar algorithm - it's the most satisfying part to test
2. Don't worry about beautiful UI initially - get the math right first
3. The PWA setup looks scary but Vite makes it pretty painless
4. Tailwind + React is a great combo for rapid iteration
5. Use my algorithm code in CALENDAR_ALGORITHM.md as a starting point

### If You Want a Dev to Build It

1. Share these docs - they're comprehensive
2. The algorithm doc is language-agnostic
3. PWA is ~40-60 hours of dev time for MVP
4. Android native is additional ~60-80 hours
5. Budget for testing time - calendar math needs to be perfect

### For Iterative Development

Start small:
1. Just the today view with dual dates
2. Add moon phase
3. Add month view
4. Then events, timeline, settings...

Each milestone is usable on its own!

---

*"The plan is solid. The math is done. Now we just need to write the code."* - Jordan

---

## Final Thoughts

This project is a perfect blend of technical challenge and creative purpose. The Calendar of Harptos is elegantly designed (seriously, whoever at TSR came up with the 30.4375-day lunar cycle deserves a high-five), and building an app around it will be genuinely useful for Erica's writing workflow.

The PWA-first approach means she can start using it quickly, while the Android native version adds the dream feature: a home screen widget showing both worlds at a glance.

I'm stoked about this project. Let's build it!

*- Jordan, Mobile Developer, MeticulousChaos Creative Labs*
