import { NavLink } from "react-router";

/**
 * $$$-Method Creation: 07/08/2026, [Md Shamin Ahsan Anaph]
 * $$$-Most Recent Change: 07/08/2026, [Md Shamin Ahsan Anaph]
 * $$$-Method Description:
 *    Renders the bottom navigation bar. Shows different links
 * $$$-Functions Using This Method: 
 *    none — this is the top-level exported component, 
 * rendered by Layout
 * $$$-Description of Variables: 
 *    Repeating class styles grouped into class variables
 *
 * */
export default function Footer({ user, onLogout }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-(--accent)" : "hover:text-(--text-h)"
    }`;

  const footerIContClass = "flex flex-col items-center";
  const footerIconClass = "w-10 bg-white rounded-full p-2";
  const footerTextClass = "font-bold text-xs";

  return (
    <footer className="border-b border-(--border) bg-black border-2 border-b-blue-50">
      <nav className="mx-auto flex flex-row max-w-3xl items-center justify-evenly gap-2 px-4 py-3">
        <span className={footerIContClass}>
          <NavLink className="w-10 bg-white rounded-full p-2">
            <img src="src\assets\interface_icons\search.svg" alt="" />
          </NavLink>
          <p className="font-bold text-xs">Discover</p>
        </span>
        <span className={footerIContClass}>
          <NavLink className={footerIconClass}>
            <img src="src\assets\interface_icons\mapIcon.svg" alt="" />
          </NavLink>
          <p className={footerTextClass}>Map</p>
        </span>
        <span className={footerIContClass}>
          <NavLink className={footerIconClass}>
            <img src="src\assets\interface_icons\messageIcon.svg" alt="" />
          </NavLink>
          <p className={footerTextClass}>Chat</p>
        </span>
        <span className={footerIContClass}>
          <NavLink className={footerIconClass}>
            <img src="src\assets\interface_icons\user.svg" alt="" />
          </NavLink>
          <p className={footerTextClass}>Profile</p>
        </span>
      </nav>
    </footer>
  );
}
