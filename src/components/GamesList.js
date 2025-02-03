import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Tabs, Tab, Paper } from '@mui/material';
import GameCard from './GameCard';
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
  const [selectedSport, setSelectedSport] = useState('basketball_nba'); // Default to NBA

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Create an array of promises for each sport
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

        // Wait for all requests to complete
        const responses = await Promise.all(sportPromises);
        
        // Combine all games from different sports
        const allGames = responses.reduce((acc, response, index) => {
          if (response.data) {
            // Add sport key to each game for filtering
            const gamesWithSport = response.data.map(game => ({
              ...game,
              sport_key: SUPPORTED_SPORTS[index]
            }));
            return [...acc, ...gamesWithSport];
          }
          return acc;
        }, []);

        // Sort games by commence time
        const sortedGames = allGames.sort((a, b) => 
          new Date(a.commence_time) - new Date(b.commence_time)
        );

        setGames(sortedGames);
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

  const filteredGames = games.filter(game => game.sport_key === selectedSport);

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

      {filteredGames.length === 0 ? (
        <Typography variant="h6" sx={{ textAlign: 'center', my: 4 }}>
          No {SPORT_LABELS[selectedSport]} games available at the moment
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredGames.map((game) => (
            <Grid item xs={12} key={game.id}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default GamesList;
