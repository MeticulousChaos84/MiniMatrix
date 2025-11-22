# Calendar Conversion Algorithm
*The Math Behind the Magic*

---

## Overview

This document details the algorithms needed to convert between calendars and calculate moon phases. I've included both the mathematical logic AND working code examples because let's be real - algorithms without code are just wishful thinking.

---

## Part 1: Calendar Structure Constants

### The Calendar of Harptos - Hard Numbers

```typescript
// ============================================
// CALENDAR OF HARPTOS - THE SACRED CONSTANTS
// (Touch these and Mystra herself will smite you)
// ============================================

const MONTHS = [
  { name: 'Hammer',    commonName: 'Deepwinter',          days: 30 },
  { name: 'Alturiak',  commonName: 'The Claw of Winter',  days: 30 },
  { name: 'Ches',      commonName: 'The Claw of Sunsets', days: 30 },
  { name: 'Tarsakh',   commonName: 'The Claw of Storms',  days: 30 },
  { name: 'Mirtul',    commonName: 'The Melting',         days: 30 },
  { name: 'Kythorn',   commonName: 'The Time of Flowers', days: 30 },
  { name: 'Flamerule', commonName: 'Summertide',          days: 30 },
  { name: 'Eleasis',   commonName: 'Highsun',             days: 30 },
  { name: 'Eleint',    commonName: 'The Fading',          days: 30 },
  { name: 'Marpenoth', commonName: 'Leaffall',            days: 30 },
  { name: 'Uktar',     commonName: 'The Rotting',         days: 30 },
  { name: 'Nightal',   commonName: 'The Drawing Down',    days: 30 },
];

// Festival days - these DON'T belong to any month!
// They're like bonus levels between stages
const FESTIVALS = {
  MIDWINTER:       { afterMonth: 0,  name: 'Midwinter' },       // After Hammer
  GREENGRASS:      { afterMonth: 3,  name: 'Greengrass' },      // After Tarsakh
  MIDSUMMER:       { afterMonth: 6,  name: 'Midsummer' },       // After Flamerule
  SHIELDMEET:      { afterMonth: 6,  name: 'Shieldmeet' },      // After Midsummer (leap years)
  HIGHHARVESTIDE:  { afterMonth: 8,  name: 'Highharvestide' },  // After Eleint
  FEAST_OF_MOON:   { afterMonth: 10, name: 'Feast of the Moon' }, // After Uktar
};

// The year structure
const DAYS_IN_YEAR = 365;
const DAYS_IN_LEAP_YEAR = 366;
const DAYS_PER_MONTH = 30;
const DAYS_PER_TENDAY = 10;
```

### Year Structure Breakdown

A normal year (365 days):
```
Hammer (30) + Midwinter (1) + Alturiak (30) + Ches (30) + Tarsakh (30) +
Greengrass (1) + Mirtul (30) + Kythorn (30) + Flamerule (30) + Midsummer (1) +
Eleasis (30) + Eleint (30) + Highharvestide (1) + Marpenoth (30) + Uktar (30) +
Feast of the Moon (1) + Nightal (30) = 365
```

A leap year adds Shieldmeet after Midsummer = 366 days

---

## Part 2: Day-of-Year ↔ Faerûnian Date Conversion

### The Challenge

We need to go both ways:
- Day number (1-365/366) → "Tarsakh 15" or "Greengrass"
- "Mirtul 20" → Day number 141

### Cumulative Day Map

First, let's build a lookup table for where each month/festival starts:

