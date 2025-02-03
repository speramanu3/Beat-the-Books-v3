// Map of NBA team names to their logo paths
const NBA_TEAM_LOGOS = {
  'Atlanta Hawks': '/nba logos/Atlanta Hawks.png',
  'Boston Celtics': '/nba logos/Boston Celtics.png',
  'Brooklyn Nets': '/nba logos/Brooklyn Nets.png',
  'Charlotte Hornets': '/nba logos/Charlotte Hornets.png',
  'Chicago Bulls': '/nba logos/Chicago Bulls.png',
  'Cleveland Cavaliers': '/nba logos/Cleveland Cavaliers.png',
  'Dallas Mavericks': '/nba logos/Dallas Mavericks.png',
  'Denver Nuggets': '/nba logos/Denver Nuggets.png',
  'Detroit Pistons': '/nba logos/Detroit Pistons.png',
  'Golden State Warriors': '/nba logos/Golden State Warriors.png',
  'Houston Rockets': '/nba logos/Houston Rockets.png',
  'Indiana Pacers': '/nba logos/Indiana Pacers.png',
  'Los Angeles Clippers': '/nba logos/Los Angeles Clippers.png',
  'Los Angeles Lakers': '/nba logos/Los Angeles Lakers.png',
  'Memphis Grizzlies': '/nba logos/Memphis Grizzlies.png',
  'Miami Heat': '/nba logos/Miami Heat.png',
  'Milwaukee Bucks': '/nba logos/Milwaukee Bucks.png',
  'Minnesota Timberwolves': '/nba logos/Minnesota Timberwolves.png',
  'New Orleans Pelicans': '/nba logos/New Orleans Pelicans.png',
  'New York Knicks': '/nba logos/New York Knicks.png',
  'Oklahoma City Thunder': '/nba logos/Oklahoma City Thunder.png',
  'Orlando Magic': '/nba logos/Orlando Magic.png',
  'Philadelphia 76ers': '/nba logos/Philadelphia 76ers.png',
  'Phoenix Suns': '/nba logos/Phoenix Suns.png',
  'Portland Trail Blazers': '/nba logos/Portland Trail Blazers.png',
  'Sacramento Kings': '/nba logos/Sacramento Kings.png',
  'San Antonio Spurs': '/nba logos/San Antonio Spurs.png',
  'Toronto Raptors': '/nba logos/Toronto Raptors.png',
  'Utah Jazz': '/nba logos/Utah Jazz.png',
  'Washington Wizards': '/nba logos/Washington Wizards.png'
};

// Default logos for each sport
const DEFAULT_LOGOS = {
  'basketball_nba': '/nba logos/NBA.png',
  'americanfootball_nfl': '/nfl.png',
  'icehockey_nhl': '/nhl.png'
};

export const getTeamLogo = (sportKey, teamName) => {
  if (sportKey === 'basketball_nba') {
    return NBA_TEAM_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
  }
  return DEFAULT_LOGOS[sportKey];
};

export const getDefaultLogo = (sportKey) => {
  return DEFAULT_LOGOS[sportKey];
};
