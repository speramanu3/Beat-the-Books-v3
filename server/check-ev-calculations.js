const admin = require('firebase-admin');

// Use the Firebase service account key file
const serviceAccount = require('./beat-the-books-183db-firebase-adminsdk-fbsvc-936ed31dee.json');

// Initialize Firebase Admin with service account and database URL
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beat-the-books-183db-default-rtdb.firebaseio.com"
});

async function checkEVCalculations() {
  try {
    const db = admin.database();
    
    // Get the basketball_nba data
    console.log('Fetching data from Firebase...');
    const sportRef = db.ref('games/basketball_nba');
    const snapshot = await sportRef.once('value');
    const data = snapshot.val();
    
    if (!data || !data.data || !data.data.length) {
      console.log('No data found in Firebase. Please make sure data has been fetched.');
      return;
    }
    
    // Print a sample of the results
    console.log('\n===== SAMPLE OF EXPECTED VALUE CALCULATIONS =====\n');
    
    // Get the first game
    const game = data.data[0];
    console.log(`Game: ${game.away_team} @ ${game.home_team}`);
    console.log(`ID: ${game.id}`);
    console.log(`Commence Time: ${new Date(game.commence_time).toLocaleString()}`);
    console.log('');
    
    // Find Pinnacle and other bookmakers for comparison
    const pinnacleBookmaker = game.bookmakers.find(b => b.key === 'pinnacle');
    
    // Get a list of other bookmakers to compare
    const otherBookmakers = game.bookmakers.filter(b => b.key !== 'pinnacle' && ['draftkings', 'fanduel', 'betmgm', 'williamhill_us'].includes(b.key));
    
    if (!pinnacleBookmaker) {
      console.log('Pinnacle data not found for this game. Cannot show EV calculations.');
      return;
    }
    
    if (otherBookmakers.length === 0) {
      console.log('No other major bookmakers found for comparison.');
      return;
    }
    
    // Loop through each major bookmaker for comparison
    for (const otherBookmaker of otherBookmakers) {
      console.log(`\n\nComparing: ${otherBookmaker.title} vs Pinnacle (Reference)`);
      console.log('');
      
      // Get the moneyline market
      const pinnacleMoneyline = pinnacleBookmaker.markets.find(m => m.key === 'h2h');
      const otherMoneyline = otherBookmaker.markets.find(m => m.key === 'h2h');
      
      if (pinnacleMoneyline && otherMoneyline) {
        console.log('===== MONEYLINE MARKET =====');
        
        otherMoneyline.outcomes.forEach(outcome => {
          const pinnacleOutcome = pinnacleMoneyline.outcomes.find(o => o.name === outcome.name);
          
          if (pinnacleOutcome) {
            console.log(`\n${outcome.name}:`);
            console.log(`  ${otherBookmaker.title} Price: ${outcome.price}`);
            console.log(`  Pinnacle Price: ${outcome.btb_price || 'N/A'}`);
            console.log(`  Book No Vig: ${outcome.book_no_vig?.toFixed(4) || 'N/A'}`);
            console.log(`  Reference No Vig: ${outcome.reference_no_vig?.toFixed(4) || 'N/A'}`);
            console.log(`  Book Earnings: ${outcome.book_earnings?.toFixed(2) || 'N/A'}`);
            console.log(`  Reference Earnings: ${outcome.reference_earnings?.toFixed(2) || 'N/A'}`);
            console.log(`  Reference Counter Odds: ${outcome.reference_counter_odds?.toFixed(2) || 'N/A'}`);
            console.log(`  Expected Value: ${outcome.expected_value?.toFixed(4) || 'N/A'}`);
            
            // Highlight positive EV bets
            if (outcome.expected_value > 0) {
              console.log(`  ✅ POSITIVE EV BET: ${(outcome.expected_value * 100).toFixed(2)}%`);
            } else {
              console.log(`  ❌ NEGATIVE EV BET: ${(outcome.expected_value * 100).toFixed(2)}%`);
            }
          }
        });
      }
      
      // Get the spreads market
      const pinnacleSpread = pinnacleBookmaker.markets.find(m => m.key === 'spreads');
      const otherSpread = otherBookmaker.markets.find(m => m.key === 'spreads');
      
      if (pinnacleSpread && otherSpread) {
        console.log('\n===== SPREADS MARKET =====');
        
        otherSpread.outcomes.forEach(outcome => {
          // Find matching outcome by name
          const pinnacleOutcome = pinnacleSpread.outcomes.find(o => o.name === outcome.name);
          
          if (pinnacleOutcome) {
            console.log(`\n${outcome.name}:`);
            console.log(`  ${otherBookmaker.title} Point: ${outcome.point} @ ${outcome.price}`);
            console.log(`  Pinnacle Point: ${outcome.btb_point || 'N/A'} @ ${outcome.btb_price || 'N/A'}`);
            console.log(`  Expected Value: ${outcome.expected_value?.toFixed(4) || 'N/A'}`);
            
            // Highlight positive EV bets
            if (outcome.expected_value > 0) {
              console.log(`  ✅ POSITIVE EV BET: ${(outcome.expected_value * 100).toFixed(2)}%`);
            } else {
              console.log(`  ❌ NEGATIVE EV BET: ${(outcome.expected_value * 100).toFixed(2)}%`);
            }
          }
        });
      }
    }
    
    console.log('\n===== DATA INFO =====');
    console.log('Last Updated:', new Date(data.lastUpdated).toLocaleString());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

checkEVCalculations();
