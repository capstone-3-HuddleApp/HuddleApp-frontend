import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { getEventsParticipating } from "../api/events";
import ChatRoomListItem from "../components/ChatRoomListItem";

export default function ChatRoom({ user }) {
  const [events, setEvents] = useState([]);
  const [error, setEventsError] = useState(null);
  const [isLoading, setLoadEvents] = useState(true);
  const { selectedCategory = "", roomSearchQuery = "" } = useOutletContext();

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
    return (
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-(--text)">
        Loading chats...
      </p>
    );
  }

  if (error) {
    return (
      <p className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#e89a87] bg-[#f9c9b8] px-4 py-3 text-center text-sm font-semibold text-[#7d2f24]">
        {error}
      </p>
    );
  }

  const normalizedQuery = roomSearchQuery.trim().toLowerCase();
  const normalizedCategory = selectedCategory.trim().toLowerCase();
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !normalizedQuery || event.name?.toLowerCase().includes(normalizedQuery);
    const matchesCategory =
      !normalizedCategory ||
      event.category?.toLowerCase() === normalizedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto w-full max-w-3xl pb-28 pt-3 sm:pt-5">
      <section className="mb-4 px-2 sm:px-0">
        <h1 className="text-2xl font-extrabold text-(--text-h)">Chats</h1>
        <p className="mt-1 text-sm text-(--text)">
          Keep up with the events you joined.
        </p>
      </section>

      {events.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#d8cdb6] bg-[#f8d8aa]/50 px-5 py-10 text-center">
          <h2 className="font-extrabold text-(--text-h)">No chats yet</h2>
          <p className="mt-1 text-sm text-(--text)">
            Join an event to open its group conversation.
          </p>
        </section>
      ) : filteredEvents.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#d8cdb6] bg-[#f8d8aa]/50 px-5 py-10 text-center">
          <h2 className="font-extrabold text-(--text-h)">No matching chats</h2>
          <p className="mt-1 text-sm text-(--text)">
            Try another room name or event category.
          </p>
        </section>
      ) : (
        <ol className="overflow-hidden rounded-2xl border border-[#d8cdb6] bg-[#fff9df]/65 shadow-[0_16px_36px_rgba(104,72,38,0.22)]">
          {filteredEvents.map((event) => (
            <ChatRoomListItem key={event.id} event={event} />
          ))}
        </ol>
      )}
    </main>
  );
}