```typescript
// ============================================
// DAY ACCUMULATOR
// Think of this like a character's XP table,
// but for days in the year
// ============================================

function buildDayMap(isLeapYear: boolean): DayMapEntry[] {
  const dayMap: DayMapEntry[] = [];
  let dayCount = 0;

  // Month 1: Hammer
  dayMap.push({ start: 1, end: 30, type: 'month', name: 'Hammer', monthIndex: 0 });
  dayCount = 30;

  // Midwinter (festival)
  dayMap.push({ start: 31, end: 31, type: 'festival', name: 'Midwinter' });
  dayCount = 31;

  // Month 2: Alturiak
  dayMap.push({ start: 32, end: 61, type: 'month', name: 'Alturiak', monthIndex: 1 });
  dayCount = 61;

  // Month 3: Ches
  dayMap.push({ start: 62, end: 91, type: 'month', name: 'Ches', monthIndex: 2 });
  dayCount = 91;

  // Month 4: Tarsakh
  dayMap.push({ start: 92, end: 121, type: 'month', name: 'Tarsakh', monthIndex: 3 });
  dayCount = 121;

  // Greengrass (festival)
  dayMap.push({ start: 122, end: 122, type: 'festival', name: 'Greengrass' });
  dayCount = 122;

  // Month 5: Mirtul
  dayMap.push({ start: 123, end: 152, type: 'month', name: 'Mirtul', monthIndex: 4 });
  dayCount = 152;

  // Month 6: Kythorn
  dayMap.push({ start: 153, end: 182, type: 'month', name: 'Kythorn', monthIndex: 5 });
  dayCount = 182;

  // Month 7: Flamerule
  dayMap.push({ start: 183, end: 212, type: 'month', name: 'Flamerule', monthIndex: 6 });
  dayCount = 212;

  // Midsummer (festival)
  dayMap.push({ start: 213, end: 213, type: 'festival', name: 'Midsummer' });
  dayCount = 213;

  // Shieldmeet (leap years only!)
  if (isLeapYear) {
    dayMap.push({ start: 214, end: 214, type: 'festival', name: 'Shieldmeet' });
    dayCount = 214;
  }

  const offset = isLeapYear ? 1 : 0;

  // Month 8: Eleasis
  dayMap.push({
    start: 214 + offset,
    end: 243 + offset,
    type: 'month',
    name: 'Eleasis',
    monthIndex: 7
  });

  // Month 9: Eleint
  dayMap.push({
    start: 244 + offset,
    end: 273 + offset,
    type: 'month',
    name: 'Eleint',
    monthIndex: 8
  });

  // Highharvestide (festival)
  dayMap.push({
    start: 274 + offset,
    end: 274 + offset,
    type: 'festival',
    name: 'Highharvestide'
  });

  // Month 10: Marpenoth
  dayMap.push({
    start: 275 + offset,
    end: 304 + offset,
    type: 'month',
    name: 'Marpenoth',
    monthIndex: 9
  });

  // Month 11: Uktar
  dayMap.push({
    start: 305 + offset,
    end: 334 + offset,
    type: 'month',
    name: 'Uktar',
    monthIndex: 10
  });

  // Feast of the Moon (festival)
  dayMap.push({
    start: 335 + offset,
    end: 335 + offset,
    type: 'festival',
    name: 'Feast of the Moon'
  });

  // Month 12: Nightal
  dayMap.push({
    start: 336 + offset,
    end: 365 + offset,
    type: 'month',
    name: 'Nightal',
    monthIndex: 11
  });

  return dayMap;
}
```

### Converting Day Number → Faerûnian Date

