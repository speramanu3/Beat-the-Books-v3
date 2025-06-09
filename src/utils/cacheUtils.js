/**
 * Cache utility for reducing Firebase read operations
 * Creates a cache with time-to-live (TTL) functionality
 */
export const createCache = (ttlMinutes = 5) => {
  const cache = new Map();
  
  return {
    /**
     * Get an item from the cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached data or null if expired/not found
     */
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
      }
      
      return item.data;
    },
    
    /**
     * Set an item in the cache with expiration
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    set: (key, data) => {
      const expiry = Date.now() + (ttlMinutes * 60 * 1000);
      cache.set(key, { data, expiry });
    },
    
    /**
     * Invalidate a specific cache entry
     * @param {string} key - Cache key to invalidate
     */
    invalidate: (key) => cache.delete(key),
    
    /**
     * Clear the entire cache
     */
    clear: () => cache.clear()
  };
};

/**
 * Throttle function to limit the frequency of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Activity tracker to detect user activity/inactivity
 * @param {number} inactivityThreshold - Time in ms to consider user inactive
 * @param {Function} onActiveChange - Callback when activity state changes
 * @returns {Function} - Cleanup function
 */
export const setupActivityTracking = (inactivityThreshold = 5 * 60 * 1000, onActiveChange) => {
  let userActive = true;
  let inactivityTimer;
  
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    
    if (!userActive) {
      userActive = true;
      onActiveChange && onActiveChange(true);
    }
    
    inactivityTimer = setTimeout(() => {
      userActive = false;
      onActiveChange && onActiveChange(false);
    }, inactivityThreshold);
  };
  
  // Track user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });
  
  // Initial setup
  resetTimer();
  
  // Return cleanup function
  return () => {
    events.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
    clearTimeout(inactivityTimer);
  };
};
