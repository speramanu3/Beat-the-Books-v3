import { getDatabase, ref, get, query, orderByChild, startAt, push, update, onValue, orderByKey, startAfter, limitToFirst } from 'firebase/database';
import { triggerBetAddedEvent } from './betSyncUtils';

/**
 * SyncManager class for handling offline operations and efficient Firebase sync
 */
export class SyncManager {
  constructor() {
    this.pendingOperations = this.loadPendingOperations();
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
  
  /**
   * Handle online status change
   */
  handleOnline = () => {
    console.log('[SyncManager] Device is online, processing pending operations');
    this.isOnline = true;
    this.processPendingOperations();
  }
  
  /**
   * Handle offline status change
   */
  handleOffline = () => {
    console.log('[SyncManager] Device is offline, operations will be queued');
    this.isOnline = false;
  }
  
  /**
   * Load pending operations from localStorage
   * @returns {Array} Array of pending operations
   */
  loadPendingOperations() {
    try {
      const stored = localStorage.getItem('pendingOperations');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[SyncManager] Error loading pending operations:', error);
      return [];
    }
  }
  
  /**
   * Save pending operations to localStorage
   */
  savePendingOperations() {
    try {
      localStorage.setItem('pendingOperations', JSON.stringify(this.pendingOperations));
    } catch (error) {
      console.error('[SyncManager] Error saving pending operations:', error);
    }
  }
  
  /**
   * Add an operation to the queue or execute immediately if online
   * @param {Function} operation - Operation function to execute
   * @param {Object} metadata - Metadata about the operation for offline storage
   */
  addOperation(operation, metadata = {}) {
    if (this.isOnline) {
      return operation();
    }
    
    this.pendingOperations.push({ operation: operation.toString(), metadata, timestamp: Date.now() });
    this.savePendingOperations();
    return Promise.resolve({ offline: true, queued: true });
  }
  
  /**
   * Process all pending operations
   */
  async processPendingOperations() {
    if (!this.isOnline || this.pendingOperations.length === 0) return;
    
    console.log(`[SyncManager] Processing ${this.pendingOperations.length} pending operations`);
    
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];
    
    for (const op of operations) {
      try {
        // This is a simplified version - in a real implementation,
        // you would need a more sophisticated way to serialize/deserialize functions
        console.log(`[SyncManager] Processing operation:`, op.metadata);
        // Execute the operation based on metadata
        await this.executeOperation(op.metadata);
      } catch (error) {
        console.error('[SyncManager] Failed to process operation:', error, op);
        // Re-queue failed operations
        this.pendingOperations.push(op);
      }
    }
    
    this.savePendingOperations();
  }
  
  /**
   * Execute an operation based on metadata
   * @param {Object} metadata - Operation metadata
   */
  async executeOperation(metadata) {
    const db = getDatabase();
    
    switch(metadata.type) {
      case 'saveBet':
        const { userId, bet } = metadata;
        const newBetRef = push(ref(db, `user_bets/${userId}`));
        const betId = newBetRef.key;
        
        const updates = {};
        updates[`user_bets/${userId}/${betId}`] = { ...bet, id: betId };
        
        if (bet.gameId && bet.sportsbook) {
          updates[`user_bet_summaries/${userId}/${bet.gameId}_${bet.sportsbook}`] = {
            betId,
            gameId: bet.gameId,
            sportsbook: bet.sportsbook,
            market: bet.betType || bet.market,
            outcome: bet.team || bet.outcome,
            timestamp: Date.now()
          };
        }
        
        return update(ref(db), updates);
        
      default:
        console.warn('[SyncManager] Unknown operation type:', metadata.type);
        return Promise.resolve();
    }
  }
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create a singleton instance
export const syncManager = new SyncManager();

/**
 * Fetch user bets with efficient caching and pagination
 * @param {string} userId - User ID
 * @param {number} pageSize - Number of bets to fetch per page
 * @param {string} lastKey - Last key for pagination
 * @returns {Promise<Object>} - Bets, last key, and hasMore flag
 */
export const fetchPaginatedUserBets = async (userId, pageSize = 50, lastKey = null) => {
  if (!userId) return { bets: [], lastKey: null, hasMore: false };
  
  const db = getDatabase();
  let betsQuery;
  
  if (lastKey) {
    betsQuery = query(
      ref(db, `user_bets/${userId}`),
      orderByKey(),
      startAfter(lastKey),
      limitToFirst(pageSize)
    );
  } else {
    betsQuery = query(
      ref(db, `user_bets/${userId}`),
      orderByKey(),
      limitToFirst(pageSize)
    );
  }
  
  try {
    const snapshot = await get(betsQuery);
    
    if (!snapshot.exists()) {
      return { bets: [], lastKey: null, hasMore: false };
    }
    
    const betsData = snapshot.val();
    const bets = Object.entries(betsData).map(([key, value]) => ({ id: key, ...value }));
    
    return {
      bets,
      lastKey: bets.length > 0 ? bets[bets.length - 1].id : null,
      hasMore: bets.length === pageSize
    };
  } catch (error) {
    console.error('[syncUtils] Error fetching paginated bets:', error);
    return { bets: [], lastKey: null, hasMore: false, error };
  }
};

/**
 * Set up a real-time listener for recent user bets
 * @param {string} userId - User ID
 * @param {Function} onUpdate - Callback when bets are updated
 * @returns {Function} - Unsubscribe function
 */
export const setupUserBetsListener = (userId, onUpdate) => {
  if (!userId) return () => {};
  
  const db = getDatabase();
  
  // Only listen to recent bets (last 24 hours)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentBetsQuery = query(
    ref(db, `user_bets/${userId}`),
    orderByChild('timestamp'),
    startAt(oneDayAgo)
  );
  
