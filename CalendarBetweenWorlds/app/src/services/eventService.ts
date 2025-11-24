// =============================================================================
// EVENT SERVICE - The Chronicle of Two Worlds
// =============================================================================
//
// This service manages all your calendar events - birthdays, story moments,
// writing sessions, whatever you want to track.
//
// THE KEY CONCEPT: Dual Anchoring
//
// Each event is "anchored" to one calendar system:
// - Gale's birthday: Anchored to FAERÛN (3 Eleasis, 1453)
//   → The Earth date is calculated from this
// - Erica's birthday: Anchored to EARTH (March 5, 1984)
//   → The Faerûn date is calculated from this
//
// This way, the drift between calendars is handled correctly.
// The anchor date is always fixed, and the other date floats.
//
// It's like how your birthday is always "March 5" even though
// the day of the week changes each year. The date is the anchor,
// the weekday is derived.
//
// =============================================================================

import { CalendarEvent } from '../types';
import {
  earthToFaerun,
  faerunToEarth,
  faerunDateToDayNumber,
  dayNumberToFaerunDate,
} from './calendarService';

// =============================================================================
// DATE STRING PARSING - The Timezone Trap Slayer
// =============================================================================

/**
 * Parse a date string like "1984-03-05" into a Date object using LOCAL time.
 *
 * THIS IS THE FIX FOR THE TIMEZONE BUG!
 *
 * The problem: new Date("1984-03-05") parses as UTC midnight.
 * If you're in Central Time (UTC-6), that becomes March 4 at 6 PM local.
 * Then when you call .getDate(), you get 4 instead of 5. WRONG!
 *
 * The solution: Parse the string manually and create a Date with explicit
 * year/month/day, which JavaScript treats as LOCAL time.
 *
 * It's like the difference between:
 * - "Meet me at midnight" (UTC - could be yesterday for you)
 * - "Meet me at midnight YOUR time" (local - always correct)
 *
 * We use NOON (12:00) to avoid DST edge cases too - if DST shifts
 * things by an hour, we're still solidly in the right day.
 *
 * @param dateStr - ISO date string like "1984-03-05"
 * @returns Date object set to noon local time on that date
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in JavaScript because... JavaScript.
  // Also using noon to avoid DST issues - see calendarService ANCHOR comment.
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Format a Date object to ISO date string using LOCAL time.
 *
 * The counterpart to parseLocalDate. Uses the date's local values,
 * not UTC, so March 5 stays March 5 no matter your timezone.
 *
 * @param date - Date object to format
 * @returns ISO date string like "1984-03-05"
 */
export function formatLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =============================================================================
// LOCAL STORAGE - Our Database (the Simple Way)
// =============================================================================

/**
 * The key we use to store events in localStorage.
 *
 * localStorage is like a filing cabinet that lives in your browser.
 * It persists even when you close the tab. Not fancy, but reliable.
 */
const STORAGE_KEY = 'calendar-between-worlds-events';

/**
 * Load all events from localStorage.
 *
 * @returns Array of calendar events, or empty array if none exist
 */
export function loadEvents(): CalendarEvent[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    // If localStorage is corrupted or unavailable, start fresh
    // It's like when your save file gets corrupted in a game
    console.error('Failed to load events from storage:', error);
    return [];
  }
}

/**
 * Save all events to localStorage.
 *
 * @param events - The complete array of events to save
 */
export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    // localStorage can fail if the browser is in private mode
    // or if storage is full (5MB limit typically)
    console.error('Failed to save events to storage:', error);
  }
}

// =============================================================================
// EVENT CREATION - Adding New Events
// =============================================================================

/**
 * Generate a unique ID for an event.
 *
 * Uses timestamp + random string - not cryptographically secure,
 * but plenty good enough for a personal calendar app.
 * It's like rolling a d10000 - collisions are theoretically possible
 * but you'll never see one in practice.
 */
