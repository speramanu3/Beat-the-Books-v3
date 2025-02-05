import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';

const SPORT_LABELS = {
  'basketball_nba': 'NBA',
  'hockey_nhl': 'NHL'
};

const SportsTabs = ({ selectedSport, onSportChange }) => {
  const handleChange = (event, newValue) => {
    onSportChange(newValue);
  };

  return (
    <Paper sx={{ mb: 3 }}>
      <Tabs
        value={selectedSport}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        aria-label="sport selection tabs"
      >
        {Object.entries(SPORT_LABELS).map(([value, label]) => (
          <Tab
            key={value}
            value={value}
            label={label}
            aria-label={`Show ${label} games`}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default SportsTabs;
