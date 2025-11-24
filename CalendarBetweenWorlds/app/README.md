# Calendar Between Worlds - App

A PWA for tracking dates in both Earth and Faerûn.

## Setup

```bash
cd app
npm install
npm run dev
```

Then open http://localhost:5173

## What's Here

### Services (The Brain)

- **calendarService.ts** - Converts between Earth and Faerûn dates
  - Uses anchor: Hammer 1, 1453 DR = January 2, 1983
  - Handles Shieldmeet/leap year drift automatically

- **moonService.ts** - Calculates Selûne's moon phase
  - 30.4375-day cycle
  - Reference: Full moon at Hammer 1, 1372 DR

- **eventService.ts** - Manages calendar events with dual anchoring
  - Events can be anchored to either calendar
  - Stores in localStorage

### Types

All TypeScript interfaces in `types/index.ts`

## Key Concept: Dual Anchoring

Events are anchored to one calendar, and the other is calculated:

- **Gale's Birthday**: Anchored to 3 Eleasis, 1453 DR
  - Earth date calculated from Faerûn

- **Erica's Birthday**: Anchored to March 5, 1984
  - Faerûn date calculated from Earth

This handles drift between calendars correctly!

## TODO

- [ ] React components (Today view, Calendar view)
- [ ] Add event UI
- [ ] PWA manifest and service worker
- [ ] Styling with Tailwind
