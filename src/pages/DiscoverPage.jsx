import { useState, useEffect } from "react";
// import { useAuth0 } from "@auth0/auth0-react";
// import { getProtected } from "../api/auth";
import { getEvents } from "../api/events";

import EventCard from "../components/EventCard";
import RecEvents from "../components/RecEvents";
import SavedEvents from "../components/SavedEvents";

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
export default function DiscoverPage({ user }) {
  // const { isAuthenticated: isAuth0User, getAccessTokenSilently } = useAuth0();
  // const [result, setResult] = useState(null);
  // const [error, setError] = useState(null);
  // const [isLoading, setIsLoading] = useState(false);

  // events data
  const [events, setAllEvents] = useState([]);
  const [loadEvents, setLoadEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // filtering
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  //zip code
  const [zipInput, setZipInput] = useState("");
  const [confirmedZip, setConfirmedZip] = useState(""); // updates when enter button is clicked

  // const categories = ["Arts", "Music", "Education", "Entertainment"]

  // Load all events once, when the page first appears.
  useEffect(() => {
    async function loadAllEvents() {
      try {
        const allEvents = await getEvents();
        setAllEvents(allEvents);
      } catch (err) {
        setEventsError(err.message);
      } finally {
        setLoadEvents(false);
      }
    }
    loadAllEvents();
  }, []);

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

  // shows all events or just picked category
  const categoryFiltered = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

  // popular events + fitltered events by zip code
  const popularEvents = confirmedZip
    ? categoryFiltered.filter((e) => e.zipcode === confirmedZip)
    : categoryFiltered;

  // bookmarked events
  const savedEvents = categoryFiltered.filter((e) => e.saved);

  const pastEvents = categoryFiltered.filter(
    (e) => new Date(e.time) < new Date(),
  );

  return (
    <>
      {loadEvents && <p>Loading Events...</p>}
      {eventsError && <p className="text-red-500">{eventsError}</p>}

      {!loadEvents && !eventsError && (
        <>
          {/* popular events + zip code */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="">
              {confirmedZip ? "Popular Events near you" : "Popular Events"}
            </h2>
            <div className="flex items-center gap-1 text-xs">
              <span>Zip Code:</span>
              <input
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                className="border rounded px-2 py-1 w-20"
              />
              <button
                onClick={handleZipConfirm}
                className="border rounded px-2 py-1"
              >
                Enter
              </button>
            </div>
          </div>
          <RecEvents
            popularEvents={popularEvents}
            toggleSaved={toggleSaved}
          ></RecEvents>

          {/* saved events */}
          <SavedEvents savedEvents={savedEvents} toggleSaved={toggleSaved} />

          {/* past events */}
          <h2 className="">Past Events</h2>
          <div className="grid grid-cols-2 gap-2 mb-20">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="past" />
            ))}
          </div>
        </>
      )}
    </>
  );
}
