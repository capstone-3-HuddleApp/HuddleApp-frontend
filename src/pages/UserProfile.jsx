import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";
import ProfileEditSection from "../components/Profile/ProfileEditSection";
import ProfileEventHistory from "../components/Profile/ProfileEventHistory";
import ProfileAccountSettings from "../components/Profile/ProfileAccountSettings";
import UsernameWarningModal from "../components/Profile/UsernameWarning";
import { useEffect, useState } from "react";
import { getEventsParticipating } from "../api/events";
import { getMyFollows, updateMyProfile } from "../api/auth";

import { uploadImage } from "../api/images";

/**
 * $$$-Component Update: 08/17/2026
 * $$$-Method Description:
 *    Main profile page component that manages all profile-related
 * state and orchestrates child components for editing, stats,
 * event history, and settings.
 * $$$-Child Components:
 *    ProfileHeader, ProfileStats, ProfileEditSection, ProfileEventHistory,
 *    ProfileAccountSettings, UsernameWarningModal
 */
export default function UserProfile({
  user,
  setUser,
  getAccessToken,
  getLocation,
  geolocation,
}) {
  // Remembers whether the owner has opened the profile editing controls
  const [isEditing, setIsEditing] = useState(false);
  // Stores temporary display name edits until backend saving is implemented
  const [draftDisplayName, setDraftDisplayName] = useState(
    user.name ||
      [user.f_name, user.l_name].filter(Boolean).join(" ") ||
      user.username,
  );
  // Stores temporary username edits without changing the logged-in account
  const [draftUsername, setDraftUsername] = useState(user.username);
  // Remembers whether the public profile should show the display name or username
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

  // Tracks the profile-save request and its user-facing result
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  // Controls the in-app warning shown before saving a changed username
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

  // Loads the events that the logged-in user has joined when the profile opens
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
        const data = await getMyFollows(user.id,token);

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
  }, [getAccessToken, user]);

  // Separates completed events from the user's complete joined-event list
  const pastEventsParticipated = joinedEvents.filter(
    (event) => new Date(event.time) < new Date(),
  );

  // Discards unsaved edits and closes the owner-only editor
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
      // upload the image after creating the event
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

  // Centers the profile content and leaves room above the fixed bottom navigation
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 sm:px-6 sm:pt-8">
      {/* Shows the logged-in user's identity and supplies the owner-only edit action */}
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
      <ProfileEditSection
        isEditing={isEditing}
        draftDisplayName={draftDisplayName}
        setDraftDisplayName={setDraftDisplayName}
        draftUsername={draftUsername}
        setDraftUsername={setDraftUsername}
        publicNameChoice={publicNameChoice}
        setPublicNameChoice={setPublicNameChoice}
        handleFileChange={handleFileChange}
        fileError={fileError}
        handleSaveProfile={handleSaveProfile}
        handleCancelEdit={handleCancelEdit}
        isSaving={isSaving}
        saveError={saveError}
        saveMessage={saveMessage}
      />

      {/* Shows profile totals; unavailable values remain placeholders until backend support exists */}
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

      {/* Displays completed events from the logged-in user's joined-event data */}
      <ProfileEventHistory
        eventsLoading={eventsLoading}
        eventsError={eventsError}
        participatingEvents={pastEventsParticipated}
      />

      {/* Keeps private account tools separate from what the public will see on profile page */}
      <ProfileAccountSettings
        getLocation={getLocation}
        geolocation={geolocation}
      />

      {/* Confirms a username change using an app-styled modal instead of a browser popup */}
      <UsernameWarningModal
        showUsernameWarning={showUsernameWarning}
        setShowUsernameWarning={setShowUsernameWarning}
        handleSaveProfile={handleSaveProfile}
      />
    </main>
  );
}