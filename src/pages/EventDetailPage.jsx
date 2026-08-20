// Import necessary tools from React Router for navigation and reading the URL
import { useParams, Link, NavLink, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import { getEvent, invalidateEventCache } from "../api/events";
import { addUserToEvent, removeUserFromEvent } from "../api/eventParticipants";
import { followUser, getMyFollows, unfollowUser, whoAmI } from "../api/auth";
import { GetEventImg, uploadImage } from "../api/images";
import ImageUpload from "../components/ImageUpload";
// Main component for displaying the details of a single event
export default function EventDetailPage({ user, getAccessToken, setGuestId }) {
  const navigate = useNavigate();
  const [Event, setEvent] = useState(null);
  const [isloading, setLoading] = useState(true);
  const [isParticipating, setParticipating] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);
  const [followError, setFollowError] = useState("");
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [images, setImages] = useState([]);
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [isChangingParticipation, setIsChangingParticipation] = useState(false);
  const [participationError, setParticipationError] = useState("");

  // Grab the event ID directly from the webpage URL
  const { id } = useParams();

  // File states
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // file constraints
  const MAX_FILE_SIZE = 2 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/jpeg", "image/webp"];

  // handleFileChange function
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFileError("No file selected");
      return;
    }
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFileError("Please select a jpeg or webp file");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("File must be under 2MB");
      return;
    }
    setFile(selectedFile);
    setFileError("");
  };

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

  console.log(Event);
  // Checks whether the logged-in user already follows this events organizer
  useEffect(() => {
    if (!Event || user.id === Event?.creator_id) {
      return;
    }

    let ignoreResult = false;

    async function loadFollowStatus() {
      try {
        setFollowLoading(true);
        setFollowError("");

        const token = getAccessToken ? await getAccessToken() : undefined;
        const data = await getMyFollows(user.id, token);

        const alreadyFollowing = data.following.some(
          (followedUser) => followedUser.id === Event.creator_id,
        );

        if (!ignoreResult) {
          setIsFollowing(alreadyFollowing);
        }
      } catch (error) {
        if (!ignoreResult) {
          setFollowError(error.message);
        }
      } finally {
        if (!ignoreResult) {
          setFollowLoading(false);
        }
      }
    }

    loadFollowStatus();

    return () => {
      ignoreResult = true;
    };
  }, [Event, user.id, getAccessToken]);

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
    if (isParticipating) {
      setShowLeaveConfirmation(true);
      return;
    }

    setIsChangingParticipation(true);
    setParticipationError("");
    try {
      const res = await addUserToEvent(user.id, Event.id);
      if (res.ok) {
        console.log("Successfully joined!");

        // Add user to participants locally instead of refetching
        setEvent((prevEvent) => ({
          ...prevEvent,
          participants: [
            ...prevEvent.participants,
            { id: user.id, username: user.username, email: user.email },
          ],
        }));

        setParticipating(true);
        invalidateEventCache();
      }
    } catch (error) {
      setParticipationError(error.message);
    } finally {
      setIsChangingParticipation(false);
    }
  };

  async function handleLeaveEvent() {
    setIsChangingParticipation(true);
    setParticipationError("");

    try {
      await removeUserFromEvent(user.id, Event.id);
      setEvent((prevEvent) => ({
        ...prevEvent,
        participants: prevEvent.participants.filter(
          (participant) => participant.id !== user.id,
        ),
      }));
      setParticipating(false);
      setShowLeaveConfirmation(false);
      invalidateEventCache();
    } catch (error) {
      setParticipationError(error.message);
      setShowLeaveConfirmation(false);
    } finally {
      setIsChangingParticipation(false);
    }
  }

  /**
   * $$$-Function Creation: 08/17/2026, [Anaf]
   * $$$-Most Recent Change: 08/17/2026, [Anaf]
   * $$$-Method Description:
   *    Fetches creator information by ID when the event loads. Retrieves
   * the event creator's data using the whoAmI function and manages loading/error
   * states. Includes cleanup to prevent state updates on unmounted components.
   * $$$-Component Using This Function:
   *    Event detail/view components
   * $$$-Description of Variables:
   *    ignoreResult flag prevents state updates after unmount; creatorData stores
   * fetched user info; token obtained from getAccessToken for authorization;
   * setFollowLoading/setFollowError/setCreatorInfo manage UI state
   *
   * */

  useEffect(() => {
    console.log(user.id === Event?.creator_id);

    let ignoreResult = false;

    async function loadCreatorInfo() {
      try {
        const token = getAccessToken ? await getAccessToken() : undefined;
        const creatorData = await whoAmI(Event.creator_id, token);

        if (!ignoreResult) {
          console.log(creatorData);
          setCreatorInfo(creatorData);
        }
      } catch (error) {
        if (!ignoreResult) {
          setFollowError(error.message);
        }
      } finally {
        if (!ignoreResult) {
          setFollowLoading(false);
        }
      }
    }

    loadCreatorInfo();

    return () => {
      ignoreResult = true;
    };
  }, [Event, user.id, getAccessToken]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await GetEventImg(parseInt(id));
        setImages(fetchedImages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchImages();
  }, [id, file]);

  // Toggles following the event organizer when the button is pressed
  async function handleFollowToggle() {
    try {
      setFollowLoading(true);
      setFollowError("");

      const token = getAccessToken ? await getAccessToken() : undefined;

      if (isFollowing) {
        await unfollowUser(Event.creator_id, token);
        setIsFollowing(false);
      } else {
        await followUser(Event.creator_id, token);
        setIsFollowing(true);
      }
    } catch (error) {
      setFollowError(error.message);
    } finally {
      setFollowLoading(false);
    }
  }

  function capitalizeFirst(str) {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  if (isloading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // If the URL has an ID that doesn't exist in our data, show a clean fallback screen
  if (!Event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff9df] px-4">
        <h2 className="text-2xl font-bold text-[#29272b] mb-2">
          Event Not Found 😢
        </h2>
        <p className="text-[#7d8794] mb-4">
          We couldn't find the details for this event.
        </p>
        <Link to="/" className="text-[#f2a451] font-medium hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  // Calculate the percentage of the attendee goal reached to fill the visual progress bar
  const progressPercentage = Math.round(
    (Event.participants.length / Event.maxParticipants) * 100,
  );

  // Get the first letter of the organizer's name to use as their profile avatar
  const organizerInitial = creatorInfo?.username?.charAt(0)?.toUpperCase() || "?";
  const { date, time } = formatDateTime(Event.time);
  const eventLatitude = Number.parseFloat(Event.latitude);
  const eventLongitude = Number.parseFloat(Event.longitude);
  const hasEventCoordinates =
    Number.isFinite(eventLatitude) && Number.isFinite(eventLongitude);

  async function handleUpload() {
    if (file) {
      try {
        const publicId = `user/${user.id}/event/${Event.id}`;
        console.log(await uploadImage(file, publicId, user.id, Event.id));
        setFile(null); // Clear file after upload
      } catch (err) {
        setError(err.message);
      }
    }
  }
  //tailwind styles
  const grid_div =
    "rounded-2xl border border-[#e3bd83] bg-[#f8d8aa] p-4 shadow-[0_8px_20px_rgba(104,72,38,0.10)]";
  const grid_text =
    " text-[#a85f25] text-[0.8rem] text-shadow-2xs font-bold uppercase tracking-wider mb-1";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4 pb-28 sm:space-y-5">
      {console.log(images)}
      <section className="relative overflow-hidden rounded-3xl border border-[#e3bd83] bg-[#f8d8aa] shadow-[0_16px_40px_rgba(139,93,45,0.18)]">
        {user.id === Event.creator_id && (
          <button
            type="button"
            onClick={() => navigate("/events/create", { state: { editEvent: Event } })}
            className="absolute right-3 top-3 z-10 rounded-full border border-[#df8b2f] bg-[#fff9df] px-4 py-2 text-sm font-bold text-[#29272b] shadow-md transition hover:-translate-y-0.5 hover:bg-[#ffe991] sm:right-5 sm:top-5"
          >
            Edit event
          </button>
        )}
        {images.length === 0 ? (
          <section className="flex min-h-52 w-full flex-col items-center justify-center bg-[#ffe991]/45 p-5">
            {/*Add image to the event */}
            <span className={`${user.id === Event?.creator_id? '': 'hidden'}`}>
              <ImageUpload
                className="w-80 p-2 flex flex-col items-center"
                label="Upload Photo"
                name="eventPhoto"
                onChange={handleFileChange}
                error={fileError}
                accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
              />
              <button
                className="cursor-pointer rounded-full border border-[#df8b2f] bg-[#ffe991] px-4 py-2 font-bold text-[#29272b]"
                onClick={handleUpload}
              >
                upload
              </button>
            </span>
          </section>
        ) : (
          <img
            className="aspect-[16/10] w-full object-cover object-center sm:aspect-[16/7]"
            src={images[0]?.url}
          ></img>
        )}
        <section className="flex flex-col items-center px-5 py-5 text-center sm:py-6">
          <h1 className="text-2xl font-extrabold leading-tight text-[#29272b] sm:text-3xl">
            {Event.name}
          </h1>
        </section>

        {/* Organizer information sits with the event's main summary. */}
        <div className="relative mx-4 mb-4 flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-[#e3bd83] bg-[#fff3cf] p-4 shadow-sm sm:mx-6 sm:mb-5 sm:px-6 md:justify-center">
          <NavLink
            className="mr-auto flex min-w-0 max-w-[calc(100%-7rem)] items-center gap-2 rounded-xl text-left transition hover:opacity-80 sm:max-w-[calc(100%-10rem)] sm:gap-3 md:mr-0 md:justify-center md:text-center"
            to="/profile/guest"
            onClick={() => setGuestId(Event.creator_id)}
          >
            {user.id !== Event.creator_id && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cfd894] text-base font-bold text-[#163b2d] sm:h-10 sm:w-10 sm:text-lg">
                {organizerInitial}
              </div>
            )}

            <div className="min-w-0 text-left md:text-center">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#566474] sm:text-xs">
                Organized By
              </p>
              <p className="truncate text-sm font-bold text-[#29272b] sm:text-base">
                {creatorInfo?.username}
              </p>
            </div>
          </NavLink>

          {user.id !== Event.creator_id && (
            <div className="flex shrink-0 flex-col items-center gap-1 md:absolute md:right-6">
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className="rounded-full border border-[#c97f88] bg-[#f2b6bd] px-4 py-1.5 text-sm font-semibold text-[#62383d] transition hover:bg-[#ed9fa9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {followLoading
                  ? "Loading..."
                  : isFollowing
                    ? "Unfollow"
                    : "Follow"}
              </button>

              {followError && (
                <p role="alert" className="max-w-40 text-center text-xs text-red-700">
                  {followError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Date, time, location, and category belong to the main event summary. */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:gap-4 sm:px-6 sm:pb-6 [&>div]:text-center">
          <div className="rounded-2xl border border-[#e3bd83] bg-[#fff3cf] p-4 shadow-sm">
            <p className={`${grid_text}`}>Date</p>
            <p className="font-semibold text-[#29272b]">{date}</p>
          </div>
          <div className="rounded-2xl border border-[#e3bd83] bg-[#fff3cf] p-4 shadow-sm">
            <p className={`${grid_text}`}>Time</p>
            <p className="font-semibold text-[#29272b]">{time}</p>
          </div>
          <div className="rounded-2xl border border-[#e3bd83] bg-[#fff3cf] p-4 shadow-sm">
            <p className={`${grid_text}`}>Location</p>
            <p className="font-semibold text-[#29272b]">{Event.location}</p>
          </div>
          <div className="rounded-2xl border border-[#e3bd83] bg-[#fff3cf] p-4 shadow-sm">
            <p className={`${grid_text}`}>Category</p>
            <p className="font-semibold text-[#29272b]">
              {capitalizeFirst(Event.category)}
            </p>
          </div>
        </div>
      </section>

      <div className={`${grid_div} flex flex-col items-center justify-center py-6 sm:px-8`}>
        <h2 className={`${grid_text} text-[1rem]`}>About this Event</h2>
        <p className="text-[#566474] leading-relaxed mb-4">
          {Event.description}
        </p>

        <h3 className="self-start mb-1 text-left text-[1.2rem] text-[#7a431e]">
          Participants:
          <span className="text-xl font-bold text-[#29272b]">
            👥 {Event.participants.length}
          </span>
          <span className="text-[#7d8794]"> / {Event.maxParticipants}</span>
        </h3>
        <div className="w-full bg-[#fff9df] rounded-full h-2.5 mb-7">
          <div
            className="bg-[#f2a451] h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
          <p className="text-sm text-[#566474] font-medium">
            {progressPercentage}% of goal reached
          </p>
        </div>

        {/*Participate button for adding user to event */}
        <button
          className="w-fit cursor-pointer rounded-full border border-[#d18a32] bg-[#ffe991] px-5 py-2 text-sm font-bold text-[#29272b] transition hover:bg-[#ffdd62] disabled:cursor-default disabled:opacity-70"
          onClick={handleJoinEvent}
          disabled={isChangingParticipation}
        >
          {isChangingParticipation
            ? "Please wait..."
            : isParticipating ? "Going - tap to leave" : "Click to Join"}
        </button>
        {participationError && (
          <p role="alert" className="mt-3 text-center text-sm font-semibold text-[#9f313d]">
            {participationError}
          </p>
        )}
      </div>

      {/* Location details shown as an individual action card. */}
      <div className="space-y-3">
        <div className={`${grid_div} flex items-center justify-between gap-4 sm:px-6`}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-xl">📍</span>
            <p
              className="font-medium text-[#29272b] max-w-50 truncate"
              title={Event.address}
            >
              {Event.address}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowMapPreview((isVisible) => !isVisible)}
            aria-expanded={showMapPreview}
            className="rounded-full border border-[#4e9bb3] bg-[#cae4ed] px-4 py-1.5 text-sm font-semibold text-[#315f70] transition hover:bg-[#afd6e2]"
          >
            {showMapPreview ? "Hide map" : "Navigate"}
          </button>
        </div>

        {showMapPreview && (
          <section className="isolate mb-4 overflow-hidden rounded-2xl border border-[#4e9bb3] bg-[#cae4ed] p-2 shadow-[0_10px_24px_rgba(78,155,179,0.18)]">
            {hasEventCoordinates ? (
              <div
                className="h-56 w-full overflow-hidden rounded-xl sm:h-72 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
                aria-label={`Static map preview of ${Event.location}`}
              >
                <MapContainer
                  center={[eventLatitude, eventLongitude]}
                  zoom={15}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                  keyboard={false}
                  zoomControl={false}
                  attributionControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <CircleMarker
                    center={[eventLatitude, eventLongitude]}
                    radius={10}
                    pathOptions={{
                      color: "#315f70",
                      fillColor: "#f2a451",
                      fillOpacity: 1,
                      weight: 3,
                    }}
                  />
                </MapContainer>
              </div>
            ) : (
              <div className="flex min-h-32 items-center justify-center rounded-xl bg-[#fff3cf] px-5 text-center text-sm font-medium text-[#566474]">
                A map preview is not available for this event location.
              </div>
            )}

            <p className="px-2 pb-1 pt-2 text-center text-sm font-semibold text-[#315f70]">
              {Event.address}
            </p>
          </section>
        )}
      </div>

      {showLeaveConfirmation && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-event-title"
            className="w-full max-w-sm rounded-3xl border border-[#e4a24d] bg-[#f8d8aa] p-6 text-center shadow-2xl"
          >
            <h2 id="leave-event-title" className="text-2xl font-extrabold text-[#29272b]">
              Leave this event?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#596579]">
              You will be removed from the participant list and lose access to this event&apos;s group chat.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirmation(false)}
                disabled={isChangingParticipation}
                className="rounded-xl border border-[#d8cdb6] bg-[#fff9df] px-4 py-3 font-bold text-[#29272b]"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleLeaveEvent}
                disabled={isChangingParticipation}
                className="rounded-xl border border-[#b85f6b] bg-[#e98e9a] px-4 py-3 font-bold text-[#50252b] disabled:opacity-60"
              >
                {isChangingParticipation ? "Leaving..." : "Leave event"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
