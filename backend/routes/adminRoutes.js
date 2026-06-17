const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
  getReports,
  resolveReport,
} = require('../controllers/adminController');

// All admin routes require both authentication and admin role
router.get('/verifications', protect, adminOnly, getPendingVerifications);
router.put('/verify/:id/approve', protect, adminOnly, approveVerification);
router.put('/verify/:id/reject', protect, adminOnly, rejectVerification);
router.get('/reports', protect, adminOnly, getReports);
router.post('/reports/:id/resolve', protect, adminOnly, resolveReport);

module.exports = router;
