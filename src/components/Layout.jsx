import { Outlet, useLocation } from "react-router";
import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SearchProvider } from "../../context/useSearchContext";

// Layout is the frame every page shares: navbar on top, page below.
// <Outlet /> is the slot where the matched child route renders.
//
// It takes user and onLogout only to hand them straight down to Navbar. App
// owns that state; Layout just happens to sit in between. authError is shown
// here rather than on one page, because a broken login affects all of them.
export default function Layout({ user, onLogout, authError }) {
  let location = useLocation();

const [selectedCategory, setSelectedCategory] = useState("");
const [roomSearchQuery, setRoomSearchQuery] = useState("");
console.log("layout:", selectedCategory)

  return (
    <div className="flex flex-col min-h-screen relative">
      {/**Fixed top navbar */}
      <SearchProvider>
        <Navbar
          className="fixed top-0 left-0 right-0 z-50 bg-[#fff9df]"
          user={user}
          onLogout={onLogout}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onRoomSearchChange={setRoomSearchQuery}
        />

        {/* Scrollable Main (with padding for fixed elements) */}
        <div
          className={`w-full flex-1 mb-20 overflow-y-hidden ${
            location.pathname.startsWith("/room/")
              ? "mt-14 flex min-h-0 flex-col px-0"
              : location.pathname.startsWith("/events/") && location.pathname !== "/events/create"
                ? "mt-16 px-3 pt-4 sm:px-6 sm:pt-6"
                : "mt-20 px-4 pt-1"
          }`}
        >
          {authError && (
            <p
              role="alert"
              className="mb-6 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
            >
              {authError}
            </p>
          )}
          <Outlet context={{selectedCategory, roomSearchQuery}}/>
        </div>
      </SearchProvider>

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
