const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  uploadID,
  updateEmergencyContacts,
  blockUser,
  reportUser,
} = require('../controllers/safetyController');

router.post('/upload-id', protect, uploadID);
router.put('/emergency-contacts', protect, updateEmergencyContacts);
router.post('/block/:id', protect, blockUser);
router.post('/report/:id', protect, reportUser);

module.exports = router;
