// =============================================================================
// SELÛNE'S MOON PHASE CALCULATOR
// =============================================================================
//
// Selûne is Toril's moon, and she's MUCH more predictable than Earth's moon.
// Her cycle is exactly 30 days, 10 hours, and 30 minutes (30.4375 days).
//
// This was intentionally designed so that:
// - The moon is roughly full at the start of each month
// - 48 complete cycles = exactly 4 years
// - The phase pattern repeats every 4 years (syncing with Shieldmeet!)
//
// It's like if NASA and a wizard got together to design a moon.
// The wizard was clearly in charge.
//
// =============================================================================

import { MoonPhase } from '../types';
import { isShieldmeetYear } from './calendarService';

// =============================================================================
// THE SACRED NUMBERS OF SELÛNE
// =============================================================================

/**
 * Selûne's synodic period - time between full moons.
 *
 * 30 days + 10 hours + 30 minutes = 30.4375 days
 *
 * This number is beautiful because:
 * - 48 × 30.4375 = 1461 (exactly 4 years including Shieldmeet!)
 * - It's close enough to 30 that full moons align with month starts
 * - It makes calendar math actually pleasant
 *
 * Earth's moon does NOT have these nice properties.
 * Earth's moon is chaotic and unpredictable.
 * Be more like Selûne.
 */
const SELUNE_CYCLE_DAYS = 30.4375;

/**
 * Reference point: Full moon at midnight, Hammer 1, 1372 DR
 *
 * This is from official Forgotten Realms sources.
 * 1372 DR is a Shieldmeet year and a popular campaign start date.
 */
const REFERENCE_YEAR = 1372;
const REFERENCE_DAY = 1; // Hammer 1

/**
 * The eight phases of Selûne.
 *
 * These divide the lunar cycle into 8 equal parts, like pizza slices
 * but for moon-watching. Each phase is roughly 3.8 days.
 *
 * The cycle position is 0-1, where:
 * - 0 = New Moon (invisible)
 * - 0.5 = Full Moon (party time for werewolves)
 * - 1 = Back to New Moon
 */
const MOON_PHASES = [
  { min: 0.000,  max: 0.0625, name: 'New Moon',        emoji: '🌑' },
  { min: 0.0625, max: 0.1875, name: 'Waxing Crescent', emoji: '🌒' },
  { min: 0.1875, max: 0.3125, name: 'First Quarter',   emoji: '🌓' },
  { min: 0.3125, max: 0.4375, name: 'Waxing Gibbous',  emoji: '🌔' },
  { min: 0.4375, max: 0.5625, name: 'Full Moon',       emoji: '🌕' },
  { min: 0.5625, max: 0.6875, name: 'Waning Gibbous',  emoji: '🌖' },
  { min: 0.6875, max: 0.8125, name: 'Last Quarter',    emoji: '🌗' },
  { min: 0.8125, max: 1.0000, name: 'Waning Crescent', emoji: '🌘' },
];

// =============================================================================
// HELPER FUNCTION
// =============================================================================

/**
 * Count days from the reference point (Hammer 1, 1372 DR) to a target date.
 *
 * This is the core calculation - everything else builds on this.
 * It's like calculating XP gained, but for days elapsed.
 *
 * @param year - Target DR year
 * @param dayOfYear - Target day of that year (1-366)
 * @returns Number of days (positive = after reference, negative = before)
 */
function daysSinceReference(year: number, dayOfYear: number): number {
  let totalDays = 0;

  if (year >= REFERENCE_YEAR) {
    // Count forward from 1372
    for (let y = REFERENCE_YEAR; y < year; y++) {
      totalDays += isShieldmeetYear(y) ? 366 : 365;
    }
    totalDays += dayOfYear - REFERENCE_DAY;
  } else {
    // Count backward from 1372
    // This handles dates before 1372 DR (like 1453 is after, but
    // if we ever need older dates, this works)
    for (let y = REFERENCE_YEAR - 1; y >= year; y--) {
      totalDays -= isShieldmeetYear(y) ? 366 : 365;
    }
    totalDays += dayOfYear - REFERENCE_DAY;
  }

  return totalDays;
}

// =============================================================================
// MAIN MOON PHASE FUNCTION
// =============================================================================

