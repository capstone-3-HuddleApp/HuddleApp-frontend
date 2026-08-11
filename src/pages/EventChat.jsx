// components/EventChat.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { getSocket, initSocket } from "../api/socket";
import { getEventsParticipating } from "../api/events";
import fetchMessages from "../api/messeges";

export default function EventChat({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = getSocket();
  const messagesEndRef = useRef(null);

  // Verify user is a participant and fetch event
  useEffect(() => {
    async function verifyParticipant() {
      try {
        const participatingEvents = await getEventsParticipating();
        console.log("Participating events:", participatingEvents);
        console.log("Looking for eventId:", eventId, "type:", typeof eventId);
        const foundEvent = participatingEvents.find(
          (e) => e.id === parseInt(eventId),
        );
        console.log("Found event:", foundEvent);

        if (!foundEvent) {
          setError("You are not a participant in this event");
          setTimeout(() => navigate("/chat-rooms"), 2000);
          return;
        }

        setEvent(foundEvent);
      } catch (err) {
        setError(err.message);
        setTimeout(() => navigate("/chatroom"), 2000);
      }
    }

    verifyParticipant();
  }, [eventId, navigate]);

  // Load messages and join socket room (only if verified)
  useEffect(() => {
    if (!event) return;

    async function loadAndJoin() {
      try {
        initSocket();
        const socket = getSocket();

        socket.emit("join_event", eventId);
        console.log(`✅ Joined room: event_${eventId}`);

        socket.on("receive_event_message", (data) => {
          setMessages((prev) => [...prev, data]);
        });

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
      socket.off("receive_event_message");
    };
  }, [event, eventId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    socket.emit("send_event_message", {
      eventId,
      userId: user.id,
      message: input,
    });

    setInput("");
  };

  if (isLoading) {
    return <p>Loading chat...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <div className="chat-container h-screen flex flex-col">
      <div className="p-4 bg-blue-500 text-white">
        <h2>{event?.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 flex ${msg.userId === user.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${msg.userId === user.id ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}
              >
                <p className="text-sm font-semibold">{msg.username}</p>
                <p>{msg.content}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </form>
    </div>
  );
}
