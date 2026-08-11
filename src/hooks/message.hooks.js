import { useState, useEffect } from 'react';
import { getSocket, initSocket } from '../api/socket';
import fetchMessages from '../api/messeges';

export const useEventChat = (eventId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    if (!eventId) return;

    async function loadAndJoin() {
      try {
        initSocket();

        socket.emit('join_event', eventId);
        console.log(`✅ Joined room: event_${eventId}`);

        socket.on('receive_event_message', (data) => {
          setMessages((prev) => [...prev, data]);
        });

        const initialMessages = await fetchMessages(eventId);  // ← Use it here
        setMessages(initialMessages);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in loadAndJoin:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    loadAndJoin();

    return () => {
      socket.off('receive_event_message');
    };
  }, [eventId, socket]);

  return { messages, setMessages, isLoading, error };
};

export const useSendMessage = (eventId, userId) => {
  const socket = getSocket();

  const sendMessage = (messageText) => {
    if (!messageText.trim()) return;

    socket.emit('send_event_message', {
      eventId,
      userId,
      message: messageText,
    });
  };

  return { sendMessage };
};