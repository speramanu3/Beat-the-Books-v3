import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import admin utilities for console access
import adminUtils from './utils/adminUtils';

// Make admin utilities available globally
window.adminUtils = adminUtils;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log a message to confirm admin utilities are available
console.log('Admin utilities loaded. Use adminUtils.getApiQuota() or adminUtils.checkApiQuota() in console.');
