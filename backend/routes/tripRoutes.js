const express = require('express');
const router = express.Router();
const {
  getTrips, getTripById, getMyTrips,
  createTrip, updateTrip, deleteTrip,
  joinTrip, leaveTrip, getSharedTrips,
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTrips).post(protect, createTrip);
router.get('/my', protect, getMyTrips);
router.route('/:id').get(protect, getTripById).put(protect, updateTrip).delete(protect, deleteTrip);
router.post('/:id/join', protect, joinTrip);
router.post('/:id/leave', protect, leaveTrip);
router.get('/shared/:userId', protect, getSharedTrips);

module.exports = router;