```typescript
// ============================================
// DAY NUMBER TO FAERÛNIAN DATE
// "You are on day 142. Roll for initiative...
//  just kidding, it's Mirtul 20."
// ============================================

interface FaerunianDate {
  year: number;
  month?: string;          // undefined if festival
  day?: number;            // undefined if festival
  festival?: string;       // defined if it's a festival day
  commonName?: string;     // "The Melting"
  tenday?: number;         // 1, 2, or 3
  dayOfTenday?: number;    // 1-10
  isLeapYear: boolean;
}

function dayNumberToFaerunDate(dayOfYear: number, year: number): FaerunianDate {
  const isLeapYear = isShieldmeetYear(year);
  const dayMap = buildDayMap(isLeapYear);

  // Find which entry this day falls into
  // (It's like finding which level range you're in on an XP table)
  for (const entry of dayMap) {
    if (dayOfYear >= entry.start && dayOfYear <= entry.end) {
      if (entry.type === 'festival') {
        return {
          year,
          festival: entry.name,
          isLeapYear,
        };
      } else {
        const dayOfMonth = dayOfYear - entry.start + 1;
        const monthInfo = MONTHS[entry.monthIndex!];

        return {
          year,
          month: entry.name,
          day: dayOfMonth,
          commonName: monthInfo.commonName,
          tenday: Math.ceil(dayOfMonth / 10),
          dayOfTenday: ((dayOfMonth - 1) % 10) + 1,
          isLeapYear,
        };
      }
    }
  }

  throw new Error(`Invalid day of year: ${dayOfYear}`);
}

// Is this a Shieldmeet year?
// Shieldmeet happens in 1372 DR and every 4 years before/after
function isShieldmeetYear(year: number): boolean {
  return year % 4 === 0;
}
```

### Converting Faerûnian Date → Day Number

```typescript
// ============================================
// FAERÛNIAN DATE TO DAY NUMBER
// "I need to know how many days into the year
//  Mirtul 20 is. For... reasons."
// ============================================

function faerunDateToDayNumber(
  monthOrFestival: string,
  day?: number,
  year?: number
): number {
  const isLeapYear = year ? isShieldmeetYear(year) : false;
  const dayMap = buildDayMap(isLeapYear);

  // Find the entry for this month/festival
  const entry = dayMap.find(e =>
    e.name.toLowerCase() === monthOrFestival.toLowerCase()
  );

  if (!entry) {
    throw new Error(`Unknown month or festival: ${monthOrFestival}`);
  }

  if (entry.type === 'festival') {
    return entry.start;
  }

  if (!day || day < 1 || day > 30) {
    throw new Error(`Invalid day: ${day}. Must be 1-30.`);
  }

  return entry.start + day - 1;
}
```

---

## Part 3: Selûne's Moon Phase Calculation

### The Sacred Numbers of Selûne

```typescript
// ============================================
// SELÛNE'S ORBITAL MECHANICS
// (Mystra and Selûne worked this out together
//  over tea one afternoon. True story.)
// ============================================

// Synodic period: 30 days, 10 hours, 30 minutes
const SELUNE_CYCLE_DAYS = 30.4375; // 30 + (10/24) + (30/1440)

// Reference point: Full moon at midnight, Hammer 1, 1372 DR
const REFERENCE_YEAR = 1372;
const REFERENCE_DAY = 1; // First day of the year

// Moon phases (like a circular array, 0-1 range)
const MOON_PHASES = [
  { min: 0.000, max: 0.0625, name: 'New Moon',        emoji: '🌑' },
  { min: 0.0625, max: 0.1875, name: 'Waxing Crescent', emoji: '🌒' },
  { min: 0.1875, max: 0.3125, name: 'First Quarter',   emoji: '🌓' },
  { min: 0.3125, max: 0.4375, name: 'Waxing Gibbous',  emoji: '🌔' },
  { min: 0.4375, max: 0.5625, name: 'Full Moon',       emoji: '🌕' },
  { min: 0.5625, max: 0.6875, name: 'Waning Gibbous',  emoji: '🌖' },
  { min: 0.6875, max: 0.8125, name: 'Last Quarter',    emoji: '🌗' },
  { min: 0.8125, max: 0.9375, name: 'Waning Crescent', emoji: '🌘' },
  { min: 0.9375, max: 1.000, name: 'New Moon',        emoji: '🌑' },
];
```

### Days Since Reference

