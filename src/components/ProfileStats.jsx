export default function ProfileStats({
    followersCount,
    followingCount,
    eventsCount,
}) {
    // Displays reusable profile totals without assuming whether the viewer owns the profile.
    return (
        <section className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa]">
            {/* Keeps the three profile totals evenly divided across the available width. */}
            <div className="flex min-w-0 flex-col items-center gap-1 px-2 py-4 text-center">
                <strong className="text-xl font-extrabold text-(--text-h)">
                    {followersCount ?? "--"}
                </strong>
                <span className="text-xs font-semibold text-(--text) sm:text-sm">
                    Followers
                </span>
            </div>
            
            <div className="flex min-w-0 flex-col items-center gap-1 border-l border-[#d8cdb6] px-2 py-4 text-center">
                <strong className="text-xl font-extrabold text-(--text-h)">
                    {followingCount ?? "--"}
                </strong>
                <span className="text-xs font-semibold text-(--text) sm:text-sm">
                    Following
                </span>
            </div>
            
            <div className="flex min-w-0 flex-col items-center gap-1 border-l border-[#d8cdb6] px-2 py-4 text-center">
                <strong className="text-xl font-extrabold text-(--text-h)">
                    {eventsCount ?? "--"}
                </strong>
               <span className="text-xs font-semibold text-(--text) sm:text-sm">
                    Events
               </span>
            </div>
            
        </section>
    );
}
