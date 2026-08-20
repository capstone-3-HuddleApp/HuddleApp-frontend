import { NavLink } from "react-router";
import ProfileAvatar from "./ProfileAvatar";
export default function ProfileFollowList({
    openFollowList,
    followers,
    following,
    onPersonClick,
    onClose,
}) {
    // Chooses the correct people and title based on nthe statistic the user selected
    const people = 
    openFollowList === "followers" ? followers : following;

    const title =
    openFollowList === "followers" ? "Followers" : "Following";

    // Renders nothing while neither follow list is selected
    if (!openFollowList) {
        return null;
    }

    return (
        <section className="mt-5 rounded-2xl border border-[#d8cdb6] bg-[#f8d8aa] p-5">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-(--text-h)">
                    {title}
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-full border border-[#df8b2f] bg-[#fff9df] px-4 py-2 text-sm font-bold text-(--text-h)"
                >
                    Close
                </button>
            </div>
            {people.length === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-[#d8cdb6] bg-[#fff9df]/50 px-4 py-6 text-center text-sm text-(--text)">
                    No {title.toLowerCase()} to show yet
                </p>
            ) : (
                <ul className="mt-5 space-y-3">
                    {people.map((person) => {
                        const publicName =
                            person.publicNameChoice === "username"
                                ? person.username
                                : person.name || person.username;

                        return (
                        <li key={person.id}>
                            <NavLink
                                to="/profile/guest"
                                onClick={() => onPersonClick(person.id)}
                                className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#d8cdb6] bg-[#fff9df]/60 px-4 py-3 transition hover:bg-[#fff9df] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#df8b2f]"
                            >
                            
                            <ProfileAvatar
                                profile={person}
                                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#df8b2f] bg-[#f8d8aa] font-extrabold text-(--text-h)"
                            />

                            <div className="min-w-0">
                                <p className="truncate font-bold text-(--text-h)">
                                    {publicName}
                                </p>

                                <p className="truncate text-sm text-(--text)">
                                    @{person.username}
                                </p>
                            </div>
                            </NavLink>
                        </li>
                        );
                    })}
                </ul>
            )
            }
        </section>
    );
}
