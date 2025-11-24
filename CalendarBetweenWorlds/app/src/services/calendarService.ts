// =============================================================================
// CALENDAR BETWEEN WORLDS - The Planar Conversion Engine
// =============================================================================
//
// Welcome, traveler! You've found the sacred scrolls of temporal translation.
// This service converts between Earth dates and Faerûnian dates, because
// apparently keeping track of time across dimensions wasn't complicated enough.
//
// Think of this like a TARDIS, but instead of being bigger on the inside,
// it's more accurate on the inside. And it doesn't make the whooshy noise.
// (Though you're welcome to make the noise yourself while using it.)
//
// For Erica & Gale's timeline:
// - Anchor: Hammer 1, 1453 DR = January 2, 1983
// - This means 2025 = 1495 DR
// - Gale's birthday: 3 Eleasis, 1453 DR
//
// =============================================================================

import { FaerunianDate, DayMapEntry, MonthInfo } from '../types';

// =============================================================================
// THE SACRED CONSTANTS OF HARPTOS
// (Mess with these and Mystra will personally smite your codebase)
// =============================================================================

/**
 * The twelve months of the Calendar of Harptos.
 * Each month has exactly 30 days - unlike Earth's chaotic "some have 31,
 * some have 30, February is just doing its own thing" nonsense.
 *
 * It's like if someone looked at the Gregorian calendar and said
 * "What if we made this NOT feel like it was designed by a committee
 * of drunk monks?" And thus, Harptos was born.
 */
export const MONTHS: MonthInfo[] = [
  { name: 'Hammer',    commonName: 'Deepwinter',          days: 30, season: 'Winter' },
  { name: 'Alturiak',  commonName: 'The Claw of Winter',  days: 30, season: 'Winter' },
  { name: 'Ches',      commonName: 'The Claw of Sunsets', days: 30, season: 'Spring' },
  { name: 'Tarsakh',   commonName: 'The Claw of Storms',  days: 30, season: 'Spring' },
  { name: 'Mirtul',    commonName: 'The Melting',         days: 30, season: 'Spring' },
  { name: 'Kythorn',   commonName: 'The Time of Flowers', days: 30, season: 'Summer' },
  { name: 'Flamerule', commonName: 'Summertide',          days: 30, season: 'Summer' },
  { name: 'Eleasis',   commonName: 'Highsun',             days: 30, season: 'Summer' },
  { name: 'Eleint',    commonName: 'The Fading',          days: 30, season: 'Autumn' },
  { name: 'Marpenoth', commonName: 'Leaffall',            days: 30, season: 'Autumn' },
  { name: 'Uktar',     commonName: 'The Rotting',         days: 30, season: 'Autumn' },
  { name: 'Nightal',   commonName: 'The Drawing Down',    days: 30, season: 'Winter' },
];

/**
 * Festival days - the bonus levels of the Faerûnian calendar!
 * These are intercalary days that don't belong to any month.
 * They just... exist. Between months. Like interstitial ads,
 * but actually fun and you don't want to skip them.
 */
export const FESTIVALS = [
  { name: 'Midwinter',       afterMonth: 0,  description: 'Nobles renew alliances, everyone survives winter together' },
  { name: 'Greengrass',      afterMonth: 3,  description: 'Spring festival, flowers, hope springs eternal' },
  { name: 'Midsummer',       afterMonth: 6,  description: 'Festival of love and music - gods ensure good weather!' },
  { name: 'Highharvestide',  afterMonth: 8,  description: 'Harvest celebration, last chance to travel before winter' },
  { name: 'Feast of the Moon', afterMonth: 10, description: 'Honoring the dead, remembrance' },
];

// =============================================================================
// THE ANCHOR POINT - Where Our Two Worlds Connect
// =============================================================================

/**
 * THE CANONICAL ANCHOR
 *
 * This is where we've mathematically aligned the planes.
 * It's like the Standing Stone in the Dalelands, but for time.
 *
 * Why January 2, 1983?
 * - 1452 DR was a Shieldmeet year (366 days)
 * - 1982 was NOT a leap year (365 days)
 * - This means Midwinter 1452 = January 1, 1983
 * - So Hammer 1, 1453 = January 2, 1983
 *
 * It's like when you're syncing audio and video - you need that one
 * perfect moment where they line up, then everything else follows.
 * This is our clapper board moment. *CLAP*
 */
export const ANCHOR = {
  // Using explicit numbers creates LOCAL midnight, not UTC!
  // new Date('1983-01-02T00:00:00') can be interpreted as UTC midnight,
  // which is actually the previous evening in US timezones.
  // new Date(year, month, day) is always local. Month is 0-indexed.
  realDate: new Date(1983, 0, 2), // January 2, 1983 local time
  faerunYear: 1453,
  faerunDayOfYear: 1, // Hammer 1
};