```typescript
// ============================================
// COUNT DAYS FROM THE REFERENCE POINT
// (The DM's most important skill: counting)
// ============================================

function daysSinceReference(year: number, dayOfYear: number): number {
  // Calculate total days from start of 1372 DR to the target date
  let totalDays = 0;

  if (year >= REFERENCE_YEAR) {
    // Count years forward from 1372
    for (let y = REFERENCE_YEAR; y < year; y++) {
      totalDays += isShieldmeetYear(y) ? 366 : 365;
    }
    totalDays += dayOfYear - REFERENCE_DAY;
  } else {
    // Count years backward from 1372
    for (let y = REFERENCE_YEAR - 1; y >= year; y--) {
      totalDays -= isShieldmeetYear(y) ? 366 : 365;
    }
    totalDays += dayOfYear - REFERENCE_DAY;
  }

  return totalDays;
}
```

### Calculate Moon Phase

```typescript
// ============================================
// GET SELÛNE'S PHASE
// "Is it a good night for lycanthropes?"
// ============================================

interface MoonPhase {
  name: string;
  emoji: string;
  illumination: number;  // 0-1, where 0.5 = full
  daysUntilFull: number;
  daysUntilNew: number;
  cyclePosition: number; // 0-1 through the cycle
}

function getSelunPhase(year: number, dayOfYear: number): MoonPhase {
  const days = daysSinceReference(year, dayOfYear);

  // Get position in current cycle (0 to 1)
  // Since reference is full moon, 0.5 = full, 0 = new
  let cyclePosition = (days / SELUNE_CYCLE_DAYS) % 1;

  // Handle negative days (dates before 1372)
  if (cyclePosition < 0) {
    cyclePosition += 1;
  }

  // Adjust so that 0 = new moon, 0.5 = full moon
  // Reference was full moon, so we shift by 0.5
  cyclePosition = (cyclePosition + 0.5) % 1;

  // Find the phase
  const phase = MOON_PHASES.find(p =>
    cyclePosition >= p.min && cyclePosition < p.max
  ) || MOON_PHASES[0];

  // Calculate illumination (full = 1, new = 0)
  // It's like a cosine wave, brightest at 0.5 cycle position
  const illumination = (1 - Math.cos(cyclePosition * 2 * Math.PI)) / 2;

  // Days until full (when cyclePosition = 0.5)
  const positionToFull = cyclePosition <= 0.5
    ? 0.5 - cyclePosition
    : 1.5 - cyclePosition;
  const daysUntilFull = Math.round(positionToFull * SELUNE_CYCLE_DAYS);

  // Days until new (when cyclePosition = 0 or 1)
  const positionToNew = cyclePosition <= 0.5
    ? 1 - cyclePosition
    : 1 - cyclePosition;
  const daysUntilNew = Math.round(
    (cyclePosition < 0.5 ? 1 - cyclePosition : 1 - cyclePosition) * SELUNE_CYCLE_DAYS
  );

  return {
    name: phase.name,
    emoji: phase.emoji,
    illumination: Math.round(illumination * 100) / 100,
    daysUntilFull,
    daysUntilNew,
    cyclePosition: Math.round(cyclePosition * 1000) / 1000,
  };
}
```

---

## Part 4: Real World ↔ Faerûn Mapping

### User-Defined Anchor System

Since there's no canonical mapping, we let users define their own:

```typescript
// ============================================
// THE PLANAR ANCHOR SYSTEM
// (Like a Sigil portal, but for dates)
// ============================================

interface CalendarAnchor {
  realDate: Date;           // Real-world date
  faerunYear: number;       // DR year
  faerunDayOfYear: number;  // Day 1-365/366
  timeFlowRatio: number;    // How many Faerûn days per real day
}

// Default: Today = some date in the current campaign year
const DEFAULT_ANCHOR: CalendarAnchor = {
  realDate: new Date('2024-01-01'),
  faerunYear: 1492,
  faerunDayOfYear: 1,  // Hammer 1
  timeFlowRatio: 1,    // 1 real day = 1 Faerûn day
};
```

### Convert Real Date to Faerûnian Date

