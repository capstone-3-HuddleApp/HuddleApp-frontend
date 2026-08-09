// Import necessary tools from React Router for navigation and reading the URL
import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { getEvent } from "../api/events";
// Import the updated mock data from the events file so we can display real event details
// Adjust this path if your file is named exactly 'event.js' instead of 'events.js'
import { initialEvents } from "../data/events";

// Main component for displaying the details of a single event
export default function EventDetailPage() {
  const [Event, setEvent] = useState(null);
  const [isloading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grab the event ID directly from the webpage URL
  const { id } = useParams();

  // Find the specific event from the mock data that matches this ID
  const event = initialEvents.find((e) => e.id == id);

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  console.log(Event);

  //Converts the IsoDateTime of our database into a date object and formats it accordingly
  //Returns an object with date and time keys
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);

    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }), //Result: "Sep 12, 2026"
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }), //Result: "6:00 PM"
    };
  };

  if (isloading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // If the URL has an ID that doesn't exist in our data, show a clean fallback screen
  if (!Event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Event Not Found 😢
        </h2>
        <p className="text-gray-500 mb-4">
          We couldn't find the details for this event.
        </p>
        <Link to="/" className="text-blue-600 font-medium hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  // Calculate the percentage of the attendee goal reached to fill the visual progress bar
  const progressPercentage = Math.round(
    (event.attendeeCount / event.attendeeGoal) * 100,
  );

  // Get the first letter of the organizer's name to use as their profile avatar
  const organizerInitial = event.organizer ? event.organizer.charAt(0) : "?";
  const { date, time } = formatDateTime(Event.time);

  //tailwind styles
  const grid_div = "bg-purple-300 p-4 rounded-2xl shadow-sm border border-gray-100"
  const grid_text = " text-red-800 text-[0.8rem] text-shadow-2xs font-bold uppercase tracking-wider mb-1"

  return (
    <>
      <h1 className="mt-0 text-3xl font-bold text-white leading-tight">
        {Event.name}
      </h1>
      <span className="border-2 border-amber-50 bg-mist-900 rounded-2xl p-1 pl-2 pr-2 ">
        {Event.category}
      </span>

      <div className="grid grid-cols-2 gap-4 mt-10 mb-10">
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>
            Date
          </p>
          <p className="font-semibold text-gray-900">{date}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>
            Time
          </p>
          <p className="font-semibold text-gray-900">{time}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>
            Address
          </p>
          <p className="font-semibold text-gray-900">{Event.address}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>
            Category
          </p>
          <p className="font-semibold text-gray-900">{Event.category}</p>
        </div>
      </div>

      <div className={`${grid_div}`}>
        <h2 className={`${grid_text} text-[1rem]`}>
          About this Event
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          {Event.description}
        </p>

        {/* Visual pills for the event tags and an optional saved status indicator */}
       
      </div>

      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Sticky top navigation bar with a back button to easily return to the home page
      <div className="bg-white px-4 py-4 sticky top-0 z-10 border-b border-gray-100">
        <Link to="/" className="text-blue-600 font-medium text-sm flex items-center gap-1">
          &larr; Back
        </Link>
      </div> */}

        {/* Main content wrapper that adds spacing and centers the layout on larger screens */}
        <div className="px-5 pt-6 pb-8 space-y-8 max-w-2xl mx-auto">
          {/* Header section showing the event category pill with emoji and the main event title */}
          <div>
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <span>{event.emoji}</span> {Event.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {Event.name}
            </h1>
          </div>

          {/* A grid layout displaying key event details like date, time, venue, and price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="font-semibold text-gray-900">{event.date}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Time
              </p>
              <p className="font-semibold text-gray-900">{event.time}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Venue
              </p>
              <p className="font-semibold text-gray-900">{event.venue}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="font-semibold text-gray-900">{event.price}</p>
            </div>
          </div>

          {/* About section wrapped in a styled card block with a colored title */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-purple-700 mb-3">
              About this Event
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              {Event.description}
            </p>

            {/* Visual pills for the event tags and an optional saved status indicator */}
            <div className="flex flex-wrap gap-2">
              {event.tags &&
                event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              {event.saved && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Saved
                </span>
              )}
            </div>
          </div>

          {/* Event goals section displaying a progress bar of current attendees versus the maximum goal */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Event Goals</h2>
                <p className="text-sm text-gray-500">Deadline: Upcoming</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-gray-900">
                  👥 {event.attendeeCount}
                </span>
                <span className="text-gray-500"> / {event.attendeeGoal}</span>
              </div>
            </div>

            {/* The visual progress bar that fills up based on the calculated percentage */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              {progressPercentage}% of goal reached
            </p>
          </div>

          {/* Organizer and Location details shown as individual tappable cards */}
          <div className="space-y-4">
            {/* Organizer profile card with an avatar and a follow button */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                  {organizerInitial}
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Organized By
                  </p>
                  <p className="font-bold text-gray-900">{event.organizer}</p>
                </div>
              </div>
              <button className="text-purple-600 font-semibold bg-purple-50 px-4 py-1.5 rounded-full text-sm hover:bg-purple-100 transition">
                Follow
              </button>
            </div>

            {/* Location details card with the specific street address and a navigate button */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <p
                  className="font-medium text-gray-900 max-w-50 truncate"
                  title={event.address}
                >
                  {event.address}
                </p>
              </div>
              <button className="text-blue-600 font-semibold bg-blue-50 px-4 py-1.5 rounded-full text-sm hover:bg-blue-100 transition">
                Navigate
              </button>
            </div>
          </div>
        </div>

        {/* Sticky bottom action bar with a prominent RSVP button that stays fixed on the screen while scrolling */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto">
            <button className="w-full bg-green-100 text-green-800 font-bold py-4 rounded-xl flex flex-col items-center justify-center transition-colors hover:bg-green-200">
              <span className="flex items-center gap-2 text-lg">
                ✅ You're Going!
              </span>
              <span className="text-sm font-medium text-green-700">
                RSVP confirmed — see you there
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
