// =============================================================================
// MAIN ENTRY POINT - Where the Magic Begins
// =============================================================================
//
// This is like the title screen of a video game.
// Everything starts here, then branches out into the actual app.
//
// =============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Mount the app to the DOM
// This is the equivalent of "Press Start to Begin"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
