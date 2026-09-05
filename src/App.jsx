// File: src/App.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { fetchJobs, setQuery } from './features/jobs/jobsSlice';
import {
  markAllRead,
  receiveNotification,
} from './features/notifications/notificationsSlice';

const modules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'jobs', label: 'Find work', icon: BriefcaseBusiness },
  { id: 'pipeline', label: 'Talent pipeline', icon: Users },
  { id: 'network', label: 'Network feed', icon: Sparkles },
];

function StateView({
  status,
  error,
  emptyLabel = 'Nothing here yet',
  isEmpty = false,
  children,
}) {
  if (status === 'loading')
    return (
      <div className="state-panel">
        <div className="shimmer line wide" />
        <div className="shimmer line" />
        <div className="shimmer block" />
      </div>
    );
  if (status === 'failed')
    return (
      <div className="state-panel state-error">
        <span className="state-icon">!</span>
        <strong>{error || 'Something went wrong'}</strong>
        <span>Check your connection and try again.</span>
      </div>
    );
  if (isEmpty)
    return (
      <div className="state-panel">
        <div className="empty-graphic">
          <FileText size={22} />
        </div>
        <strong>{emptyLabel}</strong>
        <span>New activity will appear here when it arrives.</span>
      </div>
    );
  return (
    children || (
      <div className="state-panel">
        <div className="empty-graphic">
          <FileText size={22} />
        </div>
        <strong>{emptyLabel}</strong>
        <span>New activity will appear here when it arrives.</span>
      </div>
    )
  );
}

