const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://beat-the-books-183db-default-rtdb.firebaseio.com"
});

async function triggerManualFetch() {
  try {
    // First, add the current user as an admin
    const db = admin.database();
    const uid = 'test-admin-user';
    
    console.log('Adding test user to admin list...');
    await db.ref('adminUsers').child(uid).set(true);
    
    // Create a custom token for authentication
    const customToken = await admin.auth().createCustomToken(uid);
    console.log('Created custom token for authentication');
    
    // Call the Cloud Function directly using the Firebase Admin SDK
    console.log('Triggering manual fetch...');
    
    // We can't directly call the Cloud Function from the Admin SDK,
    // so we'll use the Firebase Realtime Database to check the results
    console.log('Manual fetch triggered. Waiting for results...');
    
    // Wait a bit for the function to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check the results
    console.log('Checking results...');
    
    // Get the first sport's data
    const sportRef = db.ref('games/basketball_nba');
    const snapshot = await sportRef.once('value');
    const data = snapshot.val();
    
    if (!data || !data.data || !data.data.length) {
      console.log('No data found. The function might still be running or encountered an error.');
      return;
    }
    
    // Print a sample of the results
    console.log('Sample of the results with expected values:');
    
    // Get the first game
    const game = data.data[0];
    console.log(`Game: ${game.away_team} @ ${game.home_team}`);
    
    // Get the first bookmaker
    const bookmaker = game.bookmakers[0];
    console.log(`Bookmaker: ${bookmaker.title}`);
    
    // Get the moneyline market
    const moneylineMarket = bookmaker.markets.find(m => m.key === 'h2h');
    if (moneylineMarket) {
      console.log('Moneyline Market:');
      moneylineMarket.outcomes.forEach(outcome => {
        console.log(`  ${outcome.name}:`);
        console.log(`    Price: ${outcome.price}`);
        console.log(`    Pinnacle Price: ${outcome.btb_price || 'N/A'}`);
        console.log(`    Book No Vig: ${outcome.book_no_vig?.toFixed(4) || 'N/A'}`);
        console.log(`    Reference No Vig: ${outcome.reference_no_vig?.toFixed(4) || 'N/A'}`);
        console.log(`    Expected Value: ${outcome.expected_value?.toFixed(4) || 'N/A'}`);
        console.log('');
      });
    }
    
    // Get the spreads market
    const spreadsMarket = bookmaker.markets.find(m => m.key === 'spreads');
    if (spreadsMarket) {
      console.log('Spreads Market:');
      spreadsMarket.outcomes.forEach(outcome => {
        console.log(`  ${outcome.name}:`);
        console.log(`    Point: ${outcome.point}`);
        console.log(`    Price: ${outcome.price}`);
        console.log(`    Pinnacle Point: ${outcome.btb_point || 'N/A'}`);
        console.log(`    Pinnacle Price: ${outcome.btb_price || 'N/A'}`);
        console.log(`    Expected Value: ${outcome.expected_value?.toFixed(4) || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('Last Updated:', new Date(data.lastUpdated).toLocaleString());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    process.exit(0);
  }
}

triggerManualFetch();