  // Set up a single listener
  const unsubscribe = onValue(recentBetsQuery, (snapshot) => {
    if (snapshot.exists()) {
      const betsData = snapshot.val();
      const betsArray = Object.values(betsData);
      onUpdate(betsArray);
    } else {
      onUpdate([]);
    }
  });
  
  return unsubscribe;
};

/**
 * Check if a bet exists using the summary (efficient read)
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @param {string} bookmakerKey - Bookmaker key
 * @param {string} market - Market
 * @param {string} outcome - Outcome
 * @param {string} point - Point
 * @returns {Promise<boolean>} - Whether the bet exists
 */
export const checkBetExists = async (userId, gameId, bookmakerKey, market, outcome, point) => {
  if (!userId || !gameId || !bookmakerKey || !market || !outcome) {
    // Only log errors occasionally to reduce noise
    if (Math.random() < 0.05) {
      console.log('[syncUtils] checkBetExists: Missing required parameters', { 
        userId: userId ? 'present' : 'missing',
        gameId: gameId ? 'present' : 'missing',
        bookmakerKey: bookmakerKey ? 'present' : 'missing',
        market: market ? 'present' : 'missing',
        outcome: outcome ? 'present' : 'missing'
      });
    }
    return false;
  }
  
  // Normalize the bookmaker key
  const normalizedBookmakerKey = normalizeBookmakerKey(bookmakerKey);
  
  // Debug logging - only log 1% of checks to reduce console noise
  if (Math.random() < 0.01) {
    console.log(`[syncUtils] Checking if bet exists with normalized key: ${normalizedBookmakerKey}`);
  }
  
  try {
    const db = getDatabase();
    const summaryKey = `${gameId}_${normalizedBookmakerKey}`;
    const summaryRef = ref(db, `user_bet_summaries/${userId}/${summaryKey}`);
    const snapshot = await get(summaryRef);
    
    const exists = snapshot.exists();
    // Debug logging - only log 1% of checks to reduce console noise
    if (Math.random() < 0.01) {
      console.log(`[syncUtils] Bet existence check result for ${summaryKey}: ${exists}`);
    }
    return exists;
  } catch (error) {
    console.error('[syncUtils] Error checking bet existence:', error);
    return false;
  }
};

/**
 * Helper function to normalize bookmaker keys for consistent comparison
 * @param {string} key - Bookmaker key to normalize
 * @returns {string} - Normalized bookmaker key
 */
export const normalizeBookmakerKey = (key) => {
  if (!key) return '';
  // Convert to lowercase for consistent comparison
  const lowerKey = key.toLowerCase();
  // Handle specific cases where keys might differ between data sources
  if (lowerKey === 'lowvig') return 'lowvig';
  if (lowerKey === 'lowvig.ag') return 'lowvig';
  if (lowerKey === 'betway') return 'betway';
  if (lowerKey === 'betway.ag') return 'betway';
  return lowerKey;
};

/**
 * Save a bet with denormalized data for efficient reads
 * @param {string} userId - User ID
 * @param {Object} bet - Bet data
 * @returns {Promise<Object>} - Result of the save operation
 */
