import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  FormControlLabel, 
  Switch,
  Paper
} from '@mui/material';
import PremiumFeature from './PremiumFeature';

/**
 * A premium feature component that allows filtering games by EV threshold
 */
const PremiumEVFilter = ({ onFilterChange }) => {
  const [evThreshold, setEvThreshold] = useState(3);
  const [filterEnabled, setFilterEnabled] = useState(false);
  
  const handleThresholdChange = (event, newValue) => {
    setEvThreshold(newValue);
    if (filterEnabled) {
      onFilterChange({ enabled: true, threshold: newValue });
    }
  };
  
  const handleEnableChange = (event) => {
    const enabled = event.target.checked;
    setFilterEnabled(enabled);
    onFilterChange({ enabled, threshold: evThreshold });
  };
  
  return (
    <PremiumFeature
      title="EV Filter"
      description="Filter games by expected value (EV) to find the best betting opportunities."
    >
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1">
            EV Filter
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={filterEnabled}
                onChange={handleEnableChange}
                color="primary"
              />
            }
            label="Enable"
          />
        </Box>
        
        <Box sx={{ px: 1 }}>
          <Typography id="ev-threshold-slider" gutterBottom>
            Minimum EV: {evThreshold}%
          </Typography>
          <Slider
            value={evThreshold}
            onChange={handleThresholdChange}
            aria-labelledby="ev-threshold-slider"
            valueLabelDisplay="auto"
            step={0.5}
            marks={[
              { value: 0, label: '0%' },
              { value: 5, label: '5%' },
              { value: 10, label: '10%' }
            ]}
            min={0}
            max={10}
            disabled={!filterEnabled}
          />
        </Box>
      </Paper>
    </PremiumFeature>
  );
};

export default PremiumEVFilter;
