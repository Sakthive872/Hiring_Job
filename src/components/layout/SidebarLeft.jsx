// File: src/components/layout/SidebarLeft.jsx
import {
  BarChart3,
  BriefcaseBusiness,
  FilePlus2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Avatar from '../ui/Avatar';

const quickLinks = [
  { to: '/profile', label: '+ Experience', icon: FilePlus2 },
  { to: '/jobs', label: 'Preferences', icon: Settings },
  { to: '/jobs', label: 'Job tracker', icon: BriefcaseBusiness },
  { to: '/profile', label: 'My Career Insights', icon: BarChart3 },
  { to: '/pipeline', label: 'Post a job', icon: FilePlus2 },
  { to: '/pipeline', label: 'Manage job posts', icon: Sparkles },
];
export default function SidebarLeft() {
  const user = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);
  const name = user?.name || '';
  return (
    <aside className="linkedin-left-rail">
      <section className="linkedin-profile-card">
        <div className="linkedin-cover" />
        <div className="linkedin-avatar-wrap">
          <Avatar
            src={user?.avatarUrl}
            name={name}
            size="large"
            isOnline={Boolean(user)}
          />
          <span>#OPENTOWORK</span>
        </div>
        <h2>{name || 'Profile'}</h2>
        <p>{user?.headline || 'Headline'}</p>
        <small>{user?.location || 'Location'}</small>
        <div className="linkedin-profile-stats">
          <span>
            <b>{user?.connectionsCount ?? '—'}</b> connections
          </span>
          <span>
            <b>{user?.profileViews ?? '—'}</b> profile views
          </span>
        </div>
      </section>
      <nav className="quick-links" aria-label="Profile quick links">
        {quickLinks
          .filter((link) => link.to !== '/pipeline' || role === 'recruiter')
          .map(({ to, label, icon: Icon }) => (
            <NavLink className="quick-link" to={to} key={`${to}-${label}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
      </nav>
      <div className="left-rail-footer">Grow your career with Workline</div>
    </aside>
  );
}
