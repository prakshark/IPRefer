const mongoose = require('mongoose');

const ipSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['Copyrights', 'Trademarks', 'Patent', 'Design Ideas', 'Geographical Indications', 'Plant Variety', 'Semiconductor Board Design']
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dateOfCreation: {
    type: Date,
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'infringed', 'pending'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IP', ipSchema); 