import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebaseConfig';
import { useAuth } from './AuthContext';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useAppTheme = () => {
  return useContext(ThemeContext);
};

// Define themes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007E33', // Darker green that looks better on white backgrounds
    },
    secondary: {
      main: '#00A65A', // Medium green
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#121212',
      secondary: '#424242',
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
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const darkTheme = createTheme({
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

// Provider component that wraps the app and makes theme object available to any child component that calls useTheme()
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark'); // Default to dark theme
  const { currentUser } = useAuth();
  
  // Get the appropriate theme based on the mode
  const theme = themeMode === 'light' ? lightTheme : darkTheme;
  
  // Load theme preference from localStorage on initial render
  useEffect(() => {
    const loadThemePreference = async () => {
      if (currentUser) {
        // If user is logged in, try to get theme from database
        try {
          const userThemeRef = ref(database, `users/${currentUser.uid}/preferences/theme`);
          const snapshot = await get(userThemeRef);
          
          if (snapshot.exists()) {
            setThemeMode(snapshot.val());
          } else {
            // If no theme preference in database, use localStorage or default
            const storedTheme = localStorage.getItem('themePreference');
            if (storedTheme) {
              setThemeMode(storedTheme);
              // Save to database for future
              await set(userThemeRef, storedTheme);
            }
          }
        } catch (error) {
          console.error('Error loading theme preference:', error);
          // Fallback to localStorage
          const storedTheme = localStorage.getItem('themePreference');
          if (storedTheme) {
            setThemeMode(storedTheme);
          }
        }
      } else {
        // If no user is logged in, use localStorage
        const storedTheme = localStorage.getItem('themePreference');
        if (storedTheme) {
          setThemeMode(storedTheme);
        }
      }
    };
    
    loadThemePreference();
  }, [currentUser]);
  
  // Function to toggle theme
  const toggleTheme = async () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    
    // Save to localStorage
    localStorage.setItem('themePreference', newThemeMode);
    
    // If user is logged in, save to database
    if (currentUser) {
      try {
        const userThemeRef = ref(database, `users/${currentUser.uid}/preferences/theme`);
        await set(userThemeRef, newThemeMode);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };
  
  // Function to set theme directly
  const setTheme = async (mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    
    setThemeMode(mode);
    
    // Save to localStorage
    localStorage.setItem('themePreference', mode);
    
    // If user is logged in, save to database
    if (currentUser) {
      try {
        const userThemeRef = ref(database, `users/${currentUser.uid}/preferences/theme`);
        await set(userThemeRef, mode);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
  };
  
  // The value object that will be provided to components that use this context
  const value = {
    theme,
    themeMode,
    toggleTheme,
    setTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
