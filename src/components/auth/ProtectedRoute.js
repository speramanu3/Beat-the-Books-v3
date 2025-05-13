import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A wrapper component that redirects to the login page if the user is not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if authenticated
 * @param {boolean} props.requireVerified - Whether email verification is required
 * @returns {React.ReactNode} The protected component or redirect
 */
const ProtectedRoute = ({ children, requireVerified = false }) => {
  const { currentUser, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} sx={{ color: '#39FF14', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to home page if user is not logged in
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If verification is required, check if email is verified
  if (requireVerified && !currentUser.emailVerified) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" color="#39FF14" gutterBottom>
          Email Verification Required
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please check your email and verify your account before accessing this page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you haven't received the verification email, you can request a new one from your profile settings.
        </Typography>
      </Box>
    );
  }

  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
