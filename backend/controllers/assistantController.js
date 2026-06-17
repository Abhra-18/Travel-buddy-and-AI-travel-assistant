const asyncHandler = require('express-async-handler');
const { chatWithGemini } = require('../utils/geminiClient');

// @route   POST /api/assistant/chat
// @access  Private
const handleChat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required.');
  }

  // Define a system prompt or context to prepend to the conversation if it's new
  // In the Gemini API, context can be managed by the first message in the history.
  // We will assume the frontend handles the history correctly.

  const aiResponse = await chatWithGemini(history, message);

  if (!aiResponse) {
    res.status(500);
    throw new Error('Failed to generate response from AI Assistant.');
  }

  res.status(200).json({
    success: true,
    data: aiResponse,
  });
});

module.exports = {
  handleChat,
};
