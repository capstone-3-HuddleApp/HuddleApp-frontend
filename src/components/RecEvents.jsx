import { useState } from "react";
import EventCard from "./EventCard";
import arrow from "../assets/interface_icons/arrow.svg";
import { useSearch } from "../../context/useSearchContext.jsx";

function RecEvents({ popularEvents, toggleSaved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const {searchResults} = useSearch();
  const itemsPerPage = 6;
  const eventsToDisplay = searchResults?.length > 0 ? searchResults : popularEvents;
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
      // Swiped left
      setCurrentPage((prev) => (prev + 1) % maxPages);
    } else if (distance < -50) {
      // Swiped right
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
      <div className="grid w-full grid-cols-2 gap-3 lg:grid-cols-3">
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
          <img className="size-10 " src={arrow} alt="next" />
        </button>
      </section>
    </div>
  );
}

export default RecEvents;
