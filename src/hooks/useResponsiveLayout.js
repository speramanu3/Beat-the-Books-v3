import { useTheme, useMediaQuery } from '@mui/material';

/**
 * Custom hook that provides responsive layout properties and utilities
 * @returns {Object} Object containing responsive layout properties and helper functions
 */
const useResponsiveLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return {
    // Device type flags
    isMobile,
    isTablet,
    isDesktop,
    
    // Layout properties
    spacing: isMobile ? 1 : 2,
    padding: isMobile ? 1 : 2,
    
    // Component sizing
    fontSize: {
      title: isMobile ? '1.25rem' : '1.5rem',
      subtitle: isMobile ? '1rem' : '1.25rem',
      body: isMobile ? '0.875rem' : '1rem',
      small: isMobile ? '0.75rem' : '0.875rem',
    },
    
    // Table properties
    tableSize: isMobile ? 'small' : 'medium',
    tableColumns: {
      // Default columns to show on mobile vs desktop
      game: true, // Always show
      team: true, // Always show
      market: true, // Always show
      outcome: true, // Always show
      width: !isMobile,
      sportsbook: !isMobile,
      timestamp: !isMobile,
      details: !isMobile,
    },
    
    // Card properties
    cardElevation: isMobile ? 1 : 2,
    
    // Helper functions
    getResponsiveValue: (mobileValue, desktopValue) => isMobile ? mobileValue : desktopValue,
  };
};

export default useResponsiveLayout;
