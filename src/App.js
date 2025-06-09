import React, { useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import GamesList from './components/GamesList';
import HomePage from './components/HomePage';
import Header from './components/Header';
import ProfilePage from './components/auth/ProfilePage';
import SettingsPage from './components/auth/SettingsPage';
import FavoriteBets from './components/FavoriteBets';
import EVsPage from './components/EVsPage';
import AdminControls from './components/AdminControls';
import BetTracker from './components/BetTracker';
import BetTrackerFix from './components/BetTrackerFix';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider, useAppTheme } from './contexts/ThemeContext';

// Theme is now managed by ThemeContext

function AppContent() {
  // Explicitly set the initial state to 'home' to ensure the home page is shown by default
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSport, setSelectedSport] = useState('basketball_nba');
  const { theme } = useAppTheme();

  // Navigation functions
  const navigateTo = (page, sportKey) => {
    console.log('Navigating to:', page, sportKey ? `with sport: ${sportKey}` : '');
    setCurrentPage(page);
    if (sportKey) {
      setSelectedSport(sportKey);
    }
  };

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Header currentPage={currentPage} navigateTo={navigateTo} />
      <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <AdminControls />
        </Container>
        {currentPage === 'home' ? (
          <HomePage navigateTo={navigateTo} />
        ) : currentPage === 'profile' ? (
          <ProfilePage navigateTo={navigateTo} />
        ) : currentPage === 'settings' ? (
          <SettingsPage navigateTo={navigateTo} />
        ) : currentPage === 'favorites' ? (
          <FavoriteBets />
        ) : currentPage === 'bets' ? (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <BetTrackerFix />
          </Container>
        ) : currentPage === 'evs' ? (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <EVsPage />
          </Container>
        ) : (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <GamesList initialSport={selectedSport} />
          </Container>
        )}
      </Box>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
