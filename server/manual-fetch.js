const admin = require('firebase-admin');
const axios = require('axios');

// Use the Firebase service account key file
const serviceAccount = require('./beat-the-books-183db-firebase-adminsdk-fbsvc-936ed31dee.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beat-the-books-183db-default-rtdb.firebaseio.com"
});

// Configuration
const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = 'a96c15675d0a120680eed5d628c4c773'; // Using the same key as in index.js
const SUPPORTED_SPORTS = [
  'basketball_nba',
  'football_nfl',
  'hockey_nhl',
  'baseball_mlb'
];

/**
 * Processes the raw odds data to add expected value calculations
 * (This is the same function as in index.js)
 */
function addExpectedValueCalculations(gamesData) {
  return gamesData.map(game => {
    // Find Pinnacle bookmaker to use as reference - try different possible keys
    const possiblePinnacleKeys = ['pinnacle', 'pinnacle_us', 'pinnaclesports'];
    let pinnacleBookmaker;
    let pinnacleKey;
    
    for (const key of possiblePinnacleKeys) {
      pinnacleBookmaker = game.bookmakers.find(b => b.key === key);
      if (pinnacleBookmaker) {
        pinnacleKey = key;
        console.log(`Found Pinnacle with key: ${key}`);
        break;
      }
    }
    
    if (!pinnacleBookmaker) {
      console.log(`Pinnacle odds not found for game ${game.id}, available bookmakers: ${game.bookmakers.map(b => b.key).join(', ')}`);
      return game; // Return game without EV calculations if Pinnacle odds not available
    }
    
    // Create lookup objects for Pinnacle odds by market type and outcome name
    const pinnacleOddsMap = {};
    
    // Process each market from Pinnacle
    pinnacleBookmaker.markets.forEach(market => {
      pinnacleOddsMap[market.key] = {};
      
      // For each outcome in the market, store the price and point (if applicable)
      market.outcomes.forEach(outcome => {
        pinnacleOddsMap[market.key][outcome.name] = {
          price: outcome.price,
          point: outcome.point
        };
      });
    });
    
    // Process each bookmaker to add EV calculations
    const processedBookmakers = game.bookmakers.map(bookmaker => {
      // Skip self-comparison for Pinnacle
      if (bookmaker.key === pinnacleKey) {
        return bookmaker;
      }
      
      // Process each market for this bookmaker
      const processedMarkets = bookmaker.markets.map(market => {
        // Process each outcome in the market
        const processedOutcomes = market.outcomes.map(outcome => {
          // Skip EV calculations if this market is not available from Pinnacle
          if (!pinnacleOddsMap[market.key] || !pinnacleOddsMap[market.key][outcome.name]) {
            return outcome;
          }
          
          // Get Pinnacle reference price and point
          const btbPrice = pinnacleOddsMap[market.key][outcome.name].price;
          const btbPoint = pinnacleOddsMap[market.key][outcome.name].point;
          
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

async function manualFetch() {
  try {
    console.log('Starting manual fetch of odds data...');
    
    // First, add the current user as an admin
    const db = admin.database();
    const uid = 'test-admin-user';
    
    console.log('Adding test user to admin list...');
    await db.ref('adminUsers').child(uid).set(true);
    
    // Fetch odds for each supported sport
    for (const sport of SUPPORTED_SPORTS) {
      console.log(`Fetching odds for ${sport}...`);
      
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
        
        console.log(`Received ${response.data.length} games for ${sport}`);
        
        // Log the available bookmakers for the first game
        if (response.data.length > 0) {
          const firstGame = response.data[0];
          console.log(`First game: ${firstGame.away_team} @ ${firstGame.home_team}`);
          console.log('Available bookmakers:');
          firstGame.bookmakers.forEach(bm => {
            console.log(`  - ${bm.key}: ${bm.title}`);
          });
        }
        
        // Process the data to add expected value calculations
        console.log('Adding expected value calculations...');
        const processedData = addExpectedValueCalculations(response.data);
        
        // Store the processed data in Firebase
        console.log('Storing data in Firebase...');
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
        
        // Display sample of the results for the first game
        if (processedData.length > 0 && sport === 'basketball_nba') {
          const game = processedData[0];
          console.log('\n===== SAMPLE RESULTS =====');
          console.log(`Game: ${game.away_team} @ ${game.home_team}`);
          
          // Find a bookmaker with expected value calculations
          const bookmaker = game.bookmakers.find(b => b.key !== 'pinnacle');
          if (bookmaker) {
            console.log(`Bookmaker: ${bookmaker.title}`);
            
            // Show moneyline market
            const moneylineMarket = bookmaker.markets.find(m => m.key === 'h2h');
            if (moneylineMarket && moneylineMarket.outcomes.length > 0) {
              const outcome = moneylineMarket.outcomes[0];
              console.log('\nMoneyline Sample:');
              console.log(`  Team: ${outcome.name}`);
              console.log(`  Price: ${outcome.price}`);
              console.log(`  Pinnacle Price: ${outcome.btb_price}`);
              console.log(`  Expected Value: ${outcome.expected_value.toFixed(4)}`);
              console.log(`  EV Percentage: ${(outcome.expected_value * 100).toFixed(2)}%`);
            }
          }
        }
        
        // Add a small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching odds for ${sport}:`, error.message);
        // Continue with other sports even if one fails
      }
    }
    
    console.log('\nManual fetch completed successfully');
    console.log('You can now run check-ev-calculations.js to see detailed results');
    
  } catch (error) {
    console.error('Error in manual fetch:', error);
  } finally {
    process.exit(0);
  }
}

manualFetch();
