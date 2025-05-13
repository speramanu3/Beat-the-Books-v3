import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const AuthModal = ({ open, onClose, initialTab = 0 }) => {
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const { login, signup, loginWithGoogle, error, setError } = useAuth();

  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      setTab(initialTab);
      resetForm();
    }
  }, [open, initialTab]);

  // Reset form when tab changes
  useEffect(() => {
    resetForm();
  }, [tab]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setShowPassword(false);
    setIsSubmitting(false);
    setSuccessMessage('');
    setFormErrors({});
    setError('');
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Additional validation for signup
    if (tab === 1) {
      if (!displayName) {
        errors.displayName = 'Name is required';
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
      setSuccessMessage('Login successful!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      // Error is set by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await signup(email, password, displayName);
      setSuccessMessage('Account created successfully! Please check your email for verification.');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
      // Error is set by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      await loginWithGoogle();
      setSuccessMessage('Login successful!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Google login error:', error);
      // Error is set by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? null : onClose}
      aria-labelledby="auth-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '90%', sm: 450 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          outline: 'none',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(57, 255, 20, 0.2)',
          background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
          margin: 'auto'
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          id="auth-modal-title"
          variant="h5"
          component="h2"
          sx={{
            mb: 2,
            textAlign: 'center',
            color: '#39FF14',
            fontWeight: 'bold',
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          {tab === 0 ? 'WELCOME BACK' : 'JOIN BEAT THE BOOKS'}
        </Typography>

        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 'bold',
            },
            '& .Mui-selected': {
              color: '#39FF14',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#39FF14',
            },
          }}
        >
          <Tab label="Login" disabled={isSubmitting} />
          <Tab label="Sign Up" disabled={isSubmitting} />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {tab === 0 ? (
          // Login Form
          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #39FF14 30%, #00E676 90%)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00E676 30%, #39FF14 90%)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.5)',
                  background: 'rgba(57, 255, 20, 0.3)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#000' }} />
              ) : (
                'LOGIN'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: '#39FF14' } }}
                onClick={() => {
                  // Handle forgot password
                  // This would typically open a password reset dialog
                  alert('Password reset functionality will be implemented soon!');
                }}
              >
                Forgot password?
              </Typography>
            </Box>
          </Box>
        ) : (
          // Sign Up Form
          <Box component="form" onSubmit={handleSignup} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="displayName"
              label="Full Name"
              name="displayName"
              autoComplete="name"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={!!formErrors.displayName}
              helperText={formErrors.displayName}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email-signup"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password-signup"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password-signup"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirm-password"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#39FF14',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#39FF14',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #39FF14 30%, #00E676 90%)',
                color: '#000',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00E676 30%, #39FF14 90%)',
                },
                '&.Mui-disabled': {
                  color: 'rgba(0, 0, 0, 0.5)',
                  background: 'rgba(57, 255, 20, 0.3)',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: '#000' }} />
              ) : (
                'SIGN UP'
              )}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          sx={{
            mt: 1,
            mb: 2,
            py: 1.5,
            borderColor: '#39FF14',
            color: '#fff',
            '&:hover': {
              borderColor: '#00E676',
              backgroundColor: 'rgba(57, 255, 20, 0.1)'
            }
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: '#39FF14' }} />
          ) : (
            'Continue with Google'
          )}
        </Button>
      </Box>
    </Modal>
  );
};

export default AuthModal;
