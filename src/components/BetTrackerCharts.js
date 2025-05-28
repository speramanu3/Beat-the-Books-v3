import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  ButtonGroup, 
  Button,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAppTheme } from '../contexts/ThemeContext';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
  color: theme.palette.text.primary,
  borderRadius: '8px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.5)' 
    : '0 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden'
}));

const AnimatedContainer = styled(motion.div)({
  width: '100%',
  height: '100%'
});

const ChartTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  color: theme.palette.mode === 'dark' ? '#fff' : '#333'
}));

const BetTrackerCharts = ({ bets, selectedMonth, selectedYear }) => {
  const { themeMode } = useAppTheme();
  const theme = useTheme();
  const [activeChart, setActiveChart] = useState('performance');
  const [chartData, setChartData] = useState({
    performance: [],
    distribution: [],
    winLoss: [],
    roi: []
  });
  
  // Define theme-aware colors
  const colors = {
    profit: themeMode === 'dark' ? '#4caf50' : '#2e7d32',
    loss: themeMode === 'dark' ? '#f44336' : '#c62828',
    neutral: themeMode === 'dark' ? '#90caf9' : '#1976d2',
    background: themeMode === 'dark' ? '#121212' : '#ffffff',
    text: themeMode === 'dark' ? '#ffffff' : '#333333',
    grid: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    tooltip: themeMode === 'dark' ? '#424242' : '#f5f5f5',
    pieColors: [
      themeMode === 'dark' ? '#8884d8' : '#673ab7',
      themeMode === 'dark' ? '#82ca9d' : '#4caf50',
      themeMode === 'dark' ? '#ffc658' : '#ff9800',
      themeMode === 'dark' ? '#ff8042' : '#f44336',
      themeMode === 'dark' ? '#0088fe' : '#2196f3'
    ]
  };
  
  // Process bet data for charts
  useEffect(() => {
    if (!bets || bets.length === 0) return;
    
    // Filter bets for selected month and year
    const filteredBets = bets.filter(bet => {
      const betDate = new Date(bet.gameDate);
      return betDate.getMonth() === selectedMonth && betDate.getFullYear() === selectedYear;
    });
    
    // Group bets by date for performance chart
    const betsByDate = {};
    filteredBets.forEach(bet => {
      const date = bet.gameDate.split('T')[0];
      if (!betsByDate[date]) {
        betsByDate[date] = {
          date,
          profit: 0,
          cumulativeProfit: 0,
          betsCount: 0,
          wins: 0,
          losses: 0
        };
      }
      
      // Calculate profit/loss for this bet
      let profit = 0;
      if (bet.result === 'win') {
        const odds = parseInt(bet.odds);
        const units = parseFloat(bet.units);
        
        if (odds > 0) {
          profit = units * odds / 100;
        } else {
          profit = units * 100 / Math.abs(odds);
        }
        betsByDate[date].wins++;
      } else if (bet.result === 'loss') {
        profit = -parseFloat(bet.units);
        betsByDate[date].losses++;
      }
      
      betsByDate[date].profit += profit;
      betsByDate[date].betsCount++;
    });
    
    // Convert to array and sort by date
    const performanceData = Object.values(betsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Calculate cumulative profit
    let runningTotal = 0;
    performanceData.forEach(day => {
      runningTotal += day.profit;
      day.cumulativeProfit = runningTotal;
      // Format date for display
      const dateObj = new Date(day.date);
      day.displayDate = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    });
    
    // Create bet distribution data by bet type
    const betTypeCount = {};
    filteredBets.forEach(bet => {
      const type = bet.betType;
      if (!betTypeCount[type]) betTypeCount[type] = 0;
      betTypeCount[type]++;
    });
    
    const distributionData = Object.keys(betTypeCount).map(type => ({
      name: formatBetType(type),
      value: betTypeCount[type]
    }));
    
    // Create win/loss data by sportsbook
    const sportsbookStats = {};
    filteredBets.forEach(bet => {
      const book = bet.sportsbook;
      if (!sportsbookStats[book]) {
        sportsbookStats[book] = { name: book, wins: 0, losses: 0 };
      }
      
      if (bet.result === 'win') sportsbookStats[book].wins++;
      else if (bet.result === 'loss') sportsbookStats[book].losses++;
    });
    
    const winLossData = Object.values(sportsbookStats);
    
    // Create ROI data by week
    const weeklyData = {};
    filteredBets.forEach(bet => {
      const betDate = new Date(bet.gameDate);
      // Get week number (approximate)
      const weekNum = Math.ceil((betDate.getDate()) / 7);
      const weekKey = `Week ${weekNum}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          name: weekKey,
          wagered: 0,
          returns: 0
        };
      }
      
      weeklyData[weekKey].wagered += parseFloat(bet.units);
      
      if (bet.result === 'win') {
        const odds = parseInt(bet.odds);
        const units = parseFloat(bet.units);
        
        let returns = units; // Original stake
        if (odds > 0) {
          returns += units * odds / 100;
        } else {
          returns += units * 100 / Math.abs(odds);
        }
        
        weeklyData[weekKey].returns += returns;
      }
    });
    
    const roiData = Object.values(weeklyData).map(week => ({
      ...week,
      roi: week.wagered > 0 ? ((week.returns - week.wagered) / week.wagered) * 100 : 0
    }));
    
    setChartData({
      performance: performanceData,
      distribution: distributionData,
      winLoss: winLossData,
      roi: roiData
    });
    
  }, [bets, selectedMonth, selectedYear]);
  
  // Helper function to format bet types for display
  const formatBetType = (type) => {
    switch (type) {
      case 'h2h': return 'Moneyline';
      case 'spreads': return 'Spread';
      case 'totals': return 'Total';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Custom tooltip for performance chart
  const PerformanceTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          bgcolor: colors.tooltip, 
          p: 1.5, 
          borderRadius: 1,
          boxShadow: 3,
          border: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{data.date}</Typography>
          <Typography variant="body2" color={data.profit >= 0 ? colors.profit : colors.loss}>
            Daily P/L: {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(2)} units
          </Typography>
          <Typography variant="body2" color={data.cumulativeProfit >= 0 ? colors.profit : colors.loss}>
            Total P/L: {data.cumulativeProfit >= 0 ? '+' : ''}{data.cumulativeProfit.toFixed(2)} units
          </Typography>
          <Typography variant="body2">
            Bets: {data.betsCount} ({data.wins}W-{data.losses}L)
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // Animation variants for chart containers
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: { ease: 'easeOut', duration: 0.3 }
    }
  };
  
  // Render performance chart (profit/loss over time)
  const renderPerformanceChart = () => {
    const hasData = chartData.performance && chartData.performance.length > 0;
    
    return (
      <AnimatedContainer
        key="performance-chart"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <ChartTitle variant="h6">Profit/Loss Over Time</ChartTitle>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData.performance}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.profit} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.profit} stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.loss} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.loss} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="displayDate" 
                stroke={colors.text}
                tick={{ fill: colors.text }}
              />
              <YAxis 
                stroke={colors.text}
                tick={{ fill: colors.text }}
                label={{ 
                  value: 'Units', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: colors.text }
                }}
              />
              <Tooltip content={<PerformanceTooltip />} />
              <ReferenceLine y={0} stroke={colors.text} strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="cumulativeProfit" 
                stroke={colors.neutral}
                fill={d => d.cumulativeProfit >= 0 ? "url(#colorProfit)" : "url(#colorLoss)"}
                activeDot={{ r: 8, strokeWidth: 2, stroke: themeMode === 'dark' ? '#fff' : '#000' }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available for this period
            </Typography>
          </Box>
        )}
      </AnimatedContainer>
    );
  };
  
  // Render bet distribution chart (pie chart)
  const renderDistributionChart = () => {
    const hasData = chartData.distribution && chartData.distribution.length > 0;
    
    return (
      <AnimatedContainer
        key="distribution-chart"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <ChartTitle variant="h6">Bet Type Distribution</ChartTitle>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.distribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors.pieColors[index % colors.pieColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} bets`, 'Count']}
                contentStyle={{ 
                  backgroundColor: colors.tooltip,
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: colors.text }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available for this period
            </Typography>
          </Box>
        )}
      </AnimatedContainer>
    );
  };
  
  // Render win/loss chart by sportsbook
  const renderWinLossChart = () => {
    const hasData = chartData.winLoss && chartData.winLoss.length > 0;
    
    return (
      <AnimatedContainer
        key="winloss-chart"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <ChartTitle variant="h6">Win/Loss by Sportsbook</ChartTitle>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData.winLoss}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                stroke={colors.text}
                tick={{ fill: colors.text }}
              />
              <YAxis 
                stroke={colors.text}
                tick={{ fill: colors.text }}
                label={{ 
                  value: 'Count', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: colors.text }
                }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: colors.tooltip,
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: colors.text
                }}
              />
              <Legend 
                formatter={(value) => <span style={{ color: colors.text }}>{value}</span>}
              />
              <Bar 
                dataKey="wins" 
                name="Wins" 
                fill={colors.profit} 
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              />
              <Bar 
                dataKey="losses" 
                name="Losses" 
                fill={colors.loss} 
                animationBegin={200}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available for this period
            </Typography>
          </Box>
        )}
      </AnimatedContainer>
    );
  };
  
  // Render ROI chart by week
  const renderROIChart = () => {
    const hasData = chartData.roi && chartData.roi.length > 0;
    
    return (
      <AnimatedContainer
        key="roi-chart"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <ChartTitle variant="h6">ROI by Week</ChartTitle>
        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData.roi}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="name" 
                stroke={colors.text}
                tick={{ fill: colors.text }}
              />
              <YAxis 
                stroke={colors.text}
                tick={{ fill: colors.text }}
                label={{ 
                  value: 'ROI %', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: colors.text }
                }}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)}%`, 'ROI']}
                contentStyle={{ 
                  backgroundColor: colors.tooltip,
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: colors.text
                }}
              />
              <ReferenceLine y={0} stroke={colors.text} strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="roi" 
                stroke={colors.neutral}
                strokeWidth={2}
                dot={{ 
                  stroke: themeMode === 'dark' ? '#fff' : '#000',
                  strokeWidth: 1,
                  r: 4,
                  fill: (entry) => entry.roi >= 0 ? colors.profit : colors.loss
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: themeMode === 'dark' ? '#fff' : '#000',
                  strokeWidth: 2
                }}
                animationDuration={2000}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No data available for this period
            </Typography>
          </Box>
        )}
      </AnimatedContainer>
    );
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Performance Analytics
      </Typography>
      
      <ButtonGroup 
        variant="outlined" 
        color="primary" 
        sx={{ mb: 2, display: 'flex', flexWrap: 'wrap' }}
      >
        <Button 
          onClick={() => setActiveChart('performance')}
          variant={activeChart === 'performance' ? 'contained' : 'outlined'}
        >
          Profit/Loss
        </Button>
        <Button 
          onClick={() => setActiveChart('distribution')}
          variant={activeChart === 'distribution' ? 'contained' : 'outlined'}
        >
          Bet Types
        </Button>
        <Button 
          onClick={() => setActiveChart('winLoss')}
          variant={activeChart === 'winLoss' ? 'contained' : 'outlined'}
        >
          Win/Loss
        </Button>
        <Button 
          onClick={() => setActiveChart('roi')}
          variant={activeChart === 'roi' ? 'contained' : 'outlined'}
        >
          ROI
        </Button>
      </ButtonGroup>
      
      <StyledPaper>
        <AnimatePresence mode="wait">
          {activeChart === 'performance' && renderPerformanceChart()}
          {activeChart === 'distribution' && renderDistributionChart()}
          {activeChart === 'winLoss' && renderWinLossChart()}
          {activeChart === 'roi' && renderROIChart()}
        </AnimatePresence>
      </StyledPaper>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            {renderPerformanceChart()}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            {renderDistributionChart()}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            {renderWinLossChart()}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            {renderROIChart()}
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BetTrackerCharts;
