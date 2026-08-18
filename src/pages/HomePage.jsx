import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col justify-center items-center gap-4 w-[80vw] md:w-[50vw] lg:w-[40vw] h-[60vh] rounded-2xl border border-[#f4c96b] bg-[#f8d8aa] shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-[#f2a451]">Huddle</h1>
        <h2 className="text-sm font-medium text-[#7d8794]">
          Find your people, no fee required
        </h2>
        <p className="p-10 text-sm leading-relaxed text-[#29272b]">
          A free, community-run alternative to paid event platforms — helping
          college students and working adults discover and organize pickup
          sports, hobby meetups, and hangouts at public venues, with decisions
          made by the group instead of a single organizer.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          to="/login"
          className="flex-1 rounded-lg bg-[#ffe991] py-2 text-center text-sm font-semibold text-[#29272b] transition hover:bg-[#ffefa9]"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="flex-1 rounded-lg bg-[#f2a451] py-2 text-center text-sm font-semibold text-[#29272b] transition hover:bg-[#e8943e]"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
