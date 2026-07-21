const express = require('express');
const router = express.Router();
const { generateSuggestion } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateSuggestion);

module.exports = router;
