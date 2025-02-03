// Map of team names to their logo file paths
const NBA_LOGOS = {
  'Atlanta Hawks': '/NBA Logos/Atlanta Hawks.png',
  'Boston Celtics': '/NBA Logos/Boston Celtics.png',
  'Brooklyn Nets': '/NBA Logos/Brooklyn Nets.png',
  'Charlotte Hornets': '/NBA Logos/Charlotte Hornets.png',
  'Chicago Bulls': '/NBA Logos/Chicago Bulls.png',
  'Cleveland Cavaliers': '/NBA Logos/Cleveland Cavaliers.png',
  'Dallas Mavericks': '/NBA Logos/Dallas Mavericks.png',
  'Denver Nuggets': '/NBA Logos/Denver Nuggets.png',
  'Detroit Pistons': '/NBA Logos/Detroit Pistons.png',
  'Golden State Warriors': '/NBA Logos/Golden State Warriors.png',
  'Houston Rockets': '/NBA Logos/Houston Rockets.png',
  'Indiana Pacers': '/NBA Logos/Indiana Pacers.png',
  'LA Clippers': '/NBA Logos/LA Clippers.png',
  'Los Angeles Lakers': '/NBA Logos/Los Angeles Lakers.png',
  'Memphis Grizzlies': '/NBA Logos/Memphis Grizzlies.png',
  'Miami Heat': '/NBA Logos/Miami Heat.png',
  'Milwaukee Bucks': '/NBA Logos/Milwaukee Bucks.png',
  'Minnesota Timberwolves': '/NBA Logos/Minnesota Timberwolves.png',
  'New Orleans Pelicans': '/NBA Logos/New Orleans Pelicans.png',
  'New York Knicks': '/NBA Logos/New York Knicks.png',
  'Oklahoma City Thunder': '/NBA Logos/Oklahoma City Thunder.png',
  'Orlando Magic': '/NBA Logos/Orlando Magic.png',
  'Philadelphia 76ers': '/NBA Logos/Philadelphia 76ers.png',
  'Phoenix Suns': '/NBA Logos/Phoenix Suns.png',
  'Portland Trail Blazers': '/NBA Logos/Portland Trail Blazers.png',
  'Sacramento Kings': '/NBA Logos/Sacramento Kings.png',
  'San Antonio Spurs': '/NBA Logos/San Antonio Spurs.png',
  'Toronto Raptors': '/NBA Logos/Toronto Raptors.png',
  'Utah Jazz': '/NBA Logos/Utah Jazz.png',
  'Washington Wizards': '/NBA Logos/Washington Wizards.png'
};

const NFL_LOGOS = {
  'Arizona Cardinals': '/NFL Logos/Arizona Cardinals.png',
  'Atlanta Falcons': '/NFL Logos/Atlanta Falcons.png',
  'Baltimore Ravens': '/NFL Logos/Baltimore Ravens.png',
  'Buffalo Bills': '/NFL Logos/Buffalo Bills.png',
  'Carolina Panthers': '/NFL Logos/Carolina Panthers.png',
  'Chicago Bears': '/NFL Logos/Chicago Bears.png',
  'Cincinnati Bengals': '/NFL Logos/Cincinnati Bengals.png',
  'Cleveland Browns': '/NFL Logos/Cleveland Browns.png',
  'Dallas Cowboys': '/NFL Logos/Dallas Cowboys.png',
  'Denver Broncos': '/NFL Logos/Denver Broncos.png',
  'Detroit Lions': '/NFL Logos/Detroit Lions.png',
  'Green Bay Packers': '/NFL Logos/Green Bay Packers.png',
  'Houston Texans': '/NFL Logos/Houston Texans.png',
  'Indianapolis Colts': '/NFL Logos/Indianapolis Colts.png',
  'Jacksonville Jaguars': '/NFL Logos/Jacksonville Jaguars.png',
  'Kansas City Chiefs': '/NFL Logos/Kansas City Chiefs.png',
  'Las Vegas Raiders': '/NFL Logos/Las Vegas Raiders.png',
  'Los Angeles Chargers': '/NFL Logos/Los Angeles Chargers.png',
  'Los Angeles Rams': '/NFL Logos/Los Angeles Rams.png',
  'Miami Dolphins': '/NFL Logos/Miami Dolphins.png',
  'Minnesota Vikings': '/NFL Logos/Minnesota Vikings.png',
  'New England Patriots': '/NFL Logos/New England Patriots.png',
  'New Orleans Saints': '/NFL Logos/New Orleans Saints.png',
  'New York Giants': '/NFL Logos/New York Giants.png',
  'New York Jets': '/NFL Logos/New York Jets.png',
  'Philadelphia Eagles': '/NFL Logos/Philadelphia Eagles.png',
  'Pittsburgh Steelers': '/NFL Logos/Pittsburgh Steelers.png',
  'San Francisco 49ers': '/NFL Logos/San Francisco 49ers.png',
  'Seattle Seahawks': '/NFL Logos/Seattle Seahawks.png',
  'Tampa Bay Buccaneers': '/NFL Logos/Tampa Bay Buccaneers.png',
  'Tennessee Titans': '/NFL Logos/Tennessee Titans.png',
  'Washington Commanders': '/NFL Logos/Washington Commanders.png'
};

