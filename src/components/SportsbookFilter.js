import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FilterListIcon from '@mui/icons-material/FilterList';
import useResponsiveLayout from '../hooks/useResponsiveLayout';

const SportsbookFilter = ({ 
  availableBookmakers,
  selectedBookmakers,
  onBookmakerChange,
  onSelectAll,
  onClearAll
}) => {
  const { isMobile } = useResponsiveLayout();
  const [expanded, setExpanded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleExpandClick = () => {
    if (isMobile) {
      setDialogOpen(true);
    } else {
      setExpanded(!expanded);
    }
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <Paper sx={{ mb: 3, p: isMobile ? 1.5 : 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ display: 'inline' }}
          >
            Sportsbook Filter
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="primary" 
            sx={{ 
              display: 'inline', 
              ml: 1,
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 126, 51, 0.1)',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            {selectedBookmakers.length}/{availableBookmakers.length}
          </Typography>
        </Box>
        <Box>
          {isMobile ? (
            <Button
              variant="outlined"
              size="small"
              onClick={handleExpandClick}
              endIcon={<FilterListIcon />}
              sx={{ minWidth: 0, px: 1 }}
            >
              Filter
            </Button>
          ) : (
            <>
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
            </>
          )}
        </Box>
      </Box>

      {/* Desktop: Collapsible filter section */}
      {!isMobile && (
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
      )}
      
      {/* Mobile: Dialog for filters */}
      {isMobile && (
        <Dialog 
          open={dialogOpen} 
          onClose={handleDialogClose} 
          fullWidth 
          maxWidth="xs"
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Select Sportsbooks</Typography>
              <Typography 
                variant="subtitle2" 
                color="primary" 
                sx={{ 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(0, 126, 51, 0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                {selectedBookmakers.length}/{availableBookmakers.length}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={1}>
              {availableBookmakers.map((bookmaker) => (
                <Grid item xs={6} key={bookmaker}>
                  <Chip
                    label={bookmaker}
                    onClick={() => {
                      const isSelected = selectedBookmakers.includes(bookmaker);
                      onBookmakerChange(bookmaker, !isSelected);
                    }}
                    color={selectedBookmakers.includes(bookmaker) ? "primary" : "default"}
                    variant={selectedBookmakers.includes(bookmaker) ? "filled" : "outlined"}
                    sx={{ width: '100%', justifyContent: 'flex-start' }}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClearAll}>Clear All</Button>
            <Button onClick={onSelectAll}>Select All</Button>
            <Button onClick={handleDialogClose} variant="contained" color="primary">
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Mobile: Selected filters chips */}
      {isMobile && selectedBookmakers.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedBookmakers.slice(0, 3).map((bookmaker) => (
            <Chip 
              key={bookmaker} 
              label={bookmaker} 
              size="small" 
              onDelete={() => onBookmakerChange(bookmaker, false)}
              color="primary"
              variant="outlined"
            />
          ))}
          {selectedBookmakers.length > 3 && (
            <Chip 
              label={`+${selectedBookmakers.length - 3} more`} 
              size="small"
              onClick={handleExpandClick}
              color="default"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SportsbookFilter;
