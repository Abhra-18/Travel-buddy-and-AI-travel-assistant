const express = require('express');
const router = express.Router();
const {
  generatePlan, savePlan,
  getMyPlans, getPlanById, deletePlan,
} = require('../controllers/tripPlanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generatePlan);
router.post('/save', protect, savePlan);
router.get('/', protect, getMyPlans);
router.get('/:id', protect, getPlanById);
router.delete('/:id', protect, deletePlan);

module.exports = router;
