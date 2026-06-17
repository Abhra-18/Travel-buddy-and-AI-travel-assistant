const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/assistantController');
const { protect } = require('../middleware/authMiddleware');

// Chat endpoint, protected so only logged-in users can access
router.post('/chat', protect, handleChat);

module.exports = router;
