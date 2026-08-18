/**
 * $$$-Component Creation: 08/17/2026
 * $$$-Method Description:
 *    Displays the user's past/completed events in a list format.
 * Shows loading state, error state, empty state, or list of past events
 * with dates.
 * $$$-Parent Component:
 *    Profile
 */
export default function ProfileEventHistory({
  eventsLoading,
  eventsError,
  pastEvents,
}) {
  return (
    <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-extrabold text-(--text-h) sm:text-2xl">
          Event history
        </h2>
        <p className="mt-1 text-sm text-(--text)">
          Events you Created in the past.
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
  );
}