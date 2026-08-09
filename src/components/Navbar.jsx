import { NavLink } from 'react-router';
import searchIcon from '../assets/interface_icons/search.svg';

// NavLink is like an <a> tag but for client-side routing: it navigates without
// a full page reload, and it tells us when its route is active so we can style it.
//
// Navbar takes `user` and `onLogout` as props from App. It doesn't fetch
// anything or know how you logged in — it just renders what it's handed. A
// component this simple is easy to reason about and easy to reuse.
export default function Navbar({ user, onLogout, className=''}) {
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-(--accent)' : 'hover:text-(--text-h)'
    }`;

  return (
<header className={`min-h-[8vh] w-full border-b border-(--border) ${className}`}>
  <nav className='mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-3 px-4 py-3 sm:px-6'>
        <NavLink
          to='/'
          end
          aria-label='HUDL home'
          className='mr-auto shrink-0 text-xl font-extrabold tracking-tight text-white'
        >
          HUDL
        </NavLink>

        {/* Logged-in users see the event search and filter controls in the header. */}
        {user && (
          <div className="order-3 flex min-h-11 w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 sm:order-0 sm:mx-4 sm:min-w-48 sm:max-w-md sm:flex-1 focus-within:border-(--accent) focus-within:ring-2 focus-within:ring-(--accent)/20">
              <img
              src={searchIcon}
              alt=''
              aria-hidden='true'
              className='size-4 shrink-0 invert opacity-60'
              />
              <label htmlFor='event-search' className='sr-only'>
                Search events
              </label>
              <input
              id='event-search'
              type='search'
              name='event-search'
              placeholder='Search events'
              className='min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777087]'
              />
              <button
               type='button'
               className='shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)'
              >
                Filter
              </button>
          </div>
        )}
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
              className='rounded-md px-3 py-2 text-sm font-medium hover:text-(--text-h)'
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to='/login' className={linkClass}>
              Log in
            </NavLink>
            <NavLink
              to='/signup'
              className='rounded-md bg-(--accent) px-3 py-2 text-sm font-medium text-white'
            >
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
