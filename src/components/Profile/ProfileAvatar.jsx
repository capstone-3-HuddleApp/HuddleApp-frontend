import { useEffect, useState } from "react";
import { GetProfileImg } from "../../api/images";

export default function ProfileAvatar({ profile, className = "" }) {
  // Stores the selected user's saved profile images.
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!profile?.id) {
      setImages([]);
      return;
    }

    let ignoreResult = false;

    async function loadProfileImage() {
      try {
        const fetchedImages = await GetProfileImg(profile.id);

        if (!ignoreResult) {
          setImages(fetchedImages);
        }
      } catch {
        if (!ignoreResult) {
          setImages([]);
        }
      }
    }

    loadProfileImage();

    return () => {
      ignoreResult = true;
    };
  }, [profile?.id]);

  const profileName = profile?.name || profile?.username || "";
  const initial = profileName.charAt(0).toUpperCase();

  return (
    <span className={className}>
      {images[0]?.url ? (
        <img
          src={images[0].url}
          alt={`${profileName}'s profile`}
          className="size-full rounded-full object-cover"
        />
      ) : (
        initial
      )}
    </span>
  );
}