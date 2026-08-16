const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


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
    return await response.json();
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function GetEventImg(eventId) {
    try {
        const response = await fetch(`${BASE_URL}/api/image/event/${eventId}`);
        
        if (!response.ok) throw new Error("Failed to fetch images");
        
        const { data } = await response.json();
        return data;
    } catch (error) {
        console.error("Get images error:", error);
        throw error;
    }
}