const NHL_LOGOS = {
  'Anaheim Ducks': '/NHL Logos/Anaheim Ducks.png',
  'Arizona Coyotes': '/NHL Logos/Arizona Coyotes.png',
  'Boston Bruins': '/NHL Logos/Boston Bruins.png',
  'Buffalo Sabres': '/NHL Logos/Buffalo Sabres.png',
  'Calgary Flames': '/NHL Logos/Calgary Flames.png',
  'Carolina Hurricanes': '/NHL Logos/Carolina Hurricanes.png',
  'Chicago Blackhawks': '/NHL Logos/Chicago Blackhawks.png',
  'Colorado Avalanche': '/NHL Logos/Colorado Avalanche.png',
  'Columbus Blue Jackets': '/NHL Logos/Columbus Blue Jackets.png',
  'Dallas Stars': '/NHL Logos/Dallas Stars.png',
  'Detroit Red Wings': '/NHL Logos/Detroit Red Wings.png',
  'Edmonton Oilers': '/NHL Logos/Edmonton Oilers.png',
  'Florida Panthers': '/NHL Logos/Florida Panthers.png',
  'Los Angeles Kings': '/NHL Logos/Los Angeles Kings.png',
  'Minnesota Wild': '/NHL Logos/Minnesota Wild.png',
  'Montreal Canadiens': '/NHL Logos/Montreal Canadiens.png',
  'Nashville Predators': '/NHL Logos/Nashville Predators.png',
  'New Jersey Devils': '/NHL Logos/New Jersey Devils.png',
  'New York Islanders': '/NHL Logos/New York Islanders.png',
  'New York Rangers': '/NHL Logos/New York Rangers.png',
  'Ottawa Senators': '/NHL Logos/Ottawa Senators.png',
  'Philadelphia Flyers': '/NHL Logos/Philadelphia Flyers.png',
  'Pittsburgh Penguins': '/NHL Logos/Pittsburgh Penguins.png',
  'San Jose Sharks': '/NHL Logos/San Jose Sharks.png',
  'Seattle Kraken': '/NHL Logos/Seattle Kraken.png',
  'St Louis Blues': '/NHL Logos/St Louis Blues.png',
  'Tampa Bay Lightning': '/NHL Logos/Tampa Bay Lightning.png',
  'Toronto Maple Leafs': '/NHL Logos/Toronto Maple Leafs.png',
  'Utah Hockey Club': '/NHL Logos/Utah Hockey Club.png',
  'Vancouver Canucks': '/NHL Logos/Vancouver Canucks.png',
  'Vegas Golden Knights': '/NHL Logos/Las Vegas Golden Knights.png',
  'Washington Capitals': '/NHL Logos/Washington Capitals.png',
  'Winnipeg Jets': '/NHL Logos/Winnipeg Jets.png'
};

// Default logos for each sport
const DEFAULT_LOGOS = {
  'basketball_nba': '/NBA Logos/NBA.png',
  'americanfootball_nfl': '/NFL Logos/NFL.png',
  'icehockey_nhl': '/NHL Logos/NHL.png'
};

export const getTeamLogo = (sportKey, teamName) => {
  switch (sportKey) {
    case 'basketball_nba':
      return NBA_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    case 'americanfootball_nfl':
      return NFL_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    case 'icehockey_nhl':
      return NHL_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    default:
      return '';
  }
};

export const getDefaultLogo = (sportKey) => {
  return DEFAULT_LOGOS[sportKey] || '';
};

// Function to handle API team name variations
export const normalizeTeamName = (sportKey, teamName) => {
  // Add any specific team name normalizations here if needed
  const normalizations = {
    'basketball_nba': {
      'LA Clippers': 'LA Clippers',
      'Los Angeles Clippers': 'LA Clippers'
    },
    'americanfootball_nfl': {
      // Add NFL specific normalizations if needed
    },
    'icehockey_nhl': {
      'Vegas Golden Knights': 'Vegas Golden Knights',
      'Las Vegas Golden Knights': 'Vegas Golden Knights'
    }
  };

  return normalizations[sportKey]?.[teamName] || teamName;
};
