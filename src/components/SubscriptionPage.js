import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import StripeCheckout from './StripeCheckout';
import StripeCustomerPortal from './StripeCustomerPortal';
import SubscriptionTest from './SubscriptionTest';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Chip,
  Grid,
  Paper,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';

// Subscription plans - only showing monthly option as requested
const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Premium',
    price: 9.99,
    description: 'Access to premium features for one month',
    features: ['Full access to all EV calculations', 'Find profitable betting opportunities', 'Updated daily']
  }
];

// Main SubscriptionPage component
const SubscriptionPage = () => {
  const { currentUser } = useAuth();
  const { subscription, loading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Check for success or canceled URL parameters (for Stripe redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      // Remove the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // Listen for navigation events from PremiumFeature component
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      if (event.detail?.page === 'subscription') {
        // We're already on the subscription page, so nothing to do
        console.log('Navigation to subscription page detected');
      }
    };
    
    window.addEventListener('navigate-to', handleNavigationEvent);
    
    return () => {
      window.removeEventListener('navigate-to', handleNavigationEvent);
    };
  }, []);
  
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  // Map subscription plans to Stripe price IDs
  // In production, these should be your actual Stripe price IDs
  // TODO: Replace these with your actual price IDs from Stripe Dashboard > Products
  // You can find price IDs by going to your Stripe Dashboard > Products > [Your Product] > Pricing
  // Using the actual price ID from Stripe
  const PLAN_PRICE_IDS = {
    monthly: 'price_1RZJ6uBbycTUDwgypp7s8zS5'
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  const isSubscriptionActive = subscription && subscription.status === 'active';
  
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Beat the Books Premium
      </Typography>
      
      {isSubscriptionActive ? (
        <Box mb={4}>
          <Alert severity="success">
            <Typography variant="h6">
              You have an active {subscription.plan} subscription
            </Typography>
            <Typography variant="body1">
              Your subscription is valid until {new Date(subscription.endDate).toLocaleDateString()}
            </Typography>
            <Box mt={2}>
              <StripeCustomerPortal buttonText="Manage Your Subscription" />
            </Box>
          </Alert>
        </Box>
      ) : (
        <>
          <Typography variant="body1" paragraph>
            Upgrade to premium to access all features and get the most out of Beat the Books.
          </Typography>
          
          {!selectedPlan ? (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h5" component="h2">
                        {plan.name}
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ my: 2 }}>
                        ${plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {plan.description}
                      </Typography>
                      <Box mt={2}>
                        {plan.features.map((feature, index) => (
                          <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                            • {feature}
                          </Typography>
                        ))}
                      </Box>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mt: 3 }}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        Select
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                {selectedPlan.name} Plan - ${selectedPlan.price}
              </Typography>
              <Box mb={3}>
                <StripeCheckout 
                  priceId={PLAN_PRICE_IDS[selectedPlan.id]} 
                  buttonText={`Subscribe for $${selectedPlan.price}`} 
                />
              </Box>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setSelectedPlan(null)}
              >
                Back to plans
              </Button>
            </Box>
          )}
        </>
      )}
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Payment successful! Your subscription is now active.
        </Alert>
      </Snackbar>
      
      {/* Test Component - Remove in production */}
      <Box mt={6}>
        <Divider sx={{ mb: 4 }}>
          <Chip label="Testing Tools" />
        </Divider>
        <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            Subscription Testing Tools
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            These tools are for development and testing only. Remove in production.
          </Typography>
          <SubscriptionTest />
        </Paper>
      </Box>
    </Container>
  );
};

export default SubscriptionPage;
