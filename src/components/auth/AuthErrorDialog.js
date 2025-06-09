import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Typography
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../../contexts/AuthContext';

const AuthErrorDialog = ({ open, onClose, message = "You need to be signed in to perform this action." }) => {
  const { loginWithGoogle } = useAuth();
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose(); // Close the dialog after successful login
    } catch (error) {
      console.error('Google login error:', error);
      // Error is handled by the auth context
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="auth-error-dialog-title"
      aria-describedby="auth-error-dialog-description"
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid rgba(57, 255, 20, 0.2)',
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
        }
      }}
    >
      <DialogTitle id="auth-error-dialog-title">
        <Typography variant="h6" color="#39FF14">
          Authentication Required
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="auth-error-dialog-description" sx={{ color: 'text.primary' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          sx={{
            mb: 1,
            py: 1,
            borderColor: '#39FF14',
            color: '#fff',
            '&:hover': {
              borderColor: '#00E676',
              backgroundColor: 'rgba(57, 255, 20, 0.1)'
            }
          }}
        >
          Sign in with Google
        </Button>
        <Button 
          fullWidth 
          onClick={onClose}
          variant="text"
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthErrorDialog;
