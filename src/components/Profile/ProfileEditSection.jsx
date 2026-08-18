import ImageUpload from "../../components/ImageUpload";
/**
 * $$$-Component Creation: 08/17/2026
 * $$$-Method Description:
 *    Renders the edit profile form with display name, username, 
 * public name choice, and image upload fields. Only visible when 
 * isEditing state is true.
 * $$$-Parent Component:
 *    Profile
 */
export default function ProfileEditSection({
  isEditing,
  draftDisplayName,
  setDraftDisplayName,
  draftUsername,
  setDraftUsername,
  publicNameChoice,
  setPublicNameChoice,
  handleFileChange,
  fileError,
  handleSaveProfile,
  handleCancelEdit,
  isSaving,
  saveError,
  saveMessage,
}) {
  if (!isEditing) return null;

  return (
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
      {/* Add image to the profile */}
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
  );
}