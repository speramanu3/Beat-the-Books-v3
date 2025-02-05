import React, { useMemo } from 'react';
import { Paper, Grid, Typography, Box, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { format } from 'date-fns';
import { getTeamLogo } from '../utils/teamLogos';
import DetailedOddsView from './DetailedOddsView';
import { getProcessedOdds, formatOdds } from '../utils/oddsProcessing';

const GameCard = ({ game, selectedBookmakers }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      mb={isMobile ? 0.5 : 1}
      component="article"
      role="article"
      aria-label={`${team} ${isHome ? 'Home' : 'Away'} Team`}
    >
      <Avatar
        src={getTeamLogo(game.sport_key, team)}
        alt={`${team} logo`}
        sx={{ 
          width: isMobile ? 30 : 40, 
          height: isMobile ? 30 : 40, 
          mr: isMobile ? 1 : 2 
        }}
      />
      <Box>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          component="span"
          sx={{ 
            fontSize: isMobile ? '0.9rem' : undefined,
            fontWeight: 'bold'
          }}
        >
          {team}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          display="block"
          sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
        >
          {isHome ? 'Home' : 'Away'}
        </Typography>
      </Box>
    </Box>
  );

  const MoneylineSection = ({ title, awayOdds, homeOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography 
        variant="subtitle2" 
        gutterBottom 
        color="text.secondary"
        sx={{ 
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          mb: isMobile ? 0.25 : 1
        }}
      >
        {title}
      </Typography>
      <Box mb={isMobile ? 0.25 : 1}>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          {formatOdds(awayOdds?.odds)}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {awayOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          {formatOdds(homeOdds?.odds)}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {homeOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  const SpreadSection = ({ title, awayOdds, homeOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography 
        variant="subtitle2" 
        gutterBottom 
        color="text.secondary"
        sx={{ 
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          mb: isMobile ? 0.25 : 1
        }}
      >
        {title}
      </Typography>
      <Box mb={isMobile ? 0.25 : 1}>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          {awayOdds?.points > 0 ? '+' : ''}{awayOdds?.points} ({formatOdds(awayOdds?.odds)})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {awayOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          {homeOdds?.points > 0 ? '+' : ''}{homeOdds?.points} ({formatOdds(homeOdds?.odds)})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {homeOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  const TotalsSection = ({ title, overOdds, underOdds }) => (
    <Box role="region" aria-label={`${title} odds`}>
      <Typography 
        variant="subtitle2" 
        gutterBottom 
        color="text.secondary"
        sx={{ 
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          mb: isMobile ? 0.25 : 1
        }}
      >
        {title}
      </Typography>
      <Box mb={isMobile ? 0.25 : 1}>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          O {overOdds?.points} ({formatOdds(overOdds?.odds)})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {overOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
      <Box>
        <Typography 
          variant="body1"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            whiteSpace: 'nowrap'
          }}
        >
          U {underOdds?.points} ({formatOdds(underOdds?.odds)})
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.6rem' : '0.75rem',
            display: 'block',
            whiteSpace: 'nowrap'
          }}
        >
          via {underOdds?.bookmaker || 'N/A'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: isMobile ? 1 : 2,
        mb: 2,
        width: '100%',
        overflow: 'hidden' // Prevent horizontal scroll
      }}
      component="article"
      role="article"
      aria-label={`${game.away_team} vs ${game.home_team} Game Card`}
    >
      <Grid container spacing={isMobile ? 1 : 2}>
        {/* Team Info Column */}
        <Grid item xs={4}>
          <Box>
            <TeamDisplay team={game.away_team} isHome={false} />
            <TeamDisplay team={game.home_team} isHome={true} />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                display: 'block',
                mt: 1,
                fontSize: isMobile ? '0.6rem' : '0.75rem'
              }}
              role="time"
              aria-label="Game start time"
            >
              {format(new Date(game.commence_time), 'EEE, MMM d • h:mm a')}
            </Typography>
          </Box>
        </Grid>

        {/* Odds Columns */}
        <Grid item xs={8}>
          <Grid container spacing={isMobile ? 0.5 : 2}>
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

      {/* Detailed View */}
      <DetailedOddsView game={filteredGame} />
    </Paper>
  );
};

export default React.memo(GameCard);
