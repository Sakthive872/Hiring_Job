// File: src/features/messaging/components/ConversationList.jsx
import Avatar from '../../../components/ui/Avatar';
import StateView from '../../../components/ui/StateView';
import { formatRelativeDate } from '../../../utils/dateUtils';

export default function ConversationList({
  conversations = [],
  activeId,
  status = 'idle',
  error,
  onSelect,
}) {
  return (
    <aside className="conversation-list">
      <h2>Messages</h2>
      <StateView
        status={status}
        error={error}
        isEmpty={
          status !== 'loading' &&
          status !== 'failed' &&
          conversations.length === 0
        }
        emptyLabel="No conversations yet"
      >
        <div>
          {conversations.map((conversation) => (
            <button
              className={
                conversation.id === activeId
                  ? 'conversation-row active'
                  : 'conversation-row'
              }
              key={conversation.id}
              onClick={() => onSelect?.(conversation.id)}
            >
              <Avatar
                src={conversation.participant?.avatarUrl}
                name={conversation.participant?.name}
                size="small"
                onlineStatus={conversation.participant?.isOnline}
              />
              <span>
                <strong>
                  {conversation.participant?.name || 'Conversation'}
                </strong>
                <small>
                  {conversation.lastMessage?.content || 'Start a conversation'}
                </small>
              </span>
              <time>
                {formatRelativeDate(conversation.lastMessage?.createdAt)}
              </time>
            </button>
          ))}
        </div>
      </StateView>
    </aside>
  );
}
