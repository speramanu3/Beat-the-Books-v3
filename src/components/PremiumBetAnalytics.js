import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getDatabase, ref, onValue } from 'firebase/database';
import PremiumFeature from './PremiumFeature';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PremiumBetAnalytics = ({ bets }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    profitByMonth: [],
    betsByOutcome: [],
    profitBySport: [],
    winRateByOddsRange: [],
    evPerformance: []
  });

  useEffect(() => {
    if (!bets || bets.length === 0) {
      setLoading(false);
      return;
    }

    // Process bets data to generate analytics
    const processAnalytics = () => {
      // Group bets by month for profit chart
      const profitByMonth = groupBetsByMonth(bets);
      
      // Count bets by outcome (win, loss, push, pending)
      const betsByOutcome = countBetsByOutcome(bets);
      
      // Calculate profit by sport
      const profitBySport = calculateProfitBySport(bets);
      
      // Calculate win rate by odds range
      const winRateByOddsRange = calculateWinRateByOddsRange(bets);
      
      // Compare actual results vs expected value
      const evPerformance = analyzeEVPerformance(bets);
      
      setAnalytics({
        profitByMonth,
        betsByOutcome,
        profitBySport,
        winRateByOddsRange,
        evPerformance
      });
      
      setLoading(false);
    };
    
    processAnalytics();
  }, [bets]);

  // Helper function to group bets by month and calculate profit
  const groupBetsByMonth = (bets) => {
    const monthlyData = {};
    
    bets.forEach(bet => {
      if (bet.result !== 'pending' && bet.amount && bet.odds) {
        const date = new Date(bet.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: monthYear,
            profit: 0,
            bets: 0
          };
        }
        
        // Calculate profit based on result
        let profit = 0;
        if (bet.result === 'win') {
          // Calculate winnings based on American odds
          profit = bet.odds > 0 
            ? (bet.amount * bet.odds / 100) 
            : (bet.amount * 100 / Math.abs(bet.odds));
        } else if (bet.result === 'loss') {
          profit = -bet.amount;
        }
        
        monthlyData[monthYear].profit += profit;
        monthlyData[monthYear].bets += 1;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  };
  
  // Helper function to count bets by outcome
  const countBetsByOutcome = (bets) => {
    const outcomes = { win: 0, loss: 0, push: 0, pending: 0 };
    
    bets.forEach(bet => {
      if (outcomes.hasOwnProperty(bet.result)) {
        outcomes[bet.result]++;
      }
    });
    
    return Object.entries(outcomes).map(([name, value]) => ({ name, value }));
  };
  
  // Helper function to calculate profit by sport
  const calculateProfitBySport = (bets) => {
    const sportData = {};
    
    bets.forEach(bet => {
      if (bet.result !== 'pending' && bet.amount && bet.odds && bet.sport) {
        if (!sportData[bet.sport]) {
          sportData[bet.sport] = {
            sport: bet.sport,
            profit: 0,
            bets: 0
          };
        }
        
        // Calculate profit based on result
        let profit = 0;
        if (bet.result === 'win') {
          profit = bet.odds > 0 
            ? (bet.amount * bet.odds / 100) 
            : (bet.amount * 100 / Math.abs(bet.odds));
        } else if (bet.result === 'loss') {
          profit = -bet.amount;
        }
        
        sportData[bet.sport].profit += profit;
        sportData[bet.sport].bets += 1;
      }
    });
    
    return Object.values(sportData);
  };
  
  // Helper function to calculate win rate by odds range
  const calculateWinRateByOddsRange = (bets) => {
    const oddsRanges = {
      'Heavy Favorite (-300 or more)': { min: -Infinity, max: -300, wins: 0, total: 0 },
      'Favorite (-299 to -150)': { min: -299, max: -150, wins: 0, total: 0 },
      'Slight Favorite (-149 to -101)': { min: -149, max: -101, wins: 0, total: 0 },
      'Pick\'em (-100 to +100)': { min: -100, max: 100, wins: 0, total: 0 },
      'Slight Underdog (+101 to +149)': { min: 101, max: 149, wins: 0, total: 0 },
      'Underdog (+150 to +299)': { min: 150, max: 299, wins: 0, total: 0 },
      'Heavy Underdog (+300 or more)': { min: 300, max: Infinity, wins: 0, total: 0 }
    };
    
    bets.forEach(bet => {
      if (bet.result !== 'pending' && bet.result !== 'push' && bet.odds) {
        // Find the appropriate odds range
        for (const [range, data] of Object.entries(oddsRanges)) {
          if (bet.odds >= data.min && bet.odds <= data.max) {
            data.total++;
            if (bet.result === 'win') {
              data.wins++;
            }
            break;
          }
        }
      }
    });
    
    // Calculate win rates and convert to array
    return Object.entries(oddsRanges)
      .filter(([_, data]) => data.total > 0)
      .map(([range, data]) => ({
        range,
        winRate: (data.wins / data.total) * 100,
        sampleSize: data.total
      }));
  };
  
  // Helper function to analyze EV performance
  const analyzeEVPerformance = (bets) => {
    const evData = {
      'Positive EV': { expectedProfit: 0, actualProfit: 0, bets: 0 },
      'Negative EV': { expectedProfit: 0, actualProfit: 0, bets: 0 },
      'Unknown EV': { expectedProfit: 0, actualProfit: 0, bets: 0 }
    };
    
    bets.forEach(bet => {
      if (bet.result !== 'pending' && bet.amount && bet.odds) {
        let category = 'Unknown EV';
        if (bet.expectedValue > 0) {
          category = 'Positive EV';
        } else if (bet.expectedValue < 0) {
          category = 'Negative EV';
        }
        
        // Calculate actual profit
        let actualProfit = 0;
        if (bet.result === 'win') {
          actualProfit = bet.odds > 0 
            ? (bet.amount * bet.odds / 100) 
            : (bet.amount * 100 / Math.abs(bet.odds));
        } else if (bet.result === 'loss') {
          actualProfit = -bet.amount;
        }
        
        // Calculate expected profit based on EV
        const expectedProfit = bet.expectedValue ? bet.amount * bet.expectedValue : 0;
        
        evData[category].expectedProfit += expectedProfit;
        evData[category].actualProfit += actualProfit;
        evData[category].bets++;
      }
    });
    
    return Object.entries(evData)
      .filter(([_, data]) => data.bets > 0)
      .map(([category, data]) => ({
        category,
        expectedProfit: data.expectedProfit,
        actualProfit: data.actualProfit,
        bets: data.bets
      }));
  };

  // Wrap the entire component in PremiumFeature
  return (
    <PremiumFeature
      title="Premium Betting Analytics"
      description="Unlock detailed betting analytics to improve your betting strategy and maximize your profits."
    >
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Advanced Betting Analytics
          </Typography>
          
          <Grid container spacing={3}>
            {/* Profit Over Time Chart */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Profit Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={analytics.profitByMonth}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#8884d8" 
                      name="Profit ($)"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Bet Outcomes Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Bet Outcomes
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.betsByOutcome}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.betsByOutcome.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Profit by Sport Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Profit by Sport
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.profitBySport}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sport" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="profit" name="Profit ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Win Rate by Odds Range */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Win Rate by Odds Range
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.winRateByOddsRange}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'winRate' ? `${value.toFixed(1)}%` : value,
                      name === 'winRate' ? 'Win Rate' : 'Sample Size'
                    ]} />
                    <Legend />
                    <Bar dataKey="winRate" name="Win Rate (%)" fill="#8884d8" />
                    <Bar dataKey="sampleSize" name="Sample Size" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* EV Performance Comparison */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Expected vs. Actual Profit
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.evPerformance}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="expectedProfit" name="Expected Profit ($)" fill="#8884d8" />
                    <Bar dataKey="actualProfit" name="Actual Profit ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </PremiumFeature>
  );
};

export default PremiumBetAnalytics;
