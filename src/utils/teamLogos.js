// Default logos for major sports
const DEFAULT_LOGOS = {
  NFL: 'https://cdn.freebiesupply.com/logos/large/2x/nfl-logo-png-transparent.png',
  NBA: 'https://cdn.freebiesupply.com/images/large/2x/nba-logo-transparent.png',
  MLB: 'https://cdn.freebiesupply.com/logos/large/2x/mlb-1-logo-png-transparent.png',
  NHL: 'https://cdn.freebiesupply.com/logos/large/2x/nhl-logo-png-transparent.png'
};

// Function to get a placeholder logo if team logo is not found
const getDefaultLogo = (sportKey) => {
  const sport = sportKey.split('_')[0].toUpperCase();
  return DEFAULT_LOGOS[sport] || DEFAULT_LOGOS.NFL;
};

export { getDefaultLogo };
