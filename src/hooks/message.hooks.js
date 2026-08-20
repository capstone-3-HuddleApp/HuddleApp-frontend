import { useEffect, useState } from "react";
import { getSocket, initSocket } from "../api/socket";
import { fetchMessages, postMessage } from "../api/messeges";

export const useEventChat = (eventId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    if (!eventId) return;

    const addMessage = (message) => {
      setMessages((previousMessages) => {
        if (
          message.id &&
          previousMessages.some(
            (existingMessage) => existingMessage.id === message.id,
          )
        ) {
          return previousMessages;
        }

        return [...previousMessages, message].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    };

    const joinEventRoom = () => {
      socket.emit("join_event", eventId);
    };

    const receiveSentMessage = (event) => {
      if (String(event.detail?.event_id) === String(eventId)) {
        addMessage(event.detail);
      }
    };

    async function loadAndJoin() {
      try {
        initSocket();
        socket.on("receive_event_message", addMessage);
        socket.on("connect", joinEventRoom);
        window.addEventListener("event-message-sent", receiveSentMessage);

        joinEventRoom();

        const initialMessages = await fetchMessages(eventId);
        setMessages(initialMessages);
        setIsLoading(false);
      } catch (err) {
        console.error("Error in loadAndJoin:", err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    loadAndJoin();

    return () => {
      socket.off("receive_event_message", addMessage);
      socket.off("connect", joinEventRoom);
      window.removeEventListener("event-message-sent", receiveSentMessage);
    };
  }, [eventId, socket]);

  return { messages, setMessages, isLoading, error };
};

export const useSendMessage = (eventId, userId) => {
  const socket = getSocket();

  const sendMsg = async (messageText) => {
    try {
      const savedMessage = await postMessage(eventId, userId, messageText);

      window.dispatchEvent(
        new CustomEvent("event-message-sent", { detail: savedMessage }),
      );
      socket.emit("send_event_message", savedMessage);

      return savedMessage;
    } catch (err) {
      console.error("Error:", err);
      throw err;
    }
  };

  return { sendMessage: sendMsg };
};
