import React, { useMemo } from 'react';
import { Paper, Grid, Typography, Box, Avatar, Skeleton } from '@mui/material';
import { format } from 'date-fns';
import { getTeamLogo } from '../utils/teamLogos';
import DetailedOddsView from './DetailedOddsView';
import { getProcessedOdds, formatOdds } from '../utils/oddsProcessing';

const GameCard = ({ game, selectedBookmakers }) => {
  // Create a filtered game object with only selected bookmakers
  const filteredGame = useMemo(() => ({
    ...game,
    bookmakers: game.bookmakers.filter(bookmaker => 
      selectedBookmakers.includes(bookmaker.title)
    )
  }), [game, selectedBookmakers]);

  // Get odds for both teams for spreads and totals
  const odds = useMemo(() => ({
    homeMoneyline: getProcessedOdds(filteredGame, 'h2h', game.home_team),
    awayMoneyline: getProcessedOdds(filteredGame, 'h2h', game.away_team),
    homeSpread: getProcessedOdds(filteredGame, 'spreads', game.home_team),
    awaySpread: getProcessedOdds(filteredGame, 'spreads', game.away_team),
    overTotal: getProcessedOdds(filteredGame, 'totals', 'Over'),
    underTotal: getProcessedOdds(filteredGame, 'totals', 'Under')
  }), [filteredGame, game.home_team, game.away_team]);

  const TeamDisplay = ({ team, isHome }) => (
    <Box 
      display="flex" 
      alignItems="center" 
      mb={1}
      component="article"
      role="article"
      aria-label={`${team} ${isHome ? 'Home' : 'Away'} Team`}
    >
      <Avatar
        src={getTeamLogo(game.sport_key, team)}
        alt={`${team} logo`}
        sx={{ width: 40, height: 40, mr: 2 }}
      />
      <Box>
        <Typography variant="h6" component="span">
          {team}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {isHome ? 'Home' : 'Away'}
        </Typography>
      </Box>
    </Box>
  );

  const MoneylineSection = ({ title, awayOdds, homeOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        {title}
      </Typography>
      <Box mb={1}>
        <Typography variant="body1">
          {formatOdds(awayOdds?.odds)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {awayOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">
          {formatOdds(homeOdds?.odds)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {homeOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  const SpreadSection = ({ title, awayOdds, homeOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        {title}
      </Typography>
      <Box mb={1}>
        <Typography variant="body1">
          {awayOdds?.points > 0 ? '+' : ''}{awayOdds?.points} ({formatOdds(awayOdds?.odds)})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {awayOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">
          {homeOdds?.points > 0 ? '+' : ''}{homeOdds?.points} ({formatOdds(homeOdds?.odds)})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {homeOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  const TotalsSection = ({ title, overOdds, underOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography variant="subtitle2" gutterBottom color="text.secondary">
        {title}
      </Typography>
      <Box mb={1}>
        <Typography variant="body1">
          O {overOdds?.points} ({formatOdds(overOdds?.odds)})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {overOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1">
          U {underOdds?.points} ({formatOdds(underOdds?.odds)})
        </Typography>
        <Typography variant="caption" color="text.secondary">
          via {underOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper 
      elevation={3} 
      sx={{ p: 2 }}
      component="article"
      role="article"
      aria-label={`${game.away_team} vs ${game.home_team} Game Card`}
    >
      <Grid container spacing={2}>
        {/* Team Information (33% width) */}
        <Grid item xs={4}>
          <Box>
            <TeamDisplay team={game.away_team} isHome={false} />
            <TeamDisplay team={game.home_team} isHome={true} />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1 }}
              role="time"
              aria-label="Game start time"
            >
              {format(new Date(game.commence_time), 'EEE, MMM d • h:mm a')}
            </Typography>
          </Box>
        </Grid>

        {/* Odds Display (67% width) */}
        <Grid item xs={8}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <MoneylineSection 
                title="Moneyline"
                awayOdds={odds.awayMoneyline}
                homeOdds={odds.homeMoneyline}
              />
            </Grid>

            <Grid item xs={4}>
              <SpreadSection 
                title="Spread"
                awayOdds={odds.awaySpread}
                homeOdds={odds.homeSpread}
              />
            </Grid>

            <Grid item xs={4}>
              <TotalsSection 
                title="Over/Under"
                overOdds={odds.overTotal}
                underOdds={odds.underTotal}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <DetailedOddsView game={filteredGame} />
    </Paper>
  );
};

export default React.memo(GameCard);
