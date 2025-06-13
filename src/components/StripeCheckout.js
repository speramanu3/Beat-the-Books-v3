import React, { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';

/**
 * StripeCheckout component for handling subscription purchases
 * @param {Object} props
 * @param {string} props.priceId - The Stripe price ID for the subscription
 * @param {string} props.buttonText - Text to display on the checkout button
 * @param {function} props.onSuccess - Callback function to run after successful checkout
 */
const StripeCheckout = ({ priceId, buttonText = 'Subscribe', onSuccess }) => {
  const stripe = useStripe();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    if (!stripe) {
      setError('Stripe has not been initialized yet. Please try again in a moment.');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to subscribe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current URL to use for success and cancel URLs
      const origin = window.location.origin;
      const successUrl = `${origin}/subscription?success=true`;
      const cancelUrl = `${origin}/subscription?canceled=true`;

      // Get the current user's ID token for authentication
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();
      
      // Call Firebase function using direct HTTP request
      const response = await fetch(
        'https://us-central1-beat-the-books-183db.cloudfunctions.net/createCheckoutSession',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            priceId,
            successUrl,
            cancelUrl
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const data = await response.json();
      
      // Redirect to Stripe Checkout
      const { sessionId } = data;
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        setError(result.error.message);
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'An error occurred while creating your checkout session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        disabled={loading || !stripe}
        onClick={handleCheckout}
        fullWidth
        sx={{ py: 1.5 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          buttonText
        )}
      </Button>
    </Box>
  );
};

export default StripeCheckout;
