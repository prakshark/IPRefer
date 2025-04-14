const express = require('express');
const router = express.Router();
const IP = require('../models/IP');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const auth = require('../middleware/auth');

// Create new IP
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { category, name, description, dateOfCreation } = req.body;
    
    const ip = new IP({
      category,
      name,
      description,
      dateOfCreation,
      owner: req.user.id
    });

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      const uploadResults = await Promise.all(uploadPromises);
      
      ip.images = uploadResults.map(result => ({
        url: result.url,
        public_id: result.public_id
      }));
    }

    await ip.save();
    res.status(201).json(ip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all IPs for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const ips = await IP.find({ owner: req.user.id });
    res.json(ips);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single IP
router.get('/:id', auth, async (req, res) => {
  try {
    const ip = await IP.findOne({ _id: req.params.id, owner: req.user.id });
    if (!ip) {
      return res.status(404).json({ message: 'IP not found' });
    }
    res.json(ip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update IP
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { category, name, description, dateOfCreation } = req.body;
    const ip = await IP.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!ip) {
      return res.status(404).json({ message: 'IP not found' });
    }

    ip.category = category || ip.category;
    ip.name = name || ip.name;
    ip.description = description || ip.description;
    ip.dateOfCreation = dateOfCreation || ip.dateOfCreation;

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.path));
      const uploadResults = await Promise.all(uploadPromises);
      
      ip.images = [...ip.images, ...uploadResults.map(result => ({
        url: result.url,
        public_id: result.public_id
      }))];
    }

    await ip.save();
    res.json(ip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete IP
router.delete('/:id', auth, async (req, res) => {
  try {
    const ip = await IP.findOne({ _id: req.params.id, owner: req.user.id });
    
    if (!ip) {
      return res.status(404).json({ message: 'IP not found' });
    }

    // Delete images from Cloudinary
    if (ip.images && ip.images.length > 0) {
      const deletePromises = ip.images.map(image => 
        cloudinary.uploader.destroy(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    await ip.remove();
    res.json({ message: 'IP deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 