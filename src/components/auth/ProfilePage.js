import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  // State for edit mode
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.displayName || '');
  
  // Placeholder password (we don't actually retrieve the real password as it's not accessible)
  const [password] = useState('••••••••••••');
  
  // State for feedback messages
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  // Get user's initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleEditName = () => {
    setIsEditingName(true);
  };
  
  const handleCancelEdit = () => {
    setEditedName(currentUser?.displayName || '');
    setIsEditingName(false);
  };
  
  const handleSaveName = () => {
    // In a real implementation, this would update the user's name in Firebase
    // For now, we'll just show a success message
    setFeedback({
      message: 'Profile updated successfully!',
      type: 'success'
    });
    setIsEditingName(false);
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 3000);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          color: '#39FF14', 
          fontFamily: '"Orbitron", sans-serif',
          textShadow: '0 0 5px rgba(57, 255, 20, 0.5)',
          mb: 4
        }}
      >
        My Profile
      </Typography>
      
      {feedback.message && (
        <Alert 
          severity={feedback.type} 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Profile Summary Card */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              bgcolor: '#1e1e1e',
              border: '1px solid rgba(57, 255, 20, 0.2)',
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                src={currentUser?.photoURL}
                alt={currentUser?.displayName || 'User'}
                sx={{
                  bgcolor: currentUser?.photoURL ? 'transparent' : '#39FF14',
                  color: currentUser?.photoURL ? 'inherit' : '#000',
                  width: 120,
                  height: 120,
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  mx: 'auto',
                  mb: 2,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  border: '4px solid rgba(57, 255, 20, 0.3)',
                }}
              >
                {!currentUser?.photoURL && getInitials(currentUser?.displayName)}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentUser?.displayName || 'User'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                {currentUser?.emailVerified ? (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: 'rgba(57, 255, 20, 0.2)', 
                      color: '#39FF14',
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 10
                    }}
                  >
                    Verified Account
                  </Typography>
                ) : (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      bgcolor: 'rgba(255, 193, 7, 0.2)', 
                      color: 'warning.main',
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 10
                    }}
                  >
                    Email Not Verified
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: '#1e1e1e',
              border: '1px solid rgba(57, 255, 20, 0.2)',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: '#39FF14', 
                fontFamily: '"Orbitron", sans-serif',
                mb: 3
              }}
            >
              Account Information
            </Typography>
            
            <Grid container spacing={3}>
              {/* Display Name */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Display Name
                  </Typography>
                  
                  {isEditingName ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#39FF14' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(57, 255, 20, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(57, 255, 20, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#39FF14',
                            },
                          },
                        }}
                      />
                      <IconButton 
                        onClick={handleSaveName} 
                        sx={{ color: '#39FF14', ml: 1 }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton 
                        onClick={handleCancelEdit} 
                        sx={{ color: 'text.secondary', ml: 1 }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        value={currentUser?.displayName || ''}
                        variant="outlined"
                        size="small"
                        disabled
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon sx={{ color: '#39FF14' }} />
                            </InputAdornment>
                          ),
                          readOnly: true,
                        }}
                      />
                      <IconButton 
                        onClick={handleEditName} 
                        sx={{ color: '#39FF14', ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              {/* Email */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    value={currentUser?.email || ''}
                    variant="outlined"
                    size="small"
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: '#39FF14' }} />
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                  />
                </Box>
              </Grid>
              
              {/* Password */}
              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    variant="outlined"
                    size="small"
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: '#39FF14' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            sx={{ color: '#39FF14' }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      readOnly: true,
                    }}
                  />
                </Box>
                <Button 
                  variant="text" 
                  size="small" 
                  sx={{ 
                    color: '#39FF14', 
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    p: 0,
                    ml: 0.5,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Change Password
                </Button>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: '#39FF14',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#32CD32'
                  }
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