// =============================================================================
// HELPER FUNCTIONS - The Supporting Cast
// =============================================================================

/**
 * Is this year a Shieldmeet year in Faerûn?
 *
 * Shieldmeet is like leap year's cooler fantasy cousin.
 * It happens every 4 years when the year is divisible by 4.
 *
 * Fun fact: Shieldmeet is traditionally a day for tournaments,
 * treaty-making, and "plain speaking between rulers and subjects."
 * Basically medieval Renaissance Faire meets UN summit.
 *
 * @param year - The DR year to check
 * @returns true if you should prep for tournaments and diplomacy
 */
export function isShieldmeetYear(year: number): boolean {
  // Simple divisibility check - no weird century exceptions like Earth has
  // Faerûnian wizards apparently made better calendars than Pope Gregory
  return year % 4 === 0;
}

/**
 * Is this year a leap year on Earth?
 *
 * Earth's leap year rules, because apparently we like pain:
 * - Divisible by 4? Leap year!
 * - But divisible by 100? NOT a leap year!
 * - But divisible by 400? YES a leap year again!
 *
 * It's like the rules were written by a lawyer who was paid by the word.
 *
 * @param year - The Earth year to check
 * @returns true if February gets its bonus day
 */
export function isLeapYear(year: number): boolean {
  // I'm not making this up - this is actually how it works
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * How many days are in this Faerûnian year?
 *
 * Normal year: 365 days (12 months × 30 days + 5 festivals)
 * Shieldmeet year: 366 days (add Shieldmeet after Midsummer)
 *
 * @param year - The DR year
 * @returns 365 or 366, depending on Shieldmeet
 */
export function daysInFaerunYear(year: number): number {
  return isShieldmeetYear(year) ? 366 : 365;
}

/**
 * How many days are in this Earth year?
 *
 * @param year - The Earth year
 * @returns 365 or 366, depending on leap year
 */
export function daysInEarthYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

// =============================================================================
// DAY MAP BUILDER - Creating the Calendar's Road Map
// =============================================================================

/**
 * Builds a complete map of where each month and festival falls in the year.
 *
 * Think of this like a level select screen for the year - it tells you
 * exactly which day number corresponds to which month or festival.
 *
 * For example, in a non-Shieldmeet year:
 * - Days 1-30: Hammer
 * - Day 31: Midwinter (festival)
 * - Days 32-61: Alturiak
 * - etc.
 *
 * It's basically creating a "legend" for the calendar, like the key
 * on a D&D dungeon map that tells you what all the symbols mean.
 *
 * @param isLeapYear - Whether this is a Shieldmeet year
 * @returns Array of day ranges and what they correspond to
 */
export function buildDayMap(isLeapYear: boolean): DayMapEntry[] {
  const dayMap: DayMapEntry[] = [];
  let currentDay = 1;

  // Process each month and any festivals that come after it
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const month = MONTHS[monthIndex];

    // Add the month itself (always 30 days, bless Harptos)
    dayMap.push({
      start: currentDay,
      end: currentDay + 29,
      type: 'month',
      name: month.name,
      monthIndex,
    });
    currentDay += 30;

    // Check if there's a festival after this month
    // It's like checking for bonus content after each level
    const festival = FESTIVALS.find(f => f.afterMonth === monthIndex);
    if (festival) {
      dayMap.push({
        start: currentDay,
        end: currentDay,
        type: 'festival',
        name: festival.name,
      });
      currentDay += 1;

      // Special case: Shieldmeet comes right after Midsummer
      // It's like the secret bonus level that only unlocks every 4 years
      if (festival.name === 'Midsummer' && isLeapYear) {
        dayMap.push({
          start: currentDay,
          end: currentDay,
          type: 'festival',
          name: 'Shieldmeet',
        });
        currentDay += 1;
      }
    }
  }

  return dayMap;
}

// =============================================================================
// CORE CONVERSION FUNCTIONS - The Main Event
// =============================================================================

/**
 * Convert a day-of-year number to a proper Faerûnian date.
 *
 * This is like translating "day 216" into "3 Eleasis" - much more
 * useful when you're trying to tell someone when Gale's birthday is.
 *
 * "When's your birthday?"
 * "Day 216!"
 * "..."
 *
 * vs.
 *
 * "When's your birthday?"
 * "3 Eleasis, during Highsun"
 * "Oh nice, summer baby!"
 *
 * @param dayOfYear - The day number (1-365 or 1-366)
 * @param year - The DR year
 * @returns A proper Faerûnian date object with all the trimmings
 */
