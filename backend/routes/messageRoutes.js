const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDirectMessages,
  getTripMessages,
  getConversations,
  sendDirectMessage,
  sendTripMessage
} = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/trip/:tripId', getTripMessages);
router.post('/trip/:tripId', sendTripMessage);
router.get('/:userId', getDirectMessages);
router.post('/:userId', sendDirectMessage);

module.exports = router;
