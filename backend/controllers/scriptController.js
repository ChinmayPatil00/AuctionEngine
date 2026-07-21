const Script = require('../models/Script');

// @desc    Get all scripts
// @route   GET /api/scripts
// @access  Public (should be Private in prod)
const getScripts = async (req, res) => {
  try {
    const scripts = await Script.find().sort({ createdAt: -1 });
    res.status(200).json(scripts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a script
// @route   POST /api/scripts
// @access  Public
const createScript = async (req, res) => {
  try {
    const { title } = req.body;
    const newScript = await Script.create({
      title: title || 'Untitled Script'
    });
    res.status(201).json(newScript);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a script (Debounced Auto-Save & Status changes)
// @route   PATCH /api/scripts/:id
// @access  Public
const updateScript = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Updates can include status (for drag-and-drop) or content (for auto-save)
    const updatedScript = await Script.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedScript) {
      return res.status(404).json({ message: 'Script not found' });
    }

    res.status(200).json(updatedScript);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a script
// @route   DELETE /api/scripts/:id
// @access  Public
const deleteScript = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Script.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Script not found' });
    }
    res.status(200).json({ message: 'Script removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getScripts,
  createScript,
  updateScript,
  deleteScript,
};
