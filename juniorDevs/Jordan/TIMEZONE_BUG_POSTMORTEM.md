# The Great Timezone Bug of 2025: A Postmortem

**From:** Cody (Senior Dev)
**To:** Jordan (Calendar Systems)
**Re:** That time March 5 kept becoming March 4

---

## The Bug

Erica reported that when she added her birthday (March 5, 1984) to the calendar, it kept displaying as March 4, 1984. You suspected timezone/DST issues - and you were RIGHT about the category, just not the specific culprit.

## What Was Actually Happening

The villain was this innocent-looking line in `EventCard`:

```typescript
const earthDate = new Date(event.earthDate);
```

And similar lines in `getEventsForEarthDate` and `getEventEarthDate`.

### The JavaScript Date Trap

When you write:
```typescript
new Date("1984-03-05")
```

JavaScript parses this as **midnight UTC** (Greenwich Mean Time).

But Erica is in Central Time (UTC-6). So:
- `new Date("1984-03-05")` = March 5, 1984 at 00:00 UTC
- In Central Time, that's = March 4, 1984 at 6:00 PM

When we then call `.getDate()` or `.toLocaleDateString()`, we get **4** instead of **5**.

It's like asking "what day is it?" and accidentally answering based on what day it is in England instead of Texas.

### Why Your DST Work Helped But Didn't Fix It

You correctly identified that using NOON instead of midnight in the `ANCHOR` constant would avoid DST edge cases - that was smart! The 12-hour buffer means even if DST shifts things by an hour, we're still in the right day.

But the bug wasn't in the anchor calculation. It was in how we were *parsing stored date strings* back into Date objects. The creation path was fine (we were manually constructing dates with year/month/day). The display path was the problem.

## The Fix

I added a helper function that parses date strings the SAFE way:

```typescript
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in JavaScript because... JavaScript.
  // Also using noon to avoid DST issues.
  return new Date(year, month - 1, day, 12, 0, 0);
}
```

This explicitly creates a Date at **noon local time**, not midnight UTC.

Then I replaced all instances of `new Date(event.earthDate)` with `parseLocalDate(event.earthDate)`.

## The Golden Rule

**Never use `new Date(string)` for date-only strings like "1984-03-05".**

Instead:
- Parse the string manually and use `new Date(year, month-1, day, 12, 0, 0)`
- Or use a library like `date-fns` or `dayjs` that handles this correctly

Similarly, **never use `.toISOString().split('T')[0]`** to get a date string for comparison - it converts to UTC first. Use local date formatting instead:

```typescript
export function formatLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

## Why This Bug Is So Common

This trap catches EVERYONE. Senior devs, junior devs, the works. JavaScript's Date handling is notoriously confusing because:

1. `new Date("1984-03-05")` = UTC midnight (ISO 8601 format)
2. `new Date("03/05/1984")` = local midnight (US format)
3. `new Date(1984, 2, 5)` = local midnight (month is 0-indexed because WHY NOT)

The inconsistency is maddening. It's like if Harptos randomly decided some months were 0-indexed and some weren't.

## Key Takeaway

When working with dates that represent "a day" (not a specific moment in time), always:

1. **Store** them as strings like "1984-03-05"
2. **Parse** them by splitting the string and using explicit year/month/day
3. **Use noon** instead of midnight to avoid DST edge cases
4. **Format** them using local getters, not `.toISOString()`

Think of it like how in D&D, you always specify which plane you're on. "Midnight" means different things on different planes - and different things in different timezones. Be explicit about where (when?) you mean.

## Files Changed

- `eventService.ts` - Added `parseLocalDate()` and `formatLocalDateString()` helpers, fixed `getEventsForEarthDate()` and `getEventEarthDate()`
- `EventsView.tsx` - Fixed `EventCard` to use `parseLocalDate()`

---

**Status:** Fixed and deployed
**Lesson learned:** JavaScript dates are a mimic. Always check for teeth before touching.

*- Cody*

*P.S. - Your instinct about timezones was correct! You were looking in the right dungeon, just the wrong room. That's good debugging intuition. Keep following those hunches.*
