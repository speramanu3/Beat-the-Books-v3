import React from 'react';
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const SportsbookFilter = ({ 
  availableBookmakers,
  selectedBookmakers,
  onBookmakerChange,
  onSelectAll,
  onClearAll
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" component="div">
          Sportsbook Filter
        </Typography>
        <Box>
          <Button 
            size="small" 
            onClick={onSelectAll}
            sx={{ mr: 1 }}
          >
            Select All
          </Button>
          <Button 
            size="small" 
            onClick={onClearAll}
            sx={{ mr: 1 }}
          >
            Clear All
          </Button>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <FormControl component="fieldset" variant="standard" sx={{ mt: 2 }}>
          <FormGroup>
            <Box display="flex" flexWrap="wrap">
              {availableBookmakers.map((bookmaker) => (
                <FormControlLabel
                  key={bookmaker}
                  control={
                    <Checkbox
                      checked={selectedBookmakers.includes(bookmaker)}
                      onChange={(e) => onBookmakerChange(bookmaker, e.target.checked)}
                      name={bookmaker}
                    />
                  }
                  label={bookmaker}
                  sx={{ width: '200px' }}
                />
              ))}
            </Box>
          </FormGroup>
        </FormControl>
      </Collapse>

      {!expanded && selectedBookmakers.length < availableBookmakers.length && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {selectedBookmakers.length} of {availableBookmakers.length} sportsbooks selected
        </Typography>
      )}
    </Paper>
  );
};

export default SportsbookFilter;
