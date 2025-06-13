const admin = require('firebase-admin');
const functions = require('firebase-functions');
const axios = require('axios');
const stripe = require('stripe')(functions.config().stripe.secret); // Test mode key
const cors = require('cors')({origin: true});

// Stripe webhook secret for verifying webhook events
// Replace with your actual webhook secret from the Stripe dashboard
// After creating your webhook in the Stripe Dashboard > Developers > Webhooks
// Copy the signing secret that starts with whsec_ and paste it below
const endpointSecret = 'whsec_PtDEIpZ9Klmy6uqOkkXJMwxCnsqKSHOi';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.database();

// Configuration
const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = 'a96c15675d0a120680eed5d628c4c773'; // We're using the hardcoded key for simplicity
const SUPPORTED_SPORTS = [
  'basketball_nba',
  'americanfootball_nfl',
  'icehockey_nhl',
  'baseball_mlb'
];

// Stripe-only functions version - fetchDailyOdds function removed

// Stripe-only functions version - addExpectedValueCalculations function removed

/**
 * Create a Stripe Checkout Session for subscription
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a checkout session'
    );
  }
  
  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;
  
  try {
    // Get user data to pre-fill checkout
    const userSnapshot = await admin.database().ref(`users/${userId}`).once('value');
    const userData = userSnapshot.val() || {};
    
    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userData.email || context.auth.token.email,
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId
      }
    });
    
    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 */
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to access the customer portal'
    );
  }
  
  const { returnUrl } = data;
  const userId = context.auth.uid;
  
  try {
    // Get the Stripe customer ID from Firebase
    const userRef = admin.database().ref(`users/${userId}/subscription`);
    const snapshot = await userRef.once('value');
    const subscriptionData = snapshot.val();
    
    if (!subscriptionData || !subscriptionData.customerId) {
      throw new Error('No Stripe customer found for this user');
    }
    
    // Create a Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptionData.customerId,
      return_url: returnUrl
    });
    
    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Webhook handler for Stripe events
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).send({ received: true });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
});

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session) {
  // Get the user ID from the session metadata
  const userId = session.metadata.userId || session.client_reference_id;
  if (!userId) {
    console.error('No user ID found in session metadata');
    return;
  }
  
  // Get the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  // Store subscription data in Firebase
  const subscriptionData = {
    status: subscription.status,
    plan: subscription.items.data[0].plan.nickname || 'premium',
    customerId: session.customer,
    subscriptionId: subscription.id,
    startDate: subscription.current_period_start * 1000, // Convert to milliseconds
    endDate: subscription.current_period_end * 1000,     // Convert to milliseconds
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };
  
  await admin.database().ref(`users/${userId}/subscription`).set(subscriptionData);
  console.log(`Subscription data saved for user ${userId}`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription) {
  // Find the user with this subscription ID
  const usersRef = admin.database().ref('users');
  const snapshot = await usersRef.orderByChild('subscription/subscriptionId').equalTo(subscription.id).once('value');
  const users = snapshot.val();
  
  if (!users) {
    console.error(`No user found with subscription ID: ${subscription.id}`);
    return;
  }
  
  // There should only be one user with this subscription ID
  const userId = Object.keys(users)[0];
  
  // Update subscription data
  const subscriptionData = {
    status: subscription.status,
    plan: subscription.items.data[0].plan.nickname || 'premium',
    startDate: subscription.current_period_start * 1000,
    endDate: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };
  
  await admin.database().ref(`users/${userId}/subscription`).update(subscriptionData);
  console.log(`Subscription updated for user ${userId}`);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  // Find the user with this subscription ID
  const usersRef = admin.database().ref('users');
  const snapshot = await usersRef.orderByChild('subscription/subscriptionId').equalTo(subscription.id).once('value');
  const users = snapshot.val();
  
  if (!users) {
    console.error(`No user found with subscription ID: ${subscription.id}`);
    return;
  }
  
  // There should only be one user with this subscription ID
  const userId = Object.keys(users)[0];
  
  // Update subscription status to canceled
  await admin.database().ref(`users/${userId}/subscription`).update({
    status: 'canceled',
    canceledAt: Date.now()
  });
  
  console.log(`Subscription canceled for user ${userId}`);
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
