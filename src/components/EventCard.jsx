import { Link } from "react-router";
import bookmark from "../assets/interface_icons/bookmark.svg";
import review from "../assets/interface_icons/comment-alt.svg";

// displays one event (popular, saved, and past events)
function EventCard({ event, onBookmarkToggle, variant }) {
  const isPast = variant === "past"; // "past" swaps the bookmark icon for to "Write a review" link

  return (
    <div className="h-40 rounded-3xl border border-white/20 bg-[#211d30] shadow-2xl shadow-black/20">
      <Link
        className="relative w-full h-full flex flex-col items-center justify-end"
        to={`/events/${event.id}`}
      >
        <img className=" w-full h-25"></img>
        <section className="w-full text-[0.8rem] h-15 bg-amber-50">
          <p>{event.name}</p>
          <p>{event.category}</p>
        </section>

        {isPast ? (
          <button className="absolute translate-x-15 -translate-y-30">
            <img className="size-7" src={review}></img>
          </button>
        ) : (
          <button
            className="absolute translate-x-15 -translate-y-30" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookmarkToggle(event.id);
            }}
          >
            <img className="size-7" src={bookmark}></img>
          </button>
        )}
      </Link>
    </div>
  );
}

export default EventCard;
