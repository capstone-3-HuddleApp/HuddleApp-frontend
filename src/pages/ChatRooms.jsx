import { useState, useEffect } from "react";
import { getEventsParticipating } from "../api/events";
import userIcon from '../assets/interface_icons/user.svg'
import { useNavigate } from "react-router";

export default function ChatRoom({ user }) {
  const [events, setEvents] = useState([]);
  const [error, setEventsError] = useState(null);
  const [isLoading, setLoadEvents] = useState(true);
  const navigate = useNavigate(); // ← Initialize useNavigate

  useEffect(() => {
    async function loadAllEvents() {
      try {
        const allEvents = await getEventsParticipating(user.id);
        setEvents(allEvents);
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


  const handleClick = (event_id) => {
    navigate(`/room/${event_id}`); // ← Use navigate() to go to that event room
  };

  return (
    <ol className="flex flex-col justify-start items-start gap-2">
      {events.map((event) => (
        <li
          
          className="flex flex-row text-start p-1 border-0 text-[0.9rem] font-extrabold h-15 w-full"
          key={event.id}
        >
          <section className="w-10 h-9 m-2 bg-white rounded-full p-2">
            <img src={userIcon} alt="" />
          </section>
          
          <section onClick={() => handleClick(event.id)}  className="cursor-pointer flex flex-col w-full justify-center">
            <p className="h-5 overflow-clip">{event.name}</p>
            <p className="h-5"></p>
          </section>
        </li>
      ))}
    </ol>
  );
}