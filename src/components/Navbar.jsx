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
export default function Navbar({ user, onLogout, className = "" }) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "text-(--accent)" : "hover:text-(--text-h)"
    }`;

  let location = useLocation();
  let name;
  if(user){
    name = user.username || "User";
  }else{
    name = "User"
  }
  
  console.log(location.pathname);

  return (
    <header
      className={`min-h-[8vh] w-full border-b border-(--border) ${className}`}
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

          <SearchBar></SearchBar>
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
          ></SearchBar>
        </nav>
      )}

      {/**user Profile: Display user name and logout button */}
      {location.pathname === "/profile" && (
        <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <h1 className="min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight text-[#29272b]">
            {name}
          </h1>
          <button
            onClick={onLogout}
            className="shrink-0 cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-(--text) transition hover:text-(--text-h) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
