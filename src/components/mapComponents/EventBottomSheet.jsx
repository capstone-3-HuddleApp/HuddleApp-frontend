import { useState, useEffect } from "react";
import { GetEventImg } from "../../api/images";

function EventBottomSheet({ selectedEvent, setSelectedEvent, userLocation, getDistanceInMiles }) {
  const [eventImage, setEventImage] = useState(null);



 useEffect(() => {
  if (!selectedEvent?.id) return;
  
  const fetchImages = async () => {
    try {
      const fetchedImages = await GetEventImg(selectedEvent.id);
      setEventImage(fetchedImages?.length > 0 ? fetchedImages[0].url : null);
    } catch (error) {
      console.error(error);
      setEventImage(null);
    }
  };

  fetchImages();
}, [selectedEvent?.id]);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-2000 bg-white rounded-t-3xl p-5 shadow-[0_-10px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out ${
        selectedEvent ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {selectedEvent && (
        <div className="relative flex gap-4">
          <button
            onClick={() => setSelectedEvent(null)}
            className="absolute -top-2 -right-2 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center font-bold text-xl cursor-pointer"
          >
            &times;
          </button>

          <img
            src={eventImage || "https://placehold.co/150x150/png"}
            alt={selectedEvent.name}
            className="w-28 h-28 object-cover rounded-xl shadow-sm bg-gray-100"
          />

          <div className="flex flex-col justify-between flex-1 pr-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2">
                {selectedEvent.name}
              </h3>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {selectedEvent.time
                  ? new Date(selectedEvent.time).toLocaleDateString()
                  : "Date TBD"}
              </p>
              <p className="text-sm font-bold text-blue-600 mt-1">
                {getDistanceInMiles(
                  userLocation[0],
                  userLocation[1],
                  selectedEvent.coords[0],
                  selectedEvent.coords[1],
                ).toFixed(1)}{" "}
                miles away
              </p>
            </div>

            <button
              onClick={() =>
                (window.location.href = `/events/${selectedEvent.id}`)
              }
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg text-sm font-semibold transition shadow-md w-full block"
            >
              More details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventBottomSheet;