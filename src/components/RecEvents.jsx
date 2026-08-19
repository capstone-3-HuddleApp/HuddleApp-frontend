import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import arrow from "../assets/interface_icons/arrow.svg";
import { useSearch } from "../../context/useSearchContext.jsx";

function RecEvents({ popularEvents, toggleSaved }) {
  const [eventsToDisplay, setEventsToDisplay] = useState(popularEvents);
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const {searchResults} = useSearch();
  const itemsPerPage = 6;

// Sync eventsToDisplay with searchResults or popularEvents
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setEventsToDisplay(searchResults);
      setCurrentPage(0);
    } else {
      setEventsToDisplay(popularEvents);
      setCurrentPage(0);
    }
  }, [searchResults, popularEvents]);

  const start = currentPage * itemsPerPage;
  const paginatedEvents = eventsToDisplay.slice(start, start + itemsPerPage);
  const maxPages = Math.ceil(eventsToDisplay.length / itemsPerPage);

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
      className="mb-4 md:flex md:flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full grid grid-cols-2 grid-rows-3 lg:grid-cols-3 gap-3 flex-1 sm:w-[80vw]">
        {paginatedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onBookmarkToggle={toggleSaved}
          />
        ))}
      </div>
      <section className="lg:flex w-full items-center justify-between mt-2">
        <button
          onClick={() =>
            setCurrentPage((prev) => (prev - 1 + maxPages) % maxPages)
          }
          className="shrink-0 hidden"
        >
          <img className="rotate-180 size-10" src={arrow} alt="prev" />
        </button>
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: maxPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentPage === index ? "bg-yellow-500" : "bg-amber-300"
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
