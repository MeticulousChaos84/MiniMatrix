// =============================================================================
// TYPE DEFINITIONS - The Character Sheets of Our Code
// =============================================================================
//
// In D&D, your character sheet defines what your character CAN do.
// In TypeScript, types define what your data CAN be.
//
// Same energy, really.
//
// =============================================================================

/**
 * A Faerûnian date - could be a regular month day or a festival.
 *
 * Think of this like a character sheet for a date. It has all the
 * stats and info you need to know about that particular day.
 */
export interface FaerunianDate {
  /** The Dale Reckoning year (e.g., 1453, 1495) */
  year: number;

  /** Month name - undefined if it's a festival day */
  month?: string;

  /** Day of the month (1-30) - undefined if it's a festival */
  day?: number;

  /** Festival name - defined only for festival days */
  festival?: string;

  /** The poetic name for the month (e.g., "Highsun" for Eleasis) */
  commonName?: string;

  /** Which season we're in */
  season?: string;

  /** Which tenday (1, 2, or 3) - Faerûn uses 10-day "weeks" */
  tenday?: number;

  /** Day within the tenday (1-10) */
  dayOfTenday?: number;

  /** Whether this year has Shieldmeet */
  isLeapYear: boolean;
}

/**
 * Information about a Faerûnian month.
 *
 * Like the PHB entry for a race - gives you all the basic stats.
 */
export interface MonthInfo {
  /** Official name (e.g., "Eleasis") */
  name: string;

  /** The common/poetic name (e.g., "Highsun") */
  commonName: string;

  /** Always 30 - Harptos was consistent */
  days: number;

  /** Which season this month falls in */
  season: string;
}

/**
 * Entry in the day map - maps day numbers to months/festivals.
 *
 * Think of this like a lookup table - given a day number,
 * what month or festival does it belong to?
 */
export interface DayMapEntry {
  /** First day number in this range */
  start: number;

  /** Last day number in this range */
  end: number;

  /** Is this a month or a festival? */
  type: 'month' | 'festival';

  /** Name of the month or festival */
  name: string;

  /** Index into the MONTHS array (only for months) */
  monthIndex?: number;
}

/**
 * Moon phase information for Selûne.
 *
 * Selûne has a nice 30.4375-day cycle that syncs beautifully
 * with the calendar. Much more elegant than Earth's moon.
 */
export interface MoonPhase {
  /** Phase name (e.g., "Waxing Gibbous") */
  name: string;

  /** Emoji for the phase */
  emoji: string;

  /** How lit up the moon is (0-1) */
  illumination: number;

  /** Days until next full moon */
  daysUntilFull: number;

  /** Position in the cycle (0-1) */
  cyclePosition: number;
}

/**
 * A calendar event - something to track in either world.
 *
 * This is the main data type for birthdays, story events,
 * writing sessions, etc.
 *
 * Key concept: Each event is ANCHORED to one calendar system.
 * - Gale's birthday is anchored to Faerûn (3 Eleasis, 1453)
 * - Erica's birthday is anchored to Earth (March 5, 1984)
 *
 * The app calculates the OTHER calendar's date from the anchor.
 */
export interface CalendarEvent {
  /** Unique ID for the event */
  id: string;

  /** Event title (e.g., "Gale's Birthday") */
  title: string;

  /** What type of event this is */
  type: 'birthday' | 'story' | 'writing' | 'note';

  /**
   * Which calendar system is this event anchored to?
   *
   * - 'earth': The Earth date is the "source of truth"
   *   (e.g., Erica's birthday is March 5, 1984)
   * - 'faerun': The Faerûn date is the "source of truth"
   *   (e.g., Gale's birthday is 3 Eleasis, 1453)
   *
   * The other date is calculated from this anchor.
   */
  anchorCalendar: 'earth' | 'faerun';

  /**
   * The anchor date on Earth.
   * ISO string format (e.g., "1984-03-05")
   *
   * If anchorCalendar is 'earth', this is the source.
   * If anchorCalendar is 'faerun', this is calculated.
   */
  earthDate: string;

  /**
   * The anchor year in Dale Reckoning.
   */
  faerunYear: number;

  /**
   * The anchor day of the Faerûn year (1-366).
   */
  faerunDayOfYear: number;

  /** Optional description or notes */
  description?: string;

  /** Does this event recur every year? */
  recurring: boolean;

  /** When was this event created */
  createdAt: string;
}

/**
 * Full information about a specific day in both calendars.
 *
 * This is what the UI displays - everything you need to know
 * about a particular day in both worlds.
 */
export interface DayInfo {
  /** The Earth date */
  earthDate: Date;

  /** The Faerûnian date */
  faerunDate: FaerunianDate;

  /** Selûne's moon phase */
  moonPhase: MoonPhase;

  /** Any events on this day */
  events: CalendarEvent[];

  /** Is this day today? */
  isToday: boolean;
}

/**
 * App settings and preferences.
 */
export interface AppSettings {
  /** Dark or light mode */
  theme: 'dark' | 'light';

  /** Show the common names for months */
  showCommonNames: boolean;

  /** Show year prophecy names */
  showYearNames: boolean;

  /** Show moon phase on calendar */
  showMoonPhase: boolean;
}
