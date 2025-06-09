import React, { useEffect } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';

// Import the migration script
import '../scripts/migrateBets';

const BetMigrationTool = () => {
  useEffect(() => {
    console.log('BetMigrationTool component mounted');
  }, []);

  const handleRunMigration = () => {
    // Prompt for credentials
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    if (email && password) {
      // The actual migration function is defined in migrateBets.js and attached to window
      if (typeof window.runBetMigration === 'function') {
        window.runBetMigration(email, password);
      } else {
        console.error('Migration function not found. Make sure the script is loaded.');
        alert('Migration function not found. Check console for details.');
      }
    } else {
      alert('Email and password are required to run the migration.');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#1e1e1e', color: '#fff' }}>
      <Typography variant="h6" gutterBottom>
        Bet Migration Tool
      </Typography>
      <Typography variant="body2" paragraph>
        This tool will migrate your bets from the old format to the new user-specific format.
        This is a one-time operation that should fix permission issues when saving and viewing bets.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRunMigration}
        >
          Run Migration
        </Button>
      </Box>
    </Paper>
  );
};

export default BetMigrationTool;
