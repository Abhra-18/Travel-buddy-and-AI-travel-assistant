const express = require('express');
const router = express.Router();
const { submitAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitAssessment);

module.exports = router;
