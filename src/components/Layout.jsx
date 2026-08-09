import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Layout is the frame every page shares: navbar on top, page below.
// <Outlet /> is the slot where the matched child route renders.
//
// It takes user and onLogout only to hand them straight down to Navbar. App
// owns that state; Layout just happens to sit in between. authError is shown
// here rather than on one page, because a broken login affects all of them.
export default function Layout({ user, onLogout, authError }) {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/**Fixed top navbar */}
      <Navbar
        className="fixed top-0 left-0 right-0 z-50 bg-gray-950"
        user={user}
        onLogout={onLogout}
      />

      {/* Scrollable Main (with padding for fixed elements) */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 mt-20 mb-20 overflow-y-hidden">
        {authError && (
          <p
            role="alert"
            className="mb-6 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
          >
            {authError}
          </p>
        )}
        <Outlet/>
      </div>

      {/* Fixed Footer */}
      {user && (
        <Footer
          user={user}
          className="fixed bottom-0 left-0 right-0 z-50 w-full"
        />
      )}
    </div>
  );
}
