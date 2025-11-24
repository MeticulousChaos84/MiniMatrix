// =============================================================================
// CALENDAR VIEW - The Map of Two Worlds
// =============================================================================
//
// This is the main calendar grid - think of it like the map screen in a game.
// You can see the whole month at a glance, navigate forward/backward in time,
// and see both Earth and Faerûn dates for every day.
//
// It's like having two maps overlaid on each other - one of the Sword Coast,
// one of... wherever you live. Both showing the same territory (time) but
// with different labels.
//
// Pro tip: Click on any day to see the full details!
//
// =============================================================================

import { useState } from 'react';
import {
  earthToFaerun,
  formatFaerunDate,
  getYearName,
  faerunDateToDayNumber,
} from '../services/calendarService';
import { getEventsForEarthDate } from '../services/eventService';
import { getSelunPhase } from '../services/moonService';
import { FaerunianDate } from '../types';

// =============================================================================
// COMPONENT - The Visual Representation
// =============================================================================

/**
 * CalendarView - Browse through time in style!
 *
 * Like flipping through a really fancy day planner, except this one
 * shows you the date in two different dimensions simultaneously.
 * Gandalf would be impressed. Maybe.
 */
function CalendarView() {
  // =========================================================================
  // STATE - What We're Tracking
  // =========================================================================

  // The current month we're viewing (default to today's month)
  // Using Earth dates as the "navigation anchor" since that's what we're used to
  const [viewDate, setViewDate] = useState(new Date());

  // Selected day for showing details (null = no selection)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // =========================================================================
  // CALENDAR MATH - Building the Grid
  // =========================================================================

  /**
   * Get all the days we need to display for this month.
   *
   * This includes:
   * - Empty slots for days before the 1st (if month doesn't start on Sunday)
   * - All the actual days of the month
   * - Empty slots to fill out the last week
   *
   * It's like building a dungeon map - you need the whole grid even if
   * some squares are empty walls.
   */
  const buildMonthGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month - what day of the week is it?
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

    // How many days in this month?
    // JavaScript trick: day 0 of NEXT month = last day of THIS month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build the array of day cells
    const days: (Date | null)[] = [];

    // Leading empty cells (before the 1st)
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    // Trailing empty cells (to complete the grid)
    // We want complete weeks (7 cells per row)
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  };

  // =========================================================================
  // NAVIGATION - Moving Through Time
  // =========================================================================

  /**
   * Go to the previous month.
   * Time travel, but boring.
   */
  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    setSelectedDate(null); // Clear selection when navigating
  };

  /**
   * Go to the next month.
   * Still time travel, still boring.
   */
  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  /**
   * Jump back to today.
   * The "I'm lost, take me home" button.
   */
  const goToToday = () => {
    setViewDate(new Date());
    setSelectedDate(new Date());
  };

  // =========================================================================
  // HELPERS - Utility Functions
  // =========================================================================

  /**
   * Check if a date is today.
   * Used to highlight the current day on the grid.
   */
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  /**
   * Check if a date is the currently selected one.
   */
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  /**
   * Format the Faerûn date for display in the calendar cell.
   * Keep it short - we don't have much space!
   */
  const formatCellFaerun = (faerunDate: FaerunianDate): string => {
    if (faerunDate.festival) {
      // For festivals, show abbreviated name
      const festivalAbbrevs: { [key: string]: string } = {
        'Midwinter': 'Mid',
        'Greengrass': 'Grn',
        'Midsummer': 'Sum',
        'Shieldmeet': 'Shd',
        'Highharvestide': 'Hrv',
        'Feast of the Moon': 'Moo',
      };
      return festivalAbbrevs[faerunDate.festival] || faerunDate.festival.substring(0, 3);
    }
    // Show day number and month abbreviation
    return `${faerunDate.day}`;
  };

  // =========================================================================
  // RENDER TIME - The Visual Output
  // =========================================================================

  const monthGrid = buildMonthGrid();

  // Get the Faerûn date for the first of this Earth month (for the header)
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const faerunStart = earthToFaerun(firstOfMonth);

  // Earth month/year for the header
  const earthMonthYear = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Day of week headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-view">
      {/* Navigation Header */}
      <div className="calendar-nav">
        <button onClick={prevMonth} className="nav-btn" title="Previous Month">
          ◀
        </button>

        <div className="calendar-title">
          <div className="earth-title">{earthMonthYear}</div>
          <div className="faerun-title">
            {faerunStart.month || faerunStart.festival}, {faerunStart.year} DR
          </div>
        </div>

        <button onClick={nextMonth} className="nav-btn" title="Next Month">
          ▶
        </button>
      </div>

      {/* Today Button */}
      <div className="calendar-controls">
        <button onClick={goToToday} className="today-btn">
          ⊙ Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="calendar-header-cell">
            {day}
          </div>
        ))}

        {/* Day cells */}
        {monthGrid.map((date, index) => {
          if (!date) {
            // Empty cell
            return <div key={`empty-${index}`} className="calendar-cell empty" />;
          }

          const faerunDate = earthToFaerun(date);
          const events = getEventsForEarthDate(date);
          const hasEvents = events.length > 0;
          const isFestival = !!faerunDate.festival;

          // Build CSS classes
          const cellClasses = [
            'calendar-cell',
            isToday(date) ? 'is-today' : '',
            isSelected(date) ? 'is-selected' : '',
            hasEvents ? 'has-events' : '',
            isFestival ? 'is-festival' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={date.toISOString()}
              className={cellClasses}
              onClick={() => setSelectedDate(date)}
            >
              <div className="cell-earth-date">{date.getDate()}</div>
              <div className="cell-faerun-date">
                {formatCellFaerun(faerunDate)}
                {/* Show month change indicator */}
                {faerunDate.day === 1 && faerunDate.month && (
                  <span className="month-indicator">
                    {faerunDate.month.substring(0, 3)}
                  </span>
                )}
              </div>
              {hasEvents && <div className="event-indicator">●</div>}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="day-details">
          <SelectedDayDetails date={selectedDate} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT - Selected Day Details Panel
// =============================================================================

/**
 * Shows all the juicy details for a selected day.
 *
 * Like clicking on a map marker and getting the full tooltip.
 */
function SelectedDayDetails({ date }: { date: Date }) {
  const faerunDate = earthToFaerun(date);
  const events = getEventsForEarthDate(date);

  // Calculate Faerûn day of year for moon
  let faerunDayOfYear: number;
  if (faerunDate.festival) {
    faerunDayOfYear = faerunDateToDayNumber(faerunDate.festival, undefined, faerunDate.year);
  } else {
    faerunDayOfYear = faerunDateToDayNumber(faerunDate.month!, faerunDate.day, faerunDate.year);
  }

  const moonPhase = getSelunPhase(faerunDate.year, faerunDayOfYear);

  return (
    <div className="selected-day-content">
      <h3>
        {date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </h3>

      <div className="faerun-detail">
        <strong>{formatFaerunDate(faerunDate, 'long')}</strong>
        <div className="year-name">{getYearName(faerunDate.year)}</div>
      </div>

      <div className="moon-detail">
        <span className="moon-emoji">{moonPhase.emoji}</span>
        <span>{moonPhase.name}</span>
        <span className="moon-pct">({Math.round(moonPhase.illumination * 100)}% lit)</span>
      </div>

      {faerunDate.season && !faerunDate.festival && (
        <div className="season-detail">
          {faerunDate.season} • Tenday {faerunDate.tenday}, Day {faerunDate.dayOfTenday}
        </div>
      )}

      {events.length > 0 && (
        <div className="events-detail">
          <h4>Events</h4>
          <ul>
            {events.map(event => (
              <li key={event.id}>
                <span className="event-type-badge">{event.type}</span>
                {event.title}
                {event.recurring && <span className="recurring-badge">↻</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