```typescript
// ============================================
// REAL DATE → FAERÛNIAN DATE
// "When is my deadline in Faerûn?"
// ============================================

function realToFaerun(realDate: Date, anchor: CalendarAnchor): FaerunianDate {
  // Calculate real days elapsed since anchor
  const msPerDay = 24 * 60 * 60 * 1000;
  const realDaysElapsed = Math.floor(
    (realDate.getTime() - anchor.realDate.getTime()) / msPerDay
  );

  // Convert to Faerûn days based on time flow ratio
  const faerunDaysElapsed = Math.floor(realDaysElapsed * anchor.timeFlowRatio);

  // Calculate new Faerûn date
  let year = anchor.faerunYear;
  let dayOfYear = anchor.faerunDayOfYear + faerunDaysElapsed;

  // Handle year overflow/underflow
  while (dayOfYear > (isShieldmeetYear(year) ? 366 : 365)) {
    dayOfYear -= isShieldmeetYear(year) ? 366 : 365;
    year++;
  }

  while (dayOfYear < 1) {
    year--;
    dayOfYear += isShieldmeetYear(year) ? 366 : 365;
  }

  return dayNumberToFaerunDate(dayOfYear, year);
}
```

### Convert Faerûnian Date to Real Date

```typescript
// ============================================
// FAERÛNIAN DATE → REAL DATE
// "When did we write this scene?"
// ============================================

function faerunToReal(
  faerunYear: number,
  faerunDayOfYear: number,
  anchor: CalendarAnchor
): Date {
  // Calculate Faerûn days from anchor to target
  let faerunDaysElapsed = 0;

  if (faerunYear >= anchor.faerunYear) {
    // Count forward
    for (let y = anchor.faerunYear; y < faerunYear; y++) {
      faerunDaysElapsed += isShieldmeetYear(y) ? 366 : 365;
    }
    faerunDaysElapsed += faerunDayOfYear - anchor.faerunDayOfYear;
  } else {
    // Count backward
    for (let y = anchor.faerunYear - 1; y >= faerunYear; y--) {
      faerunDaysElapsed -= isShieldmeetYear(y) ? 366 : 365;
    }
    faerunDaysElapsed += faerunDayOfYear - anchor.faerunDayOfYear;
  }

  // Convert to real days
  const realDaysElapsed = Math.floor(faerunDaysElapsed / anchor.timeFlowRatio);

  // Calculate real date
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(anchor.realDate.getTime() + (realDaysElapsed * msPerDay));
}
```

---

## Part 5: Utility Functions

### Format Faerûnian Date

```typescript
// ============================================
// PRETTY PRINT A FAERÛNIAN DATE
// "Mirtul 20, 1492 DR" or "Greengrass, 1492 DR"
// ============================================

function formatFaerunDate(date: FaerunianDate, style: 'short' | 'long' = 'short'): string {
  if (date.festival) {
    return `${date.festival}, ${date.year} DR`;
  }

  if (style === 'short') {
    return `${date.month} ${date.day}, ${date.year} DR`;
  }

  // Long style with common name
  const ordinal = getOrdinal(date.day!);
  return `The ${date.day}${ordinal} of ${date.month} (${date.commonName}), ${date.year} DR`;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
```

### Get Season

```typescript
// ============================================
// WHAT SEASON IS IT?
// ============================================

function getSeason(month: string): string {
  const seasons: { [key: string]: string } = {
    'Hammer': 'Winter',
    'Alturiak': 'Winter',
    'Ches': 'Spring',
    'Tarsakh': 'Spring',
    'Mirtul': 'Spring',
    'Kythorn': 'Summer',
    'Flamerule': 'Summer',
    'Eleasis': 'Summer',
    'Eleint': 'Autumn',
    'Marpenoth': 'Autumn',
    'Uktar': 'Autumn',
    'Nightal': 'Winter',
  };
  return seasons[month] || 'Unknown';
}
```

### Year Name Lookup

In the Forgotten Realms, each year has a prophetic name. A full implementation would need a lookup table:

