import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Paper,
  Stack,
  IconButton,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import AddBetButtonV2 from './AddBetButtonV2';
import { getTeamDisplay } from '../utils/teamUtils';

/**
 * Mobile-optimized EV table component with horizontal scrolling and sticky columns
 */
const MobileEVTable = ({ 
  filteredEvBets, 
  sortBy, 
  sortDirection, 
  handleSortChange, 
  formatMarket,
  formatWidth,
  formatOdds,
  formatProbability,
  formatEVPercentage,
  formatDate,
  userId,
  isBetAdded
}) => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // Handle horizontal scroll for mobile table
  const handleTableScroll = (event) => {
    const { scrollLeft, scrollWidth, clientWidth } = event.target;
    
    // Show left indicator if scrolled right
    setShowLeftScroll(scrollLeft > 0);
    
    // Show right indicator if not scrolled all the way right
    setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
  };

  // Set up scroll event listeners
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleTableScroll);
      
      // Initial check for scroll indicators
      handleTableScroll({ target: tableElement });
      
      return () => {
        tableElement.removeEventListener('scroll', handleTableScroll);
      };
    }
  }, []);

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
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Left scroll indicator */}
      {showLeftScroll && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0)})`,
            width: '40px',
          }}
        >
          <IconButton size="small">
            <KeyboardArrowLeftIcon />
          </IconButton>
        </Box>
      )}
      
      {/* Right scroll indicator */}
      {showRightScroll && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            background: `linear-gradient(to left, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0)})`,
            width: '40px',
          }}
        >
          <IconButton size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      )}
      
      <TableContainer 
        component={Paper} 
        ref={tableRef}
        sx={{ 
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.4),
            borderRadius: '4px',
          },
        }}
      >
        <Table aria-label="EV bets table" size="small">
          <TableHead>
            <TableRow>
              {/* Sticky Game column */}
              <TableCell 
                sx={{ 
                  position: 'sticky', 
                  left: 0, 
                  backgroundColor: theme.palette.background.paper,
                  zIndex: 3,
                  minWidth: '120px',
                  boxShadow: showLeftScroll ? 1 : 'none',
                }}
              >
                <TableSortLabel
                  active={sortBy === 'commenceTime'}
                  direction={sortBy === 'commenceTime' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('commenceTime')}
                >
                  Game
                </TableSortLabel>
              </TableCell>
              
              {/* Essential columns for mobile */}
              <TableCell sx={{ minWidth: '60px' }}>
                <TableSortLabel
                  active={sortBy === 'evPercent'}
                  direction={sortBy === 'evPercent' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('evPercent')}
                >
                  EV %
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ minWidth: '80px' }}>Market</TableCell>
              <TableCell sx={{ minWidth: '80px' }}>Outcome</TableCell>
              <TableCell sx={{ minWidth: '80px' }}>Bookmaker</TableCell>
              <TableCell sx={{ minWidth: '60px' }}>
                <TableSortLabel
                  active={sortBy === 'odds'}
                  direction={sortBy === 'odds' ? sortDirection : 'asc'}
                  onClick={() => handleSortChange('odds')}
                >
                  Odds
                </TableSortLabel>
              </TableCell>
              
              {/* Additional columns that can be scrolled to */}
              <TableCell sx={{ minWidth: '60px' }}>Width</TableCell>
              <TableCell sx={{ minWidth: '100px' }}>Pinnacle</TableCell>
              <TableCell sx={{ minWidth: '80px' }}>Book No Vig</TableCell>
              <TableCell sx={{ minWidth: '80px' }}>Ref No Vig</TableCell>
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
                  {/* Sticky Game column */}
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      position: 'sticky', 
                      left: 0, 
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 1,
                      boxShadow: showLeftScroll ? 1 : 'none',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {getTeamDisplay(bet.awayTeam, true)} @ {getTeamDisplay(bet.homeTeam, true)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {formatDate(bet.commenceTime)}
                    </Typography>
                  </TableCell>
                  
                  {/* EV % - prioritized for mobile */}
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: isPositiveEV ? 'success.main' : (isZeroEV ? 'text.secondary' : 'error.main'),
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}
                      >
                        {formatEVPercentage(bet.ev)}
                      </Typography>
                      {/* Only render AddBetButtonV2 if all required properties exist */}
                      {bet.gameId && (bet.bookmakerKey || bet.bookmaker) && bet.market && bet.outcome ? (
                        <AddBetButtonV2 
                          game={{
                            id: bet.gameId,
                            home_team: bet.homeTeam || '',
                            away_team: bet.awayTeam || '',
                            commence_time: bet.commenceTime || new Date().toISOString()
                          }}
                          bookmaker={{
                            key: bet.bookmakerKey || bet.bookmaker,
                            title: bet.bookmaker || bet.bookmakerKey || ''
                          }}
                          market={{
                            key: bet.market
                          }}
                          outcome={{
                            name: bet.outcome,
                            price: bet.odds || 0,
                            point: bet.point
                          }}
                          userId={userId}
                          isAdded={isBetAdded(bet.gameId, bet.bookmakerKey || bet.bookmaker, bet.market, bet.outcome, bet.point)}
                          size="small"
                      />
                      ) : null}
                    </Stack>
                  </TableCell>
                  
                  {/* Other essential columns */}
                  <TableCell sx={{ fontSize: '0.8rem' }}>{formatMarket(bet.market)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {bet.outcome}
                    </Typography>
                    {bet.market === 'spreads' && bet.point !== undefined && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {bet.point > 0 ? '+' : ''}{bet.point}
                      </Typography>
                    )}
                    {bet.market === 'totals' && bet.point !== undefined && (
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {bet.point}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{bet.bookmaker}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatOdds(bet.odds)}
                  </TableCell>
                  
                  {/* Additional columns */}
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatWidth(bet.width)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatOdds(bet.pinnacleOdds)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatProbability(bet.bookNoVig)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatProbability(bet.referenceNoVig)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MobileEVTable;
