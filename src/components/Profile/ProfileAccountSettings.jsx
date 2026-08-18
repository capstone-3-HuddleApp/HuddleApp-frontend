/**
 * $$$-Component Creation: 08/17/2026
 * $$$-Method Description:
 *    Displays account settings controls including geolocation
 * permission request and status feedback.
 * $$$-Parent Component:
 *    Profile
 */
export default function ProfileAccountSettings({ getLocation, geolocation }) {
  return (
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
  );
}