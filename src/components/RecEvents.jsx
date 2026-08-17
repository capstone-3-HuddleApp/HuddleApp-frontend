import { useState } from "react";
import EventCard from "./EventCard";
import arrow from "../assets/interface_icons/arrow.svg";

function RecEvents({ popularEvents, toggleSaved }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const itemsPerPage = 6;

  const start = currentPage * itemsPerPage;
  const paginatedEvents = popularEvents.slice(start, start + itemsPerPage);
  const maxPages = Math.ceil(popularEvents.length / itemsPerPage);

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
      className="relative flex flex-col items-center gap-1 mb-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full h-full grid grid-cols-2  gap-3 flex-1">
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
                currentPage === index ? "bg-yellow-400" : "bg-amber-300"
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
