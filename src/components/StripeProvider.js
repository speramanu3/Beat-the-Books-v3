import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../stripeConfig';

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

/**
 * StripeProvider component that wraps the application with Stripe Elements
 * This provides Stripe context to all child components
 */
const StripeProvider = ({ children }) => {
  const options = {
    // Stripe options can be configured here
    locale: 'en',
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
