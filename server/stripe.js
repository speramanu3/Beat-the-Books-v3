const admin = require('firebase-admin');
const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_REPLACE_WITH_YOUR_SECRET_KEY');

// Get database reference (assuming admin is already initialized in index.js)
const db = admin.database();

/**
 * Create a payment intent when a user initiates checkout
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to make a payment');
  }

  try {
    // Get user data from request
    const { amount, currency = 'usd', metadata = {} } = data;
    
    // Validate the amount
    if (!amount || amount < 100) { // Stripe uses cents, so $1.00 = 100 cents
      throw new functions.https.HttpsError('invalid-argument', 'Amount must be at least $1.00');
    }

    // Add user ID to metadata
    const enhancedMetadata = {
      ...metadata,
      userId: context.auth.uid
    };

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: enhancedMetadata,
      automatic_payment_methods: { enabled: true }
    });

    // Return the client secret to the client
    return {
      clientSecret: paymentIntent.client_secret
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Handle Stripe webhook events
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET';
  
  try {
    // Verify the event came from Stripe
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      endpointSecret
    );

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        // Update user subscription status in Firebase
        if (paymentIntent.metadata && paymentIntent.metadata.userId) {
          await db.ref(`users/${paymentIntent.metadata.userId}/subscription`).update({
            status: 'active',
            plan: paymentIntent.metadata.plan || 'premium',
            startDate: admin.database.ServerValue.TIMESTAMP,
            endDate: calculateEndDate(paymentIntent.metadata.plan || 'premium'),
            lastPaymentDate: admin.database.ServerValue.TIMESTAMP,
            lastPaymentAmount: paymentIntent.amount / 100 // Convert cents to dollars
          });
        }
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // You could notify the user or update their status
        break;
        
      // Add more event handlers as needed
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/**
 * Helper function to calculate subscription end date
 */
function calculateEndDate(plan) {
  const now = new Date();
  let endDate;
  
  switch (plan) {
    case 'monthly':
      endDate = new Date(now.setMonth(now.getMonth() + 1));
      break;
    case 'quarterly':
      endDate = new Date(now.setMonth(now.getMonth() + 3));
      break;
    case 'annual':
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
      break;
    default: // Default to monthly
      endDate = new Date(now.setMonth(now.getMonth() + 1));
  }
  
  return endDate.getTime();
}
