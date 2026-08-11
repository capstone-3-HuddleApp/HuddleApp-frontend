// components/EventChat.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { getEventsParticipating } from "../api/events";
import { useEventChat, useSendMessage } from "../hooks/message.hooks";

export default function EventChat({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [input, setInput] = useState("");
  const [verifyError, setVerifyError] = useState(null);
  const messagesEndRef = useRef(null);
  const [ishidden, setHidden] = useState('hidden')

  //Custom hooks handle socket logic
  const { messages, isLoading, error } = useEventChat(eventId);

  // Verify user is a participant and fetch event
  useEffect(() => {
    async function verifyParticipant() {
      try {
        const participatingEvents = await getEventsParticipating();
        const foundEvent = participatingEvents.find(
          (e) => e.id === parseInt(eventId),
        );

        if (!foundEvent) {
          setVerifyError("You are not a participant in this event");
          setTimeout(() => navigate("/chat-rooms"), 2000);
          return;
        }

        setEvent(foundEvent);
      } catch (err) {
        setVerifyError(err.message);
        setTimeout(() => navigate("/chatroom"), 2000);
      }
    }

    verifyParticipant();
  }, [eventId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return <p>Loading chat...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }


  return (
    <div className="flex flex-1 h-full flex-col-reverse overflow-y-auto p-4 ">
      {messages.length === 0 ? (
        <p className="text-center text-gray-500">
          No messages yet. Start the conversation!
        </p>
      ) : (
        messages.map((msg) => (
            
          <div
          {...console.log(msg)}
            key={msg.id}
            className={`mb-4 flex ${msg.userId === user.id ? "justify-end" : "justify-start"}`}
          >
            <div
            onClick={()=>{
                if (ishidden === 'hidden') {
                    setHidden('')
                }else{setHidden('hidden')}
            }}
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.userId === user.id ? "bg-blue-500 text-black" : "bg-gray-300 text-black"}`}
            >
              <p className="text-sm font-semibold">{msg.message}</p>
              <p>{msg.content}</p>
              <small className={`text-[0.7rem] ${ishidden}`}>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
