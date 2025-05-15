// Map of team names to their logo file paths
// Using process.env.PUBLIC_URL to ensure correct path regardless of port
const NBA_LOGOS = {
  'Atlanta Hawks': `${process.env.PUBLIC_URL}/NBA Logos/Atlanta Hawks.png`,
  'Boston Celtics': `${process.env.PUBLIC_URL}/NBA Logos/Boston Celtics.png`,
  'Brooklyn Nets': `${process.env.PUBLIC_URL}/NBA Logos/Brooklyn Nets.png`,
  'Charlotte Hornets': `${process.env.PUBLIC_URL}/NBA Logos/Charlotte Hornets.png`,
  'Chicago Bulls': `${process.env.PUBLIC_URL}/NBA Logos/Chicago Bulls.png`,
  'Cleveland Cavaliers': `${process.env.PUBLIC_URL}/NBA Logos/Cleveland Cavaliers.png`,
  'Dallas Mavericks': `${process.env.PUBLIC_URL}/NBA Logos/Dallas Mavericks.png`,
  'Denver Nuggets': `${process.env.PUBLIC_URL}/NBA Logos/Denver Nuggets.png`,
  'Detroit Pistons': `${process.env.PUBLIC_URL}/NBA Logos/Detroit Pistons.png`,
  'Golden State Warriors': `${process.env.PUBLIC_URL}/NBA Logos/Golden State Warriors.png`,
  'Houston Rockets': `${process.env.PUBLIC_URL}/NBA Logos/Houston Rockets.png`,
  'Indiana Pacers': `${process.env.PUBLIC_URL}/NBA Logos/Indiana Pacers.png`,
  'Los Angeles Clippers': `${process.env.PUBLIC_URL}/NBA Logos/Los Angeles Clippers.png`,
  'Los Angeles Lakers': `${process.env.PUBLIC_URL}/NBA Logos/Los Angeles Lakers.png`,
  'Memphis Grizzlies': `${process.env.PUBLIC_URL}/NBA Logos/Memphis Grizzlies.png`,
  'Miami Heat': `${process.env.PUBLIC_URL}/NBA Logos/Miami Heat.png`,
  'Milwaukee Bucks': `${process.env.PUBLIC_URL}/NBA Logos/Milwaukee Bucks.png`,
  'Minnesota Timberwolves': `${process.env.PUBLIC_URL}/NBA Logos/Minnesota Timberwolves.png`,
  'New Orleans Pelicans': `${process.env.PUBLIC_URL}/NBA Logos/New Orleans Pelicans.png`,
  'New York Knicks': `${process.env.PUBLIC_URL}/NBA Logos/New York Knicks.png`,
  'Oklahoma City Thunder': `${process.env.PUBLIC_URL}/NBA Logos/Oklahoma City Thunder.png`,
  'Orlando Magic': `${process.env.PUBLIC_URL}/NBA Logos/Orlando Magic.png`,
  'Philadelphia 76ers': `${process.env.PUBLIC_URL}/NBA Logos/Philadelphia 76ers.png`,
  'Phoenix Suns': `${process.env.PUBLIC_URL}/NBA Logos/Phoenix Suns.png`,
  'Portland Trail Blazers': `${process.env.PUBLIC_URL}/NBA Logos/Portland Trail Blazers.png`,
  'Sacramento Kings': `${process.env.PUBLIC_URL}/NBA Logos/Sacramento Kings.png`,
  'San Antonio Spurs': `${process.env.PUBLIC_URL}/NBA Logos/San Antonio Spurs.png`,
  'Toronto Raptors': `${process.env.PUBLIC_URL}/NBA Logos/Toronto Raptors.png`,
  'Utah Jazz': `${process.env.PUBLIC_URL}/NBA Logos/Utah Jazz.png`,
  'Washington Wizards': `${process.env.PUBLIC_URL}/NBA Logos/Washington Wizards.png`
};

