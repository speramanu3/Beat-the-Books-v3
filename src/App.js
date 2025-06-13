import React, { useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import GamesList from './components/GamesList';
import HomePage from './components/HomePage';
import Header from './components/Header';
import ProfilePage from './components/auth/ProfilePage';
import SettingsPage from './components/auth/SettingsPage';
import FavoriteBets from './components/FavoriteBets';
import EVsPage from './components/EVsPage';
import PremiumFeature from './components/PremiumFeature';
import AdminControls from './components/AdminControls';
import BetTracker from './components/BetTracker';
import BetTrackerFix from './components/BetTrackerFix';
import SubscriptionPage from './components/SubscriptionPage';
import StripeProvider from './components/StripeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ThemeProvider, useAppTheme } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

// Theme is now managed by ThemeContext

function AppContent() {
  // Explicitly set the initial state to 'home' to ensure the home page is shown by default
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSport, setSelectedSport] = useState('basketball_nba');
  const { theme } = useAppTheme();
  
  // Listen for navigation events from PremiumFeature component
  React.useEffect(() => {
    const handleNavigationEvent = (event) => {
      if (event.detail?.page) {
        navigateTo(event.detail.page);
      }
    };
    
    window.addEventListener('navigate-to', handleNavigationEvent);
    
    return () => {
      window.removeEventListener('navigate-to', handleNavigationEvent);
    };
  }, []);

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
            <PremiumFeature 
              title="Expected Value (EV) Calculator" 
              description="Unlock our premium EV calculator to find the most profitable betting opportunities across all major sportsbooks."
            >
              <EVsPage />
            </PremiumFeature>
          </Container>
        ) : currentPage === 'subscription' ? (
          <SubscriptionPage />
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
          <StripeProvider>
            <SubscriptionProvider>
              <AppContent />
            </SubscriptionProvider>
          </StripeProvider>
        </ThemeProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
