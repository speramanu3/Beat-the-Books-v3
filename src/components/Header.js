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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme } from '../contexts/ThemeContext';
import AuthModal from './auth/AuthModal';
import UserProfile from './auth/UserProfile';

const Header = ({ currentPage, navigateTo }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { currentUser } = useAuth();
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
  
  // Navigation links
  const navLinks = [
    { name: 'Home', page: 'home' },
    { name: 'Odds', page: 'odds' },
    { name: 'EVs', page: 'evs' },
    { name: 'My Bets', page: 'bets' },
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
            backgroundColor: '#1e1e1e',
            borderRadius: 2,
            border: '1px solid rgba(57, 255, 20, 0.1)',
          },
        }}
      >
        {navLinks.map((link) => (
          <MenuItem 
            key={link.page} 
            onClick={() => handleNavigation(link.page)}
            selected={currentPage === link.page}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(57, 255, 20, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(57, 255, 20, 0.05)',
              },
            }}
          >
            <Typography textAlign="center">{link.name}</Typography>
          </MenuItem>
        ))}
        
        {/* Show login/signup options only if not logged in */}
        {!currentUser && (
          <>
            <MenuItem onClick={() => handleAuthModalOpen(0)}>
              <Typography textAlign="center">Login</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleAuthModalOpen(1)}>
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
