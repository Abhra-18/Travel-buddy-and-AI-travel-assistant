const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
} = require('../controllers/postController');

router.route('/').post(protect, createPost);
router.route('/feed').get(protect, getFeed);
router.route('/:id/like').post(protect, toggleLike);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;
