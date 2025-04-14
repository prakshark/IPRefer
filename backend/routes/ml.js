const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const IPAsset = require('../models/IPAsset');
const User = require('../models/User');
const sharp = require('sharp');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function to get image features
async function getImageFeatures(imagePath) {
  try {
    // Read and preprocess image
    const imageBuffer = await fs.promises.readFile(imagePath);
    const processedImage = await sharp(imageBuffer)
      .resize(224, 224)
      .raw()
      .toBuffer();

    // Convert to array of pixel values
    const pixels = new Uint8ClampedArray(processedImage);
    const features = [];
    
    // Simple feature extraction: average RGB values for each 8x8 block
    for (let y = 0; y < 224; y += 8) {
      for (let x = 0; x < 224; x += 8) {
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let blockY = 0; blockY < 8 && y + blockY < 224; blockY++) {
          for (let blockX = 0; blockX < 8 && x + blockX < 224; blockX++) {
            const idx = ((y + blockY) * 224 + (x + blockX)) * 4;
            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            count++;
          }
        }
        
        features.push(r / count, g / count, b / count);
      }
    }
    
    return features;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
}

// Check if similar image exists
router.post('/check-similarity', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const uploadedImagePath = req.file.path;
    const uploadedFeatures = await getImageFeatures(uploadedImagePath);

    // TODO: Compare with existing images in database
    // For now, we'll just return the features
    res.json({
      message: 'Image processed successfully',
      features: uploadedFeatures
    });

    // Clean up uploaded file
    fs.unlinkSync(uploadedImagePath);
  } catch (error) {
    console.error('Error in check-similarity:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Image classification endpoint
router.post('/classify', async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ error: 'Image path is required' });
    }

    // Read and preprocess image
    const imageBuffer = fs.readFileSync(imagePath);
    const processedImage = await sharp(imageBuffer)
      .resize(224, 224)
      .raw()
      .toBuffer();

    // Convert to array of pixel values
    const pixels = new Uint8ClampedArray(processedImage);
    const features = [];
    
    // Simple feature extraction: average RGB values for each 8x8 block
    for (let y = 0; y < 224; y += 8) {
      for (let x = 0; x < 224; x += 8) {
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        for (let blockY = 0; blockY < 8 && y + blockY < 224; blockY++) {
          for (let blockX = 0; blockX < 8 && x + blockX < 224; blockX++) {
            const idx = ((y + blockY) * 224 + (x + blockX)) * 4;
            r += pixels[idx];
            g += pixels[idx + 1];
            b += pixels[idx + 2];
            count++;
          }
        }
        
        features.push(r / count, g / count, b / count);
      }
    }
    
    res.json({ features });
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

module.exports = router; 