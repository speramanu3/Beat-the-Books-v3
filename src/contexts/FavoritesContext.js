import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { database } from '../firebaseConfig';
import { ref, set, get, onValue } from 'firebase/database';

// Create the favorites context
const FavoritesContext = createContext();

// Custom hook to use the favorites context
export const useFavorites = () => {
  return useContext(FavoritesContext);
};

// Provider component
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load favorites from Firebase when user changes
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = ref(database, `users/${currentUser.uid}/favorites`);
    
    // Set up a listener for real-time updates
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (snapshot.exists()) {
        const favoritesData = snapshot.val();
        // Convert object to array if needed
        const favoritesArray = Array.isArray(favoritesData) 
          ? favoritesData 
          : Object.values(favoritesData);
        
        setFavorites(favoritesArray);
      } else {
        setFavorites([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading favorites:", error);
      setLoading(false);
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  // Check if a game is favorited
  const isFavorite = (gameId) => {
    return favorites.some(fav => fav.id === gameId);
  };

  // Add a game to favorites
  const addFavorite = async (game) => {
    if (!currentUser) return;
    
    try {
      // Create a simplified game object with essential info
      const favoriteGame = {
        id: game.id,
        sport_key: game.sport_key,
        sport_title: game.sport_title,
        home_team: game.home_team,
        away_team: game.away_team,
        commence_time: game.commence_time,
        addedAt: new Date().toISOString(),
        bookmakers: game.bookmakers.slice(0, 3) // Store only top 3 bookmakers to save space
      };
      
      // Add to local state
      const updatedFavorites = [...favorites, favoriteGame];
      setFavorites(updatedFavorites);
      
      // Save to Firebase
      const favoritesRef = ref(database, `users/${currentUser.uid}/favorites`);
      await set(favoritesRef, updatedFavorites);
      
      return true;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return false;
    }
  };

  // Remove a game from favorites
  const removeFavorite = async (gameId) => {
    if (!currentUser) return;
    
    try {
      // Remove from local state
      const updatedFavorites = favorites.filter(game => game.id !== gameId);
      setFavorites(updatedFavorites);
      
      // Save to Firebase
      const favoritesRef = ref(database, `users/${currentUser.uid}/favorites`);
      await set(favoritesRef, updatedFavorites);
      
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (game) => {
    if (isFavorite(game.id)) {
      return await removeFavorite(game.id);
    } else {
      return await addFavorite(game);
    }
  };

  // The value object that will be provided to components that use this context
  const value = {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
