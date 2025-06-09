import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { get, set, ref, getDatabase, push } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthErrorDialog from './auth/AuthErrorDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BarChartIcon from '@mui/icons-material/BarChart';
import ListIcon from '@mui/icons-material/List';
import BetTrackerCharts from './BetTrackerCharts';
import { useAppTheme } from '../contexts/ThemeContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  backgroundColor: '#1e1e1e',
  color: '#fff',
}));

const BetTrackerFix = () => {
  const { themeMode } = useAppTheme();
  const [bets, setBets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [unitValue, setUnitValue] = useState(25); // Default unit value
  const [userId, setUserId] = useState(null); // Add userId state
  const [stats, setStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    unitsWagered: 0,
    unitsWon: 0,
    unitsLost: 0,
    roi: 0,
    totalProfit: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [authErrorOpen, setAuthErrorOpen] = useState(false);

  // Load unit value from localStorage
  useEffect(() => {
    const savedUnitValue = localStorage.getItem('unitValue');
    if (savedUnitValue) {
      setUnitValue(parseFloat(savedUnitValue));
    }
  }, []);
  
  // Effect to handle user authentication state
  useEffect(() => {
    const auth = getAuth();
    console.log('[BetTrackerFix] Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('[BetTrackerFix] User authenticated, UID:', user.uid);
      } else {
        setUserId(null);
        setBets([]); // Clear bets when user logs out
        // Reset stats when user logs out
        setStats({
          totalBets: 0,
          wins: 0,
          losses: 0,
          pushes: 0,
          unitsWagered: 0,
          unitsWon: 0,
          unitsLost: 0,
          roi: 0,
          totalProfit: 0,
        });
        console.log('[BetTrackerFix] User not authenticated. Cleared bets and stats.');
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  // Fetch bets from Firebase when userId changes or month/year selection changes
  useEffect(() => {
    const fetchBets = async () => {
      if (!userId) {
        console.log('[BetTrackerFix] Cannot fetch bets: No user ID available');
        return;
      }
      
      console.log('[BetTrackerFix] Fetching bets for user ID:', userId);
      
      try {
        const db = getDatabase();
        const userBetsRef = ref(db, `user_bets/${userId}`);
        console.log('[BetTrackerFix] Fetching from path:', userBetsRef.toString());
        
        const snapshot = await get(userBetsRef);
        
        if (snapshot.exists()) {
          const betsData = snapshot.val();
          const betsArray = Object.keys(betsData).map(key => ({
            id: key,
            ...betsData[key]
          }));
          
          // Sort by date descending
          betsArray.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
          
          setBets(betsArray);
          calculateStats(betsArray);
        } else {
          setBets([]);
        }
      } catch (error) {
        console.error('Error fetching bets:', error);
      }
    };
    
    fetchBets();
  }, [selectedMonth, selectedYear, unitValue, userId]); // Added userId as dependency

  // Calculate betting statistics
  const calculateStats = (betsData) => {
    // Filter bets for selected month and year
    const filteredBets = betsData.filter(bet => {
      const betDate = new Date(bet.gameDate);
      return betDate.getMonth() === selectedMonth && betDate.getFullYear() === selectedYear;
    });
    
    const totalBets = filteredBets.length;
    const wins = filteredBets.filter(bet => bet.result === 'win').length;
    const losses = filteredBets.filter(bet => bet.result === 'loss').length;
    const pushes = filteredBets.filter(bet => bet.result === 'push').length;
    
    const unitsWagered = filteredBets.reduce((total, bet) => total + parseFloat(bet.units), 0);
    const unitsWon = filteredBets
      .filter(bet => bet.result === 'win')
      .reduce((total, bet) => {
        // Calculate units won based on American odds
        const odds = parseInt(bet.odds);
        const units = parseFloat(bet.units);
        
        if (odds > 0) {
          return total + (units * odds / 100);
        } else {
          return total + (units * 100 / Math.abs(odds));
        }
      }, 0);
    
    const unitsLost = filteredBets
      .filter(bet => bet.result === 'loss')
      .reduce((total, bet) => total + parseFloat(bet.units), 0);
    
    // Calculate net profit in units (ensure precision)
    const netProfitUnits = parseFloat((unitsWon - unitsLost).toFixed(10));
    
    // Calculate total profit in dollars using unit value (ensure exact calculation)
    const totalProfit = parseFloat((netProfitUnits * unitValue).toFixed(2));
    
    // Calculate ROI
    const roi = unitsWagered > 0 ? (netProfitUnits / unitsWagered) * 100 : 0;
    
    setStats({
      totalBets,
      wins,
      losses,
      pushes,
      unitsWagered,
      unitsWon,
      unitsLost,
      roi,
      totalProfit,
      netProfitUnits
    });
  };

  const handleOpenDialog = (bet = null) => {
    if (bet) {
      setCurrentBet(bet);
      setEditMode(true);
    } else {
      setCurrentBet({
        gameId: '',
        homeTeam: '',
        awayTeam: '',
        gameDate: new Date().toISOString().split('T')[0],
        betType: 'moneyline',
        team: '',
        odds: '',
        units: 1,
        sportsbook: '',
        result: 'pending',
        notes: '',
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBet(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBet(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveBet = async () => {
    if (!userId) {
      console.error('[BetTrackerFix] Error saving bet: User ID is not available. User might be logged out.');
      setAuthErrorOpen(true);
      return;
    }
    
    console.log('[BetTrackerFix] handleSaveBet called.');
    console.log('[BetTrackerFix] User ID:', userId);
    console.log('[BetTrackerFix] Current Bet:', JSON.parse(JSON.stringify(currentBet)));
    console.log('[BetTrackerFix] Edit Mode:', editMode);
    
    try {
      const db = getDatabase();
      const userBetsPathRef = ref(db, `user_bets/${userId}`);
      
      if (editMode && currentBet.id) {
        // Update existing bet
        console.log('[BetTrackerFix] Updating existing bet with ID:', currentBet.id);
        const betRef = ref(db, `user_bets/${userId}/${currentBet.id}`);
        const updatedBet = {
          ...currentBet,
          userId: userId, // Ensure userId is included
          timestamp: Date.now() // Update timestamp
        };
        console.log('[BetTrackerFix] Path for update:', betRef.toString());
        console.log('[BetTrackerFix] Data to update:', JSON.parse(JSON.stringify(updatedBet)));
        await set(betRef, updatedBet);
        console.log('[BetTrackerFix] Bet updated successfully');
      } else {
        // Create new bet with a Firebase-generated unique ID
        const newBetRef = push(userBetsPathRef);
        const newBet = {
          ...currentBet,
          id: newBetRef.key,
          userId: userId,
          timestamp: Date.now()
        };
        console.log('[BetTrackerFix] Creating new bet with ID:', newBetRef.key);
        console.log('[BetTrackerFix] Path for new bet:', newBetRef.toString());
        console.log('[BetTrackerFix] Data for new bet:', JSON.parse(JSON.stringify(newBet)));
        await set(newBetRef, newBet);
        console.log('[BetTrackerFix] New bet created successfully');
      }
      
      // Refresh bets
      console.log('[BetTrackerFix] Refreshing bets list after save');
      const betsRef = ref(db, `user_bets/${userId}`);
      const snapshot = await get(betsRef);
      if (snapshot.exists()) {
        const betsData = snapshot.val();
        console.log('[BetTrackerFix] Bets data fetched:', Object.keys(betsData).length, 'bets');
        const betsArray = Object.keys(betsData).map(key => ({
          id: key,
          ...betsData[key]
        }));
        
        // Sort by date descending
        betsArray.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
        
        setBets(betsArray);
        calculateStats(betsArray);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving bet:', error);
    }
  };

  const handleDeleteBet = async (betId) => {
    if (!userId) {
      console.error("[BetTrackerFix] User not logged in, cannot delete bet.");
      return;
    }
    try {
      console.log(`[BetTrackerFix] Deleting bet ${betId} for user ${userId}`);
      const db = getDatabase();
      const betRef = ref(db, `user_bets/${userId}/${betId}`);
      await set(betRef, null);
      
      // Update local state
      const updatedBets = bets.filter(bet => bet.id !== betId);
      setBets(updatedBets);
      calculateStats(updatedBets);
      console.log(`[BetTrackerFix] Successfully deleted bet ${betId}`);
    } catch (error) {
      console.error('[BetTrackerFix] Error deleting bet:', error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'win': return 'success';
      case 'loss': return 'error';
      case 'push': return 'warning';
      default: return 'default';
    }
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'win': return <CheckCircleIcon color="success" />;
      case 'loss': return <CancelIcon color="error" />;
      case 'push': return <Chip label="PUSH" size="small" />;
      default: return <Chip label="PENDING" size="small" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Calculate exact values for display
  const netProfitUnits = stats.unitsWon - stats.unitsLost;
  const exactTotalProfit = (netProfitUnits * unitValue).toFixed(2);
  const exactROI = stats.unitsWagered > 0 ? ((netProfitUnits / stats.unitsWagered) * 100).toFixed(2) : '0.00';

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Bet Tracker
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={handleMonthChange}
            >
              {months.map((month, index) => (
                <MenuItem key={index} value={index}>{month}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={handleYearChange}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleOpenDialog()}
            sx={{ height: '100%' }}
          >
            Add New Bet
          </Button>
        </Grid>
      </Grid>
      
      {/* Stats Summary */}
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom>
          {months[selectedMonth]} {selectedYear} Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2">Total Bets</Typography>
            <Typography variant="h6">{stats.totalBets}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2">Record</Typography>
            <Typography variant="h6">{stats.wins}-{stats.losses}{stats.pushes > 0 ? `-${stats.pushes}` : ''}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="body2">Units Profit/Loss</Typography>
            <Typography 
              variant="h6" 
              color={netProfitUnits > 0 ? 'success.main' : netProfitUnits < 0 ? 'error.main' : 'inherit'}
            >
              {netProfitUnits.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">Total Profit (${unitValue.toFixed(2)}/unit)</Typography>
            <Typography 
              variant="h6" 
              color={netProfitUnits > 0 ? 'success.main' : netProfitUnits < 0 ? 'error.main' : 'inherit'}
            >
              ${exactTotalProfit}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2">ROI</Typography>
            <Typography 
              variant="h6"
              color={netProfitUnits > 0 ? 'success.main' : netProfitUnits < 0 ? 'error.main' : 'inherit'}
            >
              {exactROI}%
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>
      
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mt: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          aria-label="bet tracker tabs"
          sx={{
            '& .MuiTab-root': {
              color: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            },
            '& .Mui-selected': {
              color: themeMode === 'dark' ? '#39FF14' : '#007E33',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: themeMode === 'dark' ? '#39FF14' : '#007E33',
            }
          }}
        >
          <Tab 
            icon={<ListIcon />} 
            label="Bet List" 
            id="bet-list-tab"
            aria-controls="bet-list-panel"
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="Analytics" 
            id="analytics-tab"
            aria-controls="analytics-panel"
          />
        </Tabs>
      </Box>
      
      {/* Bet List Tab Panel */}
      <div
        role="tabpanel"
        hidden={activeTab !== 0}
        id="bet-list-panel"
        aria-labelledby="bet-list-tab"
      >
        {activeTab === 0 && (
          <TableContainer component={StyledPaper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Game</TableCell>
                  <TableCell>Bet</TableCell>
                  <TableCell>Odds</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>Sportsbook</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bets.filter(bet => {
                  const betDate = new Date(bet.gameDate);
                  return betDate.getMonth() === selectedMonth && betDate.getFullYear() === selectedYear;
                }).map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{formatDate(bet.gameDate)}</TableCell>
                    <TableCell>{bet.awayTeam} @ {bet.homeTeam}</TableCell>
                    <TableCell>
                      {bet.betType === 'moneyline' ? 
                        bet.team : 
                        `${bet.team} ${bet.betType === 'spread' ? bet.line : 'O/U ' + bet.line}`
                      }
                    </TableCell>
                    <TableCell>{bet.odds > 0 ? `+${bet.odds}` : bet.odds}</TableCell>
                    <TableCell>{bet.units}</TableCell>
                    <TableCell>{bet.sportsbook}</TableCell>
                    <TableCell>{getResultIcon(bet.result)}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(bet)}>
                        <CalendarMonthIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteBet(bet.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {bets.filter(bet => {
                  const betDate = new Date(bet.gameDate);
                  return betDate.getMonth() === selectedMonth && betDate.getFullYear() === selectedYear;
                }).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No bets found for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
      
      {/* Analytics Tab Panel */}
      <div
        role="tabpanel"
        hidden={activeTab !== 1}
        id="analytics-panel"
        aria-labelledby="analytics-tab"
      >
        {activeTab === 1 && (
          <BetTrackerCharts 
            bets={bets} 
            selectedMonth={selectedMonth} 
            selectedYear={selectedYear} 
          />
        )}
      </div>
      
      {/* Add/Edit Bet Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Bet' : 'Add New Bet'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="homeTeam"
                label="Home Team"
                fullWidth
                value={currentBet?.homeTeam || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="awayTeam"
                label="Away Team"
                fullWidth
                value={currentBet?.awayTeam || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="gameDate"
                label="Game Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={currentBet?.gameDate || new Date().toISOString().split('T')[0]}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Bet Type</InputLabel>
                <Select
                  name="betType"
                  value={currentBet?.betType || 'moneyline'}
                  label="Bet Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="moneyline">Moneyline</MenuItem>
                  <MenuItem value="spread">Spread</MenuItem>
                  <MenuItem value="total">Total</MenuItem>
                  <MenuItem value="prop">Prop</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team</InputLabel>
                <Select
                  name="team"
                  value={currentBet?.team || ''}
                  label="Team"
                  onChange={handleInputChange}
                >
                  <MenuItem value={currentBet?.homeTeam || ''}>{currentBet?.homeTeam || 'Home Team'}</MenuItem>
                  <MenuItem value={currentBet?.awayTeam || ''}>{currentBet?.awayTeam || 'Away Team'}</MenuItem>
                  {currentBet?.betType === 'total' && (
                    <>
                      <MenuItem value="Over">Over</MenuItem>
                      <MenuItem value="Under">Under</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {(currentBet?.betType === 'spread' || currentBet?.betType === 'total') && (
              <Grid item xs={12} sm={6}>
                <TextField
                  name="line"
                  label="Line"
                  fullWidth
                  value={currentBet?.line || ''}
                  onChange={handleInputChange}
                  placeholder={currentBet?.betType === 'spread' ? '-3.5' : '224.5'}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                name="odds"
                label="Odds (American)"
                fullWidth
                value={currentBet?.odds || ''}
                onChange={handleInputChange}
                placeholder="-110"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="units"
                label="Units"
                type="number"
                fullWidth
                value={currentBet?.units || 1}
                onChange={handleInputChange}
                inputProps={{ min: 0.1, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="sportsbook"
                label="Sportsbook"
                fullWidth
                value={currentBet?.sportsbook || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Result</InputLabel>
                <Select
                  name="result"
                  value={currentBet?.result || 'pending'}
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
                value={currentBet?.notes || ''}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveBet} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'} Bet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Authentication Error Dialog */}
      <AuthErrorDialog 
        open={authErrorOpen} 
        onClose={() => setAuthErrorOpen(false)} 
        message="You need to be signed in to add or edit bets. Would you like to sign in now?"
      />
    </Box>
  );
};

export default BetTrackerFix;
