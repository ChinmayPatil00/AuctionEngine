const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMedia, uploadMedia, deleteMedia } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.route('/')
  .get(protect, getMedia)
  .post(protect, upload.single('file'), uploadMedia);

router.route('/:id').delete(protect, deleteMedia);

module.exports = router;
