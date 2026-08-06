// import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { initialEvents } from '../data/events'

export default function HomePage() {
  const [events, setEvents] = useState(initialEvents)
  return (
    <>
      <h1>Home/Default</h1>
      {events.map((event) => (
        <p key={event.id}>{event.title} — {event.category} — {event.date} — {event.time} — {event.price}</p>
      ))}
    </>
  );
}
