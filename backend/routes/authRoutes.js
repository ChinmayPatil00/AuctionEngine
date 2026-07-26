const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getUserHistory, depositFunds } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/history', protect, getUserHistory);
router.post('/deposit', protect, depositFunds);

module.exports = router;
