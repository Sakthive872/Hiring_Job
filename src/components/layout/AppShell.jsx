// File: src/components/layout/AppShell.jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Navbar from './Navbar';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import { receiveNotification } from '../../features/notifications/notificationsSlice';
import socketClient from '../../services/socket/webSocketClient';
import ChatDock from '../../features/messaging/components/ChatDock';

export default function AppShell() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const moduleName = pathname.split('/')[1] || 'home';
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (!import.meta.env.VITE_WS_URL) return undefined;
    const subscription = socketClient.subscribe(
      '/user/queue/notifications',
      (message) => dispatch(receiveNotification(JSON.parse(message.body))),
    );
    return () => {
      subscription?.then?.((item) => item.unsubscribe());
      socketClient.disconnect();
    };
  }, [dispatch]);
  return (
    <div className={`app-shell linkedin-shell module-${moduleName}`}>
      <Navbar search={search} onSearchChange={setSearch} />
      <div className="workspace linkedin-workspace">
        <SidebarLeft />
        <main className="main-content">
          <Outlet />
        </main>
        <SidebarRight />
      </div>
      <ChatDock />
    </div>
  );
}
