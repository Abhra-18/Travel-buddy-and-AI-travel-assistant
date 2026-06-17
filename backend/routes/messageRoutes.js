const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDirectMessages,
  getTripMessages,
  getConversations
} = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/trip/:tripId', getTripMessages);
router.get('/:userId', getDirectMessages);

module.exports = router;
