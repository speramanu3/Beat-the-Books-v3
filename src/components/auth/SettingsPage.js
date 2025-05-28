import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  IconButton,
  useMediaQuery,
  TextField,
  InputAdornment
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SettingsPage = ({ navigateTo }) => {
  const { currentUser } = useAuth();
  const { themeMode, setTheme, theme } = useAppTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // State for feedback messages
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  
  // State for theme preference
  const [currentTheme, setCurrentTheme] = useState(themeMode);
  
  // State for unit value
  const [unitValue, setUnitValue] = useState(() => {
    const savedUnitValue = localStorage.getItem('unitValue');
    return savedUnitValue ? parseFloat(savedUnitValue) : 10;
  });
  const [unitValueError, setUnitValueError] = useState('');
  
  const handleThemeChange = (event) => {
    setCurrentTheme(event.target.checked ? 'dark' : 'light');
  };
  
  const handleUnitValueChange = (event) => {
    const value = event.target.value;
    
    // Clear previous error
    setUnitValueError('');
    
    // Allow empty field for typing
    if (value === '') {
      setUnitValue('');
      return;
    }
    
    // Validate input is a number
    if (!/^\d*\.?\d*$/.test(value)) {
      setUnitValueError('Please enter a valid number');
      return;
    }
    
    setUnitValue(value);
  };
  
  const handleSaveSettings = async () => {
    try {
      // Validate unit value before saving
      if (unitValue === '' || isNaN(parseFloat(unitValue))) {
        setUnitValueError('Please enter a valid number');
        return;
      }
      
      // Convert to number and validate
      const numericUnitValue = parseFloat(unitValue);
      if (numericUnitValue <= 0) {
        setUnitValueError('Unit value must be greater than zero');
        return;
      }
      
      // Save theme preference
      await setTheme(currentTheme);
      
      // Save unit value to localStorage
      localStorage.setItem('unitValue', numericUnitValue.toString());
      
      setFeedback({
        message: 'Settings saved successfully!',
        type: 'success'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setFeedback({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setFeedback({
        message: 'Failed to save settings. Please try again.',
        type: 'error'
      });
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          onClick={() => navigateTo('profile')} 
          sx={{ mr: 2, color: muiTheme.palette.primary.main }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: muiTheme.palette.primary.main, 
            fontFamily: '"Orbitron", sans-serif',
            textShadow: `0 0 5px ${muiTheme.palette.mode === 'dark' ? 'rgba(57, 255, 20, 0.5)' : 'rgba(57, 255, 20, 0.3)'}`,
          }}
        >
          Settings
        </Typography>
      </Box>
      
      {feedback.message && (
        <Alert 
          severity={feedback.type} 
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Settings Summary */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              bgcolor: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)'}`,
              height: '100%'
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              {currentTheme === 'dark' ? (
                <DarkModeIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#39FF14',
                    mb: 2
                  }} 
                />
              ) : (
                <LightModeIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: '#39FF14',
                    mb: 2
                  }} 
                />
              )}
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {currentUser?.displayName || 'User'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current theme: {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSettings}
                sx={{
                  mt: 3,
                  bgcolor: '#39FF14',
                  color: '#000',
                  '&:hover': {
                    bgcolor: '#32CD32',
                  }
                }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Settings Options */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              bgcolor: muiTheme.palette.background.paper,
              border: `1px solid ${muiTheme.palette.mode === 'dark' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.1)'}`,
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: muiTheme.palette.primary.main, 
                fontFamily: '"Orbitron", sans-serif',
                mb: 3
              }}
            >
              Appearance
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {currentTheme === 'dark' ? (
                  <DarkModeIcon sx={{ mr: 2, color: muiTheme.palette.text.secondary }} />
                ) : (
                  <LightModeIcon sx={{ mr: 2, color: muiTheme.palette.text.secondary }} />
                )}
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Theme Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose between light and dark theme
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={currentTheme === 'dark'}
                    onChange={handleThemeChange}
                    color="primary"
                  />
                }
                label={currentTheme === 'dark' ? 'Dark' : 'Light'}
                labelPlacement="start"
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: muiTheme.palette.primary.main, 
                fontFamily: '"Orbitron", sans-serif',
                mb: 3
              }}
            >
              Betting Settings
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    Unit Value
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set the dollar value of one betting unit
                  </Typography>
                </Box>
              </Box>
              <TextField
                value={unitValue}
                onChange={handleUnitValueChange}
                error={!!unitValueError}
                helperText={unitValueError}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                type="text"
                size="small"
                sx={{ width: '120px' }}
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Additional settings can be added here */}
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: muiTheme.palette.primary.main, 
                fontFamily: '"Orbitron", sans-serif',
                mb: 3
              }}
            >
              Notifications
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Email Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive updates about odds changes
                </Typography>
              </Box>
              <FormControlLabel
                control={<Switch color="primary" />}
                label="Off"
                labelPlacement="start"
              />
            </Box>
            
            {!isMobile && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSettings}
                  sx={{
                    bgcolor: '#39FF14',
                    color: '#000',
                    '&:hover': {
                      bgcolor: '#32CD32',
                    }
                  }}
                >
                  Save Settings
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
