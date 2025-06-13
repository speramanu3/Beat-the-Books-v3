import React, { useMemo, useState } from 'react';
import { Paper, Grid, Typography, Box, Avatar, useTheme, useMediaQuery, IconButton, Tooltip, Collapse, Button } from '@mui/material';
import { format } from 'date-fns';
import { getTeamLogo } from '../utils/teamLogos';
import useResponsiveLayout from '../hooks/useResponsiveLayout';
import { getTeamDisplay } from '../utils/teamUtils';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DetailedOddsView from './DetailedOddsView';
import { getProcessedOdds, formatOdds } from '../utils/oddsProcessing';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import PremiumEVBadge from './PremiumEVBadge';

const GameCard = ({ game, selectedBookmakers }) => {
  const theme = useTheme();
  const { isMobile } = useResponsiveLayout();
  const [expanded, setExpanded] = useState(false);
  const { currentUser } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Extract EV data if available from GamesList component
  const hasEvData = game.maxEv !== undefined && game.bestBet !== undefined;

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

  // New combined teams display for mobile
  const TeamsDisplayMobile = () => (
    <Box 
      display="flex" 
      justifyContent="center"
      alignItems="center"
      mb={1}
      component="article"
      role="article"
      aria-label="Game Teams"
      sx={{ width: '100%' }}
    >
      {/* Away Team */}
      <Box display="flex" alignItems="center" mr={1}>
        <Avatar
          src={getTeamLogo(game.sport_key, game.away_team)}
          alt={`${game.away_team} logo`}
          sx={{ 
            width: 24, 
            height: 24,
            mr: 0.5,
            bgcolor: 'background.paper'
          }}
        />
        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1rem',
            lineHeight: 1.2
          }}
        >
          {getTeamDisplay(game.away_team, true)}
        </Typography>
      </Box>
      
      {/* VS */}
      <Typography 
        variant="body2" 
        sx={{ mx: 0.5, fontWeight: 'bold' }}
      >
        @
      </Typography>
      
      {/* Home Team */}
      <Box display="flex" alignItems="center" ml={1}>
        <Avatar
          src={getTeamLogo(game.sport_key, game.home_team)}
          alt={`${game.home_team} logo`}
          sx={{ 
            width: 24, 
            height: 24,
            mr: 0.5,
            bgcolor: 'background.paper'
          }}
        />
        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1rem',
            lineHeight: 1.2
          }}
        >
          {getTeamDisplay(game.home_team, true)}
        </Typography>
      </Box>
    </Box>
  );

  // Original team display for desktop
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
        sx={{ 
          width: 32, 
          height: 32,
          mr: 1,
          bgcolor: 'background.paper'
        }}
      />
      <Box>
        <Typography 
          variant="h6" 
          component="h3"
          sx={{ 
            fontWeight: 'bold',
            fontSize: '1.25rem',
            lineHeight: 1.2
          }}
        >
          {getTeamDisplay(team, false)}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.875rem',
            lineHeight: 1
          }}
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

  // Toggle expanded state for mobile view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: isMobile ? 1 : 2,
        mb: 2,
        width: '100%',
        overflow: 'hidden', // Prevent horizontal scroll
        position: 'relative', // For positioning the favorite icon
        transition: 'all 0.3s ease'
      }}
      component="article"
      role="article"
      aria-label={`${game.away_team} vs ${game.home_team} Game Card`}
    >
      {/* Favorite Icon */}
      {currentUser && (
        <Tooltip title={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}>
          <IconButton 
            onClick={() => toggleFavorite(game)}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              color: isFavorite(game.id) ? '#ff1744' : 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                color: isFavorite(game.id) ? '#ff4081' : '#ff1744',
              },
              padding: '4px',
            }}
            aria-label={isFavorite(game.id) ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite(game.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      )}
      {/* Mobile View */}
      {isMobile && (
        <>
          {/* Centered Teams Display */}
          <TeamsDisplayMobile />
          
          {/* Game Time */}
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: 'block',
              textAlign: 'center',
              mb: 1,
              fontSize: '0.7rem'
            }}
            role="time"
            aria-label="Game start time"
          >
            {format(new Date(game.commence_time), 'EEE, MMM d • h:mm a')}
          </Typography>
          
          {/* Premium EV Badge for Mobile */}
          {hasEvData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              <PremiumEVBadge bestBet={game.bestBet} maxEv={game.maxEv} />
            </Box>
          )}

          {/* Best Odds Display - Always visible */}
          <Grid container spacing={2}>
            {/* Moneyline */}
            <Grid item xs={4}>
              <MoneylineSection 
                title="Moneyline"
                awayOdds={odds.awayMoneyline}
                homeOdds={odds.homeMoneyline}
              />
            </Grid>

            {/* Spread */}
            <Grid item xs={4}>
              <SpreadSection 
                title="Spread"
                awayOdds={odds.awaySpread}
                homeOdds={odds.homeSpread}
              />
            </Grid>

            {/* Totals */}
            <Grid item xs={4}>
              <TotalsSection 
                title="Over/Under"
                overOdds={odds.overTotal}
                underOdds={odds.underTotal}
              />
            </Grid>
          </Grid>

          {/* View All Available Odds Button */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 2,
              borderTop: 1,
              borderColor: 'divider',
              pt: 1
            }}
          >
            <Button 
              onClick={toggleExpanded}
              endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              size="small"
              sx={{ 
                textTransform: 'none',
                color: 'primary.main',
                fontSize: '0.8rem'
              }}
            >
              {expanded ? 'Hide All Available Odds' : 'View All Available Odds'}
            </Button>
          </Box>

          {/* Expanded Details - Only for All Available Odds */}
          <Collapse in={expanded}>
            <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <DetailedOddsView 
                game={game} 
                selectedBookmakers={selectedBookmakers}
                showHeader={false}
                condensed={true}
                hideAccordion={true}
              />
            </Box>
          </Collapse>
        </>
      )}

      {/* Desktop View */}
      {!isMobile && (
        <Grid container spacing={2}>
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
                  fontSize: '0.75rem'
                }}
                role="time"
                aria-label="Game start time"
              >
                {format(new Date(game.commence_time), 'EEE, MMM d • h:mm a')}
              </Typography>
              
              {/* Premium EV Badge for Desktop */}
              {hasEvData && (
                <Box sx={{ mt: 1 }}>
                  <PremiumEVBadge bestBet={game.bestBet} maxEv={game.maxEv} />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Odds Columns */}
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
      )}

      {/* Desktop view - detailed odds are shown in the accordion component */}
      {!isMobile && (
        <DetailedOddsView 
          game={filteredGame} 
          hideAccordion={false} 
        />
      )}
    </Paper>
  );
};

export default React.memo(GameCard);
