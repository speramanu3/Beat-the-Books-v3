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

    // Sort odds from best to worst
    return allOdds.sort((a, b) => {
      if (a.odds > 0 && b.odds > 0) return b.odds - a.odds;
      if (a.odds < 0 && b.odds < 0) return a.odds - b.odds;
      return b.odds - a.odds;
    });
  }, [game]);

  const OddsTable = ({ title, marketKey, showPoints = false }) => {
    const odds = useMemo(() => getMarketOdds(marketKey), [marketKey]);

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
                <TableCell>Team</TableCell>
                {showPoints && <TableCell>Points</TableCell>}
                <TableCell>Odds</TableCell>
                <TableCell>Sportsbook</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {odds.map((odd, index) => (
                <TableRow 
                  key={index}
                  hover
                  role="row"
                  aria-label={`${odd.team} odds from ${odd.bookmaker}`}
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
