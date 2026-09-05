// File: src/app/routeViews.jsx
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StateView from '../components/ui/StateView';
import Avatar from '../components/ui/Avatar';
import JobSearchBar from '../features/jobs/components/JobSearchBar';
import JobFilterBar from '../features/jobs/components/JobFilterBar';
import JobCard from '../features/jobs/components/JobCard';
import JobDetailPane from '../features/jobs/components/JobDetailPane';
import EasyApplyModal from '../features/jobs/components/EasyApplyModal';
import NotificationFeed from '../features/notifications/components/NotificationFeed';
import SearchResultsLayout from '../features/search/components/SearchResultsLayout';
import KanbanBoard from '../features/recruiter/components/KanbanBoard';
import ProfilePage from '../features/profile/components/ProfilePage';
import ConversationList from '../features/messaging/components/ConversationList';
import MessageThread from '../features/messaging/components/MessageThread';
import LoginForm from '../features/auth/components/LoginForm';
import SignupForm from '../features/auth/components/SignupForm';
import { setActiveConversation } from '../features/messaging/slice/activeConversationsSlice';
import axiosClient from '../services/api/axiosClient';
import endpoints from '../services/api/endpoints';

export function RoleGuard({ roles }) {
  const { status, role } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
export function PublicView({ mode = 'login' }) {
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return (
    <main className="public-view">
      <div className="auth-shell">
        <section className="auth-branding" aria-label="Workline introduction">
          <div className="brand-badge">Workline</div>
          <h1>Bring your work into focus.</h1>
          <p>
            Build your professional network, discover opportunities, and move
            your career forward in one connected workspace.
          </p>
          <ul className="feature-list">
            <li>Career opportunities tailored to you</li>
            <li>Recruiter pipelines and hiring visibility</li>
            <li>Clear conversations, updates, and job discovery</li>
          </ul>
        </section>

        <section className="auth-panel" aria-label="Authentication form">
          <span className="eyebrow">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </span>
          {mode === 'signup' ? <SignupForm /> : <LoginForm />}
        </section>
      </div>
    </main>
  );
}
export function WorkspaceView({ title, description }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const userId = currentUser?.id;
  const jobs = useSelector((state) => state.jobs);
  const jobItems = Array.isArray(jobs.items) ? jobs.items : [];
  const conversations = useSelector(
    (state) => state.activeConversations?.conversations || [],
  );
  const activeId = useSelector((state) => state.activeConversations?.activeId);
  if (title === 'Your overview') return <OverviewView />;
  if (title === 'Find work')
    return <JobsView jobs={jobs} jobItems={jobItems} />;
  if (title === 'Your profile') {
    return <ProfilePage userId={userId} accountUser={currentUser} />;
  }
  if (title === 'Universal search') return <SearchResultsLayout />;
  if (title === 'Messages')
    return (
      <section className="module-page">
        <header className="module-header">
          <span className="eyebrow">Inbox</span>
          <h1>Messaging</h1>
          <p>Keep conversations moving in one focused workspace.</p>
        </header>
        <div className="messages-page">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            status="idle"
            onSelect={(id) => dispatch(setActiveConversation(id))}
          />
          <MessageThread
            conversation={conversations.find((item) => item.id === activeId)}
          />
        </div>
      </section>
    );
  if (title === 'Notifications') return <NotificationFeed />;
  if (title === 'Talent pipeline')
    return (
      <section className="module-page">
        <header className="module-header">
          <span className="eyebrow">Recruiter workspace</span>
          <h1>Talent pipeline</h1>
          <p>Move candidates through each hiring stage.</p>
        </header>
        <KanbanBoard />
      </section>
    );
  if (title === 'Network feed') return <NetworkView />;
  return (
    <section className="module-page content-section module-empty">
      <span className="eyebrow">Workspace</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <StateView emptyLabel="Waiting for connected data" />
    </section>
  );
}

function JobsView({ jobs, jobItems }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  return (
    <>
      <section className="module-page jobs-workspace">
        <header className="module-header">
          <span className="eyebrow">Candidate jobs</span>
          <h1>Find your next opportunity</h1>
          <p>Search roles and refine your preferences.</p>
        </header>
        <JobSearchBar />
        <JobFilterBar />
        <StateView
          status={jobs.status}
          error={jobs.error}
          isEmpty={jobs.status === 'succeeded' && jobItems.length === 0}
          emptyLabel="No jobs available"
        >
          <div className="job-results">
            {jobItems.map((job) => (
              <JobCard key={job.id} job={job} onSelect={setSelectedJobId} />
            ))}
          </div>
        </StateView>
      </section>
      <JobDetailPane
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        onApply={setApplyJob}
      />
      <EasyApplyModal
        open={Boolean(applyJob)}
        job={applyJob}
        onClose={() => setApplyJob(null)}
      />
    </>
  );
}

function OverviewView() {
  const navigate = useNavigate();
  return (
    <section className="module-page">
      <section className="overview-hero">
        <div>
          <span className="eyebrow">Career workspace</span>
          <h1>Find work that fits your next chapter.</h1>
          <p>
            Use your live job feed, professional network, and conversations in
            one place.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => navigate('/jobs')}
          >
            Explore opportunities
          </button>
        </div>
        <div className="hero-pattern" aria-hidden="true">
          <span>HI</span>
        </div>
      </section>
      <section className="content-section overview-topic">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your workspace</span>
            <h2>Keep moving forward</h2>
          </div>
        </div>
        <div className="topic-grid">
          <article>
            <strong>Job preferences</strong>
            <p>Set the roles and locations you want to discover.</p>
          </article>
          <article>
            <strong>Professional network</strong>
            <p>Build relationships around the work you want to do.</p>
          </article>
          <article>
            <strong>Career story</strong>
            <p>
              Keep your profile and experience ready for the next conversation.
            </p>
          </article>
        </div>
      </section>
    </section>
  );
}
function NetworkView() {
  const [activeTab, setActiveTab] = useState('Grow');
  const [activeMenu, setActiveMenu] = useState('Connections');
  const currentUser = useSelector((state) => state.auth.user);
  const [profiles, setProfiles] = useState([]);
  const [connections, setConnections] = useState([]);
  const [networkState, setNetworkState] = useState({
    status: 'loading',
    error: null,
  });
  const [busyId, setBusyId] = useState(null);
  useEffect(() => {
    let mounted = true;
    const loadNetwork = async () => {
      setNetworkState({ status: 'loading', error: null });
      try {
        const profilesResponse = await axiosClient.get(
          endpoints.network.profiles,
        );
        const connectionsResponse = currentUser?.id
          ? await axiosClient.get(endpoints.network.connections(currentUser.id))
          : { data: [] };

        if (!mounted) return;
        setProfiles(profilesResponse.data?.data || profilesResponse.data || []);
        setConnections(
          connectionsResponse.data?.data || connectionsResponse.data || [],
        );
        setNetworkState({ status: 'succeeded', error: null });
      } catch (error) {
        if (!mounted) return;
        setNetworkState({
          status: 'failed',
          error: error.response?.data?.message || 'Network could not be loaded',
        });
      }
    };

    loadNetwork();
    return () => {
      mounted = false;
    };
  }, [currentUser?.id]);
  const connectionFor = (profileId) =>
    connections.find(
      (connection) =>
        connection.requesterId === profileId ||
        connection.recipientId === profileId,
    );
  const requestConnection = async (profileId) => {
    setBusyId(profileId);
    try {
      const { data } = await axiosClient.post(endpoints.network.request, {
        recipientId: profileId,
      });
      setConnections((items) => [...items, data?.data || data]);
    } catch (error) {
      setNetworkState({
        status: 'failed',
        error: error.response?.data?.message || 'Connection request failed',
      });
    } finally {
      setBusyId(null);
    }
  };
  const acceptConnection = async (connectionId) => {
    setBusyId(connectionId);
    try {
      const { data } = await axiosClient.patch(
        `${endpoints.network.status(connectionId)}?status=ACCEPTED`,
      );
      const accepted = data?.data || data;
      setConnections((items) =>
        items.map((item) => (item.id === connectionId ? accepted : item)),
      );
      setProfiles((items) =>
        items.map((profile) =>
          profile.id === accepted.requesterId ||
          profile.id === accepted.recipientId
            ? {
                ...profile,
                connectionsCount: (profile.connectionsCount || 0) + 1,
              }
            : profile,
        ),
      );
    } finally {
      setBusyId(null);
    }
  };
  const incomingRequests = connections.filter(
    (connection) =>
      connection.recipientId === currentUser?.id &&
      connection.status === 'PENDING',
  );
  return (
    <section className="network-module">
      <aside className="network-menu">
        <h1>Manage my network</h1>
        <nav>
          {[
            'Connections',
            'Following & followers',
            'Groups',
            'Events',
            'Pages',
            'Newsletters',
          ].map((label) => (
            <button
              type="button"
              key={label}
              className={activeMenu === label ? 'active' : ''}
              onClick={() => setActiveMenu(label)}
            >
              {label}
              <span>—</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="network-canvas">
        <div className="network-tabs">
          {['Grow', 'Catch up'].map((tab) => (
            <button
              className={activeTab === tab ? 'active' : ''}
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="network-status">
          {activeTab === 'Grow'
            ? 'No pending invitations '
            : 'No recent network activity '}
          <strong onClick={() => setActiveMenu('Connections')}>Manage</strong>
        </div>
        <section className="content-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Discover</span>
              <h2>
                {activeMenu === 'Connections'
                  ? 'People you may know'
                  : activeMenu}
              </h2>
            </div>
          </div>
          {networkState.status === 'failed' && (
            <div className="network-error">{networkState.error}</div>
          )}
          {activeTab === 'Catch up' && incomingRequests.length > 0 && (
            <div className="network-request-list">
              <h3>Connection requests</h3>
              {incomingRequests.map((request) => (
                <div className="network-request" key={request.id}>
                  <span>{request.requesterName} wants to connect</span>
                  <button
                    type="button"
                    onClick={() => acceptConnection(request.id)}
                    disabled={busyId === request.id}
                  >
                    {busyId === request.id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="network-profile-grid">
            {profiles.map((profile) => {
              const connection = connectionFor(profile.id);
              const profileInfo = profile.profile || {};
              const connected = connection?.status === 'ACCEPTED';
              return (
                <article className="network-profile-card" key={profile.id}>
                  <Avatar name={profile.username} size="large" />
                  <h3>{profile.username}</h3>
                  <p>{profileInfo.headline || 'Professional profile'}</p>
                  <small>{profileInfo.location || 'Location not added'}</small>
                  <strong>{profile.connectionsCount || 0} connections</strong>
                  <button
                    type="button"
                    disabled={Boolean(connection) || busyId === profile.id}
                    onClick={() => requestConnection(profile.id)}
                  >
                    {connected
                      ? 'Connected'
                      : connection?.status === 'PENDING'
                        ? 'Pending'
                        : busyId === profile.id
                          ? 'Sending...'
                          : 'Connect'}
                  </button>
                </article>
              );
            })}
          </div>
          {networkState.status === 'succeeded' && profiles.length === 0 && (
            <StateView emptyLabel="No profiles available" />
          )}
        </section>
      </div>
    </section>
  );
}
