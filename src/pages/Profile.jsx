import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";
import { useEffect, useState } from "react";
import { getEventsParticipating } from "../api/events";
import { getMyFollows, updateMyProfile } from "../api/auth";
import ImageUpload from "../components/ImageUpload";
import { uploadImage } from "../api/images";

// ET - Created CSS for the profile page

export default function Profile({
  user,
  setUser,
  getAccessToken,
  getLocation,
  geolocation,
}) {
  // Remembers whether the owner hs opened the profile editing controls
  const [isEditing, setIsEditing] = useState(false);
  // Stores temporary display name edits until backend saving is implemented
  const [draftDisplayName, setDraftDisplayName] = useState(
    user.name ||
      [user.f_name, user.l_name].filter(Boolean).join(" ") ||
      user.username,
  );
  // Stores temporary username edits without changing the logged-in account.
  const [draftUsername, setDraftUsername] = useState(user.username);
  // Remembers whether the public profile should show the display name or username.
  const [publicNameChoice, setPublicNameChoice] = useState("displayName");
  // Tracks the logged-in user's joined events and their request status
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [followData, setFollowData] = useState({
    followers: [],
    following: [],
    followerCount: 0,
    followingCount: 0,
  });
  const [followsLoading, setFollowsLoading] = useState(true);
  const [followsError, setFollowsError] = useState("");

  // Tracks the profile-save request and its user-facing result.
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  //Controls the in-app warning shown before saving a changed username
  const [showUsernameWarning, setShowUsernameWarning] = useState(false);

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

  //Loads the events that the logged-in user has joined when the profile opens
  useEffect(() => {
    let ignoreResult = false;

    async function loadJoinedEvents() {
      try {
        setEventsLoading(true);
        setEventsError("");

        const response = await getEventsParticipating();
        const events = Array.isArray(response)
          ? response
          : (response.data ?? []);

        if (!ignoreResult) {
          setJoinedEvents(events);
        }
      } catch (error) {
        if (!ignoreResult) {
          setEventsError(error.message);
        }
      } finally {
        if (!ignoreResult) {
          setEventsLoading(false);
        }
      }
    }

    loadJoinedEvents();

    return () => {
      ignoreResult = true;
    };
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    async function loadFollows() {
      try {
        setFollowsLoading(true);
        setFollowsError("");

        const token = getAccessToken ? await getAccessToken() : undefined;
        const data = await getMyFollows(token);

        if (!ignoreResult) {
          setFollowData(data);
        }
      } catch (error) {
        if (!ignoreResult) {
          setFollowsError(error.message);
        }
      } finally {
        if (!ignoreResult) {
          setFollowsLoading(false);
        }
      }
    }

    loadFollows();

    return () => {
      ignoreResult = true;
    };
  }, [getAccessToken]);

  //Seperates completed events from the user's complete joined-event list
  const pastEvents = joinedEvents.filter(
    (event) => new Date(event.time) < new Date(),
  );

  // Discards unsaved edits and closes the owner-only editor.
  function handleCancelEdit() {
    const originalDisplayName =
      user.name ||
      [user.f_name, user.l_name].filter(Boolean).join(" ") ||
      user.username;

    setDraftDisplayName(originalDisplayName);
    setDraftUsername(user.username);
    setPublicNameChoice("displayName");
    setIsEditing(false);
    setShowUsernameWarning(false);
  }

  // Validates draft fields and saves them through the authenticated profile API
  async function handleSaveProfile() {
    const name = draftDisplayName.trim();
    const username = draftUsername.trim();

    setSaveError("");
    setSaveMessage("");

    if (!name) {
      setSaveError("Display name is required");
      return;
    }

    if (username.length < 3 || username.length > 20) {
      setSaveError("Username must be between 3 and 20 characters");
      return;
    }

    // Pauses saving until the user confirms the username change in the app
    if (username !== user.username && !showUsernameWarning) {
      setShowUsernameWarning(true);
      return;
    }

    // Closes the confirmed warning before sending the update request
    setShowUsernameWarning(false);

    try {
      setIsSaving(true);

      const token = getAccessToken ? await getAccessToken() : undefined;
      const updatedUser = await updateMyProfile({ name, username }, token);

      setUser(updatedUser);
      setDraftDisplayName(updatedUser.name);
      setDraftUsername(updatedUser.username);
      //upload the image after creating the event
      if (file) {
        const publicId = `user/${user.id}/profile/${Date.now()}`;
        await uploadImage(file, publicId, user.id);
      }

      setSaveMessage("Profile updated successfully");
      setShowUsernameWarning(false);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Centers the profile content and leaves room above the fixed bottom navigation.
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 sm:px-6 sm:pt-8">
      {/* Shows the logged-in user's identity and supplies the owner-only edit action. */}
      <ProfileHeader
        profile={user}
        action={
          <button
            type="button"
            className="cursor-pointer rounded-full border border-[#c97f88] bg-[#f2b6bd] px-5 py-2.5 text-sm font-bold text-[#62383d] transition hover:bg-[#ed9fa9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c97f88]"
            onClick={() =>
              setIsEditing((currentlyEditing) => !currentlyEditing)
            }
          >
            {isEditing ? "Close editor" : "Edit Profile"}
          </button>
        }
      />
      {/* Shows owner-only editing controls when the Edit Profile button is active */}
      {isEditing && (
        <section className="mt-5 rounded-2xl border border-(--accent-border) bg-[#f8d8aa] p-5 sm:p-6">
          <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
            Edit Profile
          </h2>
          <p className="mt-1 text-sm text-(--text)">
            Profile changes will be connected to the backend later
          </p>
          {/* Lets the owner prepare a public display name without saving it yet */}
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-(--text-h)">
              Display name
            </span>
            <input
              type="text"
              name="displayName"
              value={draftDisplayName}
              className="w-full rounded-xl border border-[#d8cdb6] bg-[#fff9df]/80 px-4 py-3 text-(--text-h) outline-none transition placeholder:text-(--text) focus:border-(--accent)"
              onChange={(event) => setDraftDisplayName(event.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-semibold text-(--text-h)">
              Username
            </span>
            <input
              type="text"
              name="username"
              value={draftUsername}
              onChange={(event) => setDraftUsername(event.target.value)}
              minLength={3}
              maxLength={20}
              className="w-full rounded-xl border border-[#d8cdb6] bg-[#fff9df]/80 px-4 py-3 text-(--text-h) outline-none transition focus:border-(--accent) "
            />
          </label>
          {/* Lets the owner choose which name should appear on the public profile */}
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-(--text-h)">
              Show publicly as
            </legend>

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d8cdb6] bg-[#fff9df]/80 px-4 py-3 text-sm font-semibold text-(--text-h) transition hover:border-(--accent-border)">
                <input
                  type="radio"
                  name="publicNameChoice"
                  value="displayName"
                  checked={publicNameChoice === "displayName"}
                  onChange={(event) => setPublicNameChoice(event.target.value)}
                  className="size-4 accent-(--accent)"
                />
                Display Name
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d8cdb6] bg-[#fff9df]/80 px-4 py-3 text-sm font-semibold text-(--text-h) transition hover:border-(--accent-border)">
                <input
                  type="radio"
                  name="publicNameChoice"
                  value="username"
                  checked={publicNameChoice === "username"}
                  onChange={(event) => setPublicNameChoice(event.target.value)}
                  className="size-4 accent-(--accent)"
                />
                Username
              </label>
            </div>
          </fieldset>
          {/*Add image to the profile */}
          <ImageUpload
            className="pt-2"
            label="Upload Profile Picture"
            name="eventPhoto"
            onChange={handleFileChange}
            error={fileError}
            accept=".jpg,.jpeg,.webp,image/jpeg,image/webp"
          />
          {/* Provides local editor controls without claiming that backend saving works. */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-xl border border-[#b39588] bg-[#fff9df] px-4 py-3 text-sm font-bold text-(--text-h) transition hover:bg-[#fff3c7]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="rounded-xl border border-[#c97f88] bg-[#f2b6bd] px-4 py-3 text-sm font-bold text-[#62383d] transition hover:bg-[#ed9fa9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>

          {/* Reports profile-save errors or success without leaving the editor */}
          {saveError && (
            <p
              role="alert"
              className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-center text-sm text-red-300"
            >
              {saveError}
            </p>
          )}

          {saveMessage && (
            <p
              role="status"
              className="mt-3 rounded-lg border border-[#2f7659] bg-[#cfd894] px-3 py-2 text-center text-sm font-semibold text-[#102f24]"
            >
              {saveMessage}
            </p>
          )}
        </section>
      )}

      {/* Shows profile totals; unavailable values remain placeholders until backend support exists. */}
      <ProfileStats
        followersCount={
          followsLoading || followsError ? undefined : followData.followerCount
        }
        followingCount={
          followsLoading || followsError ? undefined : followData.followingCount
        }
        eventsCount={
          eventsLoading || eventsError ? undefined : joinedEvents.length
        }
      />
      {/* while loading will show --, if loading fails will also show -- instead of the events joined number */}

      {/* Displays completed events from the logged-in user's joined-event data. */}
      <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
            Event history
          </h2>
          <p className="mt-1 text-sm text-(--text)">
            Events you attended in the past.
          </p>
        </div>

        {/* Displays the request state before showing real completed events. */}
        {eventsLoading ? (
          <p className="mt-5 rounded-xl border border-dashed border-[#b39588]/40 bg-[#fff9df]/50 px-4 py-8 text-center text-sm text-(--text)">
            Loading event history...
          </p>
        ) : eventsError ? (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-center text-sm text-red-300"
          >
            {eventsError}
          </p>
        ) : pastEvents.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-[#b39588]/40 bg-[#fff9df]/50 px-4 py-8 text-center text-sm text-(--text)">
            No past events to show yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {pastEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-[#d8cdb6] bg-[#fff9df]/50 px-4 py-3"
              >
                <h3 className="font-bold text-(--text-h)">{event.name}</h3>
                <p className="mt-1 text-sm text-(--text)">
                  {new Date(event.time).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Keeps private account tools seperate from what the public will see on profile page */}
      <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
            Account settings
          </h2>
          <p className="mt-1 text-sm text-(--text)">
            Manage your profile and location preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={getLocation}
          className="mt-5 w-full rounded-xl border border-(--accent-border) bg-(--accent-bg) px-4 py-3 text-sm font-bold text-(--text-h) transition hover:border-(--accent) hover:bg-(--accent) hover:text-[#29272b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
        >
          Use my current location
        </button>

        {geolocation && (
          <p
            role="status"
            className="mt-3 rounded-lg border border-[#2f7659] bg-[#cfd894] px-3 py-2 text-center text-sm font-semibold text-[#102f24]"
          >
            Location saved for this session
          </p>
        )}
      </section>

      {/* Confirms a username change using an app-styled modal instead of a browser popup. */}
      {showUsernameWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29272b]/60 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="username-warning-title"
            className="w-full max-w-md rounded-2xl border border-(--accent-border) bg-[#f8d8aa] p-5 text-center shadow-2xl sm:p-6"
          >
            <h2
              id="username-warning-title"
              className="text-xl font-extrabold text-(--text-h)"
            >
              Change your login username?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#566474]">
              Changing your username also changes the username you use to log
              in. Your email login and password will remain the same.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowUsernameWarning(false)}
                className="rounded-xl border border-[#b39588] bg-[#fff9df] px-4 py-3 text-sm font-bold text-(--text-h) transition hover:bg-[#fff3c7]"
              >
                Go back
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="rounded-xl border border-[#4e9bb3] bg-[#89d6e8] px-4 py-3 text-sm font-bold text-[#274f5d] transition hover:bg-[#70c6dc]"
              >
                Change username
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
