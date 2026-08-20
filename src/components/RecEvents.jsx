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
  const eventsToDisplay =
    searchResults?.length > 0 ? searchResults : popularEvents;

  // Reset to page 0 when search results or popular events change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchResults, popularEvents]);

  const maxPages = Math.max(
    1,
    Math.ceil(eventsToDisplay.length / itemsPerPage),
  );
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
      <div className="flex flex-col items-center justify-between mb-2">
        <div className="mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#29272b] sm:text-2xl">
              {searchResults && searchResults.length > 0
                ? "Search Results"
                : geolocation?.latitude
                  ? "Events near you"
                  : "Popular Events"}
            </h2>
            <p className="mt-1 text-sm text-[#7d8794]">
              Discover something new in your community.
            </p>
          </div>
        </div>

        {!searchResults?.length && !geolocation?.latitude && (
          <div className="flex justify-end px-1">
            <div className="flex items-center gap-2 rounded-2xl border border-[#d8cdb6] bg-[#fff9df]/90 p-2 text-xs font-semibold text-[#566474] shadow-[0_8px_20px_rgba(104,72,38,0.14)]">
              <label htmlFor="discover-zipcode">Zip Code:</label>
              <input
                id="discover-zipcode"
                type="text"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                className="w-20 rounded-lg border border-[#d8cdb6] bg-[#fff9df] px-2 py-2 text-[#29272b] outline-none focus:border-[#f2a451] focus:ring-2 focus:ring-[#f2a451]/20"
              />
              <button
                onClick={handleZipConfirm}
                className="rounded-lg border border-[#df8b2f] bg-[#ffe991] px-3 py-2 font-bold text-[#29272b] transition hover:bg-[#ffdf6b]"
              >
                Enter
              </button>
            </div>
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
