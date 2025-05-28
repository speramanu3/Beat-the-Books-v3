import React, { useState } from 'react';
import { 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Snackbar,
  Alert,
  Zoom
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { get, set, ref, getDatabase } from 'firebase/database';

const AddBetButton = ({ game, bookmaker, market, outcome }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [betDetails, setBetDetails] = useState({
    gameId: game?.id || '',
    homeTeam: game?.home_team || '',
    awayTeam: game?.away_team || '',
    gameDate: game?.commence_time ? new Date(game.commence_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    betType: market?.key || 'moneyline',
    team: outcome?.name || '',
    line: outcome?.point || '',
    odds: outcome?.price || '',
    units: 1,
    sportsbook: bookmaker?.title || '',
    result: 'pending',
    notes: '',
    timestamp: Date.now()
  });

  const handleOpen = () => {
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
    try {
      const db = getDatabase();
      const newBetRef = ref(db, `user_bets/${Date.now()}`);
      await set(newBetRef, betDetails);
      
      // Close dialog after saving
      setOpen(false);
      
      // Show success notification
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving bet:', error);
    }
  };
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <>
      <Tooltip title="Add to Bet Tracker">
        <IconButton 
          size="small" 
          onClick={handleOpen}
          sx={{ 
            color: 'rgba(144, 202, 249, 0.8)', // Neutral blue color with transparency
            '&:hover': { 
              color: '#64b5f6', 
              transform: 'scale(1.1)',
              filter: 'brightness(1.2)'
            } 
          }}
        >
          <AddCircleIcon />
        </IconButton>
      </Tooltip>
      
      {/* Success Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Zoom}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': { fontSize: '1.2rem' },
            boxShadow: 3
          }}
        >
          Bet added to tracker successfully!
        </Alert>
      </Snackbar>
      
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
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
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="awayTeam"
                label="Away Team"
                fullWidth
                value={betDetails.awayTeam}
                onChange={handleInputChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gameDate"
                label="Game Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={betDetails.gameDate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Bet Type</InputLabel>
                <Select
                  name="betType"
                  value={betDetails.betType}
                  label="Bet Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="h2h">Moneyline</MenuItem>
                  <MenuItem value="spreads">Spread</MenuItem>
                  <MenuItem value="totals">Total</MenuItem>
                  <MenuItem value="prop">Prop</MenuItem>
                </Select>
              </FormControl>
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
            {(betDetails.betType === 'spreads' || betDetails.betType === 'totals') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="line"
                  label="Line"
                  fullWidth
                  value={betDetails.line}
                  onChange={handleInputChange}
                />
              </Grid>
            )}
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
                placeholder="Add any notes about this bet..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSaveBet} variant="contained" color="primary">
            Add Bet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddBetButton;
