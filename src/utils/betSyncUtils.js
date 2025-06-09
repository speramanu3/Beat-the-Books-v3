// betSyncUtils.js
// Utility functions for synchronizing bet data between components

/**
 * Trigger a bet added event to notify other components
 * @param {Object} betData - Data about the bet that was added
 */
export const triggerBetAddedEvent = (betData) => {
  // Create a custom event with bet details
  const betAddedEvent = new CustomEvent('betAdded', {
    detail: {
      gameId: betData.gameId,
      sportsbook: betData.sportsbook || betData.bookmakerKey,
      bookmakerKey: betData.bookmakerKey || betData.sportsbook,
      market: betData.market || betData.betType,
      outcome: betData.outcome || betData.team,
      point: betData.point || betData.line,
      timestamp: Date.now()
    }
  });
  
  console.log('[betSyncUtils] Triggering betAdded event with data:', betAddedEvent.detail);
  window.dispatchEvent(betAddedEvent);
};

/**
 * Add a listener for bet added events
 * @param {Function} callback - Function to call when a bet is added
 * @returns {Function} - Function to remove the listener
 */
export const addBetAddedListener = (callback) => {
  const handleBetAdded = (event) => {
    console.log('[betSyncUtils] Received betAdded event:', event.detail);
    callback(event.detail);
  };
  
  window.addEventListener('betAdded', handleBetAdded);
  
  // Return a function to remove the listener
  return () => {
    window.removeEventListener('betAdded', handleBetAdded);
  };
};

/**
 * Get a unique key for a bet based on its game ID and sportsbook
 * @param {Object} betData - Bet data containing gameId and sportsbook
 * @returns {String} - Unique key for the bet
 */
export const getBetKey = (betData) => {
  const gameId = betData.gameId;
  const sportsbook = betData.sportsbook || betData.bookmakerKey;
  
  if (!gameId || !sportsbook) {
    console.error('[betSyncUtils] Missing gameId or sportsbook in betData:', betData);
    return null;
  }
  
  return `${gameId}_${sportsbook}`;
};

/**
 * Sync checked bets that aren't properly saved in Firebase
 * This function is used to reconcile UI state (checkmarks) with the database
 * @param {Array} checkedBets - Array of bet data from the UI that shows as checked
 * @param {Array} savedBets - Array of bets already saved in Firebase
 * @param {String} userId - User ID to save bets for
 * @returns {Promise<Object>} - Result of the sync operation
 */
export const syncCheckedBets = async (checkedBets, savedBets, userId) => {
  if (!userId) {
    console.error('[betSyncUtils] Cannot sync bets: No user ID provided');
    return { success: false, error: 'No user ID provided' };
  }
  
  if (!checkedBets || !checkedBets.length) {
    console.log('[betSyncUtils] No checked bets to sync');
    return { success: true, synced: 0 };
  }
  
  if (!savedBets) savedBets = [];
  
  console.log(`[betSyncUtils] Starting sync of ${checkedBets.length} checked bets`);
  
  // Import saveBet function from syncUtils
  const { saveBet } = await import('./syncUtils');
  
  let syncedCount = 0;
  let errors = [];
  
  // Create a map of saved bets for faster lookup
  const savedBetsMap = {};
  savedBets.forEach(bet => {
    const key = getBetKey(bet);
    if (key) savedBetsMap[key] = true;
  });
  
  // Process each checked bet
  const syncPromises = checkedBets.map(async checkedBet => {
    try {
      const betKey = getBetKey(checkedBet);
      
      // Skip if this bet is already saved
      if (betKey && savedBetsMap[betKey]) {
        console.log(`[betSyncUtils] Bet ${betKey} already saved, skipping`);
        return { success: true, skipped: true };
      }
      
      // Save the bet to Firebase
      console.log(`[betSyncUtils] Saving bet ${betKey} to Firebase`);
      const result = await saveBet(userId, checkedBet);
      
      if (result && result.success === false) {
        throw new Error(result.error || 'Unknown error saving bet');
      }
      
      syncedCount++;
      return { success: true };
    } catch (error) {
      console.error('[betSyncUtils] Error syncing bet:', error, checkedBet);
      errors.push({ bet: checkedBet, error: error.message });
      return { success: false, error: error.message };
    }
  });
  
  // Wait for all sync operations to complete
  await Promise.all(syncPromises);
  
  console.log(`[betSyncUtils] Sync complete. Synced: ${syncedCount}, Errors: ${errors.length}`);
  
  return {
    success: errors.length === 0,
    synced: syncedCount,
    errors: errors.length > 0 ? errors : null
  };
};
