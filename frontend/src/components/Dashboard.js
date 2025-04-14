import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [myAssets, setMyAssets] = useState([]);
  const [exploreAssets, setExploreAssets] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [newAsset, setNewAsset] = useState({
    type: '',
    content: '',
    description: '',
    image: null
  });
  const [error, setError] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (activeTab === 0) {
      fetchMyAssets();
    } else if (activeTab === 2) {
      fetchExploreAssets();
    }
  }, [activeTab, filterType, navigate]);

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/api/ip/my-assets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const data = await response.json();
      setMyAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Failed to fetch your assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExploreAssets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = new URL('http://localhost:5000/api/ip/explore');
      if (filterType) {
        url.searchParams.append('type', filterType);
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch explore assets');
      }
      
      const data = await response.json();
      setExploreAssets(data);
    } catch (error) {
      console.error('Error fetching explore assets:', error);
      setError('Failed to fetch explore assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleAddAsset = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('type', newAsset.type);
      formData.append('content', newAsset.content);
      formData.append('description', newAsset.description);
      if (newAsset.image) {
        formData.append('image', newAsset.image);
      }

      const response = await fetch('http://localhost:5000/api/ip/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add asset');
      }

      setOpenAddDialog(false);
      setNewAsset({
        type: '',
        content: '',
        description: '',
        image: null
      });
      fetchMyAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
      setError(error.message);
    }
  };

  const handleImageChange = (e) => {
    setNewAsset({
      ...newAsset,
      image: e.target.files[0]
    });
  };

  const handleAssetClick = async (assetId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/ip/${assetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch asset details');
      }
      
      const data = await response.json();
      setSelectedAsset(data);
    } catch (error) {
      console.error('Error fetching asset details:', error);
      setError('Failed to fetch asset details. Please try again.');
    }
  };

  if (loading && activeTab === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="My Intellectual Properties" />
          <Tab label="Add IP" />
          <Tab label="Explore" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            {myAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset._id}>
                <Card onClick={() => handleAssetClick(asset._id)} sx={{ cursor: 'pointer' }}>
                  {asset.imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={asset.imageUrl}
                      alt={asset.content}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6">{asset.content}</Typography>
                    <Typography color="textSecondary">{asset.type}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {myAssets.length === 0 && !loading && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  No IP assets registered yet. Add your first asset to get started!
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add New IP
          </Button>

          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
            <DialogTitle>Add New Intellectual Property</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="companyName">Company Name</MenuItem>
                  <MenuItem value="tagline">Tagline</MenuItem>
                  <MenuItem value="logo">Logo</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Content"
                value={newAsset.content}
                onChange={(e) => setNewAsset({ ...newAsset, content: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={newAsset.description}
                onChange={(e) => setNewAsset({ ...newAsset, description: e.target.value })}
                sx={{ mb: 2 }}
              />
              {newAsset.type === 'logo' && (
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddAsset} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <FormControl sx={{ mb: 3, minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="companyName">Company Name</MenuItem>
              <MenuItem value="tagline">Tagline</MenuItem>
              <MenuItem value="logo">Logo</MenuItem>
            </Select>
          </FormControl>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {exploreAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} key={asset._id}>
                  <Card onClick={() => handleAssetClick(asset._id)} sx={{ cursor: 'pointer' }}>
                    {asset.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={asset.imageUrl}
                        alt={asset.content}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h6">{asset.content}</Typography>
                      <Typography color="textSecondary">{asset.type}</Typography>
                      <Typography variant="body2">
                        Owner: {asset.owner.companyName}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {exploreAssets.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center">
                    No IP assets found. Be the first to add one!
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Box>
      )}

      <Dialog
        open={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedAsset && (
          <>
            <DialogTitle>IP Asset Details</DialogTitle>
            <DialogContent>
              {selectedAsset.imageUrl && (
                <Box sx={{ mb: 2 }}>
                  <img
                    src={selectedAsset.imageUrl}
                    alt={selectedAsset.content}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
              <Typography variant="h6" gutterBottom>
                {selectedAsset.content}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                Type: {selectedAsset.type}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Description: {selectedAsset.description}
              </Typography>
              <Typography variant="body2">
                Owner: {selectedAsset.owner.companyName}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAsset(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default Dashboard; 