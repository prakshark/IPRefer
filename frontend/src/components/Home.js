import React from 'react';
import { Container, Typography, Box, Button, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Home = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to IPRefer
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Intellectual Property Protection Platform
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 