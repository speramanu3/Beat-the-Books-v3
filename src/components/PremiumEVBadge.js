import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useSubscription } from '../contexts/SubscriptionContext';
import PremiumFeature from './PremiumFeature';

/**
 * A component that displays EV (Expected Value) information for premium users
 */
const PremiumEVBadge = ({ bestBet, maxEv }) => {
  const { hasPremium } = useSubscription();

  if (!bestBet || maxEv <= 0) {
    return null;
  }

  // Determine color based on EV percentage
  const getColor = (ev) => {
    if (ev >= 7) return 'success';
    if (ev >= 4) return 'primary';
    if (ev >= 2) return 'warning';
    return 'default';
  };

  const evColor = getColor(maxEv);

  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      <Tooltip
        title={
          <Box>
            <Typography variant="body2">
              Best Value Bet: {bestBet.team} @ {bestBet.bookmaker}
            </Typography>
            <Typography variant="body2">
              Odds: {bestBet.odds > 0 ? '+' : ''}{bestBet.odds}
            </Typography>
            <Typography variant="body2">
              Expected Value: {bestBet.ev}%
            </Typography>
          </Box>
        }
        arrow
      >
        <Chip
          icon={<TrendingUpIcon />}
          label={`EV: ${bestBet.ev}%`}
          color={evColor}
          size="small"
          sx={{
            fontWeight: 'bold',
            '& .MuiChip-icon': {
              color: 'inherit'
            }
          }}
        />
      </Tooltip>
    </Box>
  );

  // If user has premium, show the content directly
  if (hasPremium()) {
    return content;
  }

  // Otherwise, wrap in PremiumFeature
  return (
    <PremiumFeature
      title="Value Betting Insights"
      description="Unlock expected value (EV) calculations to find the best betting opportunities."
      inline={true}
    >
      {content}
    </PremiumFeature>
  );
};

export default PremiumEVBadge;
