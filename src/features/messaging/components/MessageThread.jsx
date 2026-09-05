// File: src/features/messaging/components/MessageThread.jsx
import { useEffect, useRef } from 'react';
import Avatar from '../../../components/ui/Avatar';
import StateView from '../../../components/ui/StateView';
import { formatRelativeDate } from '../../../utils/dateUtils';

export default function MessageThread({
  conversation,
  currentUserId,
  status = 'idle',
  error,
}) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);
  if (!conversation) return <StateView emptyLabel="Select a conversation" />;
  const messages = conversation.messages || [];
  return (
    <section className="message-thread">
      <header>
        <Avatar
          src={conversation.participant?.avatarUrl}
          name={conversation.participant?.name}
          size="medium"
          onlineStatus={conversation.participant?.isOnline}
        />
        <div>
          <strong>{conversation.participant?.name || 'Conversation'}</strong>
          <span>
            {conversation.participant?.isOnline ? 'Online now' : 'Offline'}
          </span>
        </div>
      </header>
      <div className="message-stream">
        <StateView
          status={status}
          error={error}
          isEmpty={
            status !== 'loading' && status !== 'failed' && messages.length === 0
          }
          emptyLabel="No messages yet"
        >
          <div>
            {messages.map((message) => (
              <article
                className={
                  message.senderId === currentUserId
                    ? 'message outgoing'
                    : 'message'
                }
                key={message.id}
              >
                <p>{message.content}</p>
                <time>{formatRelativeDate(message.createdAt)}</time>
              </article>
            ))}
          </div>
        </StateView>
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
