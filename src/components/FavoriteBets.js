import React, { useState, useEffect } from 'react';
import { isAfter, startOfDay, addDays, parseISO, isPast, addHours } from 'date-fns';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert,
  Button
} from '@mui/material';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import GameCard from './GameCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RefreshIcon from '@mui/icons-material/Refresh';
import { database } from '../firebaseConfig';
import { ref, get } from 'firebase/database';

const FavoriteBets = () => {
  const { currentUser } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState([
    'FanDuel', 'DraftKings', 'BetMGM', 'Caesars', 'PointsBet'
  ]);

  // Fetch the latest odds data for favorite games
  // Helper function to check if a bet was favorited after the game was played
  const wasFavoritedAfterGamePlayed = (favorite) => {
    // If we don't have both timestamps, we can't determine, so include the bet
    if (!favorite.addedAt || !favorite.commence_time) {
      return false;
    }
    
    const gameDate = parseISO(favorite.commence_time);
    const favoritedDate = parseISO(favorite.addedAt);
    
    // Get the day after the game (midnight)
    const dayAfterGame = addDays(startOfDay(gameDate), 1);
    
    // Return true if the bet was favorited after the day the game was played
    return isAfter(favoritedDate, dayAfterGame);
  };

  // Helper function to check if a game has already been played
  const hasGameBeenPlayed = (game) => {
    if (!game.commence_time) {
      return false;
    }
    
    const gameDate = parseISO(game.commence_time);
    const now = new Date();
    
    // Add 3 hours to game time to account for typical game duration
    // This ensures games in progress are still shown
    const estimatedEndTime = addHours(gameDate, 3);
    
    // Return true if the estimated end time has passed
    return isPast(estimatedEndTime);
  };

  useEffect(() => {
    const fetchLatestOdds = async () => {
      if (!currentUser || !favorites.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const updatedGames = [];
        
        // Filter out favorites that were added after the game was played
        // AND filter out games that have already been played
        const validFavorites = favorites.filter(fav => 
          !wasFavoritedAfterGamePlayed(fav) && !hasGameBeenPlayed(fav)
        );
        
        // Group favorites by sport to minimize database reads
        const sportGroups = validFavorites.reduce((acc, fav) => {
          if (!acc[fav.sport_key]) {
            acc[fav.sport_key] = [];
          }
          acc[fav.sport_key].push(fav);
          return acc;
        }, {});
        
        // Fetch latest data for each sport
        for (const sportKey of Object.keys(sportGroups)) {
          const sportRef = ref(database, `sports/${sportKey}`);
          const snapshot = await get(sportRef);
          
          if (snapshot.exists()) {
            const sportData = snapshot.val();
            
            // Find the favorite games in the latest data
            for (const favorite of sportGroups[sportKey]) {
              const latestGame = sportData.find(game => game.id === favorite.id);
              
              if (latestGame) {
                // Preserve the addedAt timestamp from the favorite
                updatedGames.push({
                  ...latestGame,
                  addedAt: favorite.addedAt
                });
              } else {
                // If game not found in latest data (might be old/completed), use the stored favorite data
                updatedGames.push(favorite);
              }
            }
          } else {
            // If no latest data, use the stored favorite data
            sportGroups[sportKey].forEach(favorite => updatedGames.push(favorite));
          }
        }
        
        setGames(updatedGames);
        setError(null);
      } catch (err) {
        console.error('Error fetching latest odds for favorites:', err);
        setError('Failed to load the latest odds for your favorite bets.');
        // Fall back to using the stored favorites data but still filter out invalid ones
        setGames(favorites.filter(fav => 
          !wasFavoritedAfterGamePlayed(fav) && !hasGameBeenPlayed(fav)
        ));
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchLatestOdds();
    }
  }, [currentUser, favorites, favoritesLoading]);

  const handleRefresh = () => {
    setLoading(true);
    // Re-fetch the latest odds
    const fetchLatestOdds = async () => {
      // Implementation similar to the useEffect above
      // This is a simplified version for the refresh button
      try {
        // Filter out favorites that were added after the game was played
        // AND filter out games that have already been played
        const validFavorites = favorites.filter(fav => 
          !wasFavoritedAfterGamePlayed(fav) && !hasGameBeenPlayed(fav)
        );
        setGames([...validFavorites]);
        setError(null);
      } catch (err) {
        setError('Failed to refresh the latest odds.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestOdds();
  };

  // If not logged in
  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Please log in to view your favorite bets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You need to be logged in to save and view your favorite bets.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            color: '#39FF14', 
            fontFamily: '"Orbitron", sans-serif',
            textShadow: '0 0 5px rgba(57, 255, 20, 0.5)'
          }}
        >
          Favorite Bets
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={loading}
          sx={{ 
            color: '#39FF14', 
            borderColor: '#39FF14',
            '&:hover': {
              borderColor: '#32CD32',
              backgroundColor: 'rgba(57, 255, 20, 0.1)'
            }
          }}
        >
          Refresh Odds
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#39FF14' }} />
        </Box>
      ) : games.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <FavoriteBorderIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.3)' }} />
          <Typography variant="h5" gutterBottom>
            No Favorite Bets Yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add games to your favorites by clicking the heart icon on any game card.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid item xs={12} key={game.id}>
              <GameCard game={game} selectedBookmakers={selectedBookmakers} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default FavoriteBets;
