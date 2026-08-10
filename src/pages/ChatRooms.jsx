import { useState, useEffect } from "react";
import { getEventsParticipating } from "../api/events";

export default function ChatRoom({ user }) {
  const [events, setEvents] = useState([]);
  const [error, setEventsError] = useState(null);
  const [isLoading, setLoadEvents] = useState(true);

  useEffect(() => {
    async function loadAllEvents() {
      try {
        const allEvents = await getEventsParticipating(user.id);
        // console.log('API response:', allEvents); 
        setEvents(allEvents); // allEvents is already an array, so this works
      } catch (err) {
        setEventsError(err.message);
      } finally {
        setLoadEvents(false);
      }
    }
    
    loadAllEvents();
  }, [user.id]);

  if (isLoading) {
    return <p>Loading</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <ol>
      {events.map((event) => (
        <li key={event.id}>{event.name}</li>
      ))}
    </ol>
  );
}