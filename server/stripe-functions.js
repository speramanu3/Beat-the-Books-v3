const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

// Stripe webhook secret for verifying webhook events
const endpointSecret = 'whsec_PtDEIpZ9Klmy6uqOkkXJMwxCnsqKSHOi';

// Initialize Firebase Admin
admin.initializeApp();

// Create a checkout session for subscription
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to create a checkout session'
    );
  }

  const { priceId, successUrl, cancelUrl } = data;
  const userId = context.auth.uid;

  try {
    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: context.auth.token.email,
      metadata: {
        userId: userId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create a billing portal session for subscription management
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to access the customer portal'
    );
  }

  const { returnUrl } = data;
  const userId = context.auth.uid;

  try {
    // Get the customer ID from Firestore
    const userSnapshot = await admin.database().ref(`users/${userId}/stripe`).once('value');
    const userData = userSnapshot.val();

    if (!userData || !userData.customerId) {
      throw new functions.https.HttpsError(
        'not-found',
        'No Stripe customer found for this user'
      );
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Webhook handler for Stripe events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object;
      // Handle successful checkout
      await handleCheckoutSessionCompleted(checkoutSession);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Handle subscription updates
      await handleSubscriptionUpdated(subscription);
      break;
    case 'customer.subscription.deleted':
      const cancelledSubscription = event.data.object;
      // Handle subscription cancellation
      await handleSubscriptionCancelled(cancelledSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  const subscriptionId = session.subscription;

  try {
    // Store the customer and subscription info in Firestore
    await admin.database().ref(`users/${userId}/stripe`).update({
      customerId,
      subscriptionId,
      status: 'active',
      createdAt: admin.database.ServerValue.TIMESTAMP,
    });

    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    // Find the user with this subscription
    const snapshot = await admin
      .database()
      .ref('users')
      .orderByChild('stripe/subscriptionId')
      .equalTo(subscription.id)
      .once('value');
    
    const users = snapshot.val();
    if (!users) {
      console.log(`No user found with subscription ID: ${subscription.id}`);
      return;
    }

    // There should only be one user with this subscription
    const userId = Object.keys(users)[0];
    
    // Update the subscription status
    await admin.database().ref(`users/${userId}/stripe`).update({
      status: subscription.status,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      currentPeriodEnd: subscription.current_period_end * 1000, // Convert to milliseconds
    });

    console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  try {
    // Find the user with this subscription
    const snapshot = await admin
      .database()
      .ref('users')
      .orderByChild('stripe/subscriptionId')
      .equalTo(subscription.id)
      .once('value');
    
    const users = snapshot.val();
    if (!users) {
      console.log(`No user found with subscription ID: ${subscription.id}`);
      return;
    }

    // There should only be one user with this subscription
    const userId = Object.keys(users)[0];
    
    // Update the subscription status
    await admin.database().ref(`users/${userId}/stripe`).update({
      status: 'canceled',
      updatedAt: admin.database.ServerValue.TIMESTAMP,
      canceledAt: admin.database.ServerValue.TIMESTAMP,
    });

    console.log(`Subscription cancelled for user ${userId}`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}
