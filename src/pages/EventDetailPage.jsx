// Import necessary tools from React Router for navigation and reading the URL
import { useParams, Link, NavLink } from "react-router";
import { useEffect, useState } from "react";
import { getEvent } from "../api/events";
import { addUserToEvent } from "../api/eventParticipants";
import { followUser, getMyFollows, unfollowUser, whoAmI } from "../api/auth";
import { GetEventImg, uploadImage } from "../api/images";
import ImageUpload from "../components/ImageUpload";
// Main component for displaying the details of a single event
export default function EventDetailPage({ user, getAccessToken, setGuestId }) {
  const [Event, setEvent] = useState(null);
  const [isloading, setLoading] = useState(true);
  const [isParticipating, setParticipating] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);
  const [followError, setFollowError] = useState("");
  const [creatorInfo, setCreatorInfo] = useState(null);
  const [images, setImages] = useState([]);

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
      }
    } catch (error) {
      console.error("Failed to join:", error);
    }
  };

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
  const organizerInitial = Event.organizer ? event.organizer.charAt(0) : "?";
  const { date, time } = formatDateTime(Event.time);

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
    "bg-[#f8d8aa] p-4 rounded-2xl shadow-sm border border-[#d8cdb6]";
  const grid_text =
    " text-[#a85f25] text-[0.8rem] text-shadow-2xs font-bold uppercase tracking-wider mb-1";

  return (
    <>
      {console.log(images)}
      <section
        className={`h-80 flex flex-col items-center justify-end overflow-hidden`}
      >
        {images.length === 0 ? (
          <section className="h-2/3 w-full flex pb-1 flex-col items-center rounded-2xl border-2 bg-amber-200">
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
                className="border-2 cursor-pointer bg-amber-400 p-1 rounded-3xl"
                onClick={handleUpload}
              >
                upload
              </button>
            </span>
          </section>
        ) : (
          <img
            className="h-2/3 w-full object-center object-cover rounded-2xl border-2 bg-amber-200"
            src={images[0]?.url}
          ></img>
        )}
        <section className="h-1/3">
          <h1 className="mt-0 text-3xl font-bold text-[#29272b] leading-tight">
            {Event.name}
          </h1>
          <span className="border-2 border-[#d18a32] bg-[#ffe991] rounded-2xl p-1 pl-2 pr-2 text-[#29272b]">
            {capitalizeFirst(Event.category)}
          </span>
        </section>
      </section>

      {/*Grid displaying date, time, address and category */}
      <div className="grid grid-cols-2 gap-4 mt-5 mb-8">
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Date</p>
          <p className="font-semibold text-[#29272b]">{date}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Time</p>
          <p className="font-semibold text-[#29272b]">{time}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Location</p>
          <p className="font-semibold text-[#29272b]">{Event.location}</p>
        </div>
        <div className={`${grid_div}`}>
          <p className={`${grid_text}`}>Category</p>
          <p className="font-semibold text-[#29272b]">
            {capitalizeFirst(Event.category)}
          </p>
        </div>
      </div>

      <div className={`${grid_div} flex flex-col justify-center items-center`}>
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
          className="w-fit text-xs text-[#29272b] border-2 border-[#d18a32] rounded-xl bg-[#ffe991] p-2 cursor-pointer"
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
          <NavLink
            className="flex items-center gap-3"
            to={"/profile/guest"}
            onClick={() => setGuestId(Event.creator_id)}
          >
            {user.id !== Event.creator_id && (
              <div className="w-10 h-10 bg-[#cfd894] rounded-full flex items-center justify-center text-[#163b2d] font-bold text-lg">
                {organizerInitial}
              </div>
            )}

            <div>
              <p className="text-xs text-[#566474] font-bold uppercase tracking-wider">
                Organized By
              </p>
              <p className="font-bold text-[#29272b]">
                {creatorInfo?.username}
              </p>
            </div>
          </NavLink>
          {user.id !== Event.creator_id && (
            <div className="flex flex-col items-center gap-1">
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
                <p
                  role="alert"
                  className="max-w-40 text-center text-xs text-red-700"
                >
                  {followError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Location details card with the specific street address and a navigate button */}
        <div className={`${grid_div} flex items-center justify-around`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <p
              className="font-medium text-[#29272b] max-w-50 truncate"
              title={Event.address}
            >
              {Event.address}
            </p>
          </div>
          <button className="border border-[#4e9bb3] text-[#315f70] font-semibold bg-[#cae4ed] px-4 py-1.5 rounded-full text-sm hover:bg-[#afd6e2] transition">
            Navigate
          </button>
        </div>
      </div>
    </>
  );
}
