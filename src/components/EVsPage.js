import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TableSortLabel,
  Slider,
  Grid,
  CircularProgress,
  Button,
  Stack
} from '@mui/material';
import { useAppTheme } from '../contexts/ThemeContext';
import SportsbookFilter from './SportsbookFilter';
import axios from 'axios';
import config from '../config';
import { database } from '../firebaseConfig';
import { ref, get, set } from 'firebase/database';
import AddBetButton from './AddBetButton';
import { format } from 'date-fns';

const SUPPORTED_SPORTS = ['americanfootball_nfl', 'basketball_nba', 'icehockey_nhl', 'baseball_mlb'];

const SPORT_LABELS = {
  'americanfootball_nfl': 'NFL',
  'basketball_nba': 'NBA',
  'icehockey_nhl': 'NHL',
  'baseball_mlb': 'MLB'
};

// Cache keys - using different keys from GamesList to avoid conflicts
const CACHE_KEY = 'evGamesCache';
const CACHE_TIMESTAMP_KEY = 'evGamesCacheTimestamp';

const EVsPage = () => {
  const [games, setGames] = useState([]);
  const [evBets, setEvBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('basketball_nba');
  const [availableBookmakers, setAvailableBookmakers] = useState([]);
  const [selectedBookmakers, setSelectedBookmakers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [minEv, setMinEv] = useState(0); // 0% minimum EV by default to show all bets
  const [maxWidth, setMaxWidth] = useState(30); // 30 maximum width by default to show all bets
  const [sortBy, setSortBy] = useState('evPercent'); // Default sort by EV
  const [sortDirection, setSortDirection] = useState('desc'); // Default sort direction
  const { themeMode } = useAppTheme();

  // Function to handle sport tab change
  const handleSportChange = (event, newValue) => {
    setSelectedSport(newValue);
  };

  // Function to handle bookmaker selection change
  const handleBookmakerChange = (bookmaker, isSelected) => {
    if (isSelected) {
      setSelectedBookmakers([...selectedBookmakers, bookmaker]);
    } else {
      setSelectedBookmakers(selectedBookmakers.filter(b => b !== bookmaker));
    }
  };

  // Function to select all bookmakers
  const handleSelectAllBookmakers = () => {
    if (availableBookmakers.length > 0) {
      setSelectedBookmakers([...availableBookmakers]);
    }
  };

  // Function to clear all bookmaker selections
  const handleClearAllBookmakers = () => {
    setSelectedBookmakers([]);
  };

  // Function to handle minimum EV slider change
  const handleMinEvChange = (event, newValue) => {
    setMinEv(newValue);
  };

  // Function to handle maximum width change
  const handleMaxWidthChange = (event, newValue) => {
    setMaxWidth(newValue);
  };
  
  // Function to handle sort change
  const handleSortChange = (property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Simple function to determine if a bet has positive EV
  const hasPositiveEV = (evValue) => {
    return evValue > 0;
  };
  
  // Format EV percentage for display
  const formatEVPercentage = (evValue) => {
    if (evValue === undefined || evValue === null) return 'N/A';
    return (evValue * 100).toFixed(2) + '%';
  };
  
  // Format odds for display
  const formatOdds = (odds) => {
    if (odds === undefined || odds === null) return '-';
    return odds > 0 ? `+${odds}` : odds;
  };

  // Format percentage for display
  const formatPercent = (percent) => {
    if (percent === undefined || percent === null) return '-';
    return `${percent.toFixed(2)}%`;
  };
  
  // Calculate width based on market type and odds
  const calculateWidth = (btbPrice, referenceCounterOdds, market, point) => {
    if (btbPrice === undefined || referenceCounterOdds === undefined) {
      return null;
    }
    
    try {
      // Different width calculations based on market type
      if (market === 'h2h') {
        // Moneyline width calculation
        // Formula: abs(if(and(btbPrice<0,referenceCounterOdds<0),abs(min(btbPrice,btbPrice of the other team))-abs(max(btbPrice,referenceCounterOdds)),
        //             if(and(btbPrice<0,referenceCounterOdds>0),abs(btbPrice)-abs(referenceCounterOdds),
        //                if(and(btbPrice>0,referenceCounterOdds<0),abs(referenceCounterOdds)-abs(btbPrice),"error"))))
        
        let width;
        
        if (btbPrice < 0 && referenceCounterOdds < 0) {
          // Both negative
          width = Math.abs(Math.min(btbPrice, referenceCounterOdds)) - Math.abs(Math.max(btbPrice, referenceCounterOdds));
        } else if (btbPrice < 0 && referenceCounterOdds > 0) {
          // btbPrice negative, referenceCounterOdds positive
          width = Math.abs(btbPrice) - Math.abs(referenceCounterOdds);
        } else if (btbPrice > 0 && referenceCounterOdds < 0) {
          // btbPrice positive, referenceCounterOdds negative
          width = Math.abs(referenceCounterOdds) - Math.abs(btbPrice);
        } else {
          // Both positive or other cases
          return null; // "error" case in the formula
        }
        
        return Math.abs(width);
      } 
      else if (market === 'spreads') {
        // For spread markets, the width is the difference between the odds for the same point spread
        // We'll use a simpler calculation - just the absolute difference between the odds
        return Math.abs(btbPrice - referenceCounterOdds);
      } 
      else if (market === 'totals') {
        // For total markets, similar to spreads
        return Math.abs(btbPrice - referenceCounterOdds);
      }
      
      // Default case
      return null;
    } catch (error) {
      console.error('Error calculating width:', error);
      return null;
    }
  };
  
  // Format width for display
  const formatWidth = (width) => {
    if (width === null || width === undefined) return 'N/A';
    return width.toFixed(2);
  };
  
  // Convert American odds to implied probability
  const oddsToProb = (odds) => {
    if (odds === undefined || odds === null) return 0;
    
    // For positive odds (e.g., +150)
    if (odds > 0) {
      return 100 / (odds + 100);
    }
    // For negative odds (e.g., -110)
    else if (odds < 0) {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
    return 0;
  };
  
  // Format implied probability for display
  const formatProbability = (prob) => {
    if (prob === undefined || prob === null) return 'N/A';
    return (prob * 100).toFixed(2) + '%';
  };
  
  // Format potential earnings for display
  const formatEarnings = (earnings) => {
    if (earnings === undefined || earnings === null) return 'N/A';
    return `$${earnings.toFixed(2)}`;
  };
  
  // Pure function to calculate EV bets from games data and selected bookmakers
  const calculateRawEvBets = (gamesData, bookmakersForFiltering, oddsToProb, hasPositiveEV, calculateWidth, SPORT_LABELS) => {
    if (!gamesData || gamesData.length === 0 || !bookmakersForFiltering || bookmakersForFiltering.length === 0) {
      return [];
    }

    // Removed verbose log for cleaner console output
    

    
    const evs = [];
    let pinnacleGamesCount = 0;
    
    // Single summary log at the start of processing
    console.log(`Processing ${gamesData.length} games for EVs calculation`);
    
    gamesData.forEach(game => {
      // Check if Pinnacle data is available for this game
      const hasPinnacle = game.bookmakers.some(bm => 
        bm.key === 'pinnacle' || 
        bm.key.toLowerCase() === 'pinnacle' ||
        bm.key.toLowerCase().includes('pinnacle')
      );
      
      if (hasPinnacle) {
        pinnacleGamesCount++;
        // Removed verbose per-game logs
      } else {
        // Skip games without Pinnacle data
        return;
      }
      
      // Process each bookmaker (except Pinnacle)
      game.bookmakers.forEach(bookmaker => {
        // Skip Pinnacle as we're using it as the reference
        if (bookmaker.key === 'pinnacle' || 
            bookmaker.key.toLowerCase() === 'pinnacle' ||
            bookmaker.key.toLowerCase().includes('pinnacle')) {
          return;
        }
        
        // Check if this bookmaker is in our list to use for filtering
        const isSelected = bookmakersForFiltering.some(selectedBm => 
          selectedBm.toLowerCase() === bookmaker.key.toLowerCase());
        
        if (!isSelected) {
          return;
        }
        
        // Process each market (h2h, spreads, totals)
        bookmaker.markets.forEach(market => {
          const marketKey = market.key;
          
          // Process each outcome in the market
          market.outcomes.forEach(outcome => {
            // Debug: Log outcome data to understand what's available
            console.log(`Outcome data for ${game.home_team} vs ${game.away_team}, market: ${marketKey}, outcome: ${outcome.name}`, {
              hasExpectedValue: outcome.expected_value !== undefined,
              hasBookNoVig: outcome.book_no_vig !== undefined,
              hasReferenceNoVig: outcome.reference_no_vig !== undefined,
              bookNoVig: outcome.book_no_vig,
              referenceNoVig: outcome.reference_no_vig,
              price: outcome.price,
              btbPrice: outcome.btb_price
            });
            
            // For MLB games or any games missing expected_value, calculate it if possible
            if (outcome.expected_value === undefined) {
              // Check if we have the necessary data to calculate EV
              if (outcome.book_no_vig !== undefined && outcome.reference_no_vig !== undefined) {
                // Calculate expected value: (reference_no_vig - book_no_vig) / book_no_vig
                const calculatedEV = (outcome.reference_no_vig - outcome.book_no_vig) / outcome.book_no_vig;
                outcome.expected_value = calculatedEV;
                console.log(`Calculated EV for ${outcome.name}: ${calculatedEV}`);
              } else {
                // Try an alternative calculation method if the no_vig values are missing
                if (outcome.price !== undefined && outcome.btb_price !== undefined) {
                  // Convert American odds to implied probabilities
                  const bookProb = oddsToProb(outcome.price);
                  const pinnacleProb = oddsToProb(outcome.btb_price);
                  
                  if (bookProb > 0 && pinnacleProb > 0) {
                    // Calculate EV as (pinnacle_prob - book_prob) / book_prob
                    const calculatedEV = (pinnacleProb - bookProb) / bookProb;
                    outcome.expected_value = calculatedEV;
                    console.log(`Alternative EV calculation for ${outcome.name}: ${calculatedEV}`);
                  } else {
                    console.log(`Invalid probabilities for ${outcome.name}: book=${bookProb}, pinnacle=${pinnacleProb}`);
                    return;
                  }
                } else {
                  // Still missing required data
                  console.log(`Missing data for EV calculation for ${outcome.name}`);
                  return;
                }
              }
            }
            
            const isPositiveEV = hasPositiveEV(outcome.expected_value);
            
            // Add to our list of EV bets
            const evBet = {
              id: `${game.id}-${marketKey}-${outcome.name}-${bookmaker.key}`,
              gameId: game.id,
              sport: game.sport_key,
              league: SPORT_LABELS[game.sport_key] || game.sport_key,
              homeTeam: game.home_team,
              awayTeam: game.away_team,
              commenceTime: game.commence_time,
              market: marketKey,
              outcome: outcome.name,
              point: outcome.point, // Store the point value for spreads and totals
              bookmaker: bookmaker.key,
              odds: outcome.price,
              pinnacleOdds: outcome.btb_price,
              bookNoVig: outcome.book_no_vig,
              referenceNoVig: outcome.reference_no_vig,
              bookEarnings: outcome.book_earnings,
              referenceEarnings: outcome.reference_earnings,
              referenceCounterOdds: outcome.reference_counter_odds,
              isPositiveEV: isPositiveEV,
              ev: outcome.expected_value, // Already stored as decimal
              evPercent: outcome.expected_value * 100, // Convert to percentage
              
              // Calculate width specific to each market type
              width: calculateWidth(outcome.btb_price, outcome.reference_counter_odds, marketKey, outcome.point)
            };
            
            evs.push(evBet);
          });
        });
      });
    });
    
    // Single summary log with all the important information
    console.log(`calculateRawEvBets: ${gamesData.length} total games, ${pinnacleGamesCount} with Pinnacle odds, ${evs.length} EV bets generated for ${bookmakersForFiltering.length} bookmakers`);
    return evs;
  };

  // Function to fetch games data
  const fetchGames = async (forceUpdate = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Always prioritize Firebase data
      // Streamlined logging
      let sportData = null;
      let lastUpdateTime = null;
      
      try {
        // With our new structure, data is stored by sport
        const sportRef = ref(database, `games/${selectedSport}`);
        const sportSnapshot = await get(sportRef);
        
        if (sportSnapshot.exists()) {
          const sportDataObj = sportSnapshot.val();
          sportData = sportDataObj.data;
          lastUpdateTime = sportDataObj.lastUpdated;
          console.log(`Found ${sportData.length} games for ${selectedSport} in Firebase`);
        } else {
          console.log(`No data found for ${selectedSport} in Firebase`);
        }
        
        // Also check API usage info
        const apiUsageRef = ref(database, 'apiUsage');
        const apiUsageSnapshot = await get(apiUsageRef);
        
        if (apiUsageSnapshot.exists()) {
          const apiUsageData = apiUsageSnapshot.val();
          // Store quota info in localStorage for admin access
          localStorage.setItem('apiQuotaInfo', JSON.stringify({
            remaining: apiUsageData.remainingRequests,
            used: apiUsageData.usedRequests,
            lastChecked: new Date(apiUsageData.lastUpdated).toISOString()
          }));
          
          // API quota info stored in localStorage for admin access
        }
      } catch (firebaseReadError) {
        console.error(' Error reading from Firebase:', firebaseReadError);
        // Continue with fallbacks if Firebase read fails
      }

      // If we have data from Firebase and it's not a force update, use it
      if (!forceUpdate && sportData && lastUpdateTime) {
        console.log(`Using data from Firebase for ${selectedSport}`);
        setGames(sportData); // Set raw games data
        const allBookies = new Set();
        sportData.forEach(game => game.bookmakers.forEach(bm => allBookies.add(bm.key)));
        setAvailableBookmakers(Array.from(allBookies));
        if (window.sessionStorage.getItem('evPageInitialLoadComplete') !== 'true' && allBookies.size > 0) {
          setSelectedBookmakers(Array.from(allBookies));
          window.sessionStorage.setItem('evPageInitialLoadComplete', 'true');
        }
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(sportData));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, lastUpdateTime.toString());
        setLastUpdated(new Date(lastUpdateTime));
        setLoading(false);
        return;
      }
      
      // If we're here, either:
      // 1. No Firebase data exists for this sport
      // 2. Force update was requested
      // 3. Firebase couldn't be accessed
      
      // Try to use localStorage as a fallback
      if (!forceUpdate) {
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
          
          if (cachedData && cachedTimestamp) {
            const parsedData = JSON.parse(cachedData);
            console.log(`Using cached data from localStorage as fallback for ${selectedSport}`);
            setGames(parsedData); // Set raw games data
            const allBookies = new Set();
            parsedData.forEach(game => game.bookmakers.forEach(bm => allBookies.add(bm.key)));
            setAvailableBookmakers(Array.from(allBookies));
            if (window.sessionStorage.getItem('evPageInitialLoadComplete') !== 'true' && allBookies.size > 0) {
              setSelectedBookmakers(Array.from(allBookies));
              window.sessionStorage.setItem('evPageInitialLoadComplete', 'true');
            }
            setLastUpdated(new Date(parseInt(cachedTimestamp)));
            setLoading(false);
            return;
          }
        } catch (localStorageError) {
          console.error(' Error accessing localStorage:', localStorageError);
        }
      }
      
      // As a last resort, if we can't get data from Firebase or localStorage,
      // or if force update was requested, fetch from the API
      console.log(`Fetching fresh data from API for ${selectedSport} (this should only happen rarely)`);
      
      try {
        // Make sure we're requesting all available bookmakers including Pinnacle
        const response = await axios.get(`${config.API_BASE_URL}/sports/${selectedSport}/odds`, {
          params: {
            apiKey: config.API_KEY,
            regions: 'us,eu', // Include EU region to get Pinnacle
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            bookmakers: 'pinnacle,fanduel,draftkings,betmgm,bovada,williamhill_us,barstool,pointsbet,bet365,unibet,betrivers,twinspires,betus,wynnbet,betonlineag,lowvig,mybookieag,betfred,superbook,circasports,betway,fanatics,caesars,foxbet,si_sportsbook,betfair,tipico,station,hard_rock,playup'
          }
        });
        
        const gamesData = response.data;
        console.log(`Received ${gamesData.length} games for ${selectedSport} from API`);
        
        // Set raw games data, available bookmakers, and initially selected bookmakers
        setGames(gamesData);
        const allBookies = new Set();
        gamesData.forEach(game => game.bookmakers.forEach(bm => allBookies.add(bm.key)));
        setAvailableBookmakers(Array.from(allBookies));
        if (window.sessionStorage.getItem('evPageInitialLoadComplete') !== 'true' && allBookies.size > 0) {
          setSelectedBookmakers(Array.from(allBookies));
          window.sessionStorage.setItem('evPageInitialLoadComplete', 'true');
        }
        
        // Update Firebase with the new data
        try {
          const now = Date.now();
          const sportRef = ref(database, `games/${selectedSport}`);
          await set(sportRef, {
            data: gamesData,
            lastUpdated: now
          });
          
          console.log(`Updated Firebase with fresh data for ${selectedSport}`);
          
          // Update localStorage with the new data
          localStorage.setItem(CACHE_KEY, JSON.stringify(gamesData));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
          
          setLastUpdated(new Date(now));
        } catch (firebaseWriteError) {
          console.error(' Error writing to Firebase:', firebaseWriteError);
          // Still continue since we have the data, just couldn't cache it
        }
        
        setLoading(false);
      } catch (apiError) {
        console.error(' Error fetching from API:', apiError);
        setError('Failed to fetch odds data. Please try again later.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Unexpected error in fetchGames:', error);
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  // Format market name for display
  const formatMarket = (market) => {
    switch (market) {
      case 'h2h':
        return 'Moneyline';
      case 'spreads':
        return 'Spread';
      case 'totals':
        return 'Total';
      default:
        return market;
    }
  };

  // Fetch data when the component mounts
  // Fetch raw game data when component mounts or selectedSport changes
  useEffect(() => {
    // Reset the initial load completion flag when sport changes, so bookmakers are re-selected for the new sport
    if (selectedSport) { // only run if selectedSport is defined
        window.sessionStorage.removeItem('evPageInitialLoadComplete'); 
        fetchGames();
    }
  }, [selectedSport]); // Runs on mount (due to initial selectedSport) and when selectedSport changes

  // Calculate evBets when games or selectedBookmakers change
  useEffect(() => {
    if (games.length > 0 && selectedBookmakers.length > 0) {
      console.log(`Recalculating evBets: ${games.length} games, ${selectedBookmakers.length} bookmakers`);
      const rawEvs = calculateRawEvBets(games, selectedBookmakers, oddsToProb, hasPositiveEV, calculateWidth, SPORT_LABELS);
      setEvBets(rawEvs);
    } else {
      console.log('Clearing evBets due to no games or no selected bookmakers.');
      setEvBets([]); // Clear evBets if no games or no selected bookmakers
    }
  }, [games, selectedBookmakers]); // Dependencies: raw games and selected bookmakers

  // Initial fetch on mount (if selectedSport is already set, which it is)
  // The selectedSport useEffect already covers the initial mount case because selectedSport is initialized.
  // No separate empty-dependency useEffect needed for fetchGames if selectedSport handles it.

  // Filtered and sorted EVs for display
  const filteredEvBets = useMemo(() => {
    if (evBets.length === 0) { // Now check evBets directly
        return [];
    }
    return evBets
      .filter(bet => {
        // Filter by sport
        if (bet.sport !== selectedSport) {
          return false;
        }
        
        // Filter by minimum EV (using actual value, not absolute value)
        if (bet.evPercent < minEv * 100) {
          return false;
        }
        
        // Filter by maximum width
        if (bet.width === null || bet.width === undefined) {
          return true; // Always show bets with no width value
        }
        return bet.width <= maxWidth;
      })
      .sort((a, b) => {
        // Sort by the selected property
        if (sortBy === 'evPercent') {
          return sortDirection === 'asc' ? a.evPercent - b.evPercent : b.evPercent - a.evPercent;
        } else if (sortBy === 'odds') {
          return sortDirection === 'asc' ? a.odds - b.odds : b.odds - a.odds;
        } else if (sortBy === 'commenceTime') {
          return sortDirection === 'asc' 
            ? new Date(a.commenceTime) - new Date(b.commenceTime) 
            : new Date(b.commenceTime) - new Date(a.commenceTime);
        }
        return 0;
      });
  // Ensure selectedBookmakers is not a direct dependency here if evBets already incorporates it.
  // selectedSport is fine as it's a final display filter.
  }, [evBets, minEv, maxWidth, sortBy, sortDirection, selectedSport]);

  // Render the table of EV bets
  const renderEvTable = () => {
    if (filteredEvBets.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="subtitle1" color="text.secondary">
            No EV bets found matching your criteria. Try lowering the minimum EV threshold.
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table aria-label="EV bets table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'commenceTime'}
                  direction={sortBy === 'commenceTime' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('commenceTime')}
                >
                  Game
                </TableSortLabel>
              </TableCell>
              <TableCell>Width</TableCell>
              <TableCell>Market</TableCell>
              <TableCell>Outcome</TableCell>
              <TableCell>Bookmaker</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'odds'}
                  direction={sortBy === 'odds' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('odds')}
                >
                  Odds
                </TableSortLabel>
              </TableCell>
              <TableCell>Pinnacle Odds</TableCell>
              <TableCell>Book No Vig</TableCell>
              <TableCell>Ref No Vig</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'evPercent'}
                  direction={sortBy === 'evPercent' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('evPercent')}
                >
                  EV %
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvBets.map((bet) => {
              const isPositiveEV = bet.ev > 0;
              const isZeroEV = bet.ev === 0;
              
              return (
                <TableRow 
                  key={bet.id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: isPositiveEV ? 'rgba(0, 255, 0, 0.05)' : (isZeroEV ? 'rgba(200, 200, 200, 0.05)' : 'rgba(255, 0, 0, 0.05)')
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {bet.awayTeam} @ {bet.homeTeam}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(bet.commenceTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatWidth(bet.width)}
                  </TableCell>
                  <TableCell>{formatMarket(bet.market)}</TableCell>
                  <TableCell>
                    {bet.outcome}
                    {bet.market === 'spreads' && bet.point !== undefined && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {bet.point > 0 ? '+' : ''}{bet.point}
                      </Typography>
                    )}
                    {bet.market === 'totals' && bet.point !== undefined && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        {bet.point}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{bet.bookmaker}</TableCell>
                  <TableCell>
                    {formatOdds(bet.odds)}
                  </TableCell>
                  <TableCell>
                    {formatOdds(bet.pinnacleOdds)}
                  </TableCell>
                  <TableCell>
                    {formatProbability(bet.bookNoVig)}
                  </TableCell>
                  <TableCell>
                    {formatProbability(bet.referenceNoVig)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isPositiveEV ? 'success.main' : (isZeroEV ? 'text.secondary' : 'error.main'),
                          fontWeight: 'bold'
                        }}
                      >
                        {formatEVPercentage(bet.ev)}
                      </Typography>
                      <AddBetButton 
                        game={{
                          id: bet.gameId,
                          home_team: bet.homeTeam,
                          away_team: bet.awayTeam,
                          commence_time: bet.commenceTime
                        }}
                        bookmaker={{
                          key: bet.bookmakerKey,
                          title: bet.bookmaker
                        }}
                        market={{
                          key: bet.market
                        }}
                        outcome={{
                          name: bet.outcome,
                          price: bet.odds,
                          point: bet.point
                        }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Expected Value Bets
      </Typography>
      
      {/* Sport tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedSport}
          onChange={handleSportChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {Object.entries(SPORT_LABELS).map(([key, label]) => (
            <Tab key={key} value={key} label={label} />
          ))}
        </Tabs>
      </Paper>

      {/* Conditional rendering for loading, error, or content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error} {/* Display primary error message */}
        </Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={8}>
              <SportsbookFilter
                availableBookmakers={availableBookmakers}
                selectedBookmakers={selectedBookmakers}
                onBookmakerChange={handleBookmakerChange}
                onSelectAll={handleSelectAllBookmakers}
                onClearAll={handleClearAllBookmakers}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography id="ev-slider" gutterBottom>
                    Minimum EV: {(minEv * 100).toFixed(1)}%
                  </Typography>
                  <Slider
                    value={minEv}
                    onChange={handleMinEvChange}
                    aria-labelledby="ev-slider"
                    step={0.01}
                    marks={[
                      { value: -0.25, label: '-25%' },
                      { value: -0.125, label: '-12.5%' },
                      { value: 0, label: '0%' },
                      { value: 0.125, label: '12.5%' },
                      { value: 0.25, label: '25%' }
                    ]}
                    min={-0.25}
                    max={0.25}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${(value * 100).toFixed(1)}%`}
                  />
                </Box>
                
                <Box>
                  <Typography id="width-slider" gutterBottom>
                    Maximum Width: {maxWidth}
                  </Typography>
                  <Slider
                    value={maxWidth}
                    onChange={handleMaxWidthChange}
                    aria-labelledby="width-slider"
                    step={1}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100' },
                      { value: 150, label: '150' },
                      { value: 200, label: '200' }
                    ]}
                    min={0}
                    max={200}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Last updated info */}
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          )}
          
          {/* Render the table of EV bets */}
          {renderEvTable()}
        </>
      )}
    </Box>
  );
};

export default EVsPage;