const NFL_LOGOS = {
  'Arizona Cardinals': `${process.env.PUBLIC_URL}/NFL Logos/Arizona Cardinals.png`,
  'Atlanta Falcons': `${process.env.PUBLIC_URL}/NFL Logos/Atlanta Falcons.png`,
  'Baltimore Ravens': `${process.env.PUBLIC_URL}/NFL Logos/Baltimore Ravens.png`,
  'Buffalo Bills': `${process.env.PUBLIC_URL}/NFL Logos/Buffalo Bills.png`,
  'Carolina Panthers': `${process.env.PUBLIC_URL}/NFL Logos/Carolina Panthers.png`,
  'Chicago Bears': `${process.env.PUBLIC_URL}/NFL Logos/Chicago Bears.png`,
  'Cincinnati Bengals': `${process.env.PUBLIC_URL}/NFL Logos/Cincinnati Bengals.png`,
  'Cleveland Browns': `${process.env.PUBLIC_URL}/NFL Logos/Cleveland Browns.png`,
  'Dallas Cowboys': `${process.env.PUBLIC_URL}/NFL Logos/Dallas Cowboys.png`,
  'Denver Broncos': `${process.env.PUBLIC_URL}/NFL Logos/Denver Broncos.png`,
  'Detroit Lions': `${process.env.PUBLIC_URL}/NFL Logos/Detroit Lions.png`,
  'Green Bay Packers': `${process.env.PUBLIC_URL}/NFL Logos/Green Bay Packers.png`,
  'Houston Texans': `${process.env.PUBLIC_URL}/NFL Logos/Houston Texans.png`,
  'Indianapolis Colts': `${process.env.PUBLIC_URL}/NFL Logos/Indianapolis Colts.png`,
  'Jacksonville Jaguars': `${process.env.PUBLIC_URL}/NFL Logos/Jacksonville Jaguars.png`,
  'Kansas City Chiefs': `${process.env.PUBLIC_URL}/NFL Logos/Kansas City Chiefs.png`,
  'Las Vegas Raiders': `${process.env.PUBLIC_URL}/NFL Logos/Las Vegas Raiders.png`,
  'Los Angeles Chargers': `${process.env.PUBLIC_URL}/NFL Logos/Los Angeles Chargers.png`,
  'Los Angeles Rams': `${process.env.PUBLIC_URL}/NFL Logos/Los Angeles Rams.png`,
  'Miami Dolphins': `${process.env.PUBLIC_URL}/NFL Logos/Miami Dolphins.png`,
  'Minnesota Vikings': `${process.env.PUBLIC_URL}/NFL Logos/Minnesota Vikings.png`,
  'New England Patriots': `${process.env.PUBLIC_URL}/NFL Logos/New England Patriots.png`,
  'New Orleans Saints': `${process.env.PUBLIC_URL}/NFL Logos/New Orleans Saints.png`,
  'New York Giants': `${process.env.PUBLIC_URL}/NFL Logos/New York Giants.png`,
  'New York Jets': `${process.env.PUBLIC_URL}/NFL Logos/New York Jets.png`,
  'Philadelphia Eagles': `${process.env.PUBLIC_URL}/NFL Logos/Philadelphia Eagles.png`,
  'Pittsburgh Steelers': `${process.env.PUBLIC_URL}/NFL Logos/Pittsburgh Steelers.png`,
  'San Francisco 49ers': `${process.env.PUBLIC_URL}/NFL Logos/San Francisco 49ers.png`,
  'Seattle Seahawks': `${process.env.PUBLIC_URL}/NFL Logos/Seattle Seahawks.png`,
  'Tampa Bay Buccaneers': `${process.env.PUBLIC_URL}/NFL Logos/Tampa Bay Buccaneers.png`,
  'Tennessee Titans': `${process.env.PUBLIC_URL}/NFL Logos/Tennessee Titans.png`,
  'Washington Commanders': `${process.env.PUBLIC_URL}/NFL Logos/Washington Commanders.png`
};

