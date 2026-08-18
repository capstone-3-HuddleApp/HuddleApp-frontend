import { GetProfileImg } from "../api/images";
import { useState, useEffect } from "react";

// Displays the public identity shared by the owner's and visitor's profiles.
export default function ProfileHeader({ profile, action }) {
  const [images, setImages] = useState([]);
  const fullName =
    profile?.name ||
    [profile?.f_name, profile?.l_name].filter(Boolean).join(" ") ||
    profile?.username;

  console.log(profile);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await GetProfileImg(profile.id);
        setImages(fetchedImages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchImages();
  }, [profile]);

  const profileInitial = fullName?.charAt(0).toUpperCase();
  // Uses a responsive card that stacks on phones and becomes a row on larger screens.
  return (
    <section className="flex flex-col items-center gap-4 rounded-3xl border border-[#d8cdb6] bg-[#f8d8aa] p-5 text-center shadow-xl sm:flex-row sm:p-6 sm:text-left">
      {/* Uses the profile initial as an avatar until picture uploads are implemented. */}
      <div className="flex size-24 shrink-0 items-center justify-center rounded-full border-2 border-(--accent) bg-(--accent-bg) text-3xl font-extrabold text-(--text-h) sm:size-28">
        {images[0]?.url ? (
          <img
            src={images[0].url}
            alt="profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          profileInitial
        )}
      </div>
      {/* Displays the selected public name with the unique username underneath. */}
      <div className="min-w-0">
        <h1 className="wrap-break-word text-2xl font-extrabold text-(--text-h) sm:text-3xl">
          {fullName}
        </h1>
        <p className="mt-1 break-all text-sm text-(--text) sm:text-base">
          @{profile.username}
        </p>
      </div>
      {/* Allows each page to supply an owner or visitor-specific action button. */}
      {action && <div className="sm:ml-auto">{action}</div>}
    </section>
  );
}
