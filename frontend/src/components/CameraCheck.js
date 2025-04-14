import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';
import * as ml5 from 'ml5';

function CameraCheck({ user }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [classifier, setClassifier] = useState(null);

  useEffect(() => {
    // Initialize ML5.js classifier
    const initClassifier = async () => {
      try {
        const classifier = await ml5.imageClassifier('MobileNet');
        setClassifier(classifier);
      } catch (err) {
        setError('Failed to initialize ML model');
      }
    };

    initClassifier();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureAndCheck = async () => {
    if (!classifier || !videoRef.current) return;

    setLoading(true);
    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Get classification
      const results = await classifier.classify(canvas);
      
      // Send to backend for checking
      const token = localStorage.getItem('token');
      const formData = new FormData();
      canvas.toBlob(blob => {
        formData.append('image', blob, 'capture.jpg');
      });
      
      const response = await axios.post('http://localhost:5000/api/ml/check-image', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      setError('');
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Camera Check
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ maxWidth: '100%', border: '1px solid #ccc' }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!stream ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={startCamera}
                >
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={captureAndCheck}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Check Logo'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </Button>
                </>
              )}
            </Box>
          </Box>
          
          {result && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                {result.found ? (
                  <>
                    <Typography variant="h6" color="error" gutterBottom>
                      Similar Logo Found
                    </Typography>
                    {result.matches.map((match, index) => (
                      <Box key={index} sx={{ mt: 2 }}>
                        <Typography variant="body1">
                          Owner: {match.owner}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Content: {match.content}
                        </Typography>
                        {match.imageUrl && (
                          <Box
                            component="img"
                            src={match.imageUrl}
                            alt="Matched logo"
                            sx={{ maxWidth: '200px', mt: 1 }}
                          />
                        )}
                      </Box>
                    ))}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" color="success" gutterBottom>
                      No Similar Logo Found
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

export default CameraCheck; 