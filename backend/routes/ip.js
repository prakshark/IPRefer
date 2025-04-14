const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const IPAsset = require('../models/IPAsset');
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Add new IP asset
router.post('/add', auth, upload.single('image'), async (req, res) => {
  try {
    const { type, content, description } = req.body;
    
    // Check for similar content
    const similarAssets = await IPAsset.find({
      $text: { $search: content }
    });

    if (similarAssets.length > 0) {
      // Notify the owner of the similar asset
      const owner = await User.findById(similarAssets[0].owner);
      owner.notifications.push({
        type: 'infringement',
        message: `Someone tried to register similar content: ${content}`
      });
      await owner.save();

      return res.status(400).json({
        message: 'Similar content already exists',
        owner: owner.companyName
      });
    }

    const ipAsset = new IPAsset({
      owner: req.user._id,
      type,
      content,
      imageUrl: req.file ? req.file.path : null,
      description
    });

    await ipAsset.save();
    res.status(201).json(ipAsset);
  } catch (error) {
    console.error('Error adding IP asset:', error);
    res.status(500).json({ message: 'Error adding IP asset', error: error.message });
  }
});

// Get user's IP assets
router.get('/my-assets', auth, async (req, res) => {
  try {
    const assets = await IPAsset.find({ owner: req.user._id });
    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ message: 'Error fetching assets', error: error.message });
  }
});

// Get all IP assets (for explore page)
router.get('/explore', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const assets = await IPAsset.find(query).populate('owner', 'companyName');
    res.json(assets);
  } catch (error) {
    console.error('Error fetching explore assets:', error);
    res.status(500).json({ message: 'Error fetching assets', error: error.message });
  }
});

// Get IP asset details
router.get('/:id', auth, async (req, res) => {
  try {
    const asset = await IPAsset.findById(req.params.id).populate('owner', 'companyName');
    if (!asset) {
      return res.status(404).json({ message: 'IP asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ message: 'Error fetching asset details', error: error.message });
  }
});

module.exports = router; 