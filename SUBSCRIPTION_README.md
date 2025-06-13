# Beat the Books v3 - Stripe Subscription Integration

This document provides an overview of the Stripe subscription integration in Beat the Books v3 and instructions for testing and deployment.

## Overview

The subscription system allows users to subscribe to premium features using Stripe. The integration includes:

1. **Server-side components** (Firebase Cloud Functions):
   - Checkout session creation
   - Customer portal session creation
   - Webhook handler for Stripe events
   - Subscription data storage in Firebase

2. **Client-side components**:
   - Subscription UI (pricing page, checkout process)
   - Subscription state management via React Context
   - Premium feature access control

3. **Premium features**:
   - Expected Value (EV) filtering for betting opportunities
   - Advanced betting analytics
   - More premium features can be added using the `PremiumFeature` component

## Testing the Integration

For development and testing purposes, we've added a `SubscriptionTest` component to the Subscription page that allows you to:

1. Simulate subscription activation
2. Simulate subscription cancellation
3. View current subscription status

This lets you test premium features without setting up actual Stripe payments.

### Testing Premium Features

1. Log in to the application
2. Navigate to the "Premium" page from the header
3. Scroll down to the "Subscription Testing Tools" section
4. Click "Simulate Subscription" to activate premium features
5. Test premium features like:
   - EV filtering on the Games List page
   - Premium analytics in the Bet Tracker

## Production Setup

Before deploying to production:

1. **Update Stripe Keys**:
   - Replace `sk_test_REPLACE_WITH_YOUR_SECRET_KEY` in `server/index.js` with your actual Stripe secret key
   - Replace `whsec_REPLACE_WITH_YOUR_WEBHOOK_SECRET` in `server/index.js` with your Stripe webhook signing secret
   - Update `STRIPE_PUBLISHABLE_KEY` in `src/stripeConfig.js` with your Stripe publishable key

2. **Configure Stripe Products and Prices**:
   - Create subscription products and prices in your Stripe dashboard
   - Update the `SUBSCRIPTION_PLANS` array in `SubscriptionPage.js` with your actual price IDs

3. **Set Up Stripe Webhooks**:
   - Configure a webhook endpoint in your Stripe dashboard pointing to your deployed Firebase function URL
   - Add the following events to your webhook:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. **Remove Testing Components**:
   - Remove the `SubscriptionTest` component from `SubscriptionPage.js`
   - Remove the testing tools section from the Subscription page

## Firebase Security Rules

Ensure your Firebase Realtime Database has appropriate security rules to protect subscription data:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "subscription": {
          ".read": "$uid === auth.uid",
          ".write": false
        }
      }
    }
  }
}
```

This ensures that:
- Users can only read their own subscription data
- Subscription data can only be written by server-side code (Firebase functions)

## Deployment

Deploy the Firebase functions to make the subscription system live:

```bash
cd server
npm install
firebase deploy --only functions
```

## Troubleshooting

If you encounter issues with the subscription system:

1. **Check Firebase Function Logs**:
   - Use `firebase functions:log` to view logs from the webhook handler
   - Look for any errors in processing Stripe events

2. **Verify Webhook Configuration**:
   - Ensure your webhook endpoint is correctly configured in Stripe
   - Check that the webhook secret matches between Stripe and your code

3. **Test Subscription Data**:
   - Use the Firebase console to verify subscription data is being stored correctly
   - Check the user's subscription status in the Realtime Database

4. **Monitor Stripe Events**:
   - Use the Stripe dashboard to monitor webhook events and deliveries
   - Resend failed webhook events if necessary
