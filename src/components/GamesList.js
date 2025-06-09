import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Tabs, Tab, Paper, Button, CircularProgress, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppTheme } from '../contexts/ThemeContext';
import GameCard from './GameCard';
import SportsbookFilter from './SportsbookFilter';
import axios from 'axios';
import config from '../config';
import { database } from '../firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const SUPPORTED_SPORTS = ['americanfootball_nfl', 'basketball_nba', 'icehockey_nhl', 'baseball_mlb'];

const SPORT_LABELS = {
  'americanfootball_nfl': 'NFL',
  'basketball_nba': 'NBA',
  'icehockey_nhl': 'NHL',
  'baseball_mlb': 'MLB'
};

// Cache keys
const CACHE_KEY = 'gamesCache';
const CACHE_TIMESTAMP_KEY = 'gamesCacheTimestamp';

const GamesList = ({ initialSport = 'basketball_nba' }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [availableBookmakers, setAvailableBookmakers] = useState([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const { themeMode } = useAppTheme();
  
  // Handle authentication state
  useEffect(() => {
    const auth = getAuth();
    console.log('[GamesList] Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('[GamesList] User authenticated, UID:', user.uid);
      } else {
        setUserId(null);
        setGames([]); // Clear games when user logs out
        setAvailableBookmakers([]);
        setLastUpdated(null);
        console.log('[GamesList] User not authenticated. Cleared games data.');
      }
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const shouldUpdate = (timestamp) => {
    if (!timestamp) return true;

    const lastUpdate = new Date(parseInt(timestamp));
    const now = new Date();
    
    // Get today's 8 AM ET
    const todayEight = new Date();
    todayEight.setHours(8, 0, 0, 0);
    todayEight.setMinutes(0, 0, 0);
    
    // Convert to ET by adding 5 hours (ET is UTC-5)
    const etOffset = 5;
    todayEight.setHours(todayEight.getHours() + etOffset);

    // For testing, log the times
    console.log(' Current time:', now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    console.log(' Last update:', lastUpdate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    console.log(' Today 8 AM ET:', todayEight.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    // Update if it's past 8 AM ET today and our last update was before 8 AM ET today
    const needsUpdate = now >= todayEight && lastUpdate < todayEight;
    console.log(' Needs update:', needsUpdate);
    return needsUpdate;
  };

  const processAndSetGames = (gamesData) => {
    // Extract unique bookmakers
    const allBookmakers = new Set();
    gamesData.forEach(game => {
      game.bookmakers.forEach(bookmaker => {
        allBookmakers.add(bookmaker.title);
      });
    });

    setGames(gamesData);
    setAvailableBookmakers(Array.from(allBookmakers));
    setSelectedBookmakers(Array.from(allBookmakers));
  };

  const fetchGames = async (forceUpdate = false) => {
    // Check if user is authenticated
    if (!userId) {
      console.log('[GamesList] Cannot fetch games: User not authenticated');
      setLoading(false);
      setGames([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      // Always prioritize Firebase data
      console.log(' Checking Firebase for data...');
      let sportData = null;
      let lastUpdateTime = null;
      
      try {
        // With our new structure, data is stored by sport
        const sportRef = ref(database, `games/${selectedSport}`);
        const sportSnapshot = await get(sportRef);
        
        if (sportSnapshot.exists()) {
          const sportDataObj = sportSnapshot.val();
          sportData = sportDataObj.data;
          lastUpdateTime = sportDataObj.lastUpdated;
          console.log(` Found ${sportData.length} games for ${selectedSport} in Firebase`);
        } else {
          console.log(` No data found for ${selectedSport} in Firebase`);
        }
        
        // Also check API usage info
        const apiUsageRef = ref(database, 'apiUsage');
        const apiUsageSnapshot = await get(apiUsageRef);
        
        if (apiUsageSnapshot.exists()) {
          const apiUsageData = apiUsageSnapshot.val();
          // Store quota info in localStorage for admin access
          localStorage.setItem('apiQuotaInfo', JSON.stringify({
            remaining: apiUsageData.remainingRequests,
            used: apiUsageData.usedRequests,
            lastChecked: new Date(apiUsageData.lastUpdated).toISOString()
          }));
          
          console.log(' API Quota - Remaining:', apiUsageData.remainingRequests, 'Used:', apiUsageData.usedRequests);
        }
      } catch (firebaseReadError) {
        console.error(' Error reading from Firebase:', firebaseReadError);
        // Continue with fallbacks if Firebase read fails
      }

      // If we have data from Firebase and it's not a force update, use it
      if (!forceUpdate && sportData && lastUpdateTime) {
        console.log(' Using data from Firebase');
        processAndSetGames(sportData);
        
        // Update localStorage with Firebase data for offline access
        localStorage.setItem(CACHE_KEY, JSON.stringify(sportData));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, lastUpdateTime.toString());
        
        setLastUpdated(new Date(lastUpdateTime));
        setLoading(false);
        return;
      }
      
      // If we're here, either:
      // 1. No Firebase data exists for this sport
      // 2. Force update was requested
      // 3. Firebase couldn't be accessed
      
      // Try to use localStorage as a fallback
      if (!forceUpdate) {
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
          
          if (cachedData && cachedTimestamp) {
            const parsedData = JSON.parse(cachedData);
            console.log(' Using cached data from localStorage as fallback');
            processAndSetGames(parsedData);
            setLastUpdated(new Date(parseInt(cachedTimestamp)));
            setLoading(false);
            return;
          }
        } catch (localStorageError) {
          console.error(' Error accessing localStorage:', localStorageError);
        }
      }
      
      // As a last resort, if we can't get data from Firebase or localStorage,
      // or if force update was requested, fetch from the API
      console.log(' Fetching fresh data from API (this should only happen rarely)');
      
      try {
        // Make sure we're requesting all available bookmakers including Pinnacle
        const response = await axios.get(`${config.API_BASE_URL}/sports/${selectedSport}/odds`, {
          params: {
            apiKey: config.API_KEY,
            regions: 'us,eu', // Include EU region to get Pinnacle
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            bookmakers: 'pinnacle,fanduel,draftkings,betmgm,bovada,williamhill_us,barstool,pointsbet,bet365,unibet,betrivers,twinspires,betus,wynnbet,betonlineag,lowvig,mybookieag,betfred,superbook,circasports,betway,fanatics,caesars,foxbet,si_sportsbook,betfair,tipico,station,hard_rock,playup'
          }
        });
        
        // Extract API quota information
        if (response.headers && response.headers['x-requests-remaining']) {
          const remaining = parseInt(response.headers['x-requests-remaining']);
          const used = parseInt(response.headers['x-requests-used']);
          
          // Store quota info in localStorage for admin access
          localStorage.setItem('apiQuotaInfo', JSON.stringify({
            remaining: remaining,
            used: used,
            total: remaining + used,
            lastChecked: new Date().toISOString()
          }));
          
          console.log(' API Quota - Remaining:', remaining, 'Used:', used, 'Total:', remaining + used);
        }
        
        const gamesData = response.data;
        console.log(` Received ${gamesData.length} games from API`);
        
        // Sort games by commence time
        const sortedGames = gamesData.sort((a, b) => 
          new Date(a.commence_time) - new Date(b.commence_time)
        );
        
        // Process and display the games
        processAndSetGames(sortedGames);
        
        // Store in localStorage for offline access
        const now = new Date();
        localStorage.setItem(CACHE_KEY, JSON.stringify(sortedGames));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.getTime().toString());
        setLastUpdated(now);
        
        // Try to update Firebase with the new data (for other users)
        // This is just a courtesy - our Cloud Function will handle the main updates
        try {
          const sportRef = ref(database, `games/${selectedSport}`);
          await set(sportRef, {
            data: sortedGames,
            lastUpdated: now.getTime()
          });
          console.log(' Updated Firebase with fresh API data');
        } catch (firebaseError) {
          console.error(' Could not update Firebase:', firebaseError);
          // Continue even if Firebase update fails
        }
      } catch (apiError) {
        console.error(' API fetch error:', apiError);
        setError('Unable to fetch current odds data. Please try again later.');
      }

      // If we get here and haven't returned yet, check if we have any data to display
      if (loading) {
        setLoading(false);
      }
      
      // If no data has been set yet, try to use cached data from localStorage as a fallback
      if (games.length === 0) {
        // If no games data from API, try to use cached data from localStorage as a fallback
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            console.log(' Using cached data from localStorage as fallback');
            processAndSetGames(parsedData);
            const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
            setLastUpdated(cachedTimestamp ? new Date(parseInt(cachedTimestamp)) : new Date());
          } else {
            throw new Error('No cached data available');
          }
        } catch (cacheError) {
          console.error(' No usable data available:', cacheError);
          setError('Unable to fetch or retrieve games data. Please try again later.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch games data');
      console.error('Error fetching games:', err.response?.data || err);
      
      // Try to use cached data as a last resort
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          console.log(' Using cached data from localStorage after error');
          processAndSetGames(parsedData);
          const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
          setLastUpdated(cachedTimestamp ? new Date(parseInt(cachedTimestamp)) : new Date());
        }
      } catch (fallbackError) {
        console.error(' Failed to use cached data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch games when component mounts or when sport changes
  useEffect(() => {
    fetchGames();
    // Clear the loading state after a short delay if no data is found
    // This ensures we don't show loading indefinitely
    const timeoutId = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [selectedSport, userId]);
  
  // Function to force refresh data from API
  const forceRefresh = async () => {
    setRefreshing(true);
    setLoading(true); // Show loading state
    try {
      // Call fetchGames with forceUpdate=true to bypass cache checks
      await fetchGames(true);
    } catch (error) {
      console.error('Force refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSportChange = (event, newValue) => {
    // Reset loading state and clear games when changing sports
    // to ensure we show loading indicator
    setLoading(true);
    setGames([]);
    setSelectedSport(newValue);
    
    // Immediately try to fetch games for the new sport
    fetchGames();
  };

  const handleBookmakerChange = (bookmaker, checked) => {
    setSelectedBookmakers(prev => {
      if (checked) {
        return [...prev, bookmaker];
      } else {
        return prev.filter(b => b !== bookmaker);
      }
    });
  };

  const handleSelectAllBookmakers = () => {
    setSelectedBookmakers(availableBookmakers);
  };

  const handleClearAllBookmakers = () => {
    setSelectedBookmakers([]);
  };

  const filteredGames = useMemo(() => {
    // First check if games array exists and has items
    if (!games || games.length === 0) {
      return [];
    }
    
    return games
      .filter(game => game.sport_key === selectedSport)
      .filter(game => game.bookmakers.some(bookmaker => 
        selectedBookmakers.includes(bookmaker.title)
      ));
  }, [games, selectedSport, selectedBookmakers]);

  // Show loading state, but with a timeout to prevent infinite loading
  if (loading) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
        Loading games...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: 'center', my: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h3" 
        sx={{ 
          textAlign: 'center',
          mb: 3,
          color: themeMode === 'light' ? '#007E33' : '#39FF14',
          textShadow: themeMode === 'light'
            ? '0 0 5px rgba(0, 126, 51, 0.7), 0 0 10px rgba(0, 126, 51, 0.5), 0 0 15px rgba(0, 126, 51, 0.3)'
            : '0 0 5px rgba(57, 255, 20, 0.7), 0 0 10px rgba(57, 255, 20, 0.5), 0 0 15px rgba(57, 255, 20, 0.3)',
          fontWeight: 'bold',
          fontSize: { xs: '2rem', sm: '3rem' },
          fontFamily: "'Orbitron', sans-serif",
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}
      >
        Beat the Odds
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedSport}
          onChange={handleSportChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="sport selection tabs"
        >
          {SUPPORTED_SPORTS.map(sport => (
            <Tab
              key={sport}
              value={sport}
              label={SPORT_LABELS[sport]}
              aria-label={`Show ${SPORT_LABELS[sport]} games`}
            />
          ))}
        </Tabs>
      </Paper>

      <Box sx={{ mb: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleString('en-US', {
            timeZone: 'America/New_York',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }) + ' ET' : 'Never'}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Next Update: {lastUpdated ? (() => {
            const nextUpdate = new Date(lastUpdated);
            nextUpdate.setHours(8, 0, 0, 0);
            if (new Date() >= nextUpdate) {
              nextUpdate.setDate(nextUpdate.getDate() + 1);
            }
            return nextUpdate.toLocaleString('en-US', {
              timeZone: 'America/New_York',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }) + ' ET';
          })() : 'Never'}
        </Typography>
      </Box>

      <SportsbookFilter
        availableBookmakers={availableBookmakers}
        selectedBookmakers={selectedBookmakers}
        onBookmakerChange={handleBookmakerChange}
        onSelectAll={handleSelectAllBookmakers}
        onClearAll={handleClearAllBookmakers}
      />

      {filteredGames.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
          No {SPORT_LABELS[selectedSport]} games available at the moment
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredGames.map((game) => (
            <Grid item xs={12} key={game.id}>
              <GameCard 
                game={game} 
                selectedBookmakers={selectedBookmakers}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GamesList;
