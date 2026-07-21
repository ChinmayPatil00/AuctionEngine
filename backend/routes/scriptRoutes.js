const express = require('express');
const router = express.Router();
const { getScripts, createScript, updateScript, deleteScript } = require('../controllers/scriptController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getScripts)
  .post(protect, createScript);

router.route('/:id')
  .patch(protect, updateScript)
  .delete(protect, deleteScript);

module.exports = router;
