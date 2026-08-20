const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const cache = {
  messages: {}, // keyed by eventId
  lastFetch: {},
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function isCacheValid(key) {
  return (
    cache.lastFetch[key] && Date.now() - cache.lastFetch[key] < CACHE_DURATION
  );
}

export async function fetchMessages(eventId) {
  const cacheKey = `messages_${eventId}`;

  if (cache.messages[eventId] && isCacheValid(cacheKey)) {
    return cache.messages[eventId];
  }


  try {
    const response = await fetch(`${BASE_URL}/api/messages/event/${eventId}`, {
      credentials: "include",
    });

    console.log("Messages response status:", response.status);

    if (!response.ok) throw new Error("Failed to load messages");

    const initialMessages = await response.json();
    console.log("Messages loaded:", initialMessages);
    cache.messages[eventId] = initialMessages;
    cache.lastFetch[cacheKey] = Date.now();

    return initialMessages;
  } catch (err) {
    console.error("Error fetching messages:", err);
    throw err;
  }
}

export async function postMessage(eventId, userId, messageText) {
  if (!messageText.trim()) return;

  try {
    const res = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ eventId, userId, content: messageText }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Could not send message (${res.status})`);
    }
    const savedMessage = await res.json();

    // Keep the room cache synchronized so reopening the chat includes this message.
    const cachedMessages = cache.messages[eventId] || [];
    if (!cachedMessages.some((message) => message.id === savedMessage.id)) {
      cache.messages[eventId] = [...cachedMessages, savedMessage];
    }
    cache.lastFetch[`messages_${eventId}`] = Date.now();

    console.log(savedMessage);
    return savedMessage;
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}
