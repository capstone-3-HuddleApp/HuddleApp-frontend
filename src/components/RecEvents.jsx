import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import arrow from "../assets/interface_icons/arrow.svg";
import { useSearch } from "../../context/useSearchContext.jsx";

function RecEvents({
  popularEvents,
  toggleSaved,
  geolocation,
  zipInput,
  setZipInput,
  handleZipConfirm,
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const { searchResults } = useSearch();
  const itemsPerPage = 6;

  // Determine which events to display
  const eventsToDisplay = searchResults?.length > 0 ? searchResults : popularEvents;

  // Reset to page 0 when search results or popular events change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchResults, popularEvents]);

  const maxPages = Math.max(1, Math.ceil(eventsToDisplay.length / itemsPerPage));
  const safePage = Math.min(currentPage, maxPages - 1);
  const start = safePage * itemsPerPage;
  const paginatedEvents = eventsToDisplay.slice(start, start + itemsPerPage);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50) {
      setCurrentPage((prev) => (prev + 1) % maxPages);
    } else if (distance < -50) {
      setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages);
    }

    setTouchStart(null);
  };

  return (
    <div
      className="mb-2 mt-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between mb-2">
        <h2>
          {searchResults && searchResults.length > 0
            ? "Search Results"
            : geolocation?.latitude
            ? "Events near you"
            : "Popular Events"}
        </h2>

        {!searchResults?.length && !geolocation?.latitude && (
          <div className="flex items-center gap-1 text-xs">
            <span>Zip Code:</span>
            <input
              type="text"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              className="border rounded px-2 py-1 w-20"
            />
            <button
              onClick={handleZipConfirm}
              className="border rounded px-2 py-1"
            >
              Enter
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-full grid grid-cols-2 grid-rows-3 lg:grid-cols-3 gap-3 flex-1 sm:w-[80vw]">
        {paginatedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onBookmarkToggle={toggleSaved}
          />
        ))}
      </div>

      <section className="mt-2 flex w-full items-center justify-center">
        <button
          onClick={() =>
            setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages)
          }
          className="shrink-0 hidden"
        >
          <img className="rotate-180 size-10" src={arrow} alt="prev" />
        </button>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: maxPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                safePage === index ? "bg-yellow-500" : "bg-amber-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrentPage((prev) => (prev + 1) % maxPages)}
          className="shrink-0 hidden"
        >
          <img className="size-10" src={arrow} alt="next" />
        </button>
      </section>
    </div>
  );
}

export default RecEvents;