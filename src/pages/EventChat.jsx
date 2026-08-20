// components/EventChat.jsx
import { Fragment, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { getEventsParticipating } from "../api/events";
import { useEventChat } from "../hooks/message.hooks";
import ProfileAvatar from "../components/Profile/ProfileAvatar";

export default function EventChat({ user }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [verifyError, setVerifyError] = useState(null);
  const messagesContainerRef = useRef(null);

  //Custom hooks handle socket logic
  const { messages, isLoading, error } = useEventChat(eventId);

  // Verify user is a participant and fetch event
  useEffect(() => {
    async function verifyParticipant() {
      try {
        const participatingEvents = await getEventsParticipating();
        const foundEvent = participatingEvents.find(
          (e) => e.id === parseInt(eventId),
        );

        if (!foundEvent) {
          setVerifyError("You are not a participant in this event");
          setTimeout(() => navigate("/chat-rooms"), 2000);
          return;
        }

        navigate(`/room/${eventId}`, {
          replace: true,
          state: { eventName: foundEvent.name },
        });
      } catch (err) {
        setVerifyError(err.message);
        setTimeout(() => navigate("/chatroom"), 2000);
      }
    }

    verifyParticipant();
  }, [eventId, navigate]);

  useEffect(() => {
    const messagePanel = messagesContainerRef.current;
    if (messagePanel) {
      messagePanel.scrollTo({
        top: messagePanel.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (isLoading) {
    return <p>Loading chat...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col">
      {verifyError && (
        <p className="mb-4 rounded-xl border border-[#e89a87] bg-[#f9c9b8] px-4 py-3 text-center text-sm font-semibold text-[#7d2f24]">
          {verifyError}
        </p>
      )}

      <section
        ref={messagesContainerRef}
        className="mt-8 flex flex-1 flex-col gap-3 overflow-y-auto px-3 pt-4 pb-6 sm:mt-10 sm:px-6 sm:pt-4"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="m-auto rounded-xl bg-[#f8d8aa] px-5 py-3 text-center text-sm text-(--text)">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.user_id === user.id;
            const sender = msg.sender || {
              id: msg.user_id,
              username: isOwnMessage ? user.username : "User",
            };
            const sentDate = new Date(msg.createdAt);
            const previousMessage = messages[index - 1];
            const previousDate = previousMessage
              ? new Date(previousMessage.createdAt)
              : null;
            const startsNewDay =
              !previousDate || sentDate.toDateString() !== previousDate.toDateString();
            const dateLabel = sentDate.toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            const sentTime = sentDate.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <Fragment key={msg.id}>
                {startsNewDay && (
                  <div className="my-2 flex w-full items-center gap-3" role="separator" aria-label={dateLabel}>
                    <span className="h-px flex-1 bg-[#dfb875]/70" />
                    <time
                      dateTime={sentDate.toISOString()}
                      className="shrink-0 rounded-full border border-[#dfb875] bg-[#fff3cf] px-3 py-1 text-xs font-bold text-[#7d5b38] shadow-sm"
                    >
                      {dateLabel}
                    </time>
                    <span className="h-px flex-1 bg-[#dfb875]/70" />
                  </div>
                )}

                <article
                  className={`flex items-end gap-2 ${
                    isOwnMessage ? "flex-row-reverse self-end" : "self-start"
                  } max-w-[88%] sm:max-w-[75%]`}
                >
                  <ProfileAvatar
                    profile={sender}
                    className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#df8b2f] bg-[#f8d8aa] text-sm font-extrabold text-(--text-h)"
                  />

                  <div
                    className={`min-w-0 rounded-2xl px-3.5 py-2 shadow-sm ${
                      isOwnMessage
                        ? "rounded-br-sm border border-[#4e9bb3] bg-[#caeaf1]"
                        : "rounded-bl-sm border border-[#dfb875] bg-[#f8d8aa]"
                    }`}
                  >
                    <p className="mb-1 truncate text-xs font-extrabold text-[#7d5b38]">
                      {isOwnMessage ? "You" : sender.username}
                    </p>
                    <p className="wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-(--text-h)">
                      {msg.content ?? msg.message}
                    </p>
                    <time
                      dateTime={msg.createdAt}
                      className="mt-1 block text-right text-[0.68rem] text-[#6f7780]"
                    >
                      {sentTime}
                    </time>
                  </div>
                </article>
              </Fragment>
            );
          })
        )}
      </section>
    </main>
  );
}
