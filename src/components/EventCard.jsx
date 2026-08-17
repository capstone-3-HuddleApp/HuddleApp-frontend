import { Link } from "react-router";
import { useEffect, useState } from "react";
import bookmark from "../assets/interface_icons/star.png";
import review from "../assets/interface_icons/comment-alt.svg";
import {GetEventImg} from "../api/images";

// displays one event (popular, saved, and past events)
function EventCard({ event, onBookmarkToggle, variant }) {
  const [images, setImages] = useState([])
  const isPast = variant === "past"; // "past" swaps the bookmark icon for to "Write a review" link

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
    <div className="h-40 md:h-80 rounded-3xl border border-white/20 bg-[#211d30] shadow-2xl shadow-black/20">
      <Link
        className="relative rounded-3xl w-full h-full flex flex-col items-center justify-end"
        to={`/events/${event.id}`}
      >
        <img className=" rounded-t-3xl w-full h-full " src={images[0]?.url} ></img>
        <section className="flex flex-col items-center rounded-b-3xl w-full text-[0.8rem] h-20 bg-amber-50">
          <p className="pt-0.5 text-[1.2rem] text-wrap line-clamp-1 overflow-x-hidden font-extrabold">{event.name}</p>
          <p className="w-fit p-[0.3rem] m-0 text-xs bg-amber-200 rounded-4xl">{event.category}</p>
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
            <img className="size-7 cursor-pointer" src={bookmark}></img>
          </button>
        )}
      </Link>
    </div>
  );
}

export default EventCard;
