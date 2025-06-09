import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText,
  DialogTitle, 
  TextField, 
  IconButton, 
  Snackbar, 
  Alert, 
  Tooltip, 
  Zoom, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid
} from '@mui/material';
import { triggerBetAddedEvent } from '../utils/betSyncUtils';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppTheme } from '../contexts/ThemeContext';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';
import { saveBet } from '../utils/syncUtils';
import AuthErrorDialog from './auth/AuthErrorDialog';

const AddBetButtonV2 = ({ game, bookmaker, market, outcome, userId: propUserId, isAdded = false }) => {
  // Ensure we have valid objects for all required props
  const safeGame = game || {};
  const safeBookmaker = bookmaker || {};
  const safeMarket = market || {};
  const safeOutcome = outcome || {};
  
  // Normalize bookmaker key to handle different formats (lowvig vs lowvig.ag)
  const normalizeBookmakerKey = (key) => {
    if (!key) return '';
    // Convert to lowercase for consistent comparison
    const lowerKey = key.toLowerCase();
    // Handle specific cases where keys might differ between data sources
    if (lowerKey === 'lowvig') return 'lowvig';
    if (lowerKey === 'lowvig.ag') return 'lowvig';
    if (lowerKey === 'betway') return 'betway';
    if (lowerKey === 'betway.ag') return 'betway';
    return lowerKey;
  };
  
  // Determine which bookmaker key to use, with fallback to title if key is missing
  const bookmakerKeyToUse = safeBookmaker.key || safeBookmaker.title;
  
  // Normalize the bookmaker key for consistency
  const normalizedBookmakerKey = normalizeBookmakerKey(bookmakerKeyToUse);
  
  // Debug logging for bookmaker info - only log 1% of the time to reduce console noise
  if (Math.random() < 0.01) {
    console.log('[AddBetButtonV2] Bookmaker info:', {
      originalKey: safeBookmaker.key,
      bookmakerKeyToUse,
      normalizedKey: normalizedBookmakerKey,
      title: safeBookmaker.title
    });
  }
  
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Bet added successfully!');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [authErrorOpen, setAuthErrorOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [betAdded, setBetAdded] = useState(isAdded);
  const { themeMode } = useAppTheme();
  
  // Update betAdded state when isAdded prop changes
  useEffect(() => {
    setBetAdded(isAdded);
  }, [isAdded]);
  const [betDetails, setBetDetails] = useState({
    gameId: game?.id || '',
    homeTeam: game?.home_team || '',
    awayTeam: game?.away_team || '',
    gameDate: game?.commence_time ? new Date(game.commence_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    betType: market?.key || 'moneyline',
    team: outcome?.name || '',
    odds: outcome?.price || '',
    units: 1,
    sportsbook: bookmaker?.title || '',
    result: 'pending',
    notes: '',
  });

  const handleOpen = () => {
    const auth = getAuth();
    const currentUserId = propUserId || auth.currentUser?.uid;
    
    if (!currentUserId) {
      console.error('[AddBetButtonV2] User not logged in. Cannot add bet.');
      setAuthErrorOpen(true);
      return;
    }
    
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBetDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveBet = async () => {
    const auth = getAuth();
    const currentUserId = propUserId || auth.currentUser?.uid;

    if (!currentUserId) {
      console.error('[AddBetButtonV2] Error saving bet: User ID is not available. User might be logged out.');
      setAuthErrorOpen(true);
      return;
    }

    console.log('[AddBetButtonV2] handleSaveBet called.');
    console.log('[AddBetButtonV2] Initial betDetails from state:', JSON.parse(JSON.stringify(betDetails)));
    console.log('[AddBetButtonV2] User ID determined as:', currentUserId);

    try {
      // Log the props we received for debugging
      console.log('[AddBetButtonV2] Props received:', {
        game: safeGame,
        bookmaker: safeBookmaker,
        normalizedKey: normalizedBookmakerKey,
        market: safeMarket,
        outcome: safeOutcome
      });
      
      // Validate required data before proceeding
      if (!safeGame.id) {
        console.error('[AddBetButtonV2] Game ID is missing. Game data:', safeGame);
        throw new Error('Game ID is missing or invalid');
      }
      
      // More robust bookmaker key validation
      if (!safeBookmaker || (!normalizedBookmakerKey)) {
        console.error('[AddBetButtonV2] Bookmaker key and title are missing. Bookmaker data:', safeBookmaker);
        throw new Error(`Sportsbook key and title are missing or invalid: ${JSON.stringify(safeBookmaker)}`);
      }
      
      if (!safeMarket.key) {
        console.error('[AddBetButtonV2] Market key is missing. Market data:', safeMarket);
        throw new Error('Market key is missing or invalid');
      }
      
      if (!safeOutcome.name) {
        console.error('[AddBetButtonV2] Outcome name is missing. Outcome data:', safeOutcome);
        throw new Error('Outcome name is missing or invalid');
      }
      
      // Prepare the bet data with all necessary fields for matching and display in BetTracker
      // Use string values for all fields to avoid undefined issues
      const betData = {
        // Game information
        gameId: safeGame.id,
        homeTeam: safeGame.home_team,
        awayTeam: safeGame.away_team,
        teams: `${safeGame.away_team} @ ${safeGame.home_team}`,
        commenceTime: safeGame.commence_time,
        gameDate: safeGame.commence_time ? new Date(safeGame.commence_time).toISOString() : new Date().toISOString(),
        
        // Bookmaker information
        sportsbook: normalizedBookmakerKey, // This is the key field syncUtils checks
        bookmakerKey: normalizedBookmakerKey, // For backward compatibility
        bookmakerTitle: safeBookmaker.title || normalizedBookmakerKey,
        
        // Bet type information
        market: safeMarket.key,
        betType: safeMarket.key,
        
        // Outcome information
        outcome: safeOutcome.name,
        team: safeOutcome.name,
        
        // Odds and point information
        odds: safeOutcome.price,
        point: safeOutcome.point !== undefined ? safeOutcome.point : null,
        line: safeOutcome.point !== undefined ? safeOutcome.point : null, // Add line for consistency with BetTracker
        
        // Bet details
        units: betDetails.units || '1',
        amount: betDetails.amount || '',
        notes: betDetails.notes || '',
        result: 'pending',
        
        // Metadata
        timestamp: Date.now(),
        status: 'open'
      };
      
      // Detailed logging of the prepared bet data
      console.log('[AddBetButtonV2] Prepared bet data:', betData);

      console.log('[AddBetButtonV2] Attempting to save bet with optimized sync.');
      console.log('[AddBetButtonV2] Data to save:', JSON.parse(JSON.stringify(betData)));

      // Use the optimized saveBet utility
      const result = await saveBet(currentUserId, betData);
      
      if (result && result.success === false) {
        throw new Error(result.error || 'Unknown error saving bet');
      }
      
      console.log('[AddBetButtonV2] Bet saved successfully');
      
      // Create a comprehensive event detail object with all necessary fields
      const eventDetail = {
        gameId: safeGame.id,
        sportsbook: normalizedBookmakerKey,
        bookmakerKey: normalizedBookmakerKey, // For backward compatibility
        market: safeMarket.key,
        betType: safeMarket.key, // For backward compatibility
        outcome: safeOutcome.name,
        team: safeOutcome.name, // For backward compatibility
        point: safeOutcome.point !== undefined ? safeOutcome.point : null,
        line: safeOutcome.point !== undefined ? safeOutcome.point : null, // For backward compatibility
        odds: safeOutcome.price,
        homeTeam: safeGame.home_team,
        awayTeam: safeGame.away_team,
        teams: `${safeGame.away_team} @ ${safeGame.home_team}`,
        timestamp: Date.now()
      };
      
      // Use the utility function to trigger the betAdded event with comprehensive data
      console.log('[AddBetButtonV2] Triggering betAdded event with comprehensive data:', eventDetail);
      triggerBetAddedEvent(eventDetail);
      
      // Store the bet in localStorage for sync purposes
      try {
        const checkedBetsJson = localStorage.getItem('checkedBets') || '[]';
        const checkedBets = JSON.parse(checkedBetsJson);
        
        // Add the new bet to the array if it doesn't already exist
        const betExists = checkedBets.some(bet => 
          bet.gameId === eventDetail.gameId && 
          bet.sportsbook === eventDetail.sportsbook && 
          bet.market === eventDetail.market && 
          bet.outcome === eventDetail.outcome && 
          bet.point === eventDetail.point
        );
        
        if (!betExists) {
          checkedBets.push(eventDetail);
          localStorage.setItem('checkedBets', JSON.stringify(checkedBets));
          console.log('[AddBetButtonV2] Added bet to localStorage for sync purposes');
        }
      } catch (error) {
        console.error('[AddBetButtonV2] Error storing bet in localStorage:', error);
      }
      
      setBetAdded(true); // Mark this bet as added
      setOpen(false); // Close dialog after saving
      setSnackbarMessage('Bet added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true); // Show success notification
    } catch (error) {
      console.error('[AddBetButtonV2] Error saving bet:', error);
      // Provide a more user-friendly error message
      let userMessage = error.message;
      if (error.message.includes('Sportsbook key')) {
        userMessage = 'Unable to save bet: The sportsbook information is missing or invalid. Please try again or contact support.';
      }
      setErrorMessage(userMessage);
      setErrorOpen(true);
      setOpen(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      {betAdded ? (
        <Tooltip title="Bet Added to Tracker">
          <IconButton 
            size="small" 
            disabled
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.1)' 
              } 
            }}
          >
            <CheckCircleIcon 
              sx={{ 
                color: themeMode === 'dark' ? '#4caf50' : '#2e7d32' // Neon green for dark theme, dark green for light theme
              }} 
            />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Add to Bet Tracker">
          <IconButton 
            size="small" 
            color="primary" 
            onClick={handleOpen}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 0.2)' 
              } 
            }}
          >
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bet to Tracker</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="homeTeam"
                label="Home Team"
                fullWidth
                value={betDetails.homeTeam}
                onChange={handleInputChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="awayTeam"
                label="Away Team"
                fullWidth
                value={betDetails.awayTeam}
                onChange={handleInputChange}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="betType"
                label="Bet Type"
                fullWidth
                value={betDetails.betType}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="team"
                label="Team/Selection"
                fullWidth
                value={betDetails.team}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="odds"
                label="Odds (American)"
                fullWidth
                value={betDetails.odds}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="units"
                label="Units"
                type="number"
                fullWidth
                value={betDetails.units}
                onChange={handleInputChange}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sportsbook"
                label="Sportsbook"
                fullWidth
                value={betDetails.sportsbook}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Result</InputLabel>
                <Select
                  name="result"
                  value={betDetails.result}
                  label="Result"
                  onChange={handleInputChange}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="win">Win</MenuItem>
                  <MenuItem value="loss">Loss</MenuItem>
                  <MenuItem value="push">Push</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={betDetails.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveBet} variant="contained" color="primary">
            Save Bet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Authentication Error Dialog */}
      <AuthErrorDialog 
        open={authErrorOpen} 
        onClose={() => setAuthErrorOpen(false)} 
        message="You need to be signed in to add a bet. Would you like to sign in now?"
      />
      
      {/* Error Dialog for validation errors */}
      <Dialog
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title">Error Saving Bet</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorOpen(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBetButtonV2;
