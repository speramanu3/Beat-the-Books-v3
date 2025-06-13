import React from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PremiumFeature from './PremiumFeature';

/**
 * A test component to demonstrate the subscription system
 */
const SubscriptionTest = () => {
  const { subscription, hasPremium, loading } = useSubscription();
  const { currentUser } = useAuth();
  
  // Function to simulate updating a user's subscription in Firebase
  // This would normally be done by the Stripe webhook
  const simulateSubscription = async () => {
    if (!currentUser) return;
    
    try {
      // Get Firebase database reference
      const { getDatabase, ref, set } = await import('firebase/database');
      const db = getDatabase();
      
      // Create a mock subscription
      const mockSubscription = {
        status: 'active',
        plan: 'premium',
        startDate: Date.now(),
        endDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        customerId: 'cus_mock123',
        subscriptionId: 'sub_mock123'
      };
      
      // Update the user's subscription in Firebase
      await set(ref(db, `users/${currentUser.uid}/subscription`), mockSubscription);
      
      alert('Subscription simulated successfully! You now have premium access.');
    } catch (error) {
      console.error('Error simulating subscription:', error);
      alert('Error simulating subscription. See console for details.');
    }
  };
  
  // Function to simulate cancelling a subscription
  const simulateCancellation = async () => {
    if (!currentUser) return;
    
    try {
      // Get Firebase database reference
      const { getDatabase, ref, remove } = await import('firebase/database');
      const db = getDatabase();
      
      // Remove the subscription from Firebase
      await remove(ref(db, `users/${currentUser.uid}/subscription`));
      
      alert('Subscription cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Error cancelling subscription. See console for details.');
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subscription System Test
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Subscription Status
        </Typography>
        
        {loading ? (
          <Typography>Loading subscription data...</Typography>
        ) : (
          <Box>
            <Typography>
              <strong>Has Premium Access:</strong> {hasPremium() ? 'Yes' : 'No'}
            </Typography>
            
            {subscription ? (
              <>
                <Typography>
                  <strong>Status:</strong> {subscription.status}
                </Typography>
                <Typography>
                  <strong>Plan:</strong> {subscription.plan}
                </Typography>
                <Typography>
                  <strong>Expires:</strong> {new Date(subscription.endDate).toLocaleDateString()}
                </Typography>
              </>
            ) : (
              <Typography>No active subscription</Typography>
            )}
            
            <Box sx={{ mt: 2 }}>
              {currentUser ? (
                <Grid container spacing={2}>
                  <Grid item>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={simulateSubscription}
                      disabled={hasPremium()}
                    >
                      Simulate Subscription
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={simulateCancellation}
                      disabled={!subscription}
                    >
                      Simulate Cancellation
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  Please log in to test subscription features
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Test Premium Feature Component */}
      <Typography variant="h6" gutterBottom>
        Premium Feature Test
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PremiumFeature
            title="Premium Content"
            description="This is a test of the premium content paywall"
          >
            <Paper sx={{ p: 3, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="h6" gutterBottom>
                Premium Content Unlocked!
              </Typography>
              <Typography>
                This content is only visible to premium subscribers.
                If you can see this, your subscription is working correctly.
              </Typography>
            </Paper>
          </PremiumFeature>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubscriptionTest;
