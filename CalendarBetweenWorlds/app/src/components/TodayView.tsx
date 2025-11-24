// =============================================================================
// TODAY VIEW - The Main Attraction
// =============================================================================
//
// This is what you see when you open the app - today's date in both worlds.
// It's like those split-screen moments in movies where you see two characters
// in different locations at the same time.
//
// Shows:
// - Earth date (the boring one you already know)
// - Faerûnian date (the cool one you're here for)
// - Moon phase (because Selûne is always watching)
// - Any events today
//
// =============================================================================

// React is imported automatically by Vite's React plugin
import {
  getToday,
  formatFaerunDate,
  getYearName,
  faerunDateToDayNumber,
} from '../services/calendarService';
import { getSelunPhase } from '../services/moonService';
import { getEventsForEarthDate } from '../services/eventService';

/**
 * The Today View component.
 *
 * Shows both dates side by side like a planar portal.
 * This is the main thing Erica will look at daily.
 */
function TodayView() {
  // Get today's info in both calendars
  const { earth, faerun } = getToday();

  // Get the moon phase
  let moonPhase;
  if (faerun.festival) {
    // Festival day - need to find its day number
    const dayNum = faerunDateToDayNumber(faerun.festival, undefined, faerun.year);
    moonPhase = getSelunPhase(faerun.year, dayNum);
  } else {
    const dayNum = faerunDateToDayNumber(faerun.month!, faerun.day, faerun.year);
    moonPhase = getSelunPhase(faerun.year, dayNum);
  }

  // Get any events for today
  const todayEvents = getEventsForEarthDate(earth);

  // Format the Earth date nicely
  const earthDateStr = earth.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get the year name if we have one
  const yearName = getYearName(faerun.year);

  return (
    <div className="today-view">
      {/* The Hero Section - Both Dates */}
      <div className="dual-date-display">
        {/* Earth Side */}
        <div className="earth-side">
          <div className="calendar-label">EARTH</div>
          <div className="date-primary">{earthDateStr}</div>
        </div>

        {/* Divider */}
        <div className="divider">
          <span className="divider-symbol">⟷</span>
        </div>

        {/* Faerûn Side */}
        <div className="faerun-side">
          <div className="calendar-label">FAERÛN</div>
          <div className="date-primary">
            {formatFaerunDate(faerun, 'short')}
          </div>
          {faerun.commonName && (
            <div className="date-secondary">"{faerun.commonName}"</div>
          )}
          <div className="year-name">{yearName}</div>
        </div>
      </div>

      {/* Moon Phase */}
      <div className="moon-section">
        <div className="moon-emoji">{moonPhase.emoji}</div>
        <div className="moon-info">
          <div className="moon-name">{moonPhase.name}</div>
          <div className="moon-details">
            {Math.round(moonPhase.illumination * 100)}% illuminated
            {moonPhase.daysUntilFull > 0 && moonPhase.daysUntilFull < 15 && (
              <span> • Full in {moonPhase.daysUntilFull} days</span>
            )}
          </div>
        </div>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="events-section">
          <h3>Today's Events</h3>
          <ul className="events-list">
            {todayEvents.map(event => (
              <li key={event.id} className={`event-item event-${event.type}`}>
                <span className="event-icon">
                  {event.type === 'birthday' && '🎂'}
                  {event.type === 'story' && '📖'}
                  {event.type === 'writing' && '✍️'}
                  {event.type === 'note' && '📝'}
                </span>
                <span className="event-title">{event.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Season & Tenday Info */}
      {faerun.season && (
        <div className="extra-info">
          <span className="season">
            {faerun.season === 'Winter' && '❄️'}
            {faerun.season === 'Spring' && '🌱'}
            {faerun.season === 'Summer' && '☀️'}
            {faerun.season === 'Autumn' && '🍂'}
            {' '}{faerun.season}
          </span>
          {faerun.tenday && (
            <span className="tenday">
              Tenday {faerun.tenday}, Day {faerun.dayOfTenday}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default TodayView;
