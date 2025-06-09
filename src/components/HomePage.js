import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Container,
  Paper,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
// Sports icons
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';
import SportsHockeyIcon from '@mui/icons-material/SportsHockey';
import SportsGolfIcon from '@mui/icons-material/SportsGolf';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
// Import BookmakerCarousel
import BookmakerCarousel from './BookmakerCarousel';
// Import Auth components
import AuthModal from './auth/AuthModal';
import { useAuth } from '../contexts/AuthContext';
// Feature icons
import SpeedIcon from '@mui/icons-material/Speed';
import CompareIcon from '@mui/icons-material/Compare';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
// Social icons
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import CloseIcon from '@mui/icons-material/Close';
// Animation
import { motion } from 'framer-motion';
// SEO
import { Helmet } from 'react-helmet';

const HomePage = ({ navigateTo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState(0); // 0 for login, 1 for register
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentUser } = useAuth();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Set loaded state after initial render
  useEffect(() => {
    setIsLoaded(true);
    console.log('HomePage component rendered');
  }, []);

  const handleViewOdds = (sportKey) => {
    navigateTo('odds', sportKey);
  };

  const handleOpenAuthModal = (tab = 0) => {
    setAuthTab(tab);
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const featuredSports = [
    { 
      name: 'NBA Basketball', 
      icon: <SportsBasketballIcon sx={{ fontSize: 60 }} />,
      description: 'Find the best basketball odds across major sportsbooks',
      color: '#C9082A',
      sportKey: 'basketball_nba'
    },
    { 
      name: 'NFL Football', 
      icon: <SportsFootballIcon sx={{ fontSize: 60 }} />,
      description: 'Compare football betting lines instantly',
      color: '#013369',
      sportKey: 'americanfootball_nfl'
    },
    { 
      name: 'NHL Hockey', 
      icon: <SportsHockeyIcon sx={{ fontSize: 60 }} />,
      description: 'Discover value bets for hockey games',
      color: '#000000',
      sportKey: 'icehockey_nhl'
    },
    { 
      name: 'MLB Baseball', 
      icon: <SportsBaseballIcon sx={{ fontSize: 60 }} />,
      description: 'Track baseball odds from all major sportsbooks',
      color: '#002D72',
      sportKey: 'baseball_mlb',
      comingSoon: false
    },
    { 
      name: 'Soccer', 
      icon: <SportsSoccerIcon sx={{ fontSize: 60 }} />,
      description: 'Find the best soccer betting opportunities',
      color: '#3A7D44',
      sportKey: 'soccer',
      comingSoon: true
    },
    { 
      name: 'Golf', 
      icon: <SportsGolfIcon sx={{ fontSize: 60 }} />,
      description: 'Compare golf tournament and matchup odds',
      color: '#156F65',
      sportKey: 'golf',
      comingSoon: true
    }
  ];

  const features = [
    {
      title: 'Real-Time Odds',
      description: 'Get the most up-to-date odds from multiple sportsbooks in one place',
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    },
    {
      title: 'Easy Comparison',
      description: 'Quickly compare odds across different sportsbooks to find the best value',
      icon: <CompareIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    },
    {
      title: 'Smart Filtering',
      description: 'Filter by sport, sportsbook, or bet type to find exactly what you need',
      icon: <FilterAltIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    },
    {
      title: 'Alerts & Notifications',
      description: 'Get notified when odds change significantly or match your criteria',
      icon: <NotificationsActiveIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    },
    {
      title: 'Secure & Private',
      description: 'Your data is encrypted and never shared with third parties',
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    },
    {
      title: 'Multi-Device Support',
      description: 'Access from any device - desktop, tablet, or mobile',
      icon: <DevicesIcon sx={{ fontSize: 40, color: '#39FF14' }} />
    }
  ];

  return (
    <>
      {/* SEO Optimization */}
      <Helmet>
        <title>Beat the Books | Find the Best Sports Betting Odds</title>
        <meta name="description" content="Compare sports betting odds across major sportsbooks and find the best value for NBA, NFL, NHL, MLB and more. Beat the Books helps you maximize your edge." />
        <meta name="keywords" content="sports betting, odds comparison, best odds, sportsbooks, NBA odds, NFL odds, NHL odds, MLB odds" />
        <meta property="og:title" content="Beat the Books | Find the Best Sports Betting Odds" />
        <meta property="og:description" content="Compare sports betting odds across major sportsbooks and find the best value." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Beat the Books | Find the Best Sports Betting Odds" />
        <meta name="twitter:description" content="Compare sports betting odds across major sportsbooks and find the best value." />
      </Helmet>
      
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Fade in={isLoaded} timeout={1000}>
          <Paper 
            elevation={6}
            sx={{ 
              p: { xs: 3, md: 5 }, 
              mt: 4, 
              mb: 6, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #2d2d2d 100%)',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(57, 255, 20, 0.1)'
            }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={7} sx={{ position: 'relative', zIndex: 2 }}>
                  <motion.div variants={itemVariants}>
                    <Typography 
                      variant="h2" 
                      component="h1" 
                      sx={{ 
                        color: '#39FF14',
                        textShadow: '0 0 5px rgba(57, 255, 20, 0.7), 0 0 10px rgba(57, 255, 20, 0.5)',
                        fontWeight: 'bold',
                        mb: 2,
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                        letterSpacing: '1px'
                      }}
                    >
                      BEAT THE BOOKS
                    </Typography>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#fff',
                        mb: 4,
                        maxWidth: '90%',
                        lineHeight: 1.4,
                        fontSize: { xs: '1.2rem', md: '1.5rem' }
                      }}
                    >
                      Gain your edge with real-time odds comparison across all major sportsbooks
                    </Typography>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={handleViewOdds}
                      sx={{ 
                        background: 'linear-gradient(45deg, #39FF14 30%, #00E676 90%)',
                        color: '#000',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(57, 255, 20, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00E676 30%, #39FF14 90%)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 25px rgba(57, 255, 20, 0.6)'
                        }
                      }}
                    >
                      VIEW LIVE ODDS
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      size="large"
                      onClick={() => handleOpenAuthModal(1)}
                      sx={{ 
                        borderColor: '#39FF14',
                        color: '#39FF14',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        borderWidth: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: '#00E676',
                          backgroundColor: 'rgba(57, 255, 20, 0.1)',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      SIGN UP FREE
                    </Button>
                  </motion.div>
                  

                </Grid>
                
                <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <Box 
                      sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(57, 255, 20, 0.2)'
                      }}
                    >
                      {/* Dynamic hero graphic - sports betting dashboard visualization */}
                      <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="#39FF14" fontWeight="bold" sx={{ mb: 2 }}>
                          LIVE ODDS COMPARISON
                        </Typography>
                        
                        {/* Simulated odds comparison table */}
                        <Box sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.7)', 
                          p: 2, 
                          borderRadius: 2,
                          border: '1px solid rgba(57, 255, 20, 0.3)'
                        }}>
                          <Grid container sx={{ mb: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)', pb: 1 }}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="#888">TEAM</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="#888">DK</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="#888">FD</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="#888">MGM</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="#888">BEST</Typography>
                            </Grid>
                          </Grid>
                          
                          <Grid container sx={{ mb: 1 }}>
                            <Grid item xs={4}>
                              <Typography variant="body2">Lakers</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-110</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-108</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-115</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center', color: '#39FF14', fontWeight: 'bold' }}>
                              <Typography variant="body2">-108</Typography>
                            </Grid>
                          </Grid>
                          
                          <Grid container>
                            <Grid item xs={4}>
                              <Typography variant="body2">Celtics</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-110</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-112</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center' }}>
                              <Typography variant="body2">-105</Typography>
                            </Grid>
                            <Grid item xs={2} sx={{ textAlign: 'center', color: '#39FF14', fontWeight: 'bold' }}>
                              <Typography variant="body2">-105</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </motion.div>
            
            {/* Background effect */}
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 10% 10%, rgba(57, 255, 20, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
                zIndex: 0
              }}
            />
          </Paper>
        </Fade>

      {/* Featured Sports Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            mb: 1, 
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            position: 'relative',
            display: 'inline-block',
            left: '50%',
            transform: 'translateX(-50%)',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '25%',
              width: '50%',
              height: 4,
              backgroundColor: '#39FF14',
              borderRadius: 2
            }
          }}
        >
          Featured Sports
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mt: 4, // Increased top margin to add more space after the green line
            mb: 4, 
            color: '#aaa',
            textAlign: 'center',
            maxWidth: '700px',
            mx: 'auto'
          }}
        >
          Get real-time odds from top sportsbooks for all major sports and leagues
        </Typography>
      </motion.div>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {featuredSports.map((sport, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.4, duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card 
                sx={{ 
                  height: 300, // Fixed height for all cards
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'rgba(30, 30, 30, 0.7)',
                  color: '#fff',
                  border: '1px solid rgba(57, 255, 20, 0.1)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(135deg, ${sport.color}22 0%, transparent 100%)`,
                    zIndex: 0
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>

                  <Box 
                    sx={{ 
                      mb: 2, 
                      color: '#39FF14',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 80
                    }}
                  >
                    {sport.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: 0.5
                    }}
                  >
                    {sport.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#bbb',
                      mb: 2
                    }}
                  >
                    {sport.description}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewOdds(sport.sportKey)}
                    disabled={sport.comingSoon}
                    sx={{ 
                      color: sport.comingSoon ? 'rgba(57, 255, 20, 0.3)' : '#39FF14',
                      borderColor: sport.comingSoon ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.5)',
                      '&:hover': {
                        borderColor: sport.comingSoon ? 'rgba(57, 255, 20, 0.2)' : '#39FF14',
                        backgroundColor: sport.comingSoon ? 'transparent' : 'rgba(57, 255, 20, 0.1)'
                      }
                    }}
                  >
                    {sport.comingSoon ? 'Coming Soon' : 'View Odds'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      {/* Bookmaker Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <BookmakerCarousel />
      </motion.div>

      {/* Why Choose Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            mb: 6, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #2d2d2d 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(57, 255, 20, 0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h2"
            sx={{ 
              mb: 1, 
              color: '#fff',
              fontWeight: 'bold',
              textAlign: 'center',
              position: 'relative',
              display: 'inline-block',
              left: '50%',
              transform: 'translateX(-50%)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '25%',
                width: '50%',
                height: 4,
                backgroundColor: '#39FF14',
                borderRadius: 2
              }
            }}
          >
            Why Choose Beat the Books
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 4, // Increased top margin to add more space after the green line
              mb: 5, 
              color: '#aaa',
              textAlign: 'center',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Our platform gives you the edge you need to make smarter betting decisions
          </Typography>
          
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index + 0.6, duration: 0.5 }}
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 3,
                      height: '100%',
                      borderRadius: 2,
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(57, 255, 20, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(57, 255, 20, 0.05)',
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)'
                      }
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, color: '#39FF14', fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: '#bbb' }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          
          {/* Background effect */}
          <Box 
            sx={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 90% 90%, rgba(57, 255, 20, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
              zIndex: 0
            }}
          />
        </Paper>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 8,
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.15) 0%, rgba(0, 230, 118, 0.05) 100%)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 3, 
                fontWeight: 'bold',
                textShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              Ready to find the best odds?
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                maxWidth: '700px', 
                mx: 'auto',
                color: '#ccc'
              }}
            >
              Join thousands of bettors who are maximizing their edge with Beat the Books
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleViewOdds}
                sx={{ 
                  background: 'linear-gradient(45deg, #39FF14 30%, #00E676 90%)',
                  color: '#000',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(57, 255, 20, 0.4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00E676 30%, #39FF14 90%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 6px 25px rgba(57, 255, 20, 0.6)'
                  }
                }}
              >
                VIEW LIVE ODDS NOW
              </Button>
              
              {!currentUser ? (
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => handleOpenAuthModal(1)}
                  sx={{ 
                    borderColor: '#39FF14',
                    color: '#39FF14',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00E676',
                      backgroundColor: 'rgba(57, 255, 20, 0.1)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  CREATE ACCOUNT
                </Button>
              ) : (
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigateTo('profile')}
                  sx={{ 
                    borderColor: '#39FF14',
                    color: '#39FF14',
                    fontWeight: 'bold',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#00E676',
                      backgroundColor: 'rgba(57, 255, 20, 0.1)',
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  MY PROFILE
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Background effect */}
          <Box 
            sx={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 50% 50%, rgba(57, 255, 20, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
              zIndex: 0
            }}
          />
        </Box>
      </motion.div>
      
      {/* Authentication Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={handleCloseAuthModal} 
        initialTab={authTab} 
      />
    </Container>
    </>
  );
};

export default HomePage;
