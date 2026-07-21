const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'Untitled Script'
  },
  outline: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Idea Pool', 'Scripting', 'Production', 'Posted'],
    default: 'Idea Pool'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Temporarily optional to make testing easier without fully setting up auth if desired
    required: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Script', scriptSchema);
