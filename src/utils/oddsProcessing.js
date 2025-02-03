// Data validation
export const validateOdds = (market) => {
  if (!market?.outcomes?.length) return false;
  if (market.key === 'spreads' || market.key === 'totals') {
    return market.outcomes.every(o => 
      typeof o.point === 'number' && 
      typeof o.price === 'number'
    );
  }
  return market.outcomes.every(o => typeof o.price === 'number');
};

// Odds formatting with edge cases
export const formatOdds = (odds) => {
  if (!odds && odds !== 0) return 'N/A';
  if (odds === 0) return 'EVEN';
  return odds > 0 ? `+${odds}` : odds.toString();
};

// Cache for processed odds
const oddsCache = new Map();

export const getProcessedOdds = (game, market, team = null) => {
  const cacheKey = `${game.id}-${market}-${team}`;
  
  if (oddsCache.has(cacheKey)) {
    return oddsCache.get(cacheKey);
  }

  let bestOdds = { odds: null, bookmaker: null };
  
  game.bookmakers.forEach(bookmaker => {
    const marketData = bookmaker.markets.find(m => m.key === market);
    if (!marketData || !validateOdds(marketData)) return;

    marketData.outcomes.forEach(outcome => {
      if (team && outcome.name !== team) return;
      
      if (bestOdds.odds === null || 
          (outcome.price > 0 && (bestOdds.odds < 0 || outcome.price > bestOdds.odds)) ||
          (outcome.price < 0 && (bestOdds.odds > 0 || outcome.price > bestOdds.odds))) {
        bestOdds = {
          odds: outcome.price,
          bookmaker: bookmaker.title,
          points: outcome.point
        };
      }
    });
  });

  oddsCache.set(cacheKey, bestOdds);
  return bestOdds;
};