function App() {
  const dispatch = useDispatch();
  const jobs = useSelector((state) => state.jobs);
  const unread = useSelector((state) => state.notifications.unread);
  const [activeModule, setActiveModule] = useState('overview');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch(fetchJobs({ q: search })),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [dispatch, search]);
  useEffect(() => {
    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      onConnect: () =>
        client.subscribe('/user/queue/notifications', (message) =>
          dispatch(receiveNotification(JSON.parse(message.body))),
        ),
    });
    if (import.meta.env.VITE_WS_URL) client.activate();
    return () => client.deactivate();
  }, [dispatch]);
  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };
  const submitSearch = (event) => {
    event.preventDefault();
    dispatch(setQuery(search));
    setActiveModule('jobs');
  };
  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand-mark">
          <span>W</span>
          <div>
            <strong>workline</strong>
            <small>people. purpose. progress.</small>
          </div>
        </div>
        <form className="universal-search" onSubmit={submitSearch}>
          <Search size={17} />
          <input
            aria-label="Search across Workline"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people, roles, companies"
          />
          <kbd>⌘ K</kbd>
        </form>
        <div className="top-actions">
          <button className="icon-button" title="Help">
            <CircleHelp size={19} />
          </button>
          <button
            className="icon-button notification-button"
            title="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <Bell size={19} />
            {unread > 0 && <i>{unread}</i>}
          </button>
          <button className="profile-menu">
            <span className="avatar avatar-small">AM</span>
            <ChevronDown size={15} />
          </button>
        </div>
      </nav>
      <div className="workspace">
        <aside className="left-rail">
          <div className="profile-card">
            <div className="profile-cover" />
            <div className="avatar profile-avatar">AM</div>
            <strong>Alex Morgan</strong>
            <span>Product designer</span>
            <span className="location">San Francisco, CA</span>
            <div className="profile-stats">
              <span>
                <b>0</b> connections
              </span>
              <span>
                <b>0</b> profile views
              </span>
            </div>
            <button
              className="text-button"
              onClick={() =>
                showToast('Profile editor is ready for your API connection.')
              }
            >
              View profile <span>→</span>
            </button>
          </div>
          <div className="rail-nav">
            {modules.map(({ id, label, icon: Icon }) => (
              <button
                className={
                  activeModule === id ? 'rail-link active' : 'rail-link'
                }
                onClick={() => setActiveModule(id)}
                key={id}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
          <div className="rail-footer">
            <button className="rail-link">
              <Settings size={17} />
              Settings
            </button>
            <span>© 2026 Workline</span>
          </div>
        </aside>
        <main className="main-content">
          <header className="page-header">
            <div>
              <span className="eyebrow">
                {activeModule === 'overview'
                  ? 'Tuesday, September 3'
                  : 'Workspace'}
              </span>
              <h1>
                {activeModule === 'overview'
                  ? 'Good morning, Alex.'
                  : modules.find((module) => module.id === activeModule)?.label}
              </h1>
              <p>
                {activeModule === 'overview'
                  ? 'A clear view of what is moving across your professional world.'
                  : 'Your live workspace, connected to the data that matters.'}
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() =>
                showToast('Composer opened. Connect POST /feed to publish.')
              }
            >
              + Create update
            </button>
          </header>
          {activeModule === 'overview' && (
            <Overview
              jobs={jobs}
              onBrowse={() => setActiveModule('jobs')}
              onToast={showToast}
            />
          )}
          {activeModule === 'jobs' && (
            <Jobs
              jobs={jobs}
              search={search}
              setSearch={setSearch}
              onToast={showToast}
            />
          )}
          {activeModule === 'pipeline' && (
            <ModuleEmpty
              icon={Users}
              title="Talent pipeline"
              description="Candidate stages, recruiter workspaces, and hiring momentum belong here."
              action="Create pipeline"
              onClick={() =>
                showToast('Pipeline creation is ready for POST /pipelines.')
              }
            />
          )}
          {activeModule === 'network' && <Feed onToast={showToast} />}
        </main>
        <aside className="right-rail">
          <div className="rail-heading">
            <span>Live pulse</span>
            <span className="online-dot">● connected</span>
          </div>
          <div className="pulse-card">
            <span className="pulse-label">Your next move</span>
            <h3>Make one meaningful connection today.</h3>
            <p>
              Smart recommendations will appear as your network data arrives.
            </p>
            <button
              className="secondary-button"
              onClick={() => setActiveModule('network')}
            >
              Explore network
            </button>
          </div>
          <div className="side-section">
            <div className="rail-heading">
              <span>Saved searches</span>
              <button title="Add saved search">+</button>
            </div>
            <StateView emptyLabel="No saved searches" />
          </div>
        </aside>
      </div>
      {showNotifications && (
        <div
          className="drawer-backdrop"
          onClick={() => setShowNotifications(false)}
        >
          <aside
            className="notification-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div>
                <span className="eyebrow">Inbox</span>
                <h2>Notifications</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowNotifications(false)}
                title="Close"
              >
                <X size={19} />
              </button>
            </div>
            <StateView emptyLabel="You are all caught up" />
            <button
              className="text-button drawer-read"
              onClick={() => dispatch(markAllRead())}
            >
              Mark all as read
            </button>
          </aside>
        </div>
      )}
      {toast && (
        <div className="toast">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
function Overview({ jobs, onBrowse, onToast }) {
  return (
    <div className="dashboard-grid">
      <section className="content-section feature-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Recommended for you</span>
            <h2>Roles with real momentum</h2>
          </div>
          <button className="ghost-button" onClick={onBrowse}>
            See all jobs <span>→</span>
          </button>
        </div>
        <StateView
          status={jobs.status}
          error={jobs.error}
          isEmpty={jobs.status === 'succeeded' && jobs.items.length === 0}
          emptyLabel="No recommendations yet"
        >
          <div className="job-empty">
            <div className="empty-graphic">
              <BriefcaseBusiness size={23} />
            </div>
            <div>
              <strong>Connect your job feed</strong>
              <p>
                Your personalized role recommendations will populate from GET
                /jobs.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => onToast('Job search is ready.')}
            >
              Browse roles
            </button>
          </div>
        </StateView>
      </section>
      <section className="content-section activity-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Workspace health</span>
            <h2>At a glance</h2>
          </div>
        </div>
        <div className="metric-row">
          <div>
            <strong>0</strong>
            <span>Applications</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Unread messages</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Profile reach</span>
          </div>
        </div>
      </section>
      <section className="content-section timeline-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your journey</span>
            <h2>Experience timeline</h2>
          </div>
          <button className="icon-button" title="Edit experience">
            <FileText size={18} />
          </button>
        </div>
        <StateView emptyLabel="Your story starts here" />
      </section>
    </div>
  );
}
function Jobs({ jobs, search, setSearch, onToast }) {
  return (
    <section className="content-section jobs-view">
      <div className="jobs-toolbar">
        <div>
          <span className="eyebrow">Candidate portal</span>
          <h2>Find your next chapter</h2>
        </div>
        <div className="filter-chips">
          <button className="filter-chip active">All roles</button>
          <button className="filter-chip">Remote</button>
          <button className="filter-chip">Easy apply</button>
        </div>
      </div>
      <div className="job-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, skill, or company"
        />
      </div>
      <StateView
        status={jobs.status}
        error={jobs.error}
        isEmpty={jobs.status === 'succeeded' && jobs.items.length === 0}
        emptyLabel="No roles match this search"
      >
        <div className="job-list">
          {jobs.items.map((job) => (
            <article className="job-row" key={job.id}>
              <div className="company-logo">
                {job.company?.name?.slice(0, 1) || '?'}
              </div>
              <div>
                <strong>{job.title}</strong>
                <span>
                  {job.company?.name || 'Company pending'} ·{' '}
                  {job.location || 'Location pending'}
                </span>
                <small>{job.workplaceType || 'Workplace type pending'}</small>
              </div>
              <button
                className="secondary-button"
                onClick={() => onToast('Easy Apply wizard opened.')}
              >
                Apply
              </button>
            </article>
          ))}
        </div>
      </StateView>
    </section>
  );
}
function Feed({ onToast }) {
  return (
    <section className="content-section feed-view">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Professional network</span>
          <h2>What is happening</h2>
        </div>
        <button
          className="primary-button"
          onClick={() => onToast('Post composer opened.')}
        >
          + Post
        </button>
      </div>
      <StateView emptyLabel="Your feed is waiting">
        <div className="feed-empty">
          <div className="empty-graphic">
            <MessageCircle size={23} />
          </div>
          <strong>Your network is quiet for now</strong>
          <p>Posts from people and companies you follow will appear here.</p>
          <button
            className="secondary-button"
            onClick={() => onToast('Network discovery is ready.')}
          >
            Find people to follow
          </button>
        </div>
      </StateView>
    </section>
  );
}
function ModuleEmpty({ icon: Icon, title, description, action, onClick }) {
  return (
    <section className="content-section module-empty">
      <div className="empty-graphic large">
        <Icon size={30} />
      </div>
      <span className="eyebrow">Module workspace</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="primary-button" onClick={onClick}>
        {action}
      </button>
    </section>
  );
}
export default App;
