# Calendar Between Worlds - Session Summary

**Developer:** Jordan (Calendar Systems)
**Date:** November 24, 2025
**Project:** Calendar Between Worlds PWA

---

## What We Built

A React + Vite PWA that bridges Earth and Faerûnian (Forgotten Realms) timekeeping. It lets Erica track dates in both worlds simultaneously for her story with Gale.

### Core Features Implemented

1. **Today View** - Shows current date in both calendars side-by-side
   - Earth date with day of week
   - Faerûn date with year prophecy name (e.g., "Year of the Rune Lords Triumphant")
   - Selûne's moon phase with illumination percentage
   - Any events for today

2. **Calendar View** - Month grid for browsing dates
   - Each cell shows Earth date AND Faerûn date
   - Navigate between months with arrows
   - "Today" button to jump back
   - Click any day to see detailed info panel
   - Highlights for today, festivals, and days with events

3. **Events View** - Manage important dates
   - Add events with dual-anchor support (Earth OR Faerûn as source of truth)
   - Event types: birthday, story, writing, note
   - Recurring events for annual stuff like birthdays
   - Shows both dates with anchor indicator (⚓)
   - Delete events

### Technical Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Storage:** localStorage (simple but reliable)
- **Styling:** CSS with "Candlelit Tome" theme (dark background, gold/crimson accents)
- **Mobile-first:** Responsive design

### Key Files

- `src/services/calendarService.ts` - Core conversion logic, anchor point, month/festival data
- `src/services/eventService.ts` - Event CRUD, dual-anchor system, parseLocalDate helper
- `src/services/moonService.ts` - Selûne phase calculations
- `src/components/TodayView.tsx` - Main dashboard
- `src/components/CalendarView.tsx` - Month grid browser
- `src/components/EventsView.tsx` - Event management + add form

---

## The Canonical Anchor

**Hammer 1, 1453 DR = January 2, 1983**

This means:
- 2025 = 1495 DR
- Gale's birthday: 3 Eleasis, 1453 DR = August 5, 1983
- The calendars drift due to misaligned leap years (Earth) vs Shieldmeet (Faerûn)

---

## The Great Timezone Bug of 2025

### The Problem
Dates kept shifting by one day. March 5 became March 4.

### What I Tried (Partially Right)
- Fixed UTC vs local time in date creation
- Used NOON instead of midnight to avoid DST issues
- Manually parsed date strings instead of using `new Date(string)`

### What Actually Fixed It (Cody's Help)
The bug was in the **display path**, not creation. When reading stored date strings back:

```typescript
// BAD - parses as UTC midnight
const earthDate = new Date(event.earthDate);

// GOOD - explicitly local noon
const earthDate = parseLocalDate(event.earthDate);
```

See `TIMEZONE_BUG_POSTMORTEM.md` for the full breakdown.

### Golden Rules for Future Jordan
1. **Never** use `new Date("YYYY-MM-DD")` - it parses as UTC
2. **Always** parse date strings manually with year/month/day
3. **Use NOON** instead of midnight for DST buffer
4. **Format** using local getters, not `.toISOString()`

---

## Ideas for Future Upgrades

### High Priority
- **Add Erica's birthday to defaults** - Need to uncomment and use correct date with Earth anchor
- **Festival details** - Show descriptions when clicking festival days
- **Event editing** - Currently can only add/delete, not edit existing events

### Medium Priority
- **Tenday view** - Faerûn uses 10-day "weeks" instead of 7-day weeks; could show that
- **Season theming** - Change accent colors based on current Faerûnian season
- **Export/Import** - Backup events to JSON file
- **Year prophecy browser** - Look up what any year's prophecy name is

### Fun Ideas
- **Story timeline** - Special view for tracking narrative events in chronological order
- **Dual calendar picker** - When adding events, show both calendars side by side to pick date
- **Moon phase alerts** - Notify when Selûne is full (important for certain characters/events)
- **Widget/PWA install** - Make it installable on phone home screen
- **Offline support** - Service worker for full PWA offline capability

### Technical Improvements
- **Use date-fns or dayjs** - Proper date library instead of manual parsing
- **Better type safety** - Some `any` types could be tightened
- **Unit tests** - Especially for the calendar conversion math
- **Accessibility** - Keyboard navigation, screen reader support

---

## Running the App

```bash
cd CalendarBetweenWorlds/app
npm install  # First time only
npm run dev
```

Opens at `http://localhost:5173`

---

## Lessons Learned

1. JavaScript Date parsing is wildly inconsistent - same string can be UTC or local depending on format
2. Always trace the FULL data flow (creation → storage → retrieval → display)
3. When debugging timezone issues, check EVERY place dates are created/parsed
4. DST adds another layer of pain on top of timezone pain
5. Comments explaining WHY (not just what) save future-you a lot of headaches

---

## Status

**Working!** All three views functional, timezone bug fixed, pushed to repo.

Ready for Erica to add events and start using it for story tracking!

---

*- Jordan*
*P.S. - I will never trust `new Date(string)` again. Ever.*
