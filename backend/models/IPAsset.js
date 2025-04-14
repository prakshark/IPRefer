const mongoose = require('mongoose');

const ipAssetSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['companyName', 'tagline', 'logo'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: function() {
      return this.type === 'logo';
    }
  },
  description: {
    type: String
  },
  infringementAttempts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['warning', 'infringement'],
      default: 'warning'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create text index for content field
ipAssetSchema.index({ content: 'text' });

module.exports = mongoose.model('IPAsset', ipAssetSchema); 