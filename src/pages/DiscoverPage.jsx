import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
// import { useAuth0 } from "@auth0/auth0-react";
// import { getProtected } from "../api/auth";
import { getEvents } from "../api/events";

import RecEvents from "../components/RecEvents";
import SavedEvents from "../components/SavedEvents";
import PrevEvents from "../components/PrevEvents";

// A page to TEST the protected backend endpoint. ProtectedRoute makes sure you
// can only get here when logged in; the button then calls /api/protected and
// shows what came back.
//
// This is the one place where the two kinds of login look different in the
// frontend, so it's worth reading closely:
//
//   password user -> the JWT is in an httpOnly cookie. We send NOTHING extra;
//                    the browser attaches the cookie by itself.
//   Auth0 user    -> the token lives inside Auth0's SDK, so we have to fetch
//                    it and send it in an Authorization header.
//
// The backend's requireAuth accepts either, which is why ONE endpoint serves
// both. Look at `via` in the response to see which door you came through.
export default function DiscoverPage({ geolocation, getLocation }) {
  // const { isAuthenticated: isAuth0User, getAccessTokenSilently } = useAuth0();
  // const [result, setResult] = useState(null);
  // const [error, setError] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  // events data
  const [events, setAllEvents] = useState([]);
  const [loadEvents, setLoadEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // filtering
  const { selectedCategory } = useOutletContext();
  //zip code
  const [zipInput, setZipInput] = useState("");
  const [confirmedZip, setConfirmedZip] = useState(""); // updates when enter button is clicked

  // const categories = ["Arts", "Music", "Education", "Entertainment"]

  // Load all events once, when the page first appears.
  useEffect(() => {
    async function loadAllEvents() {
      try {
        await getLocation();

        let allEvents = [];
        if (geolocation) {
          allEvents = await getEvents(
            null,
            geolocation.longitude,
            geolocation.latitude,
          );
        } else {
          allEvents = await getEvents();
        }

        setAllEvents(allEvents);
      } catch (err) {
        setEventsError(err.message);
      } finally {
        setLoadEvents(false);
      }
    }
    loadAllEvents();
  }, [geolocation]);

  function toggleSaved(id) {
    setAllEvents(
      events.map((event) =>
        event.id === id ? { ...event, saved: !event.saved } : event,
      ),
    );
  }

  // signs user up for event
  // async function handleJoinEvent(eventId) {
  //   if(!user?.id) return
  //     try {
  //       await addUserToEvent(user.id, eventId)
  //     } catch (err) {
  //       console.error("Failed to join event:", err.message)
  //     }
  //   }

  function handleZipConfirm() {
    setConfirmedZip(zipInput.trim());
  }

  // Helper function to separate current and past events
  function filterEventsByTime(events) {
    const now = new Date();
    return {
      currentEvents: events.filter((e) => new Date(e.time) >= now),
      pastEvents: events.filter((e) => new Date(e.time) < now),
    };
  }

  // shows all events or just picked category
  const categoryFiltered = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

  console.log(categoryFiltered);

  // popular events + fitltered events by zip code
  const popularEvents = confirmedZip
    ? categoryFiltered.filter((e) => e.zipcode === confirmedZip)
    : categoryFiltered;

  const { currentEvents, pastEvents } = filterEventsByTime(popularEvents);

  // bookmarked events
  const savedEvents = currentEvents.filter((e) => e.saved);

  return (
    <main className="mx-auto w-full max-w-5xl pb-28 pt-4 sm:pt-6">
      {loadEvents && <p>Loading Events...</p>}
      {eventsError && <p className="text-red-500">{eventsError}</p>}

      {!loadEvents && !eventsError && (
        <div className="space-y-5">
       
          {/* popular events + zip code */}
          <section className="rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-4 shadow-sm sm:p-6">

          <RecEvents
            popularEvents={currentEvents}
            toggleSaved={toggleSaved}
            geolocation={geolocation}
            zipInput={zipInput}
            setZipInput={setZipInput}
            handleZipConfirm={handleZipConfirm}
          ></RecEvents>
          </section>
          {/* saved events */}
          <section className="rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-[#29272b] sm:text-2xl">Saved Events</h2>
            <p className="mt-1 mb-4 text-sm text-[#7d8794]">Your bookmarked events, ready when you are.</p>
            {savedEvents.length > 0 ? (
              <SavedEvents savedEvents={savedEvents} toggleSaved={toggleSaved} />
            ) : (
              <p className="rounded-xl border border-dashed border-[#d8cdb6] bg-[#fff9df]/55 px-4 py-8 text-center text-sm text-[#7d8794]">No saved events yet.</p>
            )}
          </section>

          {/* past events */}
          <section className="rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-extrabold text-[#29272b] sm:text-2xl">Past Events</h2>
            <p className="mt-1 mb-4 text-sm text-[#7d8794]">Look back at events that have already ended.</p>
            {pastEvents.length > 0 ? (
              <PrevEvents popularEvents={pastEvents} toggleSaved={toggleSaved} />
            ) : (
              <p className="rounded-xl border border-dashed border-[#d8cdb6] bg-[#fff9df]/55 px-4 py-8 text-center text-sm text-[#7d8794]">No past events to show yet.</p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
