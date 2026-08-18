/**
 * $$$-Component Creation: 08/17/2026
 * $$$-Method Description:
 *    Modal dialog that confirms username change before saving.
 * Explains that changing username also changes login credentials
 * and provides go back / confirm options.
 * $$$-Parent Component:
 *    Profile
 */
export default function UsernameWarningModal({
  showUsernameWarning,
  setShowUsernameWarning,
  handleSaveProfile,
}) {
  if (!showUsernameWarning) return null;

  return (
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
  );
}