import React, { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';
import { formatOdds, validateOdds } from '../utils/oddsProcessing';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import { getTeamDisplay } from '../utils/teamUtils';

const DetailedOddsView = ({ game, hideAccordion = false }) => {
  const theme = useTheme();
  const { isMobile, tableSize } = useResponsiveLayout();
  const [expanded, setExpanded] = useState(false);

  // For demonstration purposes - in a real implementation, this would come from SubscriptionContext
  const isSubscribed = false; // Replace with actual subscription check

  const getMarketOdds = useMemo(() => (marketKey) => {
    const allOdds = [];
    
    game.bookmakers.forEach(bookmaker => {
      const market = bookmaker.markets.find(m => m.key === marketKey);
      if (!market || !validateOdds(market)) return;

      market.outcomes.forEach(outcome => {
        allOdds.push({
          bookmaker: bookmaker.title,
          team: outcome.name,
          odds: outcome.price,
          points: outcome.point
        });
      });
    });

    return allOdds.sort((a, b) => {
      if (a.odds > 0 && b.odds > 0) return b.odds - a.odds;
      if (a.odds < 0 && b.odds < 0) return b.odds - a.odds;
      return b.odds - a.odds;
    });
  }, [game]);

  const OddsTable = ({ title, marketKey, showPoints = false }) => {
    const odds = useMemo(() => {
      const allOdds = getMarketOdds(marketKey);
      const groupedOdds = allOdds.reduce((acc, odd) => {
        if (!acc[odd.team]) {
          acc[odd.team] = [];
        }
        acc[odd.team].push(odd);
        return acc;
      }, {});

      return Object.values(groupedOdds)
        .map(teamOdds => teamOdds.sort((a, b) => {
          if (a.odds > 0 && b.odds > 0) return b.odds - a.odds;
          if (a.odds < 0 && b.odds < 0) return b.odds - a.odds;
          return b.odds - a.odds;
        }))
        .flat();
    }, [marketKey]);
    
    // Show all odds data regardless of subscription status
    const limitedOdds = odds;
    const hasMoreOdds = false; // No longer hiding odds behind paywall

    return (
      <Box sx={{ mb: 3 }} role="region" aria-label={`${title} odds comparison`}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontSize: isMobile ? '0.9rem' : undefined }}
        >
          {title}
        </Typography>
        <TableContainer 
          component={Paper}
          sx={{ 
            width: '100%',
            overflow: isMobile ? 'auto hidden' : 'hidden',
            position: 'relative',
            '&::-webkit-scrollbar': { height: '4px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)' }
          }}
        >
          {/* Scroll indicator for mobile */}
          {isMobile && (
            <Box 
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: '50%', 
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                opacity: 0.7
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </Box>
          )}
          <Table 
            size={tableSize}
            aria-label={`${title} odds table`}
            sx={{
              '& .MuiTableCell-root': {
                px: isMobile ? 1 : 2,
                py: isMobile ? 0.5 : 1,
                fontSize: isMobile ? '0.75rem' : undefined,
                whiteSpace: 'nowrap'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    width: isMobile ? '30%' : 'auto',
                    position: isMobile ? 'sticky' : 'static',
                    left: 0,
                    backgroundColor: 'background.paper',
                    zIndex: 1
                  }}
                >
                  Team/Outcome
                </TableCell>
                {showPoints && <TableCell sx={{ width: isMobile ? '20%' : 'auto' }}>Points</TableCell>}
                <TableCell sx={{ width: isMobile ? '25%' : 'auto' }}>Odds</TableCell>
                <TableCell sx={{ width: isMobile ? '25%' : 'auto' }}>Sportsbook</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {limitedOdds.map((odd, index) => (
                <TableRow 
                  key={`${odd.team}-${odd.bookmaker}-${index}`}
                  hover
                  role="row"
                  aria-label={`${odd.team} odds from ${odd.bookmaker}`}
                  sx={{
                    backgroundColor: index > 0 && limitedOdds[index - 1]?.team === odd.team ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      position: isMobile ? 'sticky' : 'static',
                      left: 0,
                      backgroundColor: index > 0 && limitedOdds[index - 1]?.team === odd.team ? 'rgba(0, 0, 0, 0.02)' : 'background.paper',
                      zIndex: 1
                    }}
                  >
                    {isMobile ? getTeamDisplay(odd.team, isMobile) : odd.team}
                  </TableCell>
                  {showPoints && (
                    <TableCell>
                      {odd.points != null ? (odd.points > 0 ? '+' : '') + odd.points : 'N/A'}
                    </TableCell>
                  )}
                  <TableCell>{formatOdds(odd.odds)}</TableCell>
                  <TableCell>{odd.bookmaker}</TableCell>
                </TableRow>
              ))}
              
              {/* All odds are now shown - no locked row */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const handleAccordionChange = (event, isExpanded) => {
    setExpanded(isExpanded);
  };

  // If hideAccordion is true, render content directly without the accordion wrapper
  if (hideAccordion) {
    return (
      <Box sx={{ p: isMobile ? 1 : 2 }}>
        <OddsTable title="Moneyline" marketKey="h2h" />
        <OddsTable title="Spread" marketKey="spreads" showPoints={true} />
        <OddsTable title="Over/Under" marketKey="totals" showPoints={true} />
        
        {/* No premium upgrade prompt - all data is freely available */}
      </Box>
    );
  }

  // Otherwise, render with the accordion wrapper
  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="odds-comparison-content"
        id="odds-comparison-header"
      >
        <Typography>View All Available Odds</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
        <OddsTable title="Moneyline" marketKey="h2h" />
        <OddsTable title="Spread" marketKey="spreads" showPoints={true} />
        <OddsTable title="Over/Under" marketKey="totals" showPoints={true} />
        
        {/* No premium upgrade prompt - all data is freely available */}
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(DetailedOddsView);
