// =============================================================================
// EVENTS VIEW - The Chronicle Manager
// =============================================================================
//
// This is where you manage all the important dates in your two-world life:
// - Birthdays (both Earth-dwellers and Faerûnians)
// - Story events (when cool narrative stuff happens)
// - Writing sessions (when you actually sat down and wrote)
// - Random notes (whatever else you want to track)
//
// The key feature here is DUAL ANCHORING:
// - Earth-anchored: "Erica's birthday is March 5" → Faerûn date calculated
// - Faerûn-anchored: "Gale's birthday is 3 Eleasis" → Earth date calculated
//
// It's like having two address books that auto-translate between languages.
//
// =============================================================================

import { useState, useEffect } from 'react';
import {
  getAllEvents,
  deleteEvent,
  addEvent,
  createEarthAnchoredEvent,
  createFaerunAnchoredEvent,
  getEventFaerunDate,
} from '../services/eventService';
import {
  formatFaerunDate,
  MONTHS,
} from '../services/calendarService';
import { CalendarEvent } from '../types';

// =============================================================================
// COMPONENT - The Event Manager
// =============================================================================

function EventsView() {
  // =========================================================================
  // STATE - What We're Tracking
  // =========================================================================

  // All events from storage
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Is the "Add Event" form visible?
  const [showAddForm, setShowAddForm] = useState(false);

  // =========================================================================
  // EFFECTS - Setup on Mount
  // =========================================================================

  // Load events when component mounts
  useEffect(() => {
    refreshEvents();
  }, []);

  /**
   * Reload events from storage.
   * Call this after any add/delete operation.
   */
  const refreshEvents = () => {
    setEvents(getAllEvents());
  };

  // =========================================================================
  // EVENT HANDLERS - User Actions
  // =========================================================================

  /**
   * Delete an event after confirmation.
   * We ask first because deleting is forever!
   * (Well, not really, it's just localStorage, but still.)
   */
  const handleDelete = (event: CalendarEvent) => {
    if (window.confirm(`Delete "${event.title}"? This cannot be undone!`)) {
      deleteEvent(event.id);
      refreshEvents();
    }
  };

  /**
   * Called when a new event is added from the form.
   */
  const handleEventAdded = () => {
    refreshEvents();
    setShowAddForm(false);
  };

  // =========================================================================
  // RENDER - The Visual Output
  // =========================================================================

  // Group events by type for nicer display
  const eventsByType = events.reduce((acc, event) => {
    if (!acc[event.type]) {
      acc[event.type] = [];
    }
    acc[event.type].push(event);
    return acc;
  }, {} as { [key: string]: CalendarEvent[] });

  // Type labels with emojis because we're fancy like that
  const typeLabels: { [key: string]: string } = {
    birthday: '🎂 Birthdays',
    story: '📖 Story Events',
    writing: '✍️ Writing Sessions',
    note: '📝 Notes',
  };

  return (
    <div className="events-view">
      <div className="events-header">
        <h2>Events & Important Dates</h2>
        <button
          className="add-event-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Event'}
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <AddEventForm onEventAdded={handleEventAdded} onCancel={() => setShowAddForm(false)} />
      )}

      {/* Events List */}
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events yet!</p>
          <p>Click "Add Event" to create your first one.</p>
          <p className="hint">
            Pro tip: Anchor Faerûnian character birthdays to the Faerûn calendar,
            and real-world stuff to Earth!
          </p>
        </div>
      ) : (
        <div className="events-list">
          {Object.keys(typeLabels).map(type => {
            const typeEvents = eventsByType[type];
            if (!typeEvents || typeEvents.length === 0) return null;

            return (
              <div key={type} className="event-group">
                <h3>{typeLabels[type]}</h3>
                {typeEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onDelete={() => handleDelete(event)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT - Event Card
// =============================================================================

/**
 * A single event in the list.
 *
 * Shows both dates, which one is the anchor, and has a delete button.
 * Like a character sheet, but for a date.
 */
function EventCard({
  event,
  onDelete,
}: {
  event: CalendarEvent;
  onDelete: () => void;
}) {
  const faerunDate = getEventFaerunDate(event);
  const earthDate = new Date(event.earthDate);

  const earthFormatted = earthDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const faerunFormatted = formatFaerunDate(faerunDate, 'short');

  return (
    <div className="event-card">
      <div className="event-info">
        <div className="event-title">
          {event.title}
          {event.recurring && <span className="recurring-badge" title="Recurring">↻</span>}
        </div>

        <div className="event-dates">
          <div className={`date-row ${event.anchorCalendar === 'earth' ? 'is-anchor' : ''}`}>
            <span className="date-label">Earth:</span>
            <span className="date-value">{earthFormatted}</span>
            {event.anchorCalendar === 'earth' && <span className="anchor-badge">⚓</span>}
          </div>
          <div className={`date-row ${event.anchorCalendar === 'faerun' ? 'is-anchor' : ''}`}>
            <span className="date-label">Faerûn:</span>
            <span className="date-value">{faerunFormatted}</span>
            {event.anchorCalendar === 'faerun' && <span className="anchor-badge">⚓</span>}
          </div>
        </div>

        {event.description && (
          <div className="event-description">{event.description}</div>
        )}
      </div>

      <button className="delete-btn" onClick={onDelete} title="Delete Event">
        🗑️
      </button>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT - Add Event Form
// =============================================================================

/**
 * The form for adding a new event.
 *
 * This is where the dual-anchor magic happens. You pick which calendar
 * to anchor to, fill in the date, and the other side gets calculated.
 *
 * It's like filling out a character creation form, but for a calendar event.
 */
function AddEventForm({
  onEventAdded,
  onCancel,
}: {
  onEventAdded: () => void;
  onCancel: () => void;
}) {
  // =========================================================================
  // FORM STATE - All The Fields
  // =========================================================================

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('birthday');
  const [anchorCalendar, setAnchorCalendar] = useState<'earth' | 'faerun'>('earth');
  const [recurring, setRecurring] = useState(true);
  const [description, setDescription] = useState('');

  // Earth date fields
  const [earthDate, setEarthDate] = useState('');

  // Faerûn date fields
  const [faerunYear, setFaerunYear] = useState('1453');
  const [faerunMonth, setFaerunMonth] = useState('Hammer');
  const [faerunDay, setFaerunDay] = useState('1');

  // Validation error
  const [error, setError] = useState('');

  // =========================================================================
  // FORM HANDLERS
  // =========================================================================

  /**
   * Handle form submission.
   * Validates inputs and creates the event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (!title.trim()) {
      setError('Please enter a title for the event.');
      return;
    }

    try {
      let newEvent: CalendarEvent;

      if (anchorCalendar === 'earth') {
        // Create Earth-anchored event
        if (!earthDate) {
          setError('Please select an Earth date.');
          return;
        }
        // Parse the date string manually to avoid timezone parsing chaos
        // The HTML date input gives us "YYYY-MM-DD" format
        // Using new Date("1984-03-05T00:00:00") can be interpreted as UTC
        // in some browsers, which shifts the day. This way is explicit.
        // We use NOON (12:00) to avoid DST issues - see calendarService ANCHOR comment.
        const [yearNum, monthNum, dayNum] = earthDate.split('-').map(Number);
        const date = new Date(yearNum, monthNum - 1, dayNum, 12, 0, 0); // NOON local time
        newEvent = createEarthAnchoredEvent(
          title.trim(),
          type,
          date,
          description.trim() || undefined,
          recurring
        );
      } else {
        // Create Faerûn-anchored event
        const year = parseInt(faerunYear);
        const day = parseInt(faerunDay);

        if (isNaN(year) || year < 1 || year > 2000) {
          setError('Please enter a valid Faerûn year (1-2000).');
          return;
        }

        if (isNaN(day) || day < 1 || day > 30) {
          setError('Please enter a valid day (1-30).');
          return;
        }

        newEvent = createFaerunAnchoredEvent(
          title.trim(),
          type,
          year,
          faerunMonth,
          day,
          description.trim() || undefined,
          recurring
        );
      }

      // Save and notify parent
      addEvent(newEvent);
      onEventAdded();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong!');
    }
  };

  // =========================================================================
  // RENDER - The Form UI
  // =========================================================================

  return (
    <form className="add-event-form" onSubmit={handleSubmit}>
      <h3>Add New Event</h3>

      {error && <div className="form-error">{error}</div>}

      {/* Title */}
      <div className="form-group">
        <label htmlFor="event-title">Event Title</label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g., Gale's Birthday"
          autoFocus
        />
      </div>

      {/* Event Type */}
      <div className="form-group">
        <label htmlFor="event-type">Type</label>
        <select
          id="event-type"
          value={type}
          onChange={e => setType(e.target.value as CalendarEvent['type'])}
        >
          <option value="birthday">🎂 Birthday</option>
          <option value="story">📖 Story Event</option>
          <option value="writing">✍️ Writing Session</option>
          <option value="note">📝 Note</option>
        </select>
      </div>

      {/* Anchor Calendar Toggle */}
      <div className="form-group">
        <label>Anchor Calendar</label>
        <div className="anchor-toggle">
          <button
            type="button"
            className={anchorCalendar === 'earth' ? 'active' : ''}
            onClick={() => setAnchorCalendar('earth')}
          >
            🌍 Earth
          </button>
          <button
            type="button"
            className={anchorCalendar === 'faerun' ? 'active' : ''}
            onClick={() => setAnchorCalendar('faerun')}
          >
            ⚔️ Faerûn
          </button>
        </div>
        <div className="anchor-hint">
          {anchorCalendar === 'earth'
            ? 'The Earth date is the "true" date. Faerûn date will be calculated.'
            : 'The Faerûn date is the "true" date. Earth date will be calculated.'}
        </div>
      </div>

      {/* Date Input - Conditional based on anchor */}
      {anchorCalendar === 'earth' ? (
        <div className="form-group">
          <label htmlFor="earth-date">Earth Date</label>
          <input
            id="earth-date"
            type="date"
            value={earthDate}
            onChange={e => setEarthDate(e.target.value)}
          />
        </div>
      ) : (
        <div className="form-group faerun-date-group">
          <label>Faerûn Date</label>
          <div className="faerun-date-inputs">
            <input
              type="number"
              value={faerunDay}
              onChange={e => setFaerunDay(e.target.value)}
              min="1"
              max="30"
              placeholder="Day"
              className="day-input"
            />
            <select
              value={faerunMonth}
              onChange={e => setFaerunMonth(e.target.value)}
              className="month-input"
            >
              {MONTHS.map(month => (
                <option key={month.name} value={month.name}>
                  {month.name} ({month.commonName})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={faerunYear}
              onChange={e => setFaerunYear(e.target.value)}
              min="1"
              max="2000"
              placeholder="Year"
              className="year-input"
            />
            <span className="dr-suffix">DR</span>
          </div>
        </div>
      )}

      {/* Recurring Toggle */}
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={recurring}
            onChange={e => setRecurring(e.target.checked)}
          />
          Recurring (happens every year)
        </label>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="event-description">Description (optional)</label>
        <textarea
          id="event-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Any notes about this event..."
          rows={3}
        />
      </div>

      {/* Form Buttons */}
      <div className="form-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Add Event
        </button>
      </div>
    </form>
  );
}

export default EventsView;
