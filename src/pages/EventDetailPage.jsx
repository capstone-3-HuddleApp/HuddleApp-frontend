// Import necessary tools from React Router for navigation and reading the URL
import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { getEvent } from "../api/events";
import { addUserToEvent } from "../api/eventParticipants";

// Main component for displaying the details of a single event
export default function EventDetailPage({ user }) {
  const [Event, setEvent] = useState(null);
  const [isloading, setLoading] = useState(true);
  const [isParticipating, setParticipating] = useState(false);
  const [error, setError] = useState(null);

  // Grab the event ID directly from the webpage URL
  const { id } = useParams();

  useEffect(() => {
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setParticipating(
          data.participants.some((participant) => participant.id === user.id),
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id, user]);

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

  const handleJoinEvent = async () => {
  try {
    const res = await addUserToEvent(user.id, Event.id);
    
    if (res.ok) {
      console.log("Successfully joined!");
      
      // Add user to participants locally instead of refetching
      setEvent((prevEvent) => ({
        ...prevEvent,
        participants: [
          ...prevEvent.participants,
          { id: user.id, username: user.username, email: user.email }
        ]
      }));
      
      setParticipating(true);
    }
  } catch (error) {
    console.error("Failed to join:", error);
  }
};


  function capitalizeFirst(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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
  const progressPercentage = Math.round((Event.participants.length / 10) * 100);

  // Get the first letter of the organizer's name to use as their profile avatar
  const organizerInitial = Event.organizer ? event.organizer.charAt(0) : "?";
  const { date, time } = formatDateTime(Event.time);

  //tailwind styles
  const grid_div =
    "bg-purple-300 p-4 rounded-2xl shadow-sm border border-gray-100";
  const grid_text =
    " text-red-800 text-[0.8rem] text-shadow-2xs font-bold uppercase tracking-wider mb-1";

  return (
    <>
      <h1 className="mt-0 text-3xl font-bold text-white leading-tight">
        {Event.name}
      </h1>
      <span className="border-2 border-amber-50 bg-mist-900 rounded-2xl p-1 pl-2 pr-2 ">
        {capitalizeFirst(Event.category)}
      </span>

      {/*Grid displaying date, time, address and category */}
      <div className="grid grid-cols-2 gap-4 mt-10 mb-10">
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Date</p>
          <p className="font-semibold text-gray-900">{date}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Time</p>
          <p className="font-semibold text-gray-900">{time}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Location</p>
          <p className="font-semibold text-gray-900">{Event.location}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Category</p>
          <p className="font-semibold text-gray-900">
            {capitalizeFirst(Event.category)}
          </p>
        </div>
      </div>

      <div className={`${grid_div} flex flex-col justify-center items-center`}>
        <h2 className={`${grid_text} text-[1rem]`}>About this Event</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          {Event.description}
        </p>

        <h3 className="self-start mb-1 text-left text-[1.2rem] text-amber-900">
          Participants:
          <span className="text-xl font-bold text-gray-900">
            👥 {Event.participants.length}
          </span>
          <span className="text-gray-500"> / {Event.maxParticipants}</span>
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-7">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <p className="text-sm text-gray-600 font-medium">
            {progressPercentage}% of goal reached
          </p>
        </div>

        {/*Participate button for adding user to event */}
        <button
          className="w-fit text-xs text-black border-2 border-amber-50 rounded-xl bg-amber-100 p-2 cursor-pointer"
          onClick={handleJoinEvent}
          disabled={isParticipating}
        >
          {isParticipating ? "Going" : "Click to Join"}
        </button>
      </div>

      {/* Organizer and Location details shown as individual tappable cards. 
      if user is the organizer follow button is not rendered*/}
      <div className="space-y-4 mt-4 mb-4">
        {/* Organizer profile card with an avatar and a follow button */}
        <div className={`${grid_div} flex items-center justify-around`}>
          <div className="flex items-center gap-3">
            {user.id !== Event.creator_id && (
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                {organizerInitial}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Organized By
              </p>
              <p className="font-bold text-gray-900">TBD</p>
            </div>
          </div>
          {user.id !== Event.creator_id && (
            <button className="text-purple-600 font-semibold bg-purple-50 px-4 py-1.5 rounded-full text-sm hover:bg-purple-100 transition">
              Follow
            </button>
          )}
        </div>

        {/* Location details card with the specific street address and a navigate button */}
        <div className={`${grid_div} flex items-center justify-around`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <p
              className="font-medium text-gray-900 max-w-50 truncate"
              title={Event.address}
            >
              {Event.address}
            </p>
          </div>
          <button className="text-blue-600 font-semibold bg-blue-50 px-4 py-1.5 rounded-full text-sm hover:bg-blue-100 transition">
            Navigate
          </button>
        </div>
      </div>
    </>
  );
}