const NHL_LOGOS = {
  'Anaheim Ducks': `${process.env.PUBLIC_URL}/NHL Logos/Anaheim Ducks.png`,
  'Arizona Coyotes': `${process.env.PUBLIC_URL}/NHL Logos/Arizona Coyotes.png`,
  'Boston Bruins': `${process.env.PUBLIC_URL}/NHL Logos/Boston Bruins.png`,
  'Buffalo Sabres': `${process.env.PUBLIC_URL}/NHL Logos/Buffalo Sabres.png`,
  'Calgary Flames': `${process.env.PUBLIC_URL}/NHL Logos/Calgary Flames.png`,
  'Carolina Hurricanes': `${process.env.PUBLIC_URL}/NHL Logos/Carolina Hurricanes.png`,
  'Chicago Blackhawks': `${process.env.PUBLIC_URL}/NHL Logos/Chicago Blackhawks.png`,
  'Colorado Avalanche': `${process.env.PUBLIC_URL}/NHL Logos/Colorado Avalanche.png`,
  'Columbus Blue Jackets': `${process.env.PUBLIC_URL}/NHL Logos/Columbus Blue Jackets.png`,
  'Dallas Stars': `${process.env.PUBLIC_URL}/NHL Logos/Dallas Stars.png`,
  'Detroit Red Wings': `${process.env.PUBLIC_URL}/NHL Logos/Detroit Red Wings.png`,
  'Edmonton Oilers': `${process.env.PUBLIC_URL}/NHL Logos/Edmonton Oilers.png`,
  'Florida Panthers': `${process.env.PUBLIC_URL}/NHL Logos/Florida Panthers.png`,
  'Los Angeles Kings': `${process.env.PUBLIC_URL}/NHL Logos/Los Angeles Kings.png`,
  'Minnesota Wild': `${process.env.PUBLIC_URL}/NHL Logos/Minnesota Wild.png`,
  'Montréal Canadiens': `${process.env.PUBLIC_URL}/NHL Logos/Montreal Canadiens.png`,
  'Nashville Predators': `${process.env.PUBLIC_URL}/NHL Logos/Nashville Predators.png`,
  'New Jersey Devils': `${process.env.PUBLIC_URL}/NHL Logos/New Jersey Devils.png`,
  'New York Islanders': `${process.env.PUBLIC_URL}/NHL Logos/New York Islanders.png`,
  'New York Rangers': `${process.env.PUBLIC_URL}/NHL Logos/New York Rangers.png`,
  'Ottawa Senators': `${process.env.PUBLIC_URL}/NHL Logos/Ottawa Senators.png`,
  'Philadelphia Flyers': `${process.env.PUBLIC_URL}/NHL Logos/Philadelphia Flyers.png`,
  'Pittsburgh Penguins': `${process.env.PUBLIC_URL}/NHL Logos/Pittsburgh Penguins.png`,
  'San Jose Sharks': `${process.env.PUBLIC_URL}/NHL Logos/San Jose Sharks.png`,
  'Seattle Kraken': `${process.env.PUBLIC_URL}/NHL Logos/Seattle Kraken.png`,
  'St Louis Blues': `${process.env.PUBLIC_URL}/NHL Logos/St Louis Blues.png`,
  'Tampa Bay Lightning': `${process.env.PUBLIC_URL}/NHL Logos/Tampa Bay Lightning.png`,
  'Toronto Maple Leafs': `${process.env.PUBLIC_URL}/NHL Logos/Toronto Maple Leafs.png`,
  'Utah Hockey Club': `${process.env.PUBLIC_URL}/NHL Logos/Utah Hockey Club.png`,
  'Vancouver Canucks': `${process.env.PUBLIC_URL}/NHL Logos/Vancouver Canucks.png`,
  'Vegas Golden Knights': `${process.env.PUBLIC_URL}/NHL Logos/Las Vegas Golden Knights.png`,
  'Washington Capitals': `${process.env.PUBLIC_URL}/NHL Logos/Washington Capitals.png`,
  'Winnipeg Jets': `${process.env.PUBLIC_URL}/NHL Logos/Winnipeg Jets.png`
};

