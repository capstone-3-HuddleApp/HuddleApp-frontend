import { NavLink, useLocation } from "react-router";
import SearchBar from "./searchBar";

/**
 * $$$-Funtion Creation: 08/09/2026, [Md Shamin Ahsan Anaph]
 * $$$-Most Recent Change: 08/09/2026, [Md Shamin Ahsan Anaph]
 *
 * $$$-Method Description:
 *    Renders a responsive navigation header that adapts based on the current route.
 *    Displays different navigation layouts for authentication pages, protected routes,
 *    chat rooms, and profile pages. Handles user authentication state and logout functionality.
 *    Integrates SearchBar component for location and room filtering on specific routes.
 *
 * $$$-Component Using This Function:
 *    App (main layout wrapper)
 *
 * $$$-Description of Variables:
 *    - linkClass: CSS class generator for NavLink elements with active/inactive states
 *    - location: Current route pathname from useLocation hook
 *    - name: Display name derived from user.username or defaults to "User"
 *    - user: User object containing authentication state and user data
 *    - onLogout: Callback function for handling user logout
 *    - className: Optional prop for additional custom styling on header element
 *    - Four distinct nav layouts rendered conditionally based on pathname:
 *      1. /login & /signup: Auth links (Log in/Sign up or Log out)
 *      2. /protected: Logo + SearchBar for location search
 *      3. /chat-rooms: Logo + SearchBar for room filtering
 *      4. /profile: User name display + Log out button
 *
 * */
export default function Navbar({ user, onLogout, className = "", selectedCategory, setSelectedCategory, onRoomSearchChange }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-(--accent)" : "hover:text-(--text-h)"
    }`;

  let location = useLocation();
  let name;
  if (user) {
    name = user.username || "User";
  } else {
    name = "User";
  }

  console.log(selectedCategory);

  return (
    <header
      className={`${location.pathname.startsWith("/room/") ? "min-h-14" : location.pathname.startsWith("/events/") && location.pathname !== "/events/create" ? "min-h-16" : "min-h-20"} w-full border-b border-(--border) ${className}`}
    >
      {/* Auth pages: Display login/signup links or logout button*/}
      {(location.pathname === "/login" || location.pathname === "/signup") && (
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <NavLink
            to="/"
            end
            aria-label="HUDL home"
            className="mr-auto shrink-0 text-xl font-extrabold tracking-tight text-[#f2a451]"
          >
            HUDL
          </NavLink>

          {/* `end` makes "Home" active only on "/" exactly, not on every route. */}
          {/* {(!user) && <NavLink to='/' end className={linkClass}>
          
        </NavLink>} */}

          {/* Auth controls: your name + Log out, or the Log in / Sign up pair. */}
          {user ? (
            <>
              {/* 
                       <span className='px-2 text-sm'>
              Our own users always have a username; Auth0 users may also
                  have a name or email worth falling back to.
              user.username || user.name || user.email
            </span>
           */}

              <button
                onClick={onLogout}
                className="rounded-md px-3 py-2 text-sm font-medium hover:text-(--text-h)"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-[#29272b]"
              >
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      )}

      {/*// Protected route: Show logo and location search */}
      {location.pathname === "/discover" && (
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <NavLink
            to="/"
            end
            aria-label="HUDL home"
            className="mr-auto shrink-0 text-xl font-extrabold tracking-tight text-[#f2a451]"
          >
            HUDL
          </NavLink>

          <SearchBar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </nav>
      )}

      {location.pathname === "/events/create" && (
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-center px-4 py-3 sm:px-6">
          <h1 className="text-2xl font-extrabold text-[#29272b] sm:text-3xl">
            {location.state?.editEvent ? "Edit event" : "Create an event"}
          </h1>
        </div>
      )}

      {location.pathname === "/map" && (
        <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-center px-4 py-3 sm:px-6">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#29272b]">Explore Map</h1>
            <p className="text-xs text-[#7d8794]">Find events and public spaces near you.</p>
          </div>
        </div>
      )}

      {location.pathname.startsWith("/events/") && location.pathname !== "/events/create" && (
        <nav className="relative mx-auto flex h-16 max-w-6xl items-center justify-center px-4 sm:px-6">
          <NavLink
            to="/discover"
            className="absolute left-4 rounded-full border border-[#df8b2f] bg-[#f2b6bd] px-3 py-1.5 text-sm font-bold text-[#62383d] shadow-sm transition hover:bg-[#ed9fa9] sm:left-6"
          >
            Back
          </NavLink>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-[#29272b] sm:text-2xl">Event Details</h1>
            <p className="hidden text-xs text-[#7d8794] sm:block">Everything you need to HUDL up.</p>
          </div>
        </nav>
      )}

      {/**Chat Room page: shows the logo and room/search filter */}
      {location.pathname === "/chat-rooms" && (
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <NavLink
            to="/"
            end
            aria-label="HUDL home"
            className="mr-auto shrink-0 text-xl font-extrabold tracking-tight text-[#f2a451]"
          >
            HUDL
          </NavLink>

          <SearchBar
            searchPlaceholder="Search Rooms"
            filterPlaceholder="Filter"
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            localOnly
            onLocalSearchChange={onRoomSearchChange}
          ></SearchBar>
        </nav>
      )}

      {location.pathname.startsWith("/room/") && (
        <nav className="relative mx-auto flex min-h-14 max-w-6xl items-center justify-center px-4 py-1 sm:px-6">
          <NavLink
            to="/chat-rooms"
            className="absolute left-4 shrink-0 rounded-full border border-[#c97f88] bg-[#f2b6bd] px-3 py-1.5 text-sm font-bold text-[#62383d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e98e9a] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c97f88] sm:left-6"
            aria-label="Return to chat rooms"
          >
            Back
          </NavLink>
          <div className="min-w-0 max-w-[55%] text-center sm:max-w-[70%]">
            <h1 className="truncate text-lg font-extrabold text-(--text-h)">
              {location.state?.eventName || "Event chat"}
            </h1>
            <p className="text-xs text-(--text)">Group conversation</p>
          </div>
        </nav>
      )}

      {/**user Profile: Display user name and logout button */}
      {location.pathname === "/profile" && (
        <nav className="relative mx-auto flex min-h-20 max-w-6xl items-center justify-center px-4 py-3 sm:px-6">
          <h1 className="max-w-[50%] truncate text-center text-xl font-extrabold tracking-tight text-[#29272b]">
            {name}
          </h1>
          <button
            onClick={onLogout}
            className="absolute right-4 cursor-pointer rounded-full border border-[#df8b2f] bg-[#f2a451] px-4 py-2 text-sm font-bold text-[#29272b] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#e8943e] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent) sm:right-6"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
