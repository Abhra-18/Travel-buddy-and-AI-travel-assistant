async function test() {
  try {
    const loginRes = await fetch('https://travel-buddy-and-ai-travel-assistant.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@travelmate.com', password: 'Password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    // Get conversations
    const convRes = await fetch('https://travel-buddy-and-ai-travel-assistant.onrender.com/api/messages/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const convData = await convRes.json();
    console.log('Conversations:', convData.data);
  } catch (err) {
    console.error(err);
  }
}
test();
