import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

function CheckAsset({ user }) {
  const [formData, setFormData] = useState({
    type: '',
    content: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ip/check', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setResult(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while checking the asset');
      setResult(null);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Check IP Asset
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <MenuItem value="logo">Logo</MenuItem>
                <MenuItem value="companyName">Company Name</MenuItem>
                <MenuItem value="tagline">Tagline</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Check Asset
            </Button>
          </form>
          
          {result && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                {result.exists ? (
                  <>
                    <Typography variant="h6" color="error" gutterBottom>
                      Warning: Similar Content Found
                    </Typography>
                    <Typography variant="body1">
                      This content is already registered by: {result.owner}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {result.message}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" color="success" gutterBottom>
                      No Similar Content Found
                    </Typography>
                    <Typography variant="body1">
                      {result.message}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default CheckAsset; 