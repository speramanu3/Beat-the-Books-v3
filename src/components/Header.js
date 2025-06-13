import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import AuthModal from './auth/AuthModal';
import UserProfile from './auth/UserProfile';

const Header = ({ currentPage, navigateTo }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { currentUser, logout } = useAuth();
  const { themeMode } = useAppTheme();
  
  // Mobile menu state
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);
  
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState(0); // 0 for login, 1 for register
  
  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleAuthModalOpen = (tabIndex) => {
    setAuthTab(tabIndex);
    setAuthModalOpen(true);
  };
  
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
  };
  
  const handleNavigation = (page) => {
    navigateTo(page);
    handleMobileMenuClose();
  };
  
  // Listen for custom auth modal open events from other components
  useEffect(() => {
    const handleOpenAuthModalEvent = (event) => {
      console.log('Received open-auth-modal event', event.detail);
      const tabIndex = event.detail?.tab ?? 0;
      handleAuthModalOpen(tabIndex);
    };
    
    window.addEventListener('open-auth-modal', handleOpenAuthModalEvent);
    
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuthModalEvent);
    };
  }, []);
  
  // Navigation links
  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Odds', page: 'odds' },
    { name: 'EVs', page: 'evs' },
    { name: 'My Bets', page: 'bets' },
    { name: 'Premium', page: 'subscription' },
  ];
  
  return (
    <>
      <AppBar position="static" sx={{ background: themeMode === 'light' ? '#f5f5f5' : '#121212' }}>
        <Toolbar>
          {/* Logo */}
          <Typography
            variant="h6"
            onClick={() => navigateTo('home')}
            sx={{
              cursor: 'pointer',
              color: themeMode === 'light' ? '#007E33' : '#39FF14', // Darker green for light theme
              fontWeight: 'bold',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: 1,
              textShadow: themeMode === 'light' 
                ? '0 0 5px rgba(0, 126, 51, 0.5)' 
                : '0 0 5px rgba(57, 255, 20, 0.5)'
            }}
          >
            BEAT THE BOOKS
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              {navLinks.map((link) => (
                <Button
                  key={link.page}
                  onClick={() => navigateTo(link.page)}
                  sx={{
                    color: currentPage === link.page 
                      ? (themeMode === 'light' ? '#007E33' : '#39FF14')
                      : (themeMode === 'light' ? '#121212' : '#fff'),
                    display: 'block',
                    mx: 1,
                    '&:hover': {
                      color: themeMode === 'light' ? '#007E33' : '#39FF14',
                    },
                    borderBottom: currentPage === link.page 
                      ? `2px solid ${themeMode === 'light' ? '#007E33' : '#39FF14'}` 
                      : 'none',
                    borderRadius: 0,
                    paddingBottom: '6px',
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Auth Buttons or User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              currentUser ? (
                <UserProfile navigateTo={navigateTo} />
              ) : (
                <>
                  <Button 
                    variant="outlined" 
                    onClick={() => handleAuthModalOpen(0)}
                    sx={{ 
                      color: themeMode === 'light' ? '#121212' : '#fff', 
                      borderColor: themeMode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                      mr: 2,
                      '&:hover': {
                        borderColor: themeMode === 'light' ? '#007E33' : '#39FF14',
                        backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.1)' : 'rgba(57, 255, 20, 0.1)'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => handleAuthModalOpen(1)}
                    sx={{ 
                      backgroundColor: themeMode === 'light' ? '#007E33' : '#39FF14',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: themeMode === 'light' ? '#00A65A' : '#32CD32'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={mobileMenuAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiPaper-root': {
            backgroundColor: themeMode === 'light' ? '#f5f5f5' : '#1e1e1e',
            borderRadius: 2,
            border: `1px solid ${themeMode === 'light' ? 'rgba(0, 126, 51, 0.1)' : 'rgba(57, 255, 20, 0.1)'}`,
          },
        }}
      >
        {/* Show user profile info if logged in */}
        {currentUser && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`}}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: themeMode === 'light' ? '#007E33' : '#39FF14',
                  color: themeMode === 'light' ? '#fff' : '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  mr: 2
                }}
              >
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ color: themeMode === 'light' ? '#121212' : '#fff', fontWeight: 'bold' }}>
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: themeMode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>
                  {currentUser.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {navLinks.map((link) => (
          <MenuItem 
            key={link.page} 
            onClick={() => handleNavigation(link.page)}
            selected={currentPage === link.page}
            sx={{
              '&.Mui-selected': {
                backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.1)' : 'rgba(57, 255, 20, 0.1)',
              },
              '&:hover': {
                backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.05)' : 'rgba(57, 255, 20, 0.05)',
              },
              color: themeMode === 'light' ? '#121212' : '#fff',
            }}
          >
            <Typography textAlign="center">{link.name}</Typography>
          </MenuItem>
        ))}
        
        {/* User account options if logged in */}
        {currentUser && (
          <>
            <Divider sx={{ my: 1, borderColor: themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }} />
            
            <MenuItem 
              onClick={() => {
                handleNavigation('profile');
              }}
              sx={{
                color: themeMode === 'light' ? '#121212' : '#fff',
                '&:hover': {
                  backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.05)' : 'rgba(57, 255, 20, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon fontSize="small" />
                </Box>
                <Typography>Profile</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                handleNavigation('settings');
              }}
              sx={{
                color: themeMode === 'light' ? '#121212' : '#fff',
                '&:hover': {
                  backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.05)' : 'rgba(57, 255, 20, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <IconButton size="small" sx={{ p: 0 }}>
                    <Box component="span" sx={{ color: themeMode === 'light' ? '#121212' : '#fff' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </Box>
                  </IconButton>
                </Box>
                <Typography>Settings</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => {
                handleNavigation('favorites');
              }}
              sx={{
                color: themeMode === 'light' ? '#121212' : '#fff',
                '&:hover': {
                  backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.05)' : 'rgba(57, 255, 20, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: themeMode === 'light' ? '#121212' : '#fff' }}>
                  <FavoriteIcon fontSize="small" />
                </Box>
                <Typography>Favorites</Typography>
              </Box>
            </MenuItem>
            
            <Divider sx={{ my: 1, borderColor: themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }} />
            
            <MenuItem 
              onClick={async () => {
                try {
                  await logout();
                  handleMobileMenuClose();
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              sx={{
                color: themeMode === 'light' ? '#d32f2f' : '#f44336',
                '&:hover': {
                  backgroundColor: themeMode === 'light' ? 'rgba(211, 47, 47, 0.05)' : 'rgba(244, 67, 54, 0.05)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                  <LogoutIcon fontSize="small" />
                </Box>
                <Typography>Logout</Typography>
              </Box>
            </MenuItem>
          </>
        )}
        
        {/* Show login/signup options only if not logged in */}
        {!currentUser && (
          <>
            <MenuItem 
              onClick={() => handleAuthModalOpen(0)}
              sx={{
                color: themeMode === 'light' ? '#121212' : '#fff',
              }}
            >
              <Typography textAlign="center">Login</Typography>
            </MenuItem>
            <MenuItem 
              onClick={() => handleAuthModalOpen(1)}
              sx={{
                color: themeMode === 'light' ? '#121212' : '#fff',
                backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                '&:hover': {
                  backgroundColor: themeMode === 'light' ? 'rgba(0, 126, 51, 0.2)' : 'rgba(57, 255, 20, 0.2)',
                },
              }}
            >
              <Typography textAlign="center">Sign Up</Typography>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={handleAuthModalClose} 
        initialTab={authTab} 
      />
    </>
  );
};

export default Header;
