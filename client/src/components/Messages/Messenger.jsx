import { useEffect, useRef, useState } from "react";
import Button from "../Common/Button";
import Input from "../Common/Input";
import Modal from "../Common/Modal";
import { EmptyState, ErrorState, LoadingState } from "../Common/PageState";
import useApi from "../../hooks/useApi";
import useAuth from "../../hooks/useAuth";
import { getConversations, getMessages, markThreadRead, searchRecipients, sendMessage } from "../../services/message.service";
import { onSocketConnect, onSocketEvent } from "../../services/socket.service";
import { asList, userIdOf } from "../../utils/apiData";
import { formatDate } from "../../utils/format";

function conversationIdOf(conversation) {
  return conversation?.id || conversation?._id || conversation?.otherUser?.id || null;
}

function initialsOf(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(value) {
  if (!value) return "";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days < 7 ? `${days}d ago` : formatDate(value);
}

function MessageBubble({ message, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] shadow-sm ${mine ? "rounded-br-sm bg-blue-600 text-white dark:bg-[#005c4b]" : "rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-[#202c33] dark:text-[#e9edef]"}`}>
        {message.content}
        <span className={`mt-1 block text-right text-[10px] ${mine ? "text-blue-100" : "text-slate-400"}`}>
          {timeAgo(message.createdAt)}
          {!mine && !message.read && <span className="ml-2 font-semibold text-blue-500 dark:text-[#00a884]">New</span>}
        </span>
      </div>
    </div>
  );
}

export default function Messenger() {
  const { user, isAuthenticated } = useAuth();
  const myUserId = userIdOf(user);
  const scrollRef = useRef(null);

  const conversations = useApi(getConversations, [], { immediate: true });
  const [active, setActive] = useState(null);
  const activeId = conversationIdOf(active);

  const thread = useApi(() => getMessages(activeId), [activeId], { immediate: Boolean(activeId) });
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [recipientError, setRecipientError] = useState("");

  const conversationItems = asList(conversations.data);
  const messageItems = asList(thread.data);
  const refetchConversations = conversations.refetch;
  const refetchThread = thread.refetch;
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  // Live updates: a new message from the other side, or one of our own
  // messages being read, should refresh the list and the open thread.
  // Listeners stay attached across conversation switches (the active thread
  // is tracked via a ref) so an inbound event is never dropped mid-switch.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const offNewMessage = onSocketEvent("message:new", (message) => {
      refetchConversations();
      const current = activeIdRef.current;
      if (current && [String(message?.senderId), String(message?.recipientId)].includes(String(current))) {
        refetchThread();
      }
    });

    const offRead = onSocketEvent("message:read", (payload) => {
      refetchConversations();
      const current = activeIdRef.current;
      if (current && String(payload?.threadId) === String(current)) {
        refetchThread();
      }
    });

    // Whenever the socket (re)connects, pull the latest state instead of
    // waiting for the next event (covers missed events and reconnects).
    const offConnect = onSocketConnect(() => {
      refetchConversations();
      if (activeIdRef.current) refetchThread();
    });

    return () => {
      offNewMessage();
      offRead();
      offConnect();
    };
  }, [isAuthenticated, refetchConversations, refetchThread]);

  // Fallback so conversations/threads are never stale even if the socket
  // silently drops: refresh when the tab regains focus and on a quiet poll.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const refresh = () => {
      refetchConversations();
      if (activeIdRef.current) refetchThread();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", onVisibilityChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 15000);

    return () => {
      window.removeEventListener("focus", onVisibilityChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(interval);
    };
  }, [isAuthenticated, refetchConversations, refetchThread]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.data, thread.loading, activeId]);

  useEffect(() => {
    if (!composerOpen) return undefined;

    const timer = setTimeout(() => {
      setRecipientLoading(true);
      setRecipientError("");
      searchRecipients(recipientQuery)
        .then((payload) => setRecipients(asList(payload)))
        .catch((error) => setRecipientError(error.message || "Unable to find people to message."))
        .finally(() => setRecipientLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [composerOpen, recipientQuery]);

  const startConversation = (recipient) => {
    const id = recipient?.id || recipient?._id;
    setComposerOpen(false);
    setRecipientQuery("");
    setRecipients([]);
    setActive({
      id,
      otherUser: { id, name: recipient.name, role: recipient.role },
      job: null,
      unreadCount: 0,
    });
  };

  const selectConversation = (conversation) => {
    setActive({ ...conversation, unreadCount: 0 });
    markThreadRead(conversationIdOf(conversation))
      .then(() => conversations.refetch())
      .catch(() => undefined);
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !activeId) return;

    setSending(true);
    setSendError("");
    try {
      await sendMessage({ recipientId: activeId, jobId: active?.job?.id, content });
      setDraft("");
      await Promise.all([thread.refetch(), conversations.refetch()]);
    } catch (error) {
      setSendError(error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
      <aside className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 ${active ? "hidden lg:block" : "block"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-[#222d34]">
          <h2 className="font-bold text-slate-950 dark:text-[#e9edef]">Conversations</h2>
          <Button variant="secondary" className="min-h-9 px-3 text-sm" onClick={() => setComposerOpen(true)}>
            New message
          </Button>
        </div>

        {conversations.loading && <LoadingState label="Loading conversations..." />}
        {conversations.error && <ErrorState error={conversations.error} onRetry={conversations.refetch} />}
        {!conversations.loading && !conversations.error && (
          <div className="divide-y divide-slate-100 dark:divide-[#22303a]">
            {conversationItems.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No messages yet" message="Your conversations with employers and workers will appear here." />
              </div>
            ) : (
              conversationItems.map((conversation) => {
                const name = conversation.otherUser?.name || "User";
                const isSelected = conversationIdOf(conversation) === activeId;
                const lastSentByMe = String(conversation.lastMessage?.senderId || "") === String(myUserId);
                return (
                  <button
                    key={conversationIdOf(conversation)}
                    type="button"
                    onClick={() => selectConversation(conversation)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${isSelected ? "bg-blue-50 dark:bg-[#2a3942]" : "hover:bg-slate-50 dark:hover:bg-[#2a3942]/60"}`}
                  >
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {initialsOf(name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[15px] font-semibold text-slate-950 dark:text-[#e9edef]">{name}</span>
                        {conversation.lastMessage?.createdAt && (
                          <span className="shrink-0 text-[11px] text-slate-400 dark:text-[#8696a0]">{timeAgo(conversation.lastMessage.createdAt)}</span>
                        )}
                      </span>
                      {conversation.job?.title && <span className="mt-0.5 block truncate text-xs font-medium text-blue-700 dark:text-[#00a884]">{conversation.job.title}</span>}
                      <span className="mt-1 block truncate text-[15px] text-slate-500 dark:text-[#aebac1]">
                        {lastSentByMe && <span className="font-medium">You: </span>}
                        {conversation.lastMessage?.content || "Start the conversation"}
                      </span>
                      <span className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <span className="mt-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white dark:bg-[#00a884]">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </aside>

      <section className={`max-h-[70vh] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-[#222d34] dark:bg-[#202c33] dark:shadow-black/25 ${active ? "flex" : "hidden lg:flex"}`}>
        {!active ? (
          <div className="grid flex-1 place-items-center p-6">
            <EmptyState title="Select a conversation" message="Pick a thread to read and reply to messages." />
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-slate-100 p-4 dark:border-[#222d34]">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={() => setActive(null)}
                className="-ml-1 grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-[#e9edef] dark:hover:bg-[#2a3942] lg:hidden"
              >
                ←
              </button>
              <span className="hidden h-10 w-10 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white lg:grid">
                {initialsOf(active.otherUser?.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold tracking-tight text-slate-950 dark:text-[#e9edef]">{active.otherUser?.name || "User"}</p>
                <p className="truncate text-xs text-slate-500 dark:text-[#8696a0]">
                  {active.otherUser?.role === "EMPLOYER" ? "Employer" : active.otherUser?.role === "WORKER" ? "Worker" : active.otherUser?.role}
                  {active.job?.title ? ` · ${active.job.title}` : ""}
                </p>
              </div>
            </header>

            {thread.loading && <div className="p-6"><LoadingState label="Loading messages..." /></div>}
            {thread.error && <div className="p-6"><ErrorState error={thread.error} onRetry={thread.refetch} /></div>}
            {!thread.loading && !thread.error && (
              <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {messageItems.length === 0 ? (
                  <div className="py-8">
                    <EmptyState title="No messages yet" message="Send the first message below." />
                  </div>
                ) : (
                  messageItems.map((message) => (
                    <MessageBubble key={message._id || message.id} message={message} mine={String(message.senderId || message.sender) === String(myUserId)} />
                  ))
                )}
              </div>
            )}

            <form onSubmit={submitMessage} className="border-t border-slate-100 p-4 dark:border-[#222d34]">
              {sendError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{sendError}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Type a message..."
                  className="min-h-12 flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-[#2a3942] dark:bg-[#2a3942] dark:text-[#e9edef] dark:placeholder:text-[#8696a0] dark:focus:border-[#00a884] dark:focus:ring-[#00a884]/25"
                />
                <Button type="submit" loading={sending} disabled={!draft.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </>
        )}
      </section>

      <Modal open={composerOpen} title="Start a new conversation" onClose={() => setComposerOpen(false)}>
        <Input
          autoFocus
          label="Find someone to message"
          placeholder="Search by name"
          value={recipientQuery}
          onChange={(event) => setRecipientQuery(event.target.value)}
          inputClassName="mb-4"
        />

        {recipientLoading && <LoadingState label="Searching..." />}
        {recipientError && <ErrorState error={recipientError} />}
        {!recipientLoading && !recipientError && (
          <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-[#22303a] dark:border-[#2a3942]">
            {recipients.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No one found" message="Try a different name, or ask the other person to contact you first." />
              </div>
            ) : (
              recipients.map((recipient) => (
                <button
                  key={recipient.id || recipient._id}
                  type="button"
                  onClick={() => startConversation(recipient)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-[#2a3942]/60"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {initialsOf(recipient.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-slate-900 dark:text-[#e9edef]">{recipient.name}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-[#8696a0]">
                      {recipient.role === "EMPLOYER" ? "Employer" : recipient.role === "WORKER" ? "Worker" : recipient.role}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}