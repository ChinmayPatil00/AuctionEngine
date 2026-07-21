const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');

// @desc    Get all media for a user
// @route   GET /api/media
// @access  Private
const getMedia = async (req, res) => {
  try {
    const media = await Media.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload new media
// @route   POST /api/media
// @access  Private
const uploadMedia = async (req, res) => {
  try {
    console.log("uploadMedia controller hit! req.file:", req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';
    const size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    // Create URL path for frontend to access (assuming server serves /uploads)
    const url = `/uploads/${file.filename}`;

    const media = await Media.create({
      user: req.user.id,
      name: file.originalname,
      type,
      size,
      url
    });

    console.log("Media created:", media);
    res.status(201).json(media);
  } catch (error) {
    console.error("Error in uploadMedia:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', media.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMedia,
  uploadMedia,
  deleteMedia
};
