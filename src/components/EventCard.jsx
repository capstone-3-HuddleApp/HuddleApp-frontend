import { Link } from "react-router";
import { useEffect, useState } from "react";
import bookmark from "../assets/interface_icons/star.png";
import review from "../assets/interface_icons/comment-alt.svg";
import { GetEventImg } from "../api/images";

// displays one event (popular, saved, and past events)
function EventCard({ event, onBookmarkToggle }) {
  const [images, setImages] = useState([]);
  const isPast = new Date(event.time) < new Date(); // "past" swaps the bookmark icon for to "Write a review" link and grays out the event

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const fetchedImages = await GetEventImg(event.id);
        setImages(fetchedImages);
      } catch (error) {
        console.error(error);
      }
    };

    fetchImages();
  }, [event.id]);

  return (
    <Link
  className={`relative h-[25vh] md:h-80 rounded-3xl border border-white/20 bg-[#211d30] shadow-2xl shadow-black/20 w-full flex flex-col items-center justify-end overflow-hidden ${
    isPast ? "opacity-60 grayscale" : ""
  }`}
  to={`/events/${event.id}`}
>
  <button className="absolute top-2 right-2 z-10">
    {isPast ? (
      <img className="size-7" src={review} alt="write review" />
    ) : (
      <img
        className="size-9 cursor-pointer"
        src={bookmark}
        alt="bookmark"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBookmarkToggle(event.id);
        }}
      />
    )}
  </button>

  <img
    className="object-center object-cover w-full h-2/3 rounded-t-3xl"
    src={images[0]?.url}
    alt={event.name}
  />

  <section className="flex flex-col items-center rounded-b-3xl w-full text-[0.8rem] h-1/3 bg-amber-50 overflow-hidden">
    <p className="pt-0.5 text-[1.2rem] text-wrap line-clamp-1 overflow-x-hidden font-extrabold">
      {event.name}
    </p>
    <p className="w-fit p-[0.3rem] m-0 text-xs bg-amber-200 rounded-4xl">
      {event.category}
    </p>
    {event.distance_km && (
      <p className="text-xs text-gray-600 mt-0.5">
        {event.distance_km} km away
      </p>
    )}
  </section>
</Link>
  );
}

export default EventCard;
