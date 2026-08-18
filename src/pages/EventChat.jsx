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

  console.log('user id:', user.id)



  return (
    <div className="flex flex-col p-4 ">
      {messages.length === 0 ? (
        <p className="text-center text-[#7d8794]">
          No messages yet. Start the conversation!
        </p>
      ) : (
        messages.map((msg) => (
          
          <div
            key={msg.id}
            className={`mb-4 flex ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}
          >{console.log(msg)}
            <div
            onClick={()=>{
                if (ishidden === 'hidden') {
                    setHidden('')
                }else{setHidden('hidden')}
            }}
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.user_id === user.id ? "bg-[#cae4ed] text-[#29272b]" : "bg-[#f8d8aa] text-[#29272b]"}`}
            >
            <p className="text-[0.7rem]">{msg?.sender?.username}</p>
              <p className="text-sm font-semibold">{msg.message}</p>
              {console.log('msg:', msg.user_id)}
              {console.log('user:', user.id)}
              <p>{msg.content}</p>
              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
