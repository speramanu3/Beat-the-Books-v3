import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getAuth } from 'firebase/auth';

/**
 * StripeCustomerPortal component for managing existing subscriptions
 * @param {Object} props
 * @param {string} props.buttonText - Text to display on the portal button
 */
const StripeCustomerPortal = ({ buttonText = 'Manage Subscription' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePortalRedirect = async () => {
    if (!currentUser) {
      setError('You must be logged in to manage your subscription.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current URL to use as return URL
      const returnUrl = window.location.href;

      // Get the current user's ID token for authentication
      const auth = getAuth();
      const idToken = await auth.currentUser.getIdToken();
      
      // Call Firebase function using direct HTTP request
      const response = await fetch(
        'https://us-central1-beat-the-books-183db.cloudfunctions.net/createPortalSession',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            returnUrl
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portal session');
      }
      
      const data = await response.json();

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      setError(err.message || 'An error occurred while accessing the customer portal.');
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
        variant="outlined"
        color="primary"
        disabled={loading}
        onClick={handlePortalRedirect}
        fullWidth
        sx={{ py: 1 }}
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

export default StripeCustomerPortal;
