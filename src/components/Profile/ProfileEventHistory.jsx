/**
 * $$$-Component Creation: 08/17/2026
 * $$$-Method Description:
 *    Displays the user's past/completed events in a list format.
 * Shows loading state, error state, empty state, or list of past events
 * with dates.
 * $$$-Parent Component:
 *    Profile
 */

import PrevEvents from "../PrevEvents";
export default function ProfileEventHistory({
  eventsLoading,
  eventsError,
  pastEvents,
  participatingEvents= [],
  currentDescription = "Events you are currently attending.",
  historyDescription = "Events you joined in the past.",
}) {
  return (
    <>
    {/*  Shows current and upcoming events the user is attending  */}
    <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
          Current Events
        </h2>

        <p className="mt-1 text-sm text-(--text)">
          {currentDescription}
        </p>
      </div>

    {eventsLoading ? (
      <p className="mt-5 text-center text-sm text-(--text)">
        Loading current events...
      </p>
    ) : eventsError ? (
      <p role="alert" className="mt-5 text-center text-sm text-red-600">
        {eventsError}
      </p>
    ) : participatingEvents.length === 0 ? (
      <p className="mt-5 text-center text-sm text-(--text)">
        No current events to show yet.
      </p>
    ) : (
      <PrevEvents popularEvents={participatingEvents}/>
    )}

    </section>

    {
      (pastEvents && <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
          Event history
        </h2>
        <p className="mt-1 text-sm text-(--text)">
          {historyDescription}
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
        <PrevEvents popularEvents={pastEvents} />
      )}
    </section>
    )}

   </>
  );
}