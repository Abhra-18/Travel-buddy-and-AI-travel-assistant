const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. AI features will fall back to rule-based logic.');
}

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Get a Gemini model instance.
 * @returns {import('@google/generative-ai').GenerativeModel | null}
 */
const getModel = () => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

/**
 * Send a prompt to Gemini and return the text response.
 * Falls back to null if API key is missing or an error occurs.
 * @param {string} prompt
 * @returns {Promise<string | null>}
 */
const askGemini = async (prompt) => {
  const model = getModel();
  if (!model) return null;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return null;
  }
};

/**
 * Chat with Gemini using a conversation history.
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history 
 * @param {string} message 
 * @returns {Promise<string | null>}
 */
const chatWithGemini = async (history, message) => {
  const model = getModel();
  if (!model) return null;

  try {
    const chat = model.startChat({
      history: history || [],
    });
    
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (err) {
    console.error('Gemini API Chat error:', err.message);
    return null;
  }
};

module.exports = { askGemini, chatWithGemini };