export function dayNumberToFaerunDate(dayOfYear: number, year: number): FaerunianDate {
  const isLeap = isShieldmeetYear(year);
  const dayMap = buildDayMap(isLeap);

  // Find which month/festival this day falls into
  // It's like a binary search but we're just iterating because
  // there's only like 17 entries and premature optimization is the root of all evil
  for (const entry of dayMap) {
    if (dayOfYear >= entry.start && dayOfYear <= entry.end) {
      if (entry.type === 'festival') {
        // It's a festival day! Party time!
        return {
          year,
          festival: entry.name,
          isLeapYear: isLeap,
        };
      } else {
        // Regular month day
        const dayOfMonth = dayOfYear - entry.start + 1;
        const monthInfo = MONTHS[entry.monthIndex!];

        return {
          year,
          month: entry.name,
          day: dayOfMonth,
          commonName: monthInfo.commonName,
          season: monthInfo.season,
          tenday: Math.ceil(dayOfMonth / 10), // Which 10-day "week"
          dayOfTenday: ((dayOfMonth - 1) % 10) + 1, // Day within that tenday
          isLeapYear: isLeap,
        };
      }
    }
  }

  // If we get here, something has gone terribly wrong
  // Like dividing by zero, but for calendars
  throw new Error(`Invalid day of year: ${dayOfYear}. That's not how calendars work!`);
}

/**
 * Convert a Faerûnian date (month + day or festival) to day-of-year number.
 *
 * The reverse of the above function. Like Ctrl+Z for date conversion.
 *
 * @param monthOrFestival - Month name (e.g., "Eleasis") or festival name
 * @param day - Day of month (1-30), or undefined for festivals
 * @param year - The DR year (needed to know if Shieldmeet exists)
 * @returns The day number (1-365 or 1-366)
 */
export function faerunDateToDayNumber(
  monthOrFestival: string,
  day?: number,
  year: number = 1453
): number {
  const isLeap = isShieldmeetYear(year);
  const dayMap = buildDayMap(isLeap);

  // Find the matching entry
  const entry = dayMap.find(e =>
    e.name.toLowerCase() === monthOrFestival.toLowerCase()
  );

  if (!entry) {
    throw new Error(`Unknown month or festival: "${monthOrFestival}". Did you mean "Eleasis"?`);
  }

  if (entry.type === 'festival') {
    return entry.start;
  }

  // Validate the day number
  if (!day || day < 1 || day > 30) {
    throw new Error(`Invalid day: ${day}. Faerûnian months have exactly 30 days. No exceptions!`);
  }

  return entry.start + day - 1;
}

// =============================================================================
// CROSS-CALENDAR CONVERSION - The Real Magic
// =============================================================================

/**
 * Convert an Earth date to a Faerûnian date.
 *
 * This is the main spell - the reason this whole service exists.
 * Give it a Date object from Earth, get back what day it is in Faerûn.
 *
 * It works by:
 * 1. Counting days from the Earth date to our anchor point
 * 2. Adding/subtracting those days in Faerûn
 * 3. Converting the result to a proper Faerûnian date
 *
 * The drift between leap years and Shieldmeet is handled automatically.
 * That's the beauty of counting raw days - the math just works.
 *
 * @param earthDate - A JavaScript Date object
 * @returns The corresponding Faerûnian date
 */
export function earthToFaerun(earthDate: Date): FaerunianDate {
  // Step 1: Count days between the Earth date and our anchor
  // We use milliseconds because JavaScript dates are weird like that
  const msPerDay = 24 * 60 * 60 * 1000;
  const anchorTime = ANCHOR.realDate.getTime();
  const targetTime = earthDate.getTime();

  // This gives us positive numbers for dates after the anchor,
  // negative for dates before. Like coordinates on a number line.
  const daysDifference = Math.floor((targetTime - anchorTime) / msPerDay);

  // Step 2: Apply this offset to our Faerûn anchor point
  let faerunYear = ANCHOR.faerunYear;
  let faerunDayOfYear = ANCHOR.faerunDayOfYear + daysDifference;

  // Step 3: Handle year overflow (going forward in time)
  // If dayOfYear > days in year, we've rolled over to next year
  while (faerunDayOfYear > daysInFaerunYear(faerunYear)) {
    faerunDayOfYear -= daysInFaerunYear(faerunYear);
    faerunYear++;
  }

  // Step 4: Handle year underflow (going backward in time)
  // If dayOfYear < 1, we've rolled back to previous year
  while (faerunDayOfYear < 1) {
    faerunYear--;
    faerunDayOfYear += daysInFaerunYear(faerunYear);
  }

  // Step 5: Convert to proper date format
  return dayNumberToFaerunDate(faerunDayOfYear, faerunYear);
}

