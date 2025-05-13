import React, { useState } from 'react';
import { 
  Box, 
  Avatar, 
  Typography, 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      handleClose();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Generate initials from display name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get user's first name
  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.split(' ')[0];
  };
  
  return (
    <Box>
      <Button
        onClick={handleClick}
        sx={{
          textTransform: 'none',
          color: '#fff',
          '&:hover': {
            backgroundColor: 'rgba(57, 255, 20, 0.1)',
          },
        }}
        startIcon={
          <Avatar
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'User'}
            sx={{
              bgcolor: currentUser.photoURL ? 'transparent' : '#39FF14',
              color: currentUser.photoURL ? 'inherit' : '#000',
              width: 32,
              height: 32,
              fontSize: '0.875rem',
              fontWeight: 'bold',
            }}
          >
            {!currentUser.photoURL && getInitials(currentUser.displayName)}
          </Avatar>
        }
      >
        <Typography variant="body2" fontWeight="medium">
          {getFirstName(currentUser.displayName)}
        </Typography>
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            bgcolor: '#1e1e1e',
            border: '1px solid rgba(57, 255, 20, 0.2)',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
          <Avatar
            src={currentUser.photoURL}
            alt={currentUser.displayName || 'User'}
            sx={{
              bgcolor: currentUser.photoURL ? 'transparent' : '#39FF14',
              color: currentUser.photoURL ? 'inherit' : '#000',
              width: 60,
              height: 60,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              mx: 'auto',
              mb: 1,
            }}
          >
            {!currentUser.photoURL && getInitials(currentUser.displayName)}
          </Avatar>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentUser.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {currentUser.email}
          </Typography>
          {!currentUser.emailVerified && (
            <Typography variant="caption" color="warning.main">
              Email not verified
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: '#39FF14' }} />
          </ListItemIcon>
          My Profile
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FavoriteIcon fontSize="small" sx={{ color: '#39FF14' }} />
          </ListItemIcon>
          Favorite Bets
        </MenuItem>
        
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: '#39FF14' }} />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <ListItemIcon>
            {isLoggingOut ? (
              <CircularProgress size={20} sx={{ color: '#39FF14' }} />
            ) : (
              <LogoutIcon fontSize="small" sx={{ color: '#39FF14' }} />
            )}
          </ListItemIcon>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile;
