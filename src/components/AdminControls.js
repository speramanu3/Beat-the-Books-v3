import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { get, ref, set, getDatabase } from 'firebase/database';
import axios from 'axios';

// Configuration
const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = 'a96c15675d0a120680eed5d628c4c773'; // Using the same key as in server/index.js
const SUPPORTED_SPORTS = [
  'basketball_nba',
  'americanfootball_nfl',
  'icehockey_nhl',
  'baseball_mlb'
];

// Get a reference to the Firebase database
const database = getDatabase();

const AdminControls = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);

  if (!currentUser || currentUser.email !== 'sujay19@gmail.com') {
    return null;
  }

  // Function to manually fetch odds data directly from the API
  const refreshOdds = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      let totalGames = 0;
      let apiQuota = { remaining: 'unknown', used: 'unknown' };
      
      // Fetch odds for each supported sport
      for (const sport of SUPPORTED_SPORTS) {
        console.log(`Fetching odds for ${sport}`);
        
        try {
          const response = await axios.get(`${API_BASE_URL}/sports/${sport}/odds`, {
            params: {
              apiKey: API_KEY,
              regions: 'us,eu',  // Include EU region to get Pinnacle
              markets: 'spreads,totals,h2h',
              oddsFormat: 'american',
              bookmakers: 'pinnacle,fanduel,draftkings,betmgm,bovada,williamhill_us,barstool,pointsbet,bet365,unibet,betrivers,twinspires,betus,wynnbet,betonlineag,lowvig,mybookieag,betfred,superbook,circasports,betway,fanatics,caesars,foxbet,si_sportsbook,betfair,tipico,station,hard_rock,playup'
            }
          });
          
          // Process the data and store it in Firebase
          const processedData = processGamesData(response.data);
          totalGames += processedData.length;
          
          // Store the processed data in Firebase
          const gamesRef = ref(database, `games/${sport}`);
          await set(gamesRef, {
            data: processedData,
            lastUpdated: Date.now()
          });
          
          console.log(`Successfully stored ${processedData.length} games for ${sport}`);
          
          // Update API quota information
          apiQuota = {
            remaining: response.headers['x-requests-remaining'] || 'unknown',
            used: response.headers['x-requests-used'] || 'unknown'
          };
          
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`Error fetching odds for ${sport}:`, error.message);
          // Continue with other sports even if one fails
        }
      }
      
      // Store API usage information
      const apiUsageRef = ref(database, 'apiUsage');
      const usageData = {
        remainingRequests: apiQuota.remaining,
        usedRequests: apiQuota.used,
        lastUpdated: Date.now()
      };
      
      await set(apiUsageRef, usageData);
      
      // Update localStorage with API quota info
      localStorage.setItem('apiQuotaInfo', JSON.stringify({
        remaining: apiQuota.remaining,
        used: apiQuota.used,
        lastChecked: new Date().toISOString()
      }));
      
      setResult(`Odds data refreshed successfully! Fetched ${totalGames} games across ${SUPPORTED_SPORTS.length} sports.`);
    } catch (err) {
      console.error('Error refreshing odds:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to process games data and add expected value calculations
  const processGamesData = (gamesData) => {
    console.log('Processing games data for EV calculations:', gamesData.length, 'games');
    
    return gamesData.map(game => {
      // Find reference bookmaker (Pinnacle or fallback to others)
      const referenceBookmakers = ['pinnacle', 'lowvig', 'williamhill_us', 'fanduel'];
      let referenceBookmaker;
      let referenceBookmakerKey;
      
      for (const key of referenceBookmakers) {
        referenceBookmaker = game.bookmakers.find(b => b.key === key);
        if (referenceBookmaker) {
          referenceBookmakerKey = key;
          break;
        }
      }
      
      // If no reference bookmaker found, return game as is
      if (!referenceBookmaker) {
        console.log(`No reference bookmaker found for ${game.home_team} vs ${game.away_team}`);
        return game;
      }
      
      // Process each bookmaker
      game.bookmakers.forEach(bookmaker => {
        // Skip if this is the reference bookmaker
        if (bookmaker.key === referenceBookmakerKey) {
          return;
        }
        
        // Process each market
        bookmaker.markets.forEach(market => {
          // Find corresponding market in reference bookmaker
          const referenceMarket = referenceBookmaker.markets.find(m => m.key === market.key);
          if (!referenceMarket) {
            return;
          }
          
          // Process each outcome
          market.outcomes.forEach(outcome => {
            // Find corresponding outcome in reference market
            const referenceOutcome = referenceMarket.outcomes.find(o => 
              o.name === outcome.name && 
              (o.point === outcome.point || (!o.point && !outcome.point))
            );
            
            if (!referenceOutcome) {
              return;
            }
            
            // Store reference price
            outcome.btb_price = referenceOutcome.price;
            
            // Calculate no-vig probabilities
            const bookOdds = outcome.price;
            const referenceOdds = referenceOutcome.price;
            
            // Convert odds to probabilities
            let bookProb = oddsToProb(bookOdds);
            let referenceProb = oddsToProb(referenceOdds);
            
            // Store no-vig probabilities
            outcome.book_no_vig = bookProb;
            outcome.reference_no_vig = referenceProb;
            
            // Find counter outcome for reference
            const counterOutcomes = referenceMarket.outcomes.filter(o => o.name !== referenceOutcome.name);
            if (counterOutcomes.length > 0) {
              // For simplicity, just use the first counter outcome
              outcome.reference_counter_odds = counterOutcomes[0].price;
            }
            
            // Calculate expected value
            if (bookProb > 0 && referenceProb > 0) {
              const expectedValue = (referenceProb - bookProb) / bookProb;
              outcome.expected_value = expectedValue;
            }
          });
        });
      });
      
      return game;
    });
  };
  
  // Convert American odds to implied probability
  const oddsToProb = (odds) => {
    if (odds === undefined || odds === null) return 0;
    
    // For positive odds (e.g., +150)
    if (odds > 0) {
      return 100 / (odds + 100);
    }
    // For negative odds (e.g., -110)
    else if (odds < 0) {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
    return 0;
  };


  const checkApiQuota = () => {
    try {
      const quotaInfo = JSON.parse(localStorage.getItem('apiQuotaInfo'));
      setQuotaInfo(quotaInfo);
      console.log('API Quota Info:', quotaInfo);
    } catch (err) {
      setError(`Error checking API quota: ${err.message}`);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>Admin Controls</Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={refreshOdds} 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          sx={{ mr: 2 }}
        >
          {loading ? 'Refreshing...' : 'Refresh Odds Data'}
        </Button>
        
        <Button 
          variant="outlined" 
          onClick={checkApiQuota}
        >
          Check API Quota
        </Button>
      </Box>
      
      {result && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {result}
        </Typography>
      )}
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {quotaInfo && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>API Quota Information:</Typography>
          <Typography>Remaining Requests: {quotaInfo.remaining}</Typography>
          <Typography>Used Requests: {quotaInfo.used}</Typography>
          <Typography>Last Checked: {new Date(quotaInfo.lastChecked).toLocaleString()}</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AdminControls;
