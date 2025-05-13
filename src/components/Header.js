import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';

const Header = ({ currentPage, navigateTo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mobile menu state
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  // Auth dialog state
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0); // 0 for login, 1 for register
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleAuthDialogOpen = (tabIndex) => {
    setAuthTab(tabIndex);
    setAuthDialogOpen(true);
  };
  
  const handleAuthDialogClose = () => {
    setAuthDialogOpen(false);
    // Reset form fields
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };
  
  const handleAuthTabChange = (event, newValue) => {
    setAuthTab(newValue);
  };
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder for login logic
    console.log('Login with:', email, password);
    handleAuthDialogClose();
  };
  
  const handleRegister = (e) => {
    e.preventDefault();
    // Placeholder for register logic
    console.log('Register with:', email, password);
    handleAuthDialogClose();
  };
  
  const handleNavigation = (page) => {
    navigateTo(page);
    handleMobileMenuClose();
  };
  
  // Navigation links
  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Odds', page: 'odds' },
  ];
  
  return (
    <>
      <AppBar position="static" sx={{ background: '#121212' }}>
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            onClick={() => navigateTo('home')}
            sx={{
              cursor: 'pointer',
              color: '#39FF14',
              textDecoration: 'none',
              flexGrow: 1,
              fontWeight: 'bold',
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 5px rgba(57, 255, 20, 0.5)',
              letterSpacing: '1px'
            }}
          >
            BEAT THE BOOKS
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navLinks.map((link) => (
                <Button
                  key={link.name}
                  onClick={() => navigateTo(link.page)}
                  sx={{
                    mx: 1,
                    color: currentPage === link.page ? '#39FF14' : 'white',
                    '&:hover': {
                      color: '#39FF14',
                    },
                  }}
                >
                  {link.name}
                </Button>
              ))}
              
              <Box sx={{ ml: 2, display: 'flex' }}>
                <Button
                  variant="outlined"
                  onClick={() => handleAuthDialogOpen(0)}
                  sx={{
                    borderColor: '#39FF14',
                    color: 'white',
                    mr: 1,
                    '&:hover': {
                      borderColor: '#00E676',
                      backgroundColor: 'rgba(57, 255, 20, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleAuthDialogOpen(1)}
                  sx={{
                    backgroundColor: '#39FF14',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: '#00E676',
                    },
                  }}
                >
                  Register
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Mobile Navigation */}
          {isMobile && (
            <Box sx={{ display: 'flex' }}>
              <IconButton
                color="inherit"
                aria-label="account"
                onClick={() => handleAuthDialogOpen(0)}
                sx={{ mr: 1 }}
              >
                <PersonIcon />
              </IconButton>
              
              <IconButton
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              
              <Menu
                anchorEl={mobileMenuAnchorEl}
                open={isMobileMenuOpen}
                onClose={handleMobileMenuClose}
              >
                {navLinks.map((link) => (
                  <MenuItem 
                    key={link.name} 
                    onClick={() => handleNavigation(link.page)}
                    selected={currentPage === link.page}
                  >
                    {link.name}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* Auth Dialog */}
      <Dialog 
        open={authDialogOpen} 
        onClose={handleAuthDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Tabs 
            value={authTab} 
            onChange={handleAuthTabChange}
            variant="fullWidth"
            sx={{
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
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
        </DialogTitle>
        
        <DialogContent>
          {authTab === 0 ? (
            // Login Form
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#39FF14',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#00E676',
                  },
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            // Register Form
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#39FF14',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#00E676',
                  },
                }}
              >
                Create Account
              </Button>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleAuthDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
