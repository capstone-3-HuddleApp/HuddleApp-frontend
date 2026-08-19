const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const cache = {
  eventImages: {}, // keyed by eventId
  profileImages: {}, // keyed by userId
  lastFetch: {},
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (image URLs are stable)

function isCacheValid(key) {
  const lastFetch = cache.lastFetch[key];
  const now = Date.now();
  const isValid = lastFetch && now - lastFetch < CACHE_DURATION;

  console.log(`isCacheValid("${key}"):`, {
    lastFetch,
    now,
    elapsed: lastFetch ? now - lastFetch : "N/A",
    CACHE_DURATION,
    isValid,
  });

  return isValid;
}

export async function uploadImage(file, publicId, userId, eventId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("publicId", publicId);
  formData.append("userId", userId);
  if (eventId) formData.append("eventId", eventId);

  try {
    const response = await fetch(`${BASE_URL}/api/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");
    const result = await response.json();
    // Invalidate caches for affected images
    if (eventId) {
      delete cache.eventImages[eventId];
      delete cache.lastFetch[`eventImages_${eventId}`];
    }
    if (userId) {
      delete cache.profileImages[userId];
      delete cache.lastFetch[`profileImages_${userId}`];
    }

    return result;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function GetEventImg(eventId) {
  const cacheKey = `eventImages_${eventId}`;
  console.log(`🔍 Checking cache for event ${eventId}...`);
  if (cache.eventImages[eventId] && isCacheValid(cacheKey)) {
    console.log(`image cache hit for event ${eventId}`);
    return cache.eventImages[eventId];
  }

  console.log(`🔄 Cache MISS for event ${eventId}, fetching from network...`);
  try {
    const response = await fetch(`${BASE_URL}/api/image/event/${eventId}`);

    if (!response.ok) throw new Error("Failed to fetch images");

    const { data } = await response.json();
    cache.eventImages[eventId] = data;
    cache.lastFetch[cacheKey] = Date.now();
    console.log(`💾 Cached event ${eventId}`);

    return data;
  } catch (error) {
    console.error("Get images error:", error);
    throw error;
  }
}

export async function GetProfileImg(userId) {
  const cacheKey = `profileImages_${userId}`;

  if (cache.profileImages[userId] && isCacheValid(cacheKey)) {
    return cache.profileImages[userId];
  }
  try {
    const response = await fetch(`${BASE_URL}/api/image/profile/${userId}`);

    if (!response.ok) throw new Error("Failed to fetch images");

    const { data } = await response.json();

    cache.profileImages[userId] = data;
    cache.lastFetch[cacheKey] = Date.now();

    return data;
  } catch (error) {
    console.error("Get images error:", error);
    throw error;
  }
}
