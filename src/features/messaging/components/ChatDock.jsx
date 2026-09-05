// File: src/features/messaging/components/ChatDock.jsx
import { useEffect, useState } from 'react';
import { MessageCircle, Sparkles, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import socketClient from '../../../services/socket/webSocketClient';
import {
  appendMessage,
  setActiveConversation,
  setConversationError,
  setConversations,
} from '../slice/activeConversationsSlice';
import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

export default function ChatDock() {
  const dispatch = useDispatch();
  const { conversations, activeId, status, error } = useSelector(
    (state) => state.activeConversations,
  );
  const userId = useSelector((state) => state.auth.user?.id);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState('messages');
  const [assistantKey, setAssistantKey] = useState('');
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantHistory, setAssistantHistory] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');

  useEffect(() => {
    const openAssistant = (event) => {
      setMode('assistant');
      setOpen(true);
      setAssistantPrompt(event.detail?.prompt || '');
    };
    window.addEventListener('open-ai-assistant', openAssistant);
    return () => window.removeEventListener('open-ai-assistant', openAssistant);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    axiosClient
      .get(endpoints.messages.threads, { signal: controller.signal })
      .then(({ data }) => dispatch(setConversations(data?.items || data || [])))
      .catch((requestError) => {
        if (
          requestError.name !== 'CanceledError' &&
          requestError.name !== 'AbortError'
        )
          dispatch(
            setConversationError(
              requestError.response?.data?.message ||
                'Conversations could not be loaded',
            ),
          );
      });
    const subscription = socketClient.subscribe(
      '/user/queue/messages',
      (message) => dispatch(appendMessage(JSON.parse(message.body))),
    );
    return () => {
      controller.abort();
      subscription?.then?.((item) => item.unsubscribe());
    };
  }, [dispatch, open]);
  const active = conversations.find((item) => item.id === activeId);

  const send = (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeId) return;
    const message = {
      threadId: activeId,
      senderId: userId,
      content: draft.trim(),
      createdAt: new Date().toISOString(),
    };
    dispatch(appendMessage(message));
    socketClient.publish(`/app/messages/${activeId}`, message);
    setDraft('');
  };

  const sendAssist = async (event) => {
    event.preventDefault();
    const message = assistantPrompt.trim();
    if (!message) return;

    setAssistantLoading(true);
    setAssistantError('');

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setAssistantHistory((current) => [...current, userMessage]);
    setAssistantPrompt('');

    try {
      const { data } = await axiosClient.post(endpoints.assistant.chat, {
        message,
        apiKey: assistantKey.trim(),
      });
      const payload = data?.data ?? data;
      const reply =
        payload?.reply || payload?.message || 'No response was returned.';
      setAssistantHistory((current) => [
        ...current,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (requestError) {
      const msg =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        requestError.message ||
        'Assistant request failed';
      setAssistantError(msg);
      setAssistantHistory((current) => [
        ...current,
        {
          role: 'assistant',
          content: `Sorry, I could not respond. ${msg}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <>
      <button
        className="assistant-launcher"
        onClick={() => {
          setMode('assistant');
          setOpen(true);
        }}
        aria-label="Open AI assistant"
      >
        <Sparkles size={17} />
        <span>Ask AI</span>
      </button>
      <button
        className="chat-launcher"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
      {open && (
        <section className="chat-dock">
          {mode === 'assistant' ? (
            <div className="assistant-panel">
              <div className="assistant-header">
                <div>
                  <span className="eyebrow">AI assistant</span>
                  <h2>OpenAI helper</h2>
                </div>
                <div className="assistant-mode-switch">
                  <button
                    type="button"
                    className={mode === 'messages' ? 'active' : ''}
                    onClick={() => setMode('messages')}
                  >
                    Messages
                  </button>
                  <button
                    type="button"
                    className={mode === 'assistant' ? 'active' : ''}
                    onClick={() => setMode('assistant')}
                  >
                    AI
                  </button>
                </div>
              </div>

              <div className="assistant-api-box">
                <label htmlFor="assistant-api-key">OpenAI API key</label>
                <input
                  id="assistant-api-key"
                  type="password"
                  value={assistantKey}
                  onChange={(event) => setAssistantKey(event.target.value)}
                  placeholder="Paste your OpenAI key here"
                />
              </div>

              <div className="assistant-chat-stream">
                {assistantHistory.length === 0 ? (
                  <div className="assistant-empty-state">
                    Ask for hiring help, interview prep, job summaries, or
                    profile rewrites.
                  </div>
                ) : (
                  assistantHistory.map((entry, index) => (
                    <div
                      key={`${entry.role}-${index}-${entry.timestamp || index}`}
                      className={`assistant-bubble ${entry.role}`}
                    >
                      <strong>
                        {entry.role === 'user' ? 'You' : 'Assistant'}
                      </strong>
                      <p>{entry.content}</p>
                    </div>
                  ))
                )}
                {assistantLoading && (
                  <div className="assistant-bubble assistant">
                    <strong>Assistant</strong>
                    <p>Thinking…</p>
                  </div>
                )}
              </div>

              {assistantError && (
                <div className="assistant-error">{assistantError}</div>
              )}

              <form className="assistant-composer" onSubmit={sendAssist}>
                <textarea
                  value={assistantPrompt}
                  rows={3}
                  onChange={(event) => setAssistantPrompt(event.target.value)}
                  placeholder="Ask the assistant anything..."
                  aria-label="Ask the assistant anything"
                />
                <button
                  type="submit"
                  disabled={!assistantPrompt.trim() || assistantLoading}
                >
                  {assistantLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="messages-mode-header">
                <strong>Messages</strong>
                <button type="button" onClick={() => setMode('assistant')}>
                  <Sparkles size={14} />
                  Ask AI
                </button>
              </div>
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                status={status}
                error={error}
                onSelect={(id) => dispatch(setActiveConversation(id))}
              />
              <div className="chat-content">
                <MessageThread conversation={active} currentUserId={userId} />
                <form className="chat-composer" onSubmit={send}>
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message"
                    aria-label="Write a message"
                  />
                  <button type="submit" disabled={!draft.trim() || !activeId}>
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
