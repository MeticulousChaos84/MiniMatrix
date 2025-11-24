// =============================================================================
// APP COMPONENT - The Main Hub
// =============================================================================
//
// This is like the main menu of a game - it holds everything together
// and lets you navigate between different views.
//
// Currently we have:
// - Today View: See today's date in both worlds
// - Calendar View: Browse dates (coming soon)
// - Add Event: Track birthdays and events (coming soon)
//
// =============================================================================

import { useState, useEffect } from 'react';
import TodayView from './components/TodayView';
import { createDefaultEvents } from './services/eventService';

/**
 * The main app component.
 *
 * Right now it's simple - just shows the Today view.
 * We'll add navigation tabs later for Calendar and Events.
 */
function App() {
  const [currentView, setCurrentView] = useState<'today' | 'calendar' | 'events'>('today');

  // Set up default events on first load
  // This creates Gale's birthday if it doesn't exist
  useEffect(() => {
    createDefaultEvents();
  }, []);

  return (
    <div className="app">
      {/* Header - The title bar */}
      <header className="app-header">
        <h1>☾ Calendar Between Worlds</h1>
      </header>

      {/* Main content area */}
      <main className="app-main">
        {currentView === 'today' && <TodayView />}
        {currentView === 'calendar' && <div>Calendar view coming soon!</div>}
        {currentView === 'events' && <div>Events view coming soon!</div>}
      </main>

      {/* Navigation tabs */}
      <nav className="app-nav">
        <button
          className={currentView === 'today' ? 'active' : ''}
          onClick={() => setCurrentView('today')}
        >
          Today
        </button>
        <button
          className={currentView === 'calendar' ? 'active' : ''}
          onClick={() => setCurrentView('calendar')}
        >
          Calendar
        </button>
        <button
          className={currentView === 'events' ? 'active' : ''}
          onClick={() => setCurrentView('events')}
        >
          Events
        </button>
      </nav>
    </div>
  );
}

export default App;
