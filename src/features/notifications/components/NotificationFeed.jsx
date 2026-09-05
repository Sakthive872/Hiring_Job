// File: src/features/notifications/components/NotificationFeed.jsx
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import StateView from '../../../components/ui/StateView';
import { formatRelativeDate } from '../../../utils/dateUtils';

function normalizeNotifications(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function NotificationFeed() {
  const [state, setState] = useState({
    status: 'loading',
    items: [],
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    axiosClient
      .get(endpoints.notifications.list, { signal: controller.signal })
      .then(({ data }) =>
        setState({
          status: 'succeeded',
          items: normalizeNotifications(data),
          error: null,
        }),
      )
      .catch((error) => {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError')
          setState({
            status: 'failed',
            items: [],
            error:
              error.response?.data?.message ||
              'Notifications could not be loaded',
          });
      });
    return () => controller.abort();
  }, []);
  const notifications = Array.isArray(state.items) ? state.items : [];
  const markRead = async (notification) => {
    if (notification.readAt) return;
    await axiosClient.post(endpoints.notifications.read(notification.id));
    setState((current) => ({
      ...current,
      items: (Array.isArray(current.items) ? current.items : []).map((item) =>
        item.id === notification.id
          ? { ...item, readAt: new Date().toISOString() }
          : item,
      ),
    }));
  };
  return (
    <section className="notification-feed content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Inbox</span>
          <h2>Notifications</h2>
        </div>
        <Bell size={19} />
      </div>
      <StateView
        status={state.status}
        error={state.error}
        isEmpty={state.status === 'succeeded' && notifications.length === 0}
        emptyLabel="You are all caught up"
      >
        <div className="notification-list">
          {notifications.map((notification) => (
            <button
              className={
                notification.readAt
                  ? 'notification-row read'
                  : 'notification-row'
              }
              key={notification.id}
              onClick={() => markRead(notification)}
            >
              <span className="notification-icon">
                <Bell size={15} />
              </span>
              <span>
                <strong>{notification.title}</strong>
                <small>{notification.message}</small>
              </span>
              <time>{formatRelativeDate(notification.createdAt)}</time>
            </button>
          ))}
        </div>
      </StateView>
    </section>
  );
}