/**
 * Convert a Faerûnian date to an Earth date.
 *
 * The reverse spell - going from Faerûn to Earth.
 * Useful for answering questions like "When in the real world
 * was Gale's birthday?"
 *
 * @param faerunYear - The DR year
 * @param faerunDayOfYear - The day number in that year
 * @returns A JavaScript Date object for Earth
 */
export function faerunToEarth(faerunYear: number, faerunDayOfYear: number): Date {
  // Step 1: Count days from our Faerûn anchor to the target date
  let daysDifference = 0;

  if (faerunYear >= ANCHOR.faerunYear) {
    // Going forward from anchor
    for (let y = ANCHOR.faerunYear; y < faerunYear; y++) {
      daysDifference += daysInFaerunYear(y);
    }
    daysDifference += faerunDayOfYear - ANCHOR.faerunDayOfYear;
  } else {
    // Going backward from anchor
    for (let y = ANCHOR.faerunYear - 1; y >= faerunYear; y--) {
      daysDifference -= daysInFaerunYear(y);
    }
    daysDifference += faerunDayOfYear - ANCHOR.faerunDayOfYear;
  }

  // Step 2: Apply this offset to our Earth anchor
  const msPerDay = 24 * 60 * 60 * 1000;
  const resultTime = ANCHOR.realDate.getTime() + (daysDifference * msPerDay);

  return new Date(resultTime);
}

// =============================================================================
// FORMATTING FUNCTIONS - Making It Pretty
// =============================================================================

/**
 * Format a Faerûnian date as a nice readable string.
 *
 * Examples:
 * - Short: "3 Eleasis, 1453 DR"
 * - Long: "The 3rd of Eleasis (Highsun), 1453 DR"
 * - Festival: "Midsummer, 1453 DR"
 *
 * @param date - The Faerûnian date to format
 * @param style - 'short' or 'long' format
 * @returns A nicely formatted string
 */
export function formatFaerunDate(
  date: FaerunianDate,
  style: 'short' | 'long' = 'short'
): string {
  // Festival days are special - they don't have a day number
  if (date.festival) {
    return `${date.festival}, ${date.year} DR`;
  }

  if (style === 'short') {
    return `${date.day} ${date.month}, ${date.year} DR`;
  }

  // Long format with all the fancy bits
  const ordinal = getOrdinal(date.day!);
  return `The ${date.day}${ordinal} of ${date.month} (${date.commonName}), ${date.year} DR`;
}

/**
 * Get the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 *
 * English is weird. "First, second, third... fourth?"
 * At least it's not as bad as Welsh numbers.
 *
 * @param n - The number
 * @returns The ordinal suffix
 */
function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = n % 100;

  // 11, 12, 13 are special cases (eleventh, twelfth, thirteenth)
  // because English just has to be difficult
  if (value >= 11 && value <= 13) {
    return 'th';
  }

  return suffixes[value % 10] || 'th';
}

// =============================================================================
// YEAR NAME LOOKUP - The Prophecy Table
// =============================================================================

/**
 * Each year in the Forgotten Realms has a prophetic name.
 * These were decreed by Augathra the Mad (great name for a prophet).
 *
 * This is a partial list - there are HUNDREDS of these.
 * Feel free to add more as needed!
 */
const YEAR_NAMES: { [key: number]: string } = {
  1453: 'Year of the Remembering Stones',
  1454: 'Year of the Emerald Sun',
  1455: 'Year of the Duskblade',
  1456: 'Year of the Drow',
  1489: 'Year of the Warrior Princess',
  1490: 'Year of the Star Walker\'s Return',
  1491: 'Year of the Scarlet Witch',
  1492: 'Year of Three Ships Sailing',
  1493: 'Year of the Purple Dragons',
  1494: 'Year of Twelve Warnings',
  1495: 'Year of the Rune Lords Triumphant',
};

/**
 * Get the prophetic name for a year.
 *
 * @param year - The DR year
 * @returns The year name, or a fallback if unknown
 */
export function getYearName(year: number): string {
  return YEAR_NAMES[year] || `Year ${year} DR`;
}

// =============================================================================
// UTILITY EXPORTS
// =============================================================================

/**
 * Get today's date in both calendars.
 *
 * The main thing you probably want when opening the app.
 * "What's today in both worlds?"
 */
export function getToday(): { earth: Date; faerun: FaerunianDate } {
  const earth = new Date();
  const faerun = earthToFaerun(earth);
  return { earth, faerun };
}

/**
 * Calculate what day of the Earth year a Date is.
 *
 * @param date - The date to check
 * @returns Day number 1-365/366
 */
export function getEarthDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