// MLB team logos
const MLB_LOGOS = {
  'Arizona Diamondbacks': `${process.env.PUBLIC_URL}/MLB Logos/Arizona Diamondbacks.png`,
  'Atlanta Braves': `${process.env.PUBLIC_URL}/MLB Logos/Atlanta Braves.png`,
  'Baltimore Orioles': `${process.env.PUBLIC_URL}/MLB Logos/Baltimore Orioles.png`,
  'Boston Red Sox': `${process.env.PUBLIC_URL}/MLB Logos/Boston Red Sox.png`,
  'Chicago Cubs': `${process.env.PUBLIC_URL}/MLB Logos/Chicago Cubs.png`,
  'Chicago White Sox': `${process.env.PUBLIC_URL}/MLB Logos/Chicago White Sox.png`,
  'Cincinnati Reds': `${process.env.PUBLIC_URL}/MLB Logos/Cincinnati Reds.png`,
  'Cleveland Guardians': `${process.env.PUBLIC_URL}/MLB Logos/Cleveland Guardians.png`,
  'Colorado Rockies': `${process.env.PUBLIC_URL}/MLB Logos/Colorado Rockies.png`,
  'Detroit Tigers': `${process.env.PUBLIC_URL}/MLB Logos/Detroit Tigers.png`,
  'Houston Astros': `${process.env.PUBLIC_URL}/MLB Logos/Houston Astros.png`,
  'Kansas City Royals': `${process.env.PUBLIC_URL}/MLB Logos/Kansas City Royals.png`,
  'Los Angeles Angels': `${process.env.PUBLIC_URL}/MLB Logos/Los Angeles Angels.png`,
  'Los Angeles Dodgers': `${process.env.PUBLIC_URL}/MLB Logos/Los Angeles Dodgers.png`,
  'Miami Marlins': `${process.env.PUBLIC_URL}/MLB Logos/Miami Marlins.png`,
  'Milwaukee Brewers': `${process.env.PUBLIC_URL}/MLB Logos/Milwaukee Brewers.png`,
  'Minnesota Twins': `${process.env.PUBLIC_URL}/MLB Logos/Minnesota Twins.png`,
  'New York Mets': `${process.env.PUBLIC_URL}/MLB Logos/New York Mets.png`,
  'New York Yankees': `${process.env.PUBLIC_URL}/MLB Logos/New York Yankees.png`,
  'Oakland Athletics': `${process.env.PUBLIC_URL}/MLB Logos/Oakland Athletics.png`,
  'Philadelphia Phillies': `${process.env.PUBLIC_URL}/MLB Logos/Philadelphia Phillies.png`,
  'Pittsburgh Pirates': `${process.env.PUBLIC_URL}/MLB Logos/Pittsburgh Pirates.png`,
  'San Diego Padres': `${process.env.PUBLIC_URL}/MLB Logos/San Diego Padres.png`,
  'San Francisco Giants': `${process.env.PUBLIC_URL}/MLB Logos/San Francisco Giants.png`,
  'Seattle Mariners': `${process.env.PUBLIC_URL}/MLB Logos/Seattle Mariners.png`,
  'St. Louis Cardinals': `${process.env.PUBLIC_URL}/MLB Logos/St. Louis Cardinals.png`,
  'Tampa Bay Rays': `${process.env.PUBLIC_URL}/MLB Logos/Tampa Bay Rays.png`,
  'Texas Rangers': `${process.env.PUBLIC_URL}/MLB Logos/Texas Rangers.png`,
  'Toronto Blue Jays': `${process.env.PUBLIC_URL}/MLB Logos/Toronto Blue Jays.png`,
  'Washington Nationals': `${process.env.PUBLIC_URL}/MLB Logos/Washington Nationals.png`
};

// Default logos for each sport
const DEFAULT_LOGOS = {
  'basketball_nba': `${process.env.PUBLIC_URL}/NBA Logos/NBA.png`,
  'americanfootball_nfl': `${process.env.PUBLIC_URL}/NFL Logos/NFL.png`,
  'icehockey_nhl': `${process.env.PUBLIC_URL}/NHL Logos/NHL.png`,
  'baseball_mlb': `${process.env.PUBLIC_URL}/MLB Logos/MLB.png`
};

export const getTeamLogo = (sportKey, teamName) => {
  switch (sportKey) {
    case 'basketball_nba':
      return NBA_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    case 'americanfootball_nfl':
      return NFL_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    case 'icehockey_nhl':
      return NHL_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
    case 'baseball_mlb':
      return MLB_LOGOS[teamName] || DEFAULT_LOGOS[sportKey];
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
    },
    'baseball_mlb': {
      'LA Angels': 'Los Angeles Angels',
      'LA Dodgers': 'Los Angeles Dodgers'
    }
  };

  return normalizations[sportKey]?.[teamName] || teamName;
};
