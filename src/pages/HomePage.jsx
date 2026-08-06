import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 max-w-sm rounded-2xl border border-cyan-300 bg-black p-8 mt-10 shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">Huddle</h1>
        <h2 className="text-sm font-medium text-amber-400">
          Find your people, no fee required
        </h2>
        <p className="text-sm leading-relaxed text-amber-50">
          A free, community-run alternative to paid event platforms — helping
          college students and working adults discover and organize pickup
          sports, hobby meetups, and hangouts at public venues, with decisions
          made by the group instead of a single organizer.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Link
          to="/login"
          className="flex-1 rounded-lg bg-amber-300 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-amber-200"
        >
          Log in
        </Link>
        <Link
          to="/signup"
          className="flex-1 rounded-lg bg-amber-500 py-2 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}