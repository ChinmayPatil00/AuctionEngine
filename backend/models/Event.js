const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['YouTube', 'Shorts', 'TikTok'],
  },
  status: {
    type: String,
    default: 'Scripting',
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
