import { useState } from "react";
import { EmptyState, ErrorState, LoadingState, Notice, PageHeader } from "../../components/Common/PageState";
import useApi from "../../hooks/useApi";
import { getConversations, getMessages } from "../../services/message.service";
import { asList } from "../../utils/apiData";
import { formatDate } from "../../utils/format";

export default function WorkerMessages() {
  const conversations = useApi(getConversations, [], { immediate: true });
  const [activeConversation, setActiveConversation] = useState(null);
  const messages = useApi(
    () => getMessages(activeConversation._id || activeConversation.id),
    [activeConversation?._id, activeConversation?.id],
    { immediate: Boolean(activeConversation) },
  );

  const isMissingEndpoint = conversations.error?.status === 404;
  const items = asList(conversations.data);

  return (
    <>
      <PageHeader
        eyebrow="Worker portal"
        title="Messages"
        description="Read recruiter conversations linked to jobs."
      />

      {isMissingEndpoint && (
        <Notice type="warning">
          Messaging endpoints are listed in the README, but this backend does not expose them yet.
        </Notice>
      )}

      {!isMissingEndpoint && conversations.loading && <LoadingState label="Loading conversations..." />}
      {!isMissingEndpoint && conversations.error && <ErrorState error={conversations.error} onRetry={conversations.refetch} />}
      {!isMissingEndpoint && !conversations.loading && !conversations.error && (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-950">Conversations</h2>
            </div>
            {items.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No messages yet" message="Recruiter messages will appear here." />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((conversation) => (
                  <button
                    type="button"
                    key={conversation._id || conversation.id}
                    onClick={() => setActiveConversation(conversation)}
                    className="block w-full p-4 text-left hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-950">{conversation.title || conversation.job?.title || "Conversation"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.updatedAt || conversation.createdAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {!activeConversation && <EmptyState title="Select a conversation" message="Messages will load here." />}
            {activeConversation && messages.loading && <LoadingState label="Loading messages..." />}
            {activeConversation && messages.error && <ErrorState error={messages.error} onRetry={messages.refetch} />}
            {activeConversation && !messages.loading && !messages.error && (
              <div className="grid gap-3">
                {asList(messages.data).map((message) => (
                  <article key={message._id || message.id} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm text-slate-900">{message.content}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(message.createdAt)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
