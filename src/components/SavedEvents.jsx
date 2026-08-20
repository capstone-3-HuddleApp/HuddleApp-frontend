import { useState } from "react";
import EventCard from "./EventCard";
import arrow from "../assets/interface_icons/arrow.svg";

function SavedEvents({ savedEvents, toggleSaved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const itemsPerPage = 4;

  const start = currentPage * itemsPerPage;
  const paginatedEvents = savedEvents.slice(start, start + itemsPerPage);
  const maxPages = Math.ceil(savedEvents.length / itemsPerPage);

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
    <div>
      <div
        className="mb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 lg:grid-cols-3 gap-3 flex-1 sm:w-[80vw]">
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
                  currentPage === index ? "bg-yellow-500" : "bg-amber-300"
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
    </div>
  );
}

export default SavedEvents;
