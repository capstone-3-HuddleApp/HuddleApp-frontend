import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { GetEventImg } from "../api/images";
import { fetchMessages } from "../api/messeges";

function formatMessageTime(createdAt) {
  if (!createdAt) return "";

  const messageDate = new Date(createdAt);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();

  return isToday
    ? messageDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
}

export default function ChatRoomListItem({ event }) {
  const [imageUrl, setImageUrl] = useState("");
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    let ignoreResult = false;

    async function loadRoomPreview() {
      const [imagesResult, messagesResult] = await Promise.allSettled([
        GetEventImg(event.id),
        fetchMessages(event.id),
      ]);

      if (ignoreResult) return;

      if (imagesResult.status === "fulfilled") {
        setImageUrl(imagesResult.value[0]?.url || "");
      }

      if (messagesResult.status === "fulfilled") {
        setLastMessage(messagesResult.value.at(-1) || null);
      }
    }

    loadRoomPreview();

    return () => {
      ignoreResult = true;
    };
  }, [event.id]);

  const roomInitial = event.name?.charAt(0).toUpperCase() || "H";
  const senderName = lastMessage?.sender?.username;
  const messagePreview = lastMessage?.content || lastMessage?.message;

  return (
    <li>
      <NavLink
        to={`/room/${event.id}`}
        state={{ eventName: event.name }}
        className="group flex min-h-20 items-center gap-3 px-4 py-3 transition hover:bg-[#f8d8aa]/55 focus-visible:bg-[#f8d8aa]/55 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#df8b2f] sm:px-5"
      >
        <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#df8b2f] bg-[#f8d8aa] text-xl font-extrabold text-(--text-h)">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            roomInitial
          )}
        </span>

        <span className="min-w-0 flex-1 border-b border-[#d8cdb6] py-1 group-last:border-b-0">
          <span className="flex items-start justify-between gap-3">
            <span className="truncate font-extrabold text-(--text-h)">
              {event.name}
            </span>
            <time className="shrink-0 pt-0.5 text-xs text-[#7d8794]">
              {formatMessageTime(lastMessage?.createdAt)}
            </time>
          </span>

          <span className="mt-1 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm text-(--text)">
              {messagePreview ? (
                <>
                  {senderName && (
                    <strong className="font-semibold text-[#7d5b38]">
                      {senderName}: {" "}
                    </strong>
                  )}
                  {messagePreview}
                </>
              ) : (
                "No messages yet - start the conversation"
              )}
            </span>
            {event.category && (
              <span className="shrink-0 rounded-full border border-[#e5bd54] bg-[#ffe991] px-2 py-0.5 text-[0.65rem] font-semibold text-[#6f5921]">
                {event.category}
              </span>
            )}
          </span>
        </span>
      </NavLink>
    </li>
  );
}
