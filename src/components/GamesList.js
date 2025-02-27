import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Tabs, Tab, Paper } from '@mui/material';
import GameCard from './GameCard';
import SportsbookFilter from './SportsbookFilter';
import axios from 'axios';
import config from '../config';
import { database } from '../firebaseConfig';
import { ref, set, get } from 'firebase/database';

const SUPPORTED_SPORTS = ['americanfootball_nfl', 'basketball_nba', 'icehockey_nhl'];

const SPORT_LABELS = {
  'americanfootball_nfl': 'NFL',
  'basketball_nba': 'NBA',
  'icehockey_nhl': 'NHL'
};

// Cache keys
const CACHE_KEY = 'gamesCache';
const CACHE_TIMESTAMP_KEY = 'gamesCacheTimestamp';

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('basketball_nba');
  const [availableBookmakers, setAvailableBookmakers] = useState([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try Firebase since it might have the most up-to-date data
      console.log(' Checking Firebase for data...');
      const gamesRef = ref(database, 'games');
      const snapshot = await get(gamesRef);
      const timestampRef = ref(database, 'lastUpdated');
      const timeSnapshot = await get(timestampRef);

      if (snapshot.exists() && timeSnapshot.exists()) {
        const firebaseTimestamp = timeSnapshot.val();
        console.log(' Found data in Firebase, checking if update needed...');
        
        if (!shouldUpdate(firebaseTimestamp)) {
          console.log(' Using data from Firebase');
          const data = snapshot.val();
          processAndSetGames(data);
          
          // Update localStorage with Firebase data
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, firebaseTimestamp.toString());
          
          setLastUpdated(new Date(parseInt(firebaseTimestamp)));
          setLoading(false);
          return;
        }
        console.log(' Firebase data needs update');
      } else {
        console.log(' No data found in Firebase');
      }

      // If we get here, either:
      // 1. No Firebase data exists
      // 2. Firebase data exists but needs update
      // 3. Firebase data couldn't be accessed
      console.log(' Fetching fresh data from API');
      const sportPromises = SUPPORTED_SPORTS.map(sport =>
        axios.get(`${config.API_BASE_URL}/sports/${sport}/odds`, {
          params: {
            apiKey: config.API_KEY,
            regions: 'us,eu',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american'
          }
        }).catch(error => {
          console.warn(` ${SPORT_LABELS[sport]} API Error:`, error);
          return { data: [] };
        })
      );

      const responses = await Promise.all(sportPromises);
      
      // Combine all games
      const allGames = responses.reduce((acc, response) => {
        if (response.data) {
          return [...acc, ...response.data];
        }
        return acc;
      }, []);

      // Sort games by commence time
      const sortedGames = allGames.sort((a, b) => 
        new Date(a.commence_time) - new Date(b.commence_time)
      );

      console.log(` Received ${sortedGames.length} games from API`);

      // Store in Firebase and localStorage
      const now = new Date();
      try {
        console.log(' Storing data in Firebase...');
        await Promise.all([
          set(ref(database, 'games'), sortedGames)
            .then(() => console.log(' Games stored in Firebase'))
            .catch(error => console.error(' Firebase games storage error:', error)),
          set(ref(database, 'lastUpdated'), now.getTime())
            .then(() => console.log(' Timestamp stored in Firebase'))
            .catch(error => console.error(' Firebase timestamp storage error:', error))
        ]);
      } catch (firebaseError) {
        console.error(' Firebase storage error:', firebaseError);
      }

      // Update localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(sortedGames));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, now.getTime().toString());
        console.log(' Data cached in localStorage');
      } catch (storageError) {
        console.error(' localStorage error:', storageError);
      }

      processAndSetGames(sortedGames);
      setLastUpdated(now);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch games data');
      console.error('Error fetching games:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch games only once when component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
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
    return games
      .filter(game => game.sport_key === selectedSport)
      .filter(game => game.bookmakers.some(bookmaker => 
        selectedBookmakers.includes(bookmaker.title)
      ));
  }, [games, selectedSport, selectedBookmakers]);

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
          color: '#39FF14',
          textShadow: '0 0 5px rgba(57, 255, 20, 0.7), 0 0 10px rgba(57, 255, 20, 0.5), 0 0 15px rgba(57, 255, 20, 0.3)',
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

      <Box sx={{ mb: 2, textAlign: 'center' }}>
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
