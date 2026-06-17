import API from './api';

export const chatWithAssistant = async (message, history) => {
  const response = await API.post('/assistant/chat', { message, history });
  return response.data.data;
};

const assistantService = {
  chatWithAssistant,
};

export default assistantService;
