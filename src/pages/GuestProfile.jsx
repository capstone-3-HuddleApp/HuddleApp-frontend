import ProfileHeader from "../components/ProfileHeader";
import ProfileStats from "../components/ProfileStats";

import ProfileEventHistory from "../components/Profile/ProfileEventHistory";

import { useEffect, useState } from "react";
import { getEventsParticipating, getGuestEvents } from "../api/events";
import { getMyFollows} from "../api/auth";



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
export default function GuestProfile({
  user,
  getAccessToken,
}) {

  console.log(user)
  // Tracks the logged-in user's joined events and their request status
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");
  const [guest, setGuest] = useState([]);
  const [followData, setFollowData] = useState({
    followers: [],
    following: [],
    followerCount: 0,
    followingCount: 0,
  });
  const [followsLoading, setFollowsLoading] = useState(true);
  const [followsError, setFollowsError] = useState("");


  // Loads the events that the guest user has joined when the profile opens
  useEffect(() => {
    let ignoreResult = false;

    async function loadJoinedEvents() {
      try {
        setEventsLoading(true);
        setEventsError("");

        const response = await getGuestEvents(user);
        console.log(response)
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
        const data = await getMyFollows(user, token);

        if (!ignoreResult) {
          setGuest(data.user)
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
  const pastEvents = joinedEvents.filter(
    (event) => new Date(event.time) < new Date(),
  );





  // Centers the profile content and leaves room above the fixed bottom navigation
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-6 pb-28 sm:px-6 sm:pt-8">
      {/* Shows the logged-in user's identity and supplies the owner-only edit action */}
      <ProfileHeader
        profile={guest}
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
        pastEvents={pastEvents}
      />
    </main>
  );
  }