import React from 'react';
import { Box, Typography, Button, Paper, Chip, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * A wrapper component that restricts access to premium features
 * If the user is not subscribed, it shows a paywall instead of the children
 * @param {React.ReactNode} children - The premium content to display if user has access
 * @param {string} title - Title for the premium feature
 * @param {string} description - Description of the premium feature
 * @param {boolean} inline - If true, displays a smaller inline premium indicator instead of full paywall
 */
const PremiumFeature = ({ children, title, description, inline = false }) => {
  const { hasPremium } = useSubscription();
  const { currentUser } = useAuth();
  
  // If user has premium access, show the actual feature
  if (hasPremium()) {
    return children;
  }
  
  // Otherwise show a paywall
  const handleSubscribe = () => {
    // Dispatch a custom event to open the subscription page
    const event = new CustomEvent('navigate-to', { 
      detail: { page: 'subscription' } 
    });
    window.dispatchEvent(event);
  };
  
  const handleLogin = () => {
    // Dispatch a custom event to open the auth modal
    const event = new CustomEvent('open-auth-modal', { 
      detail: { tab: 0 } // 0 for login tab
    });
    window.dispatchEvent(event);
  };
  
  // For inline mode, show a premium chip instead of full paywall
  if (inline) {
    return (
      <Tooltip
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2">
              {description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              Upgrade to premium to unlock this feature
            </Typography>
          </Box>
        }
        arrow
      >
        <Chip
          icon={<StarIcon />}
          label="Premium"
          color="secondary"
          size="small"
          onClick={currentUser ? handleSubscribe : handleLogin}
          sx={{ cursor: 'pointer' }}
        />
      </Tooltip>
    );
  }
  
  // Full paywall for non-inline mode
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.02)'
      }}
    >
      <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      
      <Typography variant="h5" component="h2" gutterBottom>
        {title || 'Premium Feature'}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {description || 'This feature is available exclusively to premium subscribers.'}
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        {currentUser ? (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSubscribe}
          >
            Upgrade to Premium
          </Button>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Please log in to access premium features
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleLogin}
            >
              Log In
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PremiumFeature;
