import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import useResponsiveLayout from '../hooks/useResponsiveLayout';

/**
 * Component to display when no games are available for a sport
 */
const EmptyState = ({ sport, onViewUpcoming, onViewResults }) => {
  const { isMobile } = useResponsiveLayout();
  
  // Get appropriate icon for the sport
  const getSportIcon = () => {
    const iconProps = { 
      fontSize: isMobile ? 'large' : 'inherit',
      sx: { 
        fontSize: isMobile ? 48 : 64,
        color: 'primary.main',
        opacity: 0.8
      }
    };
    
    switch(sport?.toLowerCase()) {
      case 'nfl':
        return <SportsFootballIcon {...iconProps} />;
      case 'nba':
        return <SportsBasketballIcon {...iconProps} />;
      case 'mlb':
        return <SportsBaseballIcon {...iconProps} />;
      case 'nhl':
        return <SportsHockeyIcon {...iconProps} />;
      case 'soccer':
        return <SportsSoccerIcon {...iconProps} />;
      case 'tennis':
        return <SportsTennisIcon {...iconProps} />;
      default:
        return <SportsBaseballIcon {...iconProps} />;
    }
  };
  
  // Get appropriate message for next games
  const getNextGameMessage = () => {
    // In a real app, this would check the schedule API
    return `Check back later for upcoming ${sport} games.`;
  };
  
  return (
    <Paper 
      elevation={isMobile ? 0 : 1}
      sx={{ 
        textAlign: 'center', 
        py: isMobile ? 4 : 8,
        px: 2,
        mx: isMobile ? 0 : 2,
        my: isMobile ? 2 : 4,
        backgroundColor: isMobile ? 'transparent' : 'background.paper'
      }}
    >
      <Box sx={{ mb: 2 }}>
        {getSportIcon()}
      </Box>
      
      <Typography variant={isMobile ? 'h6' : 'h5'} color="text.primary">
        No {sport} games available right now
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mt: 1,
          mb: 3,
          mx: 'auto',
          maxWidth: '80%'
        }}
      >
        {getNextGameMessage()}
      </Typography>
      
      <Divider sx={{ my: 2, width: '60%', mx: 'auto' }} />
      
      <Box 
        sx={{ 
          mt: 3, 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center', 
          gap: isMobile ? 1.5 : 2,
          alignItems: 'center'
        }}
      >
        <Button 
          variant="outlined" 
          startIcon={<CalendarTodayIcon />}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          onClick={onViewUpcoming}
          sx={{ minWidth: isMobile ? '100%' : 180 }}
        >
          View Upcoming Games
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<HistoryIcon />}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
          onClick={onViewResults}
          sx={{ minWidth: isMobile ? '100%' : 180 }}
        >
          View Recent Results
        </Button>
      </Box>
      
      {!isMobile && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
          Game data refreshes automatically every 5 minutes
        </Typography>
      )}
    </Paper>
  );
};

export default EmptyState;
