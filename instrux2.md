# Beat the Books v3

## Project Overview
A sports betting odds comparison app that helps users find the best available odds across multiple sportsbooks. The app should focus on clarity, ease of use, and quick access to the most favorable betting opportunities.

## Core Features & Requirements

### 1. Best Odds Display
- Display in a dark modern theme using Material UI
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
api docs: 'https://the-odds-api.com/liveapi/guides/v4/'
Base URL: 'https://api.the-odds-api.com/v4/sports'
Params: {
  apiKey: ODDS_API_KEY,
  sports: 'americanfootball_nfl,basketball_nba,icehockey_nhl',
  regions: 'us,eu',
  markets: 'h2h,spreads,totals',
  oddsFormat: 'american'
}
```

## UI Specifications

### Web Layout (Desktop/Laptop)

#### Header Section
- Title "Beat the Odds"
  - Font: Orbitron
  - Color: Neon Green (#39FF14)
  - Text-shadow: 0 0 10px rgba(57, 255, 20, 0.7)
  - Size: 2.5rem
  - Centered alignment

#### Navigation Tabs
- Height: 48px
- Background: Paper background (theme.palette.background.paper)
- Tabs centered horizontally
- Active tab indicator: Primary color
- Sports icons: 24x24px
- Padding: 12px horizontal

#### Game Cards
- Width: 100% of container
- Max-width: 1200px
- Margin: 16px auto
- Padding: 24px
- Border radius: 8px
- Box shadow: theme.shadows[1]
- Grid layout:
  - Team section: 40%
  - Odds section: 60%

##### Team Information
- Logo size: 64x64px
- Team name: 1.125rem
- Spacing between teams: 16px
- VS indicator: centered

##### Odds Display
- Grid layout: 3 columns
- Bookmaker name: 0.875rem
- Odds value: 1rem bold
- Positive odds: Green (#4CAF50)
- Negative odds: Red (#f44336)

#### Filters Section
- Width: 100%
- Max-width: 1200px
- Margin: 16px auto
- Bookmaker chips:
  - Height: 32px
  - Margin: 4px
  - Border radius: 16px

#### Status Bar
- Height: 24px
- Font size: 0.75rem
- Color: theme.palette.text.secondary
- Update time: Right aligned
- Next update: Left aligned

### Mobile Layout (< 600px)

#### Header Section
- Title size: 1.75rem
- Padding: 16px
- Stack layout (vertical)

#### Navigation Tabs
- Full width
- Tab text: 0.875rem
- Sport icons: 20x20px
- Scrollable on very small screens

#### Game Cards
- Padding: 16px
- Stack layout (vertical)
- Margins: 8px

##### Team Information
- Logo size: 48x48px
- Team name: 1rem
- Stack layout:
  - Home team
  - VS indicator
  - Away team

##### Odds Display
- Grid layout: 2 columns
- Bookmaker name: 0.75rem
- Odds value: 0.875rem
- Spacing: 8px

#### Filters Section
- Horizontal scrollable
- Chip size: 28px
- Margin: 2px

#### Status Bar
- Stack layout
- Font size: 0.675rem
- Center aligned
- Padding: 8px

### Responsive Breakpoints
- xs: 0-599px (Mobile)
- sm: 600-899px (Tablet)
- md: 900-1199px (Small desktop)
- lg: 1200-1535px (Desktop)
- xl: 1536px+ (Large screens)

### Theme Colors
```javascript
{
  primary: {
    main: '#39FF14', // Neon green
    dark: '#32D912',
    light: '#50FF2E'
  },
  secondary: {
    main: '#2196f3',
    dark: '#1976d2',
    light: '#4dabf5'
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E'
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)'
  }
}
```

### Typography Scale
```javascript
{
  h1: {
    fontSize: {
      xs: '1.75rem',
      sm: '2rem',
      md: '2.5rem'
    },
    fontFamily: 'Orbitron'
  },
  h2: {
    fontSize: {
      xs: '1.5rem',
      sm: '1.75rem',
      md: '2rem'
    }
  },
  body1: {
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    }
  },
  body2: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem'
    }
  }
}
```

### Animation Specifications
1. Tab Transitions
   - Duration: 300ms
   - Timing: ease-in-out
   - Properties: opacity, transform

2. Card Hover Effects
   - Scale: 1.02
   - Duration: 200ms
   - Shadow increase
   - Timing: ease-out

3. Odds Updates
   - Background flash
   - Color: theme.palette.primary.main
   - Duration: 500ms
   - Opacity: 0.2 -> 0

### Accessibility Features
- ARIA labels for all interactive elements
- Minimum touch target size: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Keyboard navigation support
- Screen reader optimized content structure

### Loading States
1. Initial Load
   - Skeleton screens for game cards
   - Pulse animation
   - Duration: 1.5s
   - Color: theme.palette.grey[800]

2. Data Refresh
   - Subtle opacity change
   - Progress indicator in status bar
   - Non-blocking UI

### Error States
1. API Errors
   - Error message card
   - Icon: error_outline
   - Background: rgba(244, 67, 54, 0.1)
   - Retry button

2. No Data
   - Empty state illustration
   - Helpful message
   - Refresh suggestion

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

## Implementation Guide

### Daily Odds Caching System
- Implemented in `GamesList.js`
- Fetches fresh data at 8 AM ET daily
- Uses browser's localStorage for data persistence
- Cache keys:
  - `oddsCache`: Stores odds data
  - `oddsCacheTimestamp`: Stores last update time

### Team Logo Integration
- Located in `teamLogos.js`
- Supports NBA, NFL, and NHL teams
- Handles special cases like team relocations
- Uses standardized filename format for logos

### Odds Processing
- Located in `oddsProcessing.js`
- Filters out unreasonable odds values
- Sorts and processes odds from multiple bookmakers
- Handles different odds formats (American, Decimal)

### UI Components
1. GamesList Component:
   - Manages tab navigation between sports
   - Displays last update and next update times
   - Implements bookmaker filtering

2. GameCard Component:
   - Displays individual game information
   - Shows team logos and odds
   - Responsive design for mobile devices

### Configuration
- API configuration in `config.js`
- Environment variables in `.env`:
  ```
  REACT_APP_API_KEY=your_odds_api_key
  REACT_APP_API_BASE_URL=https://api.the-odds-api.com/v4
  ```

## Development Guidelines

### Code Organization
- Components in `src/components/`
- Utility functions in `src/utils/`
- Configuration in `src/config.js`
- Assets in `public/`

### Best Practices
1. Error Handling:
   - Graceful fallback to cached data
   - User-friendly error messages
   - Console logging for debugging

2. Performance:
   - Memoization of filtered games
   - Efficient DOM updates
   - Optimized image loading

3. State Management:
   - Local component state for UI
   - localStorage for persistence
   - Props for component communication

### Testing
- Manual testing of cache behavior
- Verification of timezone handling
- Cross-browser compatibility checks
- Mobile responsiveness testing

## Future Improvements
1. Server-side caching option
2. Additional sports leagues
3. More detailed odds history
4. User preferences persistence
5. Advanced filtering options

## Running the Project
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your API key

3. Start development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Deployment
- Build creates optimized production files
- Static hosting compatible
- Environment variables required on host
- Cache clearing mechanism recommended

## Troubleshooting
1. Cache Issues:
   - Clear localStorage
   - Check browser console
   - Verify timezone settings

2. API Problems:
   - Verify API key
   - Check rate limits
   - Confirm endpoint URLs

3. Display Issues:
   - Clear browser cache
   - Check console for errors
   - Verify CSS loading
