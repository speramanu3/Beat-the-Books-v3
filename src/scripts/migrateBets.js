// Bet Migration Script
// This script migrates bets from the old timestamp-based structure to the new user-specific structure

import { getDatabase, ref, get, set, push } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Use existing Firebase instance
const db = getDatabase();
const auth = getAuth();

// Function to authenticate user
const authenticateUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Authenticated successfully:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    throw error;
  }
};

// Function to migrate bets
const migrateBets = async (userId) => {
  try {
    console.log('Starting migration for user:', userId);
    
    // Get all bets from the root level
    const rootBetsRef = ref(db, 'user_bets');
    const snapshot = await get(rootBetsRef);
    
    if (!snapshot.exists()) {
      console.log('No bets found to migrate.');
      return;
    }
    
    const betsData = snapshot.val();
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Process each bet
    for (const betId in betsData) {
      // Skip if the betId is a user ID (already in the correct format)
      if (typeof betsData[betId] === 'object' && !Array.isArray(betsData[betId]) && betsData[betId] !== null) {
        const firstKey = Object.keys(betsData[betId])[0];
        if (firstKey && typeof betsData[betId][firstKey] === 'object') {
          console.log(`Skipping ${betId} as it appears to be a user ID folder`);
          skippedCount++;
          continue;
        }
      }
      
      const bet = betsData[betId];
      
      // If the bet doesn't have a userId, assign it to the current user
      if (!bet.userId) {
        bet.userId = userId;
      }
      
      // Create a new bet under the user's path
      const userBetsRef = ref(db, `user_bets/${bet.userId}`);
      const newBetRef = push(userBetsRef);
      
      // Add the generated ID to the bet data
      const betWithId = {
        ...bet,
        id: newBetRef.key,
        migratedAt: Date.now(),
        originalId: betId
      };
      
      // Save the bet to the new location
      await set(newBetRef, betWithId);
      console.log(`Migrated bet ${betId} to ${bet.userId}/${newBetRef.key}`);
      migratedCount++;
    }
    
    console.log(`Migration complete. Migrated ${migratedCount} bets, skipped ${skippedCount} items.`);
    return { migratedCount, skippedCount };
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

// Function to run the migration
const runMigration = async (email, password) => {
  try {
    // Authenticate
    const user = await authenticateUser(email, password);
    
    // Run migration
    const result = await migrateBets(user.uid);
    
    console.log('Migration completed successfully:', result);
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Export the function to be used from the browser console
window.runBetMigration = (email, password) => {
  if (!email || !password) {
    console.error('Email and password are required');
    return;
  }
  
  console.log('Starting migration process...');
  runMigration(email, password)
    .then(result => {
      console.log('Migration process completed:', result);
    })
    .catch(error => {
      console.error('Migration process failed:', error);
    });
};

// Instructions for use
console.log(`
=== Bet Migration Tool ===
This tool migrates bets from the old timestamp-based structure to the new user-specific structure.

To run the migration:
1. Make sure you're logged in to the app
2. Open the browser console
3. Run the following command:
   window.runBetMigration('your-email@example.com', 'your-password')

Note: This will only migrate bets that don't already have a user-specific path.
`);