/**
 * Calculate Selûne's phase for a given Faerûnian date.
 *
 * This is the main function you'll use. Give it a date in Faerûn,
 * get back everything you need to know about the moon that night.
 *
 * Perfect for:
 * - "Is it a good night for lycanthropes?" (Full moon check)
 * - "Should we do the ritual tonight?" (Various phases matter)
 * - "How romantic is this evening?" (Full moon = very)
 * - "Can I see well enough to sneak?" (New moon = dark)
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year (1-366)
 * @returns Complete moon phase information
 */
export function getSelunPhase(year: number, dayOfYear: number): MoonPhase {
  // Step 1: Count days from our reference point
  const days = daysSinceReference(year, dayOfYear);

  // Step 2: Calculate position in the current lunar cycle
  // This gives us a number from 0 to 1
  let cyclePosition = (days / SELUNE_CYCLE_DAYS) % 1;

  // Handle negative days (dates before 1372)
  // JavaScript's modulo can return negative numbers, which is annoying
  if (cyclePosition < 0) {
    cyclePosition += 1;
  }

  // Step 3: Adjust so that our reference point (full moon) is at 0.5
  // Since the reference is a full moon, we need to shift the cycle
  // Raw position 0 = reference = full moon, but we want 0.5 = full
  // So we add 0.5 and wrap around
  cyclePosition = (cyclePosition + 0.5) % 1;

  // Step 4: Find which phase this falls into
  const phase = MOON_PHASES.find(p =>
    cyclePosition >= p.min && cyclePosition < p.max
  ) || MOON_PHASES[0]; // Default to New Moon if something goes weird

  // Step 5: Calculate illumination percentage
  // This follows a cosine curve - brightest at 0.5 (full), darkest at 0 (new)
  // The math: cos(0) = 1, cos(π) = -1
  // So (1 - cos(position * 2π)) / 2 gives us 0 at position 0, 1 at position 0.5
  const illumination = (1 - Math.cos(cyclePosition * 2 * Math.PI)) / 2;

  // Step 6: Calculate days until next full moon
  // Full moon is at position 0.5
  let positionToFull: number;
  if (cyclePosition <= 0.5) {
    // We're before full moon, so it's ahead of us
    positionToFull = 0.5 - cyclePosition;
  } else {
    // We're past full moon, need to go to next cycle's full
    positionToFull = 1.5 - cyclePosition;
  }
  const daysUntilFull = Math.round(positionToFull * SELUNE_CYCLE_DAYS);

  return {
    name: phase.name,
    emoji: phase.emoji,
    illumination: Math.round(illumination * 100) / 100, // Round to 2 decimal places
    daysUntilFull,
    cyclePosition: Math.round(cyclePosition * 1000) / 1000, // Round to 3 decimal places
  };
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Check if tonight is a full moon (or very close to it).
 *
 * Useful for:
 * - Werewolf warnings
 * - Selûnite holy days
 * - Romantic dinner planning
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year
 * @returns true if the moon is at least 95% full
 */
export function isFullMoon(year: number, dayOfYear: number): boolean {
  const phase = getSelunPhase(year, dayOfYear);
  return phase.illumination >= 0.95;
}

/**
 * Check if tonight is a new moon (or very close to it).
 *
 * Useful for:
 * - Shar worshiper holy days
 * - Stealth missions
 * - Astronomy observations (stars are clearer)
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year
 * @returns true if the moon is at most 5% illuminated
 */
export function isNewMoon(year: number, dayOfYear: number): boolean {
  const phase = getSelunPhase(year, dayOfYear);
  return phase.illumination <= 0.05;
}

/**
 * Get the phase name as a simple string.
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year
 * @returns Just the phase name (e.g., "Waxing Gibbous")
 */
export function getMoonPhaseName(year: number, dayOfYear: number): string {
  return getSelunPhase(year, dayOfYear).name;
}

/**
 * Get the emoji for the current phase.
 *
 * Perfect for UI display - just drop this in and you've got
 * a visual moon indicator.
 *
 * @param year - The DR year
 * @param dayOfYear - The day of that year
 * @returns Moon emoji (🌑🌒🌓🌔🌕🌖🌗🌘)
 */
export function getMoonEmoji(year: number, dayOfYear: number): string {
  return getSelunPhase(year, dayOfYear).emoji;
}
