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
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatOdds, validateOdds } from '../utils/oddsProcessing';

const DetailedOddsView = ({ game }) => {
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

    // Sort odds from highest to lowest value
    return allOdds.sort((a, b) => {
      // For positive odds (underdogs), higher is better
      if (a.odds > 0 && b.odds > 0) return b.odds - a.odds;
      // For negative odds (favorites), less negative is better
      if (a.odds < 0 && b.odds < 0) return b.odds - a.odds;
      // When comparing positive vs negative, positive is higher value
      return b.odds - a.odds;
    });
  }, [game]);

  const OddsTable = ({ title, marketKey, showPoints = false }) => {
    const odds = useMemo(() => {
      const allOdds = getMarketOdds(marketKey);
      // Group odds by team/outcome
      const groupedOdds = allOdds.reduce((acc, odd) => {
        if (!acc[odd.team]) {
          acc[odd.team] = [];
        }
        acc[odd.team].push(odd);
        return acc;
      }, {});

      // Sort within each group and flatten
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
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <TableContainer component={Paper}>
          <Table 
            size="small" 
            aria-label={`${title} odds table`}
          >
            <TableHead>
              <TableRow>
                <TableCell>Team/Outcome</TableCell>
                {showPoints && <TableCell>Points</TableCell>}
                <TableCell>Odds</TableCell>
                <TableCell>Sportsbook</TableCell>
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
                  <TableCell component="th" scope="row">{odd.team}</TableCell>
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
    <Box sx={{ mt: 2 }}>
      <Accordion>
        <AccordionSummary 
          expandIcon={<ExpandMoreIcon />}
          aria-controls="detailed-odds-content"
          id="detailed-odds-header"
        >
          <Typography>View All Available Odds</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <OddsTable title="Moneyline" marketKey="h2h" />
          <OddsTable title="Spread" marketKey="spreads" showPoints={true} />
          <OddsTable title="Over/Under" marketKey="totals" showPoints={true} />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default React.memo(DetailedOddsView);
