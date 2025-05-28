import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';

const DebugCalculation = () => {
  const [units, setUnits] = useState('-0.05');
  const [unitValue, setUnitValue] = useState('25');
  const [result, setResult] = useState('');
  const [allCalculations, setAllCalculations] = useState([]);

  const calculate = () => {
    const unitsNum = parseFloat(units);
    const valueNum = parseFloat(unitValue);
    
    // Different calculation methods to debug floating point issues
    const directMultiply = unitsNum * valueNum;
    const withToFixed = (unitsNum * valueNum).toFixed(2);
    const withMathRound = Math.round(unitsNum * valueNum * 100) / 100;
    const withPrecision = (Math.round(unitsNum * 100) / 100) * (Math.round(valueNum * 100) / 100);
    
    setResult(`
      Direct multiplication: ${directMultiply}
      With toFixed(2): ${withToFixed}
      With Math.round: ${withMathRound}
      With precision handling: ${withPrecision}
    `);
    
    // Store calculations for comparison
    setAllCalculations([
      ...allCalculations,
      {
        units: unitsNum,
        unitValue: valueNum,
        directMultiply,
        withToFixed,
        withMathRound,
        withPrecision
      }
    ]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Calculation Debugger</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Test Calculation</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField 
            label="Units" 
            value={units} 
            onChange={(e) => setUnits(e.target.value)} 
            sx={{ width: 150 }}
          />
          <Typography variant="h6" sx={{ alignSelf: 'center' }}>×</Typography>
          <TextField 
            label="Unit Value" 
            value={unitValue} 
            onChange={(e) => setUnitValue(e.target.value)} 
            sx={{ width: 150 }}
          />
          <Button 
            variant="contained" 
            onClick={calculate}
            sx={{ ml: 2 }}
          >
            Calculate
          </Button>
        </Box>
        
        {result && (
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {result}
            </Typography>
          </Paper>
        )}
      </Paper>
      
      {allCalculations.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Calculation History</Typography>
          {allCalculations.map((calc, index) => (
            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #eee' }}>
              <Typography variant="body2">
                {calc.units} × {calc.unitValue} =
              </Typography>
              <Typography variant="body2">
                Direct: {calc.directMultiply}
              </Typography>
              <Typography variant="body2">
                toFixed(2): {calc.withToFixed}
              </Typography>
              <Typography variant="body2">
                Math.round: {calc.withMathRound}
              </Typography>
              <Typography variant="body2">
                Precision: {calc.withPrecision}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
      
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" gutterBottom>JavaScript Precision Test</Typography>
        <Typography variant="body1">
          0.1 + 0.2 = {0.1 + 0.2} (should be 0.3)
        </Typography>
        <Typography variant="body1">
          -0.05 * 25 = {-0.05 * 25} (should be -1.25)
        </Typography>
        <Typography variant="body1">
          -0.05 * 25 with toFixed(2) = {(-0.05 * 25).toFixed(2)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default DebugCalculation;
