import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import GamesList from './components/GamesList';
import HomePage from './components/HomePage';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#39FF14', // Neon green
    },
    secondary: {
      main: '#00E676', // Lighter green
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
    },
    h2: {
      fontFamily: '"Orbitron", sans-serif',
    },
    h3: {
      fontFamily: '"Orbitron", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

function App() {
  // Explicitly set the initial state to 'home' to ensure the home page is shown by default
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedSport, setSelectedSport] = useState('basketball_nba');

  // Navigation functions
  const navigateTo = (page, sportKey) => {
    console.log('Navigating to:', page, sportKey ? `with sport: ${sportKey}` : '');
    setCurrentPage(page);
    if (sportKey) {
      setSelectedSport(sportKey);
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Header currentPage={currentPage} navigateTo={navigateTo} />
        <Box sx={{ minHeight: 'calc(100vh - 64px)' }}>
          {currentPage === 'home' ? (
            <HomePage navigateTo={navigateTo} />
          ) : (
            <Container maxWidth="lg" sx={{ py: 4 }}>
              <GamesList initialSport={selectedSport} />
            </Container>
          )}
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
