import React from 'react';
import Slider from 'react-slick';
import { Box, Typography } from '@mui/material';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BookmakerCarousel = () => {
  const bookmakers = [
    { name: 'DraftKings', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/DraftKings_Logos.webp` },
    { name: 'LiveScore', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/LiveScore-New.png` },
    { name: 'Pinnacle', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/Pinnacle Logo.jpeg` },
    { name: 'Betsson', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/betsson.png` },
    { name: 'Coolbet', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/coolbet.png` },
    { name: 'Everygame', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/everygame.png` },
    { name: 'Nordic', logo: `${process.env.PUBLIC_URL}/Bookmaker Logos/nordic.png` }
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 4000,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  return (
    <Box sx={{ mt: 6, mb: 8, overflow: 'hidden' }}>
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          color: '#fff',
          fontWeight: 'bold',
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
        Supported Sportsbooks
      </Typography>

      <Slider {...settings}>
        {bookmakers.map((bookmaker, index) => (
          <Box 
            key={index}
            sx={{ 
              p: 2, 
              height: 80, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box 
              component="img"
              src={bookmaker.logo}
              alt={`${bookmaker.name} logo`}
              sx={{ 
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'grayscale(0.5)',
                transition: 'all 0.3s ease',
                opacity: 0.7,
                '&:hover': {
                  filter: 'grayscale(0)',
                  opacity: 1,
                  transform: 'scale(1.05)'
                }
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default BookmakerCarousel;
