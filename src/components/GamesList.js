import React, { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Tabs, Tab, Paper } from '@mui/material';
import GameCard from './GameCard';
import SportsbookFilter from './SportsbookFilter';
import axios from 'axios';
import config from '../config';

const SUPPORTED_SPORTS = ['americanfootball_nfl', 'basketball_nba', 'icehockey_nhl'];

const SPORT_LABELS = {
  'americanfootball_nfl': 'NFL',
  'basketball_nba': 'NBA',
  'icehockey_nhl': 'NHL'
};

const GamesList = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('basketball_nba');
  const [availableBookmakers, setAvailableBookmakers] = useState([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const sportPromises = SUPPORTED_SPORTS.map(sport =>
          axios.get(`${config.API_BASE_URL}/sports/${sport}/odds`, {
            params: {
              apiKey: config.ODDS_API_KEY,
              regions: 'us,eu',
              markets: 'h2h,spreads,totals',
              oddsFormat: 'american'
            }
          })
        );

        const responses = await Promise.all(sportPromises);
        
        // Combine all games and collect unique bookmakers
        const allBookmakers = new Set();
        const allGames = responses.reduce((acc, response, index) => {
          if (response.data) {
            response.data.forEach(game => {
              game.bookmakers.forEach(bookmaker => {
                allBookmakers.add(bookmaker.title);
              });
            });
            return [...acc, ...response.data];
          }
          return acc;
        }, []);

        // Sort games by commence time
        const sortedGames = allGames.sort((a, b) => 
          new Date(a.commence_time) - new Date(b.commence_time)
        );

        setGames(sortedGames);
        const bookmakersList = Array.from(allBookmakers).sort();
        setAvailableBookmakers(bookmakersList);
        setSelectedBookmakers(bookmakersList); // Initially select all bookmakers
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch games data');
        console.error('Error fetching games:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

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
      .map(game => ({
        ...game,
        bookmakers: game.bookmakers.filter(bookmaker => 
          selectedBookmakers.includes(bookmaker.title)
        )
      }));
  }, [games, selectedSport, selectedBookmakers]);

  if (loading) return (
    <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
      Loading games...
    </Typography>
  );

  if (error) return (
    <Typography variant="h6" color="error" sx={{ textAlign: 'center', my: 4 }}>
      {error}
    </Typography>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Best Available Odds
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
