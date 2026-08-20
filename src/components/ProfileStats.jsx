export default function ProfileStats({
    followersCount,
    followingCount,
    eventsCount,
    onFollowersClick,
    onFollowingClick,
}) {
    // Displays reusable profile totals without assuming whether the viewer owns the profile.
    return (
        <section className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa]">
            {/* Keeps the three profile totals evenly divided across the available width. */}
            <button
                type="button"
                onClick={onFollowersClick}
                className="flex min-w-0 cursor-pointer flex-col items-center gap-1 px-2 py-4 text-center transition hover:bg-[#fff9df]/40 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#df8b2f]"
            >
                <strong className="text-xl font-extrabold text-(--text-h)">
                    {followersCount ?? "--"}
                </strong>
                <span className="text-xs font-semibold text-(--text) sm:text-sm">
                    Followers
                </span>
            </button>
            
            <button
                type="button"
                onClick={onFollowingClick}
                className="flex min-w-0 cursor-pointer flex-col items-center gap-1 border-l border-[#d8cdb6] px-2 py-4 text-center transition hover:bg-[#fff9df]/40 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#df8b2f]">
                <strong className="text-xl font-extrabold text-(--text-h)">
                    {followingCount ?? "--"}
                </strong>
                <span className="text-xs font-semibold text-(--text) sm:text-sm">
                    Following
                </span>
            </button>
            
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
