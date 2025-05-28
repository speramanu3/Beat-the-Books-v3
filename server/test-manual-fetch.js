const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin with your project credentials
admin.initializeApp();

async function testManualFetch() {
  try {
    // Get the Firebase Functions URL for the manualFetchOdds function
    const projectId = 'beat-the-books-183db';
    const region = 'us-central1';
    const functionName = 'manualFetchOdds';
    
    // Create a Firebase Auth token for an admin user
    // This is a simplified approach - in production, you'd use proper authentication
    const customToken = await admin.auth().createCustomToken('admin-test-user');
    
    // Exchange the custom token for an ID token
    const idTokenResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyCk8G-X2__KsABX8HM_hmSSpFuDg29dbN8`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    
    const idToken = idTokenResponse.data.idToken;
    
    // Call the Cloud Function
    const functionUrl = `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
    
    console.log(`Calling manual fetch function at: ${functionUrl}`);
    
    // Add the admin user to the database first
    const db = admin.database();
    await db.ref('adminUsers').child('admin-test-user').set(true);
    
    // Call the function with the ID token
    const response = await axios.post(
      functionUrl,
      {},
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Manual fetch response:', response.data);
  } catch (error) {
    console.error('Error testing manual fetch:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testManualFetch();