function generateId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new event anchored to an EARTH date.
 *
 * Use this for:
 * - Real-world birthdays (Erica's birthday)
 * - Writing sessions (when you actually wrote something)
 * - Real-world anniversaries
 *
 * The Faerûn date is calculated automatically from the Earth date.
 *
 * @param title - Event name
 * @param type - Type of event
 * @param earthDate - The anchor date (Earth side)
 * @param description - Optional notes
 * @param recurring - Does this happen every year?
 */
export function createEarthAnchoredEvent(
  title: string,
  type: CalendarEvent['type'],
  earthDate: Date,
  description?: string,
  recurring: boolean = false
): CalendarEvent {
  // Convert the Earth date to Faerûn
  const faerunDate = earthToFaerun(earthDate);

  // Build the day of year for the Faerûn side
  let faerunDayOfYear: number;
  if (faerunDate.festival) {
    // It's a festival day - find its day number
    faerunDayOfYear = faerunDateToDayNumber(faerunDate.festival, undefined, faerunDate.year);
  } else {
    faerunDayOfYear = faerunDateToDayNumber(faerunDate.month!, faerunDate.day, faerunDate.year);
  }

  // Format the date using LOCAL time, not UTC!
  // .toISOString() converts to UTC which can shift the day backwards
  // depending on timezone. We want to preserve the user's LOCAL date.
  // It's like when you tell someone your birthday is March 5th - you mean
  // March 5th WHERE YOU ARE, not March 5th in Greenwich, England.
  const year = earthDate.getFullYear();
  const month = String(earthDate.getMonth() + 1).padStart(2, '0');
  const day = String(earthDate.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${day}`;

  return {
    id: generateId(),
    title,
    type,
    anchorCalendar: 'earth',
    earthDate: localDateString,
    faerunYear: faerunDate.year,
    faerunDayOfYear,
    description,
    recurring,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Create a new event anchored to a FAERÛN date.
 *
 * Use this for:
 * - Faerûnian birthdays (Gale's birthday is 3 Eleasis, 1453)
 * - Story events (things that happen in the narrative)
 * - Faerûnian holidays
 *
 * The Earth date is calculated automatically from the Faerûn date.
 *
 * @param title - Event name
 * @param type - Type of event
 * @param faerunYear - The DR year
 * @param monthOrFestival - Month name or festival name
 * @param day - Day of month (undefined for festivals)
 * @param description - Optional notes
 * @param recurring - Does this happen every year?
 */
export function createFaerunAnchoredEvent(
  title: string,
  type: CalendarEvent['type'],
  faerunYear: number,
  monthOrFestival: string,
  day?: number,
  description?: string,
  recurring: boolean = false
): CalendarEvent {
  // Calculate the day of year
  const faerunDayOfYear = faerunDateToDayNumber(monthOrFestival, day, faerunYear);

  // Convert to Earth date
  const earthDate = faerunToEarth(faerunYear, faerunDayOfYear);

  // Same timezone fix as above - use LOCAL date, not UTC
  const year = earthDate.getFullYear();
  const month = String(earthDate.getMonth() + 1).padStart(2, '0');
  const dayNum = String(earthDate.getDate()).padStart(2, '0');
  const localDateString = `${year}-${month}-${dayNum}`;

  return {
    id: generateId(),
    title,
    type,
    anchorCalendar: 'faerun',
    earthDate: localDateString,
    faerunYear,
    faerunDayOfYear,
    description,
    recurring,
    createdAt: new Date().toISOString(),
  };
}

// =============================================================================
// CRUD OPERATIONS - The Standard Dungeon Actions
// =============================================================================

/**
 * Add a new event and save to storage.
 *
 * @param event - The event to add
 */
export function addEvent(event: CalendarEvent): void {
  const events = loadEvents();
  events.push(event);
  saveEvents(events);
}

/**
 * Get an event by ID.
 *
 * @param id - The event ID
 * @returns The event, or undefined if not found
 */
export function getEvent(id: string): CalendarEvent | undefined {
  const events = loadEvents();
  return events.find(e => e.id === id);
}

/**
 * Update an existing event.
 *
 * @param id - The event ID to update
 * @param updates - Partial event with fields to update
 */
export function updateEvent(id: string, updates: Partial<CalendarEvent>): void {
  const events = loadEvents();
  const index = events.findIndex(e => e.id === id);

  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    saveEvents(events);
  }
}

/**
 * Delete an event by ID.
 *
 * @param id - The event ID to delete
 */
export function deleteEvent(id: string): void {
  const events = loadEvents();
  const filtered = events.filter(e => e.id !== id);
  saveEvents(filtered);
}

// =============================================================================
// QUERY FUNCTIONS - Finding Events
// =============================================================================

/**
 * Get all events.
 *
 * @returns All stored events
 */
export function getAllEvents(): CalendarEvent[] {
  return loadEvents();
}

/**
 * Get events for a specific Earth date.
 *
 * Handles both recurring and non-recurring events.
 * For recurring events, it matches the month and day regardless of year.
 *
 * @param date - The Earth date to check
 * @returns Events on that date
 */
export function getEventsForEarthDate(date: Date): CalendarEvent[] {
  const events = loadEvents();
  // Use LOCAL date formatting, not toISOString() which converts to UTC!
  // The toISOString() trap is how March 5 becomes March 4 in the Americas.
  const targetDateStr = formatLocalDateString(date);
  const targetMonth = date.getMonth();
  const targetDay = date.getDate();

  return events.filter(event => {
    // Exact date match (for non-recurring or same-year recurring)
    if (event.earthDate === targetDateStr) {
      return true;
    }

    // Recurring event match (same month and day, any year)
    if (event.recurring) {
      // CRITICAL: Use parseLocalDate, not new Date(string)!
      // new Date("1984-03-05") parses as UTC midnight = wrong day in local time
      const eventDate = parseLocalDate(event.earthDate);
      return eventDate.getMonth() === targetMonth &&
             eventDate.getDate() === targetDay;
    }

    return false;
  });
}

/**
 * Get events for a specific Faerûnian date.
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year
 * @returns Events on that date
 */
export function getEventsForFaerunDate(year: number, dayOfYear: number): CalendarEvent[] {
  const events = loadEvents();

  return events.filter(event => {
    // Exact match
    if (event.faerunYear === year && event.faerunDayOfYear === dayOfYear) {
      return true;
    }

    // Recurring match (same day of year, any year)
    if (event.recurring && event.faerunDayOfYear === dayOfYear) {
      return true;
    }

    return false;
  });
}

/**
 * Get events by type.
 *
 * @param type - The event type to filter by
 * @returns Events of that type
 */
export function getEventsByType(type: CalendarEvent['type']): CalendarEvent[] {
  const events = loadEvents();
  return events.filter(e => e.type === type);
}

// =============================================================================
// DISPLAY HELPERS - Getting Event Info for UI
// =============================================================================

/**
 * Get the Earth date for an event, properly calculated.
 *
 * For Earth-anchored events, this is just the stored date.
 * For Faerûn-anchored events, this recalculates based on the year
 * (useful for recurring events).
 *
 * @param event - The event
 * @param forYear - Optional: calculate for a specific Earth year
 * @returns The Earth date
 */
export function getEventEarthDate(event: CalendarEvent, forYear?: number): Date {
  if (event.anchorCalendar === 'earth') {
    // Use parseLocalDate to avoid the UTC midnight trap!
    const date = parseLocalDate(event.earthDate);
    if (forYear) {
      date.setFullYear(forYear);
    }
    return date;
  } else {
    // Faerûn-anchored: calculate Earth date
    const targetYear = forYear
      ? event.faerunYear + (forYear - parseLocalDate(event.earthDate).getFullYear())
      : event.faerunYear;
    return faerunToEarth(targetYear, event.faerunDayOfYear);
  }
}

/**
 * Get the Faerûn date info for an event.
 *
 * @param event - The event
 * @param forYear - Optional: calculate for a specific Faerûn year
 * @returns The Faerûnian date object
 */
export function getEventFaerunDate(event: CalendarEvent, forYear?: number) {
  const targetYear = forYear || event.faerunYear;
  return dayNumberToFaerunDate(event.faerunDayOfYear, targetYear);
}

// =============================================================================
// PRESET EVENTS - The Founding Documents
// =============================================================================

/**
 * Create the default events for Erica & Gale's timeline.
 *
 * Call this once to set up the initial birthdays.
 */
export function createDefaultEvents(): void {
  const events = loadEvents();

  // Only create if we don't already have events
  if (events.length > 0) {
    return;
  }

  // Gale's Birthday - Anchored to Faerûn
  // 3 Eleasis, 1453 DR
  const galesBirthday = createFaerunAnchoredEvent(
    "Gale's Birthday",
    'birthday',
    1453,
    'Eleasis',
    3,
    'Born in Waterdeep during Highsun',
    true // Recurring annually
  );

  addEvent(galesBirthday);

  // You can add Erica's birthday too once she provides the date!
  // It would be Earth-anchored:
  // const ericasBirthday = createEarthAnchoredEvent(
  //   "Erica's Birthday",
  //   'birthday',
  //   new Date('1984-03-05'),
  //   'The human behind the magic',
  //   true
  // );
  // addEvent(ericasBirthday);
}
