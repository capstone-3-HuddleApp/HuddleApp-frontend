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
            geolocation.latitude,
            geolocation.longitude,
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

  // shows all events or just picked category
  const categoryFiltered = selectedCategory
    ? events.filter((e) => e.category === selectedCategory)
    : events;

    console.log(categoryFiltered)

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
    <main className="mx-auto w-full max-w-5xl pb-28 pt-4 sm:pt-6">
      {loadEvents && <p>Loading Events...</p>}
      {eventsError && <p className="text-red-500">{eventsError}</p>}

      {!loadEvents && !eventsError && (
        <div className="space-y-5">
          <div className="flex justify-end px-1">
            <div className="flex items-center gap-2 rounded-2xl border border-[#d8cdb6] bg-[#fff9df]/90 p-2 text-xs font-semibold text-[#566474] shadow-[0_8px_20px_rgba(104,72,38,0.14)]">
              <label htmlFor="discover-zipcode">Zip Code:</label>
              <input
                id="discover-zipcode"
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                className="w-20 rounded-lg border border-[#d8cdb6] bg-[#fff9df] px-2 py-2 text-[#29272b] outline-none focus:border-[#f2a451] focus:ring-2 focus:ring-[#f2a451]/20"
              />
              <button
                onClick={handleZipConfirm}
                className="rounded-lg border border-[#df8b2f] bg-[#ffe991] px-3 py-2 font-bold text-[#29272b] transition hover:bg-[#ffdf6b]"
              >
                Enter
              </button>
            </div>
          </div>

          {/* popular events + zip code */}
          <section className="rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-4 shadow-sm sm:p-6">
            <div className="mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#29272b] sm:text-2xl">
                  {confirmedZip ? "Popular Events near you" : "Popular Events"}
                </h2>
                <p className="mt-1 text-sm text-[#7d8794]">Discover something new in your community.</p>
              </div>
            </div>

          <RecEvents
            popularEvents={popularEvents}
            toggleSaved={toggleSaved}
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
