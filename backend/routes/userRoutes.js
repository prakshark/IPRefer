const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const auth = require('../middleware/auth');

// Update user profile with image
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.file) {
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.path);
      
      // If user already has a profile image, delete it from Cloudinary
      if (user.profileImage && user.profileImage.public_id) {
        await cloudinary.uploader.destroy(user.profileImage.public_id);
      }

      user.profileImage = {
        url: uploadResult.url,
        public_id: uploadResult.public_id
      };
    }

    // Update other profile fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio) user.bio = req.body.bio;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 