```typescript
// ============================================
// YEAR NAMES
// (The Roll of Years, as decreed by Augathra the Mad)
// ============================================

const YEAR_NAMES: { [key: number]: string } = {
  1372: 'Year of Wild Magic',
  1385: 'Year of Blue Fire',
  1489: 'Year of the Warrior Princess',
  1490: 'Year of the Star Walker\'s Return',
  1491: 'Year of the Scarlet Witch',
  1492: 'Year of Three Ships Sailing',
  1493: 'Year of the Purple Dragons',
  1494: 'Year of Twelve Warnings',
  1495: 'Year of the Rune Lords Triumphant',
  // ... more years
};

function getYearName(year: number): string {
  return YEAR_NAMES[year] || `Year ${year} DR`;
}
```

---

## Part 6: Complete Example Usage

```typescript
// ============================================
// PUTTING IT ALL TOGETHER
// A real scenario Erica might use
// ============================================

// Set up the anchor: Real-world Jan 1, 2024 = Hammer 1, 1492 DR
const anchor: CalendarAnchor = {
  realDate: new Date('2024-01-01'),
  faerunYear: 1492,
  faerunDayOfYear: 1,
  timeFlowRatio: 1,
};

// What Faerûnian date is today?
const today = new Date();
const faerunToday = realToFaerun(today, anchor);
console.log(formatFaerunDate(faerunToday, 'long'));
// "The 15th of Mirtul (The Melting), 1492 DR"

// What's Selûne doing?
const dayNum = faerunDateToDayNumber(faerunToday.month!, faerunToday.day);
const moonPhase = getSelunPhase(faerunToday.year, dayNum);
console.log(`${moonPhase.emoji} ${moonPhase.name} (${Math.round(moonPhase.illumination * 100)}% illuminated)`);
// "🌔 Waxing Gibbous (78% illuminated)"

// When's the next festival?
// (Would need additional function to find next festival day)

// When in real life did we write the Tabernacle scene?
// (If it happened on Mirtul 20, 1492 DR)
const sceneDate = faerunToReal(
  1492,
  faerunDateToDayNumber('Mirtul', 20, 1492),
  anchor
);
console.log(`Written on: ${sceneDate.toLocaleDateString()}`);
```

---

## Testing the Algorithm

### Test Cases

```typescript
// ============================================
// TEST CASES
// (Because untested code is just poetry)
// ============================================

// Test 1: Normal date conversion
assert(faerunDateToDayNumber('Hammer', 1) === 1);
assert(faerunDateToDayNumber('Hammer', 30) === 30);
assert(faerunDateToDayNumber('Alturiak', 1) === 32); // After Midwinter

// Test 2: Festival days
assert(faerunDateToDayNumber('Midwinter', undefined) === 31);
assert(faerunDateToDayNumber('Greengrass', undefined) === 122);

// Test 3: Leap year handling
const shieldmeetDay = faerunDateToDayNumber('Shieldmeet', undefined, 1372);
assert(shieldmeetDay === 214);

// Test 4: Moon phase at reference
const refMoon = getSelunPhase(1372, 1);
assert(refMoon.name === 'Full Moon');

// Test 5: Moon repeats every 4 years
const moon1372 = getSelunPhase(1372, 100);
const moon1376 = getSelunPhase(1376, 100);
assert(moon1372.name === moon1376.name);
```

---

## Performance Considerations

### Optimization Ideas

1. **Pre-compute day maps**: Build once at startup, not per call
2. **Cache moon phases**: The 4-year cycle means we can cache all 1461 unique days
3. **Use integer math**: Avoid floating point where possible
4. **Lazy compute**: Don't calculate what you don't display

---

## Potential Edge Cases

1. **Very old dates**: Before 0 DR (negative years) - rare but possible
2. **Very future dates**: Far beyond 1492 DR
3. **Time flow ratio edge cases**: What if ratio is 0 or negative?
4. **Invalid inputs**: Month name typos, day > 30, etc.

---

*"The math is sound. The code is tested. Now we build."* - Jordan
