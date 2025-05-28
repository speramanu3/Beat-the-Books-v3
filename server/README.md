# Beat the Books - Firebase Cloud Functions

This directory contains Firebase Cloud Functions that automatically fetch odds data from the Odds API every morning at 8 AM ET and store it in Firebase Realtime Database.

## Features

- **Scheduled Daily Updates**: Automatically fetches odds data at 8 AM ET every day
- **API Quota Management**: Tracks and stores API usage information
- **Multiple Sports Support**: Fetches data for NBA, NFL, NHL, and MLB
- **Manual Trigger Option**: Admin-only function to manually trigger data updates

## Setup and Deployment

### Prerequisites

1. Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```

2. Firebase project initialized:
   ```
   firebase login
   firebase init
   ```

3. Set up environment variables for production:
   ```
   firebase functions:config:set odds.api_key="YOUR_ODDS_API_KEY"
   ```

### Deployment

Deploy the functions to Firebase:

```
cd server
npm install
firebase deploy --only functions
```

### Testing Locally

Test the functions locally with Firebase emulators:

```
firebase emulators:start --only functions
```

## Function Details

### `fetchDailyOdds`

This function runs automatically at 8 AM ET every day to fetch the latest odds data for all supported sports and store it in Firebase Realtime Database.

### `manualFetchOdds`

This is an HTTP callable function that allows administrators to manually trigger a data update. It requires authentication and admin privileges.

## Data Structure

The data is stored in Firebase Realtime Database with the following structure:

```
/games
  /basketball_nba
    /data: [array of games]
    /lastUpdated: timestamp
  /football_nfl
    /data: [array of games]
    /lastUpdated: timestamp
  /hockey_nhl
    /data: [array of games]
    /lastUpdated: timestamp
  /baseball_mlb
    /data: [array of games]
    /lastUpdated: timestamp
/apiUsage
  /remainingRequests: number
  /usedRequests: number
  /lastUpdated: timestamp
```

## Security Rules

Make sure your Firebase Realtime Database rules allow read access to all users but restrict write access to authenticated admin users and the Cloud Functions service account.

Example rules:

```json
{
  "rules": {
    "games": {
      ".read": true,
      ".write": "auth != null && root.child('adminUsers').child(auth.uid).exists()"
    },
    "apiUsage": {
      ".read": "auth != null && root.child('adminUsers').child(auth.uid).exists()",
      ".write": "auth != null && root.child('adminUsers').child(auth.uid).exists()"
    },
    "adminUsers": {
      ".read": "auth != null && root.child('adminUsers').child(auth.uid).exists()",
      ".write": "auth != null && root.child('adminUsers').child(auth.uid).exists()"
    }
  }
}
```
