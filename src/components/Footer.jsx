import { NavLink } from "react-router";
import createIcon from '../assets/interface_icons/createIcon.png'
import mapIcon from '../assets/interface_icons/mapIcon.svg'
import messageIcon from '../assets/interface_icons/messageIcon.svg'
import search from '../assets/interface_icons/search.svg'
import userIcon from '../assets/interface_icons/user.svg'

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
export default function Footer({user, className=''}) {


  //Repeating styles grouped together
  const footerIContClass = "flex flex-col items-center mr-3 ml-3";
  const footerIconClass = "w-10 bg-white rounded-full p-2";
  const footerCreatebtn = "flex items-center w-10 h-10 bg-white rounded-none rotate-45 p-2";
  const footerTextClass = "font-bold text-xs";

  const linkClass = ({ isActive }) =>
    `${footerIconClass} ${isActive ? "bg-blue-300" : "bg-white"}`;

  return (
    <footer className={`border-b border-(--border) bg-black border-2 border-b-blue-50 h-[10vh] ${className}`}>
      <nav className="mx-auto flex flex-row max-w-3xl items-center justify-center-safe gap-2 px-4 py-3">
        
        {/* Discover route, navigates to the discover events page */}
        <span className={footerIContClass}>
          <NavLink className={linkClass} to='/protected'>
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
          <NavLink to='/events/create' className={`${footerCreatebtn} -translate-y-10`}>
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
    </footer>
  );
}