export const saveBet = async (userId, bet) => {
  if (!userId) {
    console.error('[syncUtils] Cannot save bet: No user ID provided');
    return { success: false, error: 'No user ID provided' };
  }
  
  try {
    console.log('[syncUtils] Original bet data received:', bet);
    
    // Sanitize the bet data to remove any undefined values
    const sanitizedBet = {};
    
    // Only include defined values in the sanitized bet
    Object.keys(bet).forEach(key => {
      if (bet[key] !== undefined) {
        // If it's an object, recursively sanitize it
        if (typeof bet[key] === 'object' && bet[key] !== null) {
          const sanitizedNestedObj = {};
          Object.keys(bet[key]).forEach(nestedKey => {
            if (bet[key][nestedKey] !== undefined) {
              sanitizedNestedObj[nestedKey] = bet[key][nestedKey];
            }
          });
          sanitizedBet[key] = sanitizedNestedObj;
        } else {
          sanitizedBet[key] = bet[key];
        }
      }
    });
    
    // Handle bookmaker key variations
    // If sportsbook is missing but bookmakerKey exists, use that instead
    if (!sanitizedBet.sportsbook && sanitizedBet.bookmakerKey) {
      console.log('[syncUtils] Using bookmakerKey as sportsbook:', sanitizedBet.bookmakerKey);
      sanitizedBet.sportsbook = sanitizedBet.bookmakerKey;
    }
    
    // Ensure required fields exist
    if (!sanitizedBet.gameId) {
      console.error('[syncUtils] Cannot save bet: Missing gameId');
      return { success: false, error: 'Missing gameId in bet data' };
    }
    
    if (!sanitizedBet.sportsbook) {
      console.error('[syncUtils] Cannot save bet: Missing sportsbook', sanitizedBet);
      return { success: false, error: 'Missing sportsbook in bet data' };
    }
    
    // Normalize the sportsbook key for consistent storage
    const originalSportsbook = sanitizedBet.sportsbook;
    sanitizedBet.sportsbook = normalizeBookmakerKey(sanitizedBet.sportsbook);
    console.log(`[syncUtils] Normalized sportsbook key: ${originalSportsbook} -> ${sanitizedBet.sportsbook}`);
    
    // Store the original bookmaker title if available
    if (!sanitizedBet.bookmakerTitle && sanitizedBet.sportsbook) {
      sanitizedBet.bookmakerTitle = sanitizedBet.bookmaker || sanitizedBet.sportsbook;
    }
    
    console.log('[syncUtils] Sanitized bet data:', sanitizedBet);
    
    return syncManager.addOperation(
      () => {
        const db = getDatabase();
        const newBetRef = push(ref(db, `user_bets/${userId}`));
        const betId = newBetRef.key;
        
        const updates = {};
        updates[`user_bets/${userId}/${betId}`] = { ...sanitizedBet, id: betId };
        
        if (sanitizedBet.gameId && sanitizedBet.sportsbook) {
          // Use normalized sportsbook key for the summary key
          const summaryKey = `${sanitizedBet.gameId}_${sanitizedBet.sportsbook}`;
          console.log(`[syncUtils] Creating bet summary with key: ${summaryKey}`);
          
          // Create a comprehensive summary that includes all possible matching fields
          // Create a comprehensive bet summary with all fields needed by BetTracker
          const betSummary = {
            betId,
            gameId: sanitizedBet.gameId,
            sportsbook: sanitizedBet.sportsbook, // Already normalized above
            bookmakerKey: sanitizedBet.sportsbook, // For backward compatibility
            bookmakerTitle: sanitizedBet.bookmakerTitle || sanitizedBet.bookmaker || sanitizedBet.sportsbook,
            market: sanitizedBet.betType || sanitizedBet.market,
            betType: sanitizedBet.betType || sanitizedBet.market, // For backward compatibility
            outcome: sanitizedBet.team || sanitizedBet.outcome,
            team: sanitizedBet.team || sanitizedBet.outcome, // For backward compatibility
            point: sanitizedBet.point !== undefined ? sanitizedBet.point : null,
            timestamp: Date.now(),
            // Add additional fields that are important for display in BetTracker
            odds: sanitizedBet.odds,
            units: sanitizedBet.units || '1',
            result: sanitizedBet.result || 'pending',
            // Handle date formats consistently
            gameDate: sanitizedBet.gameDate || sanitizedBet.commenceTime || new Date().toISOString(),
            // Add line information if available
            line: sanitizedBet.line || sanitizedBet.point || null
          };
          
          // If we have team information, add it to the summary
          if (sanitizedBet.homeTeam && sanitizedBet.awayTeam) {
            betSummary.homeTeam = sanitizedBet.homeTeam;
            betSummary.awayTeam = sanitizedBet.awayTeam;
            betSummary.teams = `${sanitizedBet.awayTeam} @ ${sanitizedBet.homeTeam}`;
          } else if (sanitizedBet.teams) {
            betSummary.teams = sanitizedBet.teams;
          }
          
          // Ensure we have all required fields for BetTracker display
          if (!betSummary.teams && betSummary.homeTeam && betSummary.awayTeam) {
            betSummary.teams = `${betSummary.awayTeam} @ ${betSummary.homeTeam}`;
          }
          
          // Make sure we have units for the bet
          if (!betSummary.units) {
            betSummary.units = sanitizedBet.amount || sanitizedBet.units || '1';
          }
          
          // Make sure we have a valid date
          if (!betSummary.gameDate) {
            betSummary.gameDate = new Date().toISOString();
          }
          
          // Log the complete bet summary
          console.log(`[syncUtils] Complete bet summary for ${summaryKey}:`, betSummary);
          
          updates[`user_bet_summaries/${userId}/${summaryKey}`] = betSummary;
        }
        
        // Return a promise that will also trigger the betAdded event after successful update
        return update(ref(db), updates).then(() => {
          // Trigger the betAdded event to notify other components
          console.log('[syncUtils] Database updated, triggering betAdded event');
          triggerBetAddedEvent(sanitizedBet);
          return true;
        });
      },
      { type: 'saveBet', userId, bet: sanitizedBet }
    );
  } catch (error) {
    console.error('[syncUtils] Error saving bet:', error);
    return { success: false, error: error.message };
  }
};
