const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default async function fetchMessages(eventId) {
  try {
    const response = await fetch(`${BASE_URL}/api/messages/event/${eventId}`, {
      credentials: 'include',
    });
    
    console.log('Messages response status:', response.status);
    
    if (!response.ok) throw new Error('Failed to load messages');
    
    const initialMessages = await response.json();
    console.log('Messages loaded:', initialMessages);
    return initialMessages;
  } catch (err) {
    console.error('Error fetching messages:', err);
    throw err;
  }
}