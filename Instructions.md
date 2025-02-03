# Beat the Books v2

## Project Overview
A sports betting odds comparison app that helps users find the best available odds across multiple sportsbooks. The app should focus on clarity, ease of use, and quick access to the most favorable betting opportunities.

## Core Features & Requirements

### 1. Best Odds Display
- Each game tile MUST show:
  - Best Moneyline (straight win/loss bet)
  - Best Point Spread (margin of victory bet)
  - Best Over/Under (total points bet)
  - Sportsbook name for each best odds
- Format odds consistently:
  - Positive odds: Include '+' prefix (e.g., "+150")
  - Negative odds: Include '-' prefix (e.g., "-110")
  - Points: Use same sign convention (e.g., "+5.5", "-7.5")

### 2. Game Information
- Display team logos and names clearly
- Show game start time in user's local timezone
- Layout structure:
  - Team info (33% width)
  - Odds display (67% width)

### 3. Detailed Odds View
- Expandable section showing all available odds
- Group by bet type (Moneyline, Spread, O/U)
- Sort odds from best to worst
- Show sportsbook attribution

## Technical Specifications

### Data Structure
```typescript
interface Event {
  id: string;                // Unique identifier
  sport_key: string;         // Sport identifier
  home_team: string;         // Home team name
  away_team: string;         // Away team name
  commence_time: string;     // ISO timestamp
  bookmakers: Bookmaker[];   // Array of bookmaker odds
}

interface Bookmaker {
  key: string;              // Bookmaker identifier
  title: string;            // Display name
  markets: Market[];        // Available betting markets
}

interface Market {
  key: 'h2h' | 'spreads' | 'totals';  // Market type
  outcomes: Outcome[];                 // Available bets
}

interface Outcome {
  name: string;             // Team name or Over/Under
  price: number;            // Odds value
  point?: number;           // Required for spreads/totals
}
```

### Project Structure
```
/src
  /app                 # Next.js app directory
    /page.tsx          # Main page component
    /layout.tsx        # Root layout
    /globals.css       # Global styles
  /components
    /game-tile.tsx     # Individual game display
    /odds-display.tsx  # Odds formatting/display
  /types              # TypeScript definitions
  /utils              # Helper functions
/public
  /logos              # Team logo images (format: {team-name-lowercase}.png)
/data
  /test-odds.json     # Sample data
```

### Required Components

1. GameTile (`/components/game-tile.tsx`)
   - Team display with logos
   - Best odds display
   - Expandable detailed view
   - Error handling

2. OddsDisplay (`/components/odds-display.tsx`)
   - Consistent odds formatting
   - Sportsbook attribution
   - Proper header alignment

3. SportsbookAccordion (`/components/sportsbook-accordion.tsx`)
   - Grouped odds by market type
   - All available sportsbook odds
   - Sorted display

### Implementation Guidelines

1. Error Handling
   - Show loading states
   - Handle missing data/logos gracefully
   - Validate data before display
   - Cache processed odds

2. Performance
   - Memoize odds calculations
   - Optimize re-renders
   - Lazy load expanded views

3. Accessibility
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation

### API Integration
```javascript
Base URL: 'https://api.the-odds-api.com/v4/sports'
Params: {
  apiKey: ODDS_API_KEY,
  sports: 'americanfootball_nfl,basketball_nba,icehockey_nhl',
  regions: 'us,eu',
  markets: 'h2h,spreads,totals',
  oddsFormat: 'american'
}
```

## Development Insights

### Critical Layout Considerations
1. Header Alignment
   - Headers (Moneyline, Spread, O/U) must align perfectly with their values
   - Use exact width percentages (33.33%) instead of approximate (1/3)
   - Consider padding/margins when calculating alignments
   - Test alignment with different odds lengths (+100 vs +1000)

2. Odds Display Hierarchy
   - Best odds should be immediately visible in the main tile
   - Each odds value must clearly show its source sportsbook
   - Consider color coding for positive/negative values
   - Ensure consistent spacing between odds and sportsbook names

### Data Processing Tips
1. Best Odds Calculation
   ```typescript
   // Example best odds calculation
   const findBestOdds = () => {
     const bestOdds = {
       moneyline: { odds: -Infinity, sportsbook: '' },
       spread: { point: 0, odds: -Infinity, sportsbook: '' },
       overUnder: { point: 0, odds: -Infinity, sportsbook: '' }
     };
     
     bookmakers.forEach(bookmaker => {
       // Process each market type separately
       // Keep track of both odds and points where applicable
     });
     return bestOdds;
   };
   ```

2. Data Validation
   ```typescript
   // Essential checks for odds data
   const validateOdds = (market: Market) => {
     if (!market?.outcomes?.length) return false;
     if (market.key === 'spreads' || market.key === 'totals') {
       return market.outcomes.every(o => 
         typeof o.point === 'number' && 
         typeof o.price === 'number'
       );
     }
     return market.outcomes.every(o => typeof o.price === 'number');
   };
   ```

### Common Pitfalls
1. Team Logo Handling
   - Always provide fallback for missing logos
   - Handle spaces in team names (replace with hyphens)
   - Consider caching logos for performance
   ```typescript
   const getTeamLogo = (teamName: string) => {
     const fallbackLogo = '/logos/default.png';
     const logoPath = `/logos/${teamName.toLowerCase().replace(/\s+/g, '-')}.png`;
     // Add error handling for missing logos
     return logoPath;
   };
   ```

2. Odds Formatting
   - Always handle both positive and negative odds
   - Consider edge cases like even odds (100)
   - Format points consistently with odds
   ```typescript
   const formatOdds = (odds: number) => {
     if (odds === 0) return 'EVEN';
     return odds > 0 ? `+${odds}` : odds.toString();
   };
   ```

### Component Organization
1. Odds Container
   ```typescript
   // Separate odds processing from display logic
   const OddsContainer: React.FC<Props> = ({ event }) => {
     // Process odds once at the container level
     const bestOdds = useMemo(() => findBestOdds(event), [event]);
     
     return (
       <>
         <BestOddsDisplay odds={bestOdds} />
         <DetailedOddsAccordion event={event} />
       </>
     );
   };
   ```

2. State Management
   ```typescript
   // Keep selected sportsbooks in parent component
   const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
   
   // Filter odds based on selection
   const filteredOdds = useMemo(() => 
     odds.filter(odd => selectedBooks.includes(odd.bookmaker)),
     [odds, selectedBooks]
   );
   ```

### Testing Scenarios
1. Edge Cases
   - Empty bookmaker list
   - Missing markets for some bookmakers
   - Extremely long odds values (+10000)
   - Very long team names
   - Missing point values in spreads

2. User Interactions
   - Expanding/collapsing accordion
   - Filtering sportsbooks
   - Responsive layout testing
   - Loading states

### Performance Optimizations
1. Memoization Strategy
   ```typescript
   // Memoize expensive calculations
   const bestOdds = useMemo(() => findBestOdds(event), [event]);
   const sortedBookmakers = useMemo(() => 
     sortBookmakersByOdds(event.bookmakers),
     [event.bookmakers]
   );
   ```

2. Lazy Loading
   ```typescript
   // Lazy load accordion content
   const SportsbookAccordion = lazy(() => 
     import('./sportsbook-accordion')
   );
   ```

## Getting Started
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```
