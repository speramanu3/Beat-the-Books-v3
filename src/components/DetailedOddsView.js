import React, { useMemo } from 'react';
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
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatOdds, validateOdds } from '../utils/oddsProcessing';

const DetailedOddsView = ({ game }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            overflow: 'hidden'
          }}
        >
          <Table 
            size="small" 
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
                <TableCell sx={{ width: isMobile ? '30%' : 'auto' }}>Team/Outcome</TableCell>
                {showPoints && <TableCell sx={{ width: isMobile ? '20%' : 'auto' }}>Points</TableCell>}
                <TableCell sx={{ width: isMobile ? '25%' : 'auto' }}>Odds</TableCell>
                <TableCell sx={{ width: isMobile ? '25%' : 'auto' }}>Sportsbook</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {odds.map((odd, index) => (
                <TableRow 
                  key={`${odd.team}-${odd.bookmaker}-${index}`}
                  hover
                  role="row"
                  aria-label={`${odd.team} odds from ${odd.bookmaker}`}
                  sx={{
                    backgroundColor: index > 0 && odds[index - 1]?.team === odd.team ? 'rgba(0, 0, 0, 0.02)' : 'inherit'
                  }}
                >
                  <TableCell component="th" scope="row">
                    {isMobile ? odd.team.split(' ').pop() : odd.team}
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
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Accordion>
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
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(DetailedOddsView);
