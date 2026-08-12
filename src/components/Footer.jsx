import { NavLink, useLocation, useParams } from "react-router";
import { useState } from "react";
import { useSendMessage } from "../hooks/message.hooks";
import FormField from "./FormField";

import createIcon from "../assets/interface_icons/createIcon.png";
import mapIcon from "../assets/interface_icons/mapIcon.svg";
import messageIcon from "../assets/interface_icons/messageIcon.svg";
import search from "../assets/interface_icons/search.svg";
import userIcon from "../assets/interface_icons/user.svg";
import sendIcon from "../assets/interface_icons/sendIcon.png"

/**
 * $$$-Method Creation: 08/07/2026, [Md Shamin Ahsan Anaph]
 * $$$-Most Recent Change: 08/07/2026, [Md Shamin Ahsan Anaph]
 * $$$-Method Description:
 *    Renders the bottom navigation bar. Shows different links
 * $$$-Functions Using This Method:
 *    none — this is the top-level exported component,
 * rendered by Layout
 * $$$-Description of Variables:
 *    Repeating class styles grouped into class variables
 *
 * */
export default function Footer({ user, className = "" }) {
  let location = useLocation();
  const { eventId } = useParams();
  const [input, setInput] = useState("");
  const { sendMessage } = useSendMessage(eventId, user?.id);

  //Repeating styles grouped together
  const footerIContClass = "flex flex-col items-center mr-3 ml-3";
  const footerIconClass = "w-10 bg-white rounded-full p-2";
  const footerCreatebtn =
    "flex items-center w-10 h-10 bg-white rounded-none rotate-45 p-2";
  const footerTextClass = "font-bold text-xs";

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    sendMessage(input); // Call the hook's sendMessage
    setInput(""); // Clear input
  };

  const linkClass = ({ isActive }) =>
    `${footerIconClass} ${isActive ? "bg-blue-300" : "bg-white"}`;

  console.log(location.pathname);

  return (
    <>
      <footer
        className={`border-b border-(--border) bg-black border-2 border-b-blue-50 h-[10vh] ${className}`}
      >
        {!location.pathname.startsWith("/room/") && (
          <nav className="mx-auto flex flex-row max-w-3xl items-center justify-center-safe gap-2 px-4 py-3">
            {/* Discover route, navigates to the discover events page */}
            <span className={footerIContClass}>
              <NavLink className={linkClass} to="/protected">
                <img src={search} alt="" />
              </NavLink>
              <p className="font-bold text-xs">Discover</p>
            </span>

            <span className={footerIContClass}>
              <NavLink className={linkClass} to={`/map`}>
                <img src={mapIcon} alt="" />
              </NavLink>
              <p className={footerTextClass}>Map</p>
            </span>

            {/* Create event route, navigates to the create event page*/}
            <NavLink
              to="/events/create"
              className={`${footerCreatebtn} -translate-y-10`}
            >
              <img className="rotate-45" src={createIcon} alt="" />
            </NavLink>

            <span className={footerIContClass}>
              <NavLink className={linkClass} to={`/chat-rooms`}>
                <img src={messageIcon} alt="" />
              </NavLink>
              <p className={footerTextClass}>Chat</p>
            </span>

            <span className={footerIContClass}>
              <NavLink className={linkClass} to={`/profile`}>
                <img src={userIcon} alt="" />
              </NavLink>
              <p className={footerTextClass}>Profile</p>
            </span>
          </nav>
        )}

        {location.pathname.startsWith("/room/") && (
          <section className="mt-4 flex min-h-11 w-full max-w-md items-center gap-2 rounded-full border border-white/50 bg-white/5 px-4 focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/20 [&_label]:sr-only">
            <FormField
              id="message"
              name="message"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-10 min-w-0 flex-1 [&_label]:sr-only [&_input]:border-0 [&_input]:bg-transparent [&_input]:px-0 [&_input:focus]:ring-0"
            />
            <button className="size-fit bg-amber-50 rounded-full cursor-pointer" onClick={handleSendMessage}><img className="size-8 invert shrink-0 opacity-60" src={sendIcon} alt="" /></button>
          </section>
        )}
      </footer>
    </>
  );
}
