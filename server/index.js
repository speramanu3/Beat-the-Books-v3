const admin = require('firebase-admin');
const functions = require('firebase-functions');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Configuration
const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = 'a96c15675d0a120680eed5d628c4c773'; // We're using the hardcoded key for simplicity
const SUPPORTED_SPORTS = [
  'basketball_nba',
  'football_nfl',
  'hockey_nhl',
  'baseball_mlb'
];

/**
 * Scheduled function that runs every day at 8:00 AM to fetch odds data
 * and store it in Firebase Realtime Database
 */
// Scheduled function that runs every day at 8:00 AM ET to fetch odds data
exports.fetchDailyOdds = functions.pubsub
  .schedule('0 8 * * *') // Runs at 8:00 AM every day
  .timeZone('America/New_York') // Eastern Time
  .onRun(async (context) => {
    console.log('Starting daily odds fetch at 8:00 AM ET');
    
    try {
      // Fetch odds for each supported sport
      for (const sport of SUPPORTED_SPORTS) {
        console.log(`Fetching odds for ${sport}`);
        
        try {
          const response = await axios.get(`${API_BASE_URL}/sports/${sport}/odds`, {
            params: {
              apiKey: API_KEY,
              regions: 'us,eu',  // Include EU region to get Pinnacle
              markets: 'spreads,totals,h2h',
              oddsFormat: 'american',
              bookmakers: 'pinnacle,fanduel,draftkings,betmgm,bovada,williamhill_us,barstool,pointsbet,bet365,unibet,betrivers,twinspires,betus,wynnbet,betonlineag,lowvig,mybookieag,betfred,superbook,circasports,betway,fanatics,caesars,foxbet,si_sportsbook,betfair,tipico,station,hard_rock,playup'  // Request all supported bookmakers including Pinnacle
            }
          });
          
          // Process the data to add expected value calculations
          const processedData = addExpectedValueCalculations(response.data);
          
          // Store the processed data in Firebase
          const gamesRef = db.ref(`games/${sport}`);
          await gamesRef.set({
            data: processedData,
            lastUpdated: Date.now()
          });
          
          console.log(`Successfully stored ${processedData.length} games for ${sport}`);
          
          // Store API usage information
          const apiUsageRef = db.ref('apiUsage');
          const usageData = {
            remainingRequests: response.headers['x-requests-remaining'] || 'unknown',
            usedRequests: response.headers['x-requests-used'] || 'unknown',
            lastUpdated: Date.now()
          };
          
          await apiUsageRef.set(usageData);
          console.log('API usage information updated');
          
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error fetching odds for ${sport}:`, error.message);
          // Continue with other sports even if one fails
        }
      }
      
      console.log('Daily odds fetch completed successfully');
      return null;
      
    } catch (error) {
      console.error('Error in fetchDailyOdds function:', error);
      throw error; // Rethrowing will mark the function execution as failed
    }
  });

/**
 * Processes the raw odds data to add expected value calculations
 * @param {Array} gamesData - Raw games data from The Odds API
 * @returns {Array} - Processed games data with EV calculations
 */
function addExpectedValueCalculations(gamesData) {
  return gamesData.map(game => {
    // Find reference bookmaker to use (Pinnacle or fallback to others)
    const referenceBookmakers = ['pinnacle', 'lowvig', 'williamhill_us', 'fanduel'];
    let referenceBookmaker;
    let referenceBookmakerKey;
    
    for (const key of referenceBookmakers) {
      referenceBookmaker = game.bookmakers.find(b => b.key === key);
      if (referenceBookmaker) {
        referenceBookmakerKey = key;
        console.log(`Found ${referenceBookmaker.title} with key: ${referenceBookmakerKey}`);
        break;
      }
    }
    
    if (!referenceBookmaker) {
      console.log(`No suitable reference bookmaker found for game ${game.id}, skipping EV calculations`);
      return game; // Return game without EV calculations if no reference bookmaker is available
    }
    
    // Create lookup objects for reference bookmaker odds by market type and outcome name
    const referenceOddsMap = {};
    
    // Process each market from reference bookmaker
    referenceBookmaker.markets.forEach(market => {
      referenceOddsMap[market.key] = {};
      
      // For each outcome in the market, store the price and point (if applicable)
      market.outcomes.forEach(outcome => {
        referenceOddsMap[market.key][outcome.name] = {
          price: outcome.price,
          point: outcome.point
        };
      });
    });
    
    // Process each bookmaker to add EV calculations
    const processedBookmakers = game.bookmakers.map(bookmaker => {
      // Skip self-comparison for the reference bookmaker
      if (bookmaker.key === referenceBookmakerKey) {
        return bookmaker;
      }
      
      // Process each market for this bookmaker
      const processedMarkets = bookmaker.markets.map(market => {
        // Process each outcome in the market
        const processedOutcomes = market.outcomes.map(outcome => {
          // Skip EV calculations if this market is not available from reference bookmaker
          if (!referenceOddsMap[market.key] || !referenceOddsMap[market.key][outcome.name]) {
            return outcome;
          }
          
          // Get reference price and point
          const btbPrice = referenceOddsMap[market.key][outcome.name].price;
          const btbPoint = referenceOddsMap[market.key][outcome.name].point;
          
          // For spreads and totals, only calculate EV if the points match exactly
          if ((market.key === 'spreads' || market.key === 'totals') && 
              btbPoint !== outcome.point) {
            // Points don't match, so skip EV calculation
            return outcome;
          }
          
          // Calculate no-vig probabilities
          const referenceNoVig = btbPrice < 0 
            ? Math.abs(btbPrice) / (Math.abs(btbPrice) + 100) 
            : 100 / (100 + btbPrice);
            
          const bookNoVig = outcome.price < 0 
            ? Math.abs(outcome.price) / (Math.abs(outcome.price) + 100) 
            : 100 / (100 + outcome.price);
          
          // Calculate potential earnings
          const referenceEarnings = btbPrice < 0 
            ? 100 / (Math.abs(btbPrice) / 100) 
            : btbPrice;
            
          const bookEarnings = outcome.price < 0 
            ? 100 / (Math.abs(outcome.price) / 100) 
            : outcome.price;
          
          // Calculate reference counter odds (with 4% standard vig)
          const referenceCounterOdds = btbPrice < 0 
            ? 100 / (1.04 - referenceNoVig) - 100 
            : -(100 * (1.04 - referenceNoVig)) / (1 - (1.04 - referenceNoVig));
          
          // Calculate expected value
          const expectedValue = (bookEarnings * referenceNoVig - 100 * (1 - referenceNoVig)) / 100;
          
          // Return the outcome with added calculations
          return {
            ...outcome,
            btb_price: btbPrice,
            btb_point: btbPoint || null,
            reference_no_vig: referenceNoVig,
            book_no_vig: bookNoVig,
            reference_earnings: referenceEarnings,
            book_earnings: bookEarnings,
            reference_counter_odds: referenceCounterOdds,
            expected_value: expectedValue
          };
        });
        
        // Return the market with processed outcomes
        return {
          ...market,
          outcomes: processedOutcomes
        };
      });
      
      // Return the bookmaker with processed markets
      return {
        ...bookmaker,
        markets: processedMarkets
      };
    });
    
    // Return the game with processed bookmakers
    return {
      ...game,
      bookmakers: processedBookmakers
    };
  });
}

/**
 * HTTP function to manually trigger odds fetching (for testing or emergency updates)
 */
exports.manualFetchOdds = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated and has admin privileges
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to trigger a manual fetch.'
    );
  }
  
  // In a production app, you would check if the user has admin role
  // This is a simplified example
  try {
    const adminUsersRef = db.ref('adminUsers');
    const adminSnapshot = await adminUsersRef.child(context.auth.uid).once('value');
    
    if (!adminSnapshot.exists() || !adminSnapshot.val()) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You must be an admin to trigger a manual fetch.'
      );
    }
    
    // If we reach here, the user is authenticated and has admin privileges
    console.log(`Manual fetch triggered by admin user: ${context.auth.uid}`);
    
    // Fetch odds for each supported sport (same logic as the scheduled function)
    for (const sport of SUPPORTED_SPORTS) {
      console.log(`Manually fetching odds for ${sport}`);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/sports/${sport}/odds`, {
          params: {
            apiKey: API_KEY,
            regions: 'us,eu',  // Include EU region to get Pinnacle
            markets: 'spreads,totals,h2h',
            oddsFormat: 'american',
            bookmakers: 'pinnacle,fanduel,draftkings,betmgm,bovada,williamhill_us,barstool,pointsbet,bet365,unibet,betrivers,twinspires,betus,wynnbet,betonlineag,lowvig,mybookieag,betfred,superbook,circasports,betway,fanatics,caesars,foxbet,si_sportsbook,betfair,tipico,station,hard_rock,playup'  // Request all supported bookmakers including Pinnacle
          }
        });
        
        // Process the data to add expected value calculations
        const processedData = addExpectedValueCalculations(response.data);
        
        // Store the processed data in Firebase
        const gamesRef = db.ref(`games/${sport}`);
        await gamesRef.set({
          data: processedData,
          lastUpdated: Date.now()
        });
        
        console.log(`Successfully stored ${processedData.length} games for ${sport}`);
        
        // Store API usage information
        const apiUsageRef = db.ref('apiUsage');
        const usageData = {
          remainingRequests: response.headers['x-requests-remaining'] || 'unknown',
          usedRequests: response.headers['x-requests-used'] || 'unknown',
          lastUpdated: Date.now()
        };
        
        await apiUsageRef.set(usageData);
        console.log('API usage information updated');
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching odds for ${sport}:`, error.message);
        // Continue with other sports even if one fails
      }
    }
    
    return { success: true, message: 'Manual odds fetch completed successfully' };
    
  } catch (error) {
    console.error('Error in manualFetchOdds function:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
