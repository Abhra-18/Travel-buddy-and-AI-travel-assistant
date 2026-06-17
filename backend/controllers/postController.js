const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, image } = req.body;

  if (!content && !image) {
    res.status(400);
    throw new Error('Please provide content or an image');
  }

  let post = await Post.create({
    author: req.user._id,
    content: content || '',
    image: image || '',
  });

  post = await post.populate('author', 'name profilePicture');

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Get social feed (following + global mix) with pagination & search
// @route   GET /api/posts/feed
// @access  Private
const getFeed = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const followingIds = currentUser.following || [];
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;
  const search = req.query.search?.trim() || '';

  const searchFilter = search
    ? { content: { $regex: search, $options: 'i' } }
    : {};

  // Fetch from followed users + own posts
  const followFilter = {
    author: { $in: [...followingIds, req.user._id] },
    ...searchFilter,
  };

  let posts = await Post.find(followFilter)
    .populate('author', 'name profilePicture isVerified')
    .populate('comments.user', 'name profilePicture')
    .sort({ createdAt: -1 });

  // Backfill with global posts if sparse
  if (posts.length < 5 && !search) {
    const globalPosts = await Post.find({
      author: { $nin: [...followingIds, req.user._id] },
    })
      .populate('author', 'name profilePicture isVerified')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    posts = [...posts, ...globalPosts];
  }

  const total = posts.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = posts.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    data: paginated,
    page,
    totalPages,
    total,
  });
});

// @desc    Toggle Like on a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const hasLiked = post.likes.includes(req.user._id);

  if (hasLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post.likes,
  });
});

// @desc    Add a comment
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = {
    user: req.user._id,
    text,
  };

  post.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(req.params.id)
    .populate('author', 'name profilePicture')
    .populate('comments.user', 'name profilePicture');

  res.status(201).json({
    success: true,
    data: updatedPost.comments,
  });
});

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
};
