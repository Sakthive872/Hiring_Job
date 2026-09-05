// File: src/components/layout/Navbar.jsx
import {
  Bell,
  BriefcaseBusiness,
  Grid3X3,
  Home,
  MapPin,
  MessageCircle,
  Network,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Avatar from '../ui/Avatar';
import { logout } from '../../features/auth/slice/authSlice';

const primaryLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/network', label: 'My Network', icon: Network },
  { to: '/jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { to: '/messages', label: 'Messaging', icon: MessageCircle },
];
const assistantSuggestions = [
  'Improve my profile headline',
  'Prepare me for an interview',
  'Find roles that match my skills',
];
export default function Navbar({ search, onSearchChange }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const isJobSearch = pathname === '/' || pathname === '/jobs';
  const [assistantSearch, setAssistantSearch] = useState('');
  const [assistantFocused, setAssistantFocused] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const assistantInputRef = useRef(null);
  const accountRef = useRef(null);
  const unread = useSelector((state) => state.notifications.unread);
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    const focusAssistant = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        assistantInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusAssistant);
    return () => window.removeEventListener('keydown', focusAssistant);
  }, []);
  useEffect(() => {
    const closeAccountMenu = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', closeAccountMenu);
    return () => document.removeEventListener('mousedown', closeAccountMenu);
  }, []);
  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };
  const submitAssistantSearch = (event) => {
    event.preventDefault();
    const prompt = assistantSearch.trim();
    if (!prompt) return;
    window.dispatchEvent(
      new CustomEvent('open-ai-assistant', { detail: { prompt } }),
    );
    setAssistantSearch('');
    setAssistantFocused(false);
  };
  return (
    <header className="linkedin-topbar">
      <div className="nav-inner">
        <Link className="twoin-brand" to="/" aria-label="Hiring home">
          <span className="twoin-mark">Hi</span>
          <span className="twoin-word">Hiring</span>
        </Link>
        <form
          className={isJobSearch ? 'dual-search' : 'single-search'}
          onSubmit={submitSearch}
        >
          {isJobSearch ? (
            <>
              <label>
                <Search size={16} />
                <input
                  aria-label="Search by title or skill"
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Job title, skill, or keyword"
                />
              </label>
              <label className="location-search">
                <MapPin size={16} />
                <input aria-label="Search by location" placeholder="Location" />
              </label>
            </>
          ) : (
            <label>
              <Search size={16} />
              <input
                aria-label="Search Workline"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search Workline"
              />
            </label>
          )}
          <button type="submit" aria-label="Search">
            <Search size={17} />
          </button>
        </form>
        <form
          className={assistantFocused ? 'ai-search is-focused' : 'ai-search'}
          onSubmit={submitAssistantSearch}
        >
          <Sparkles size={16} />
          <input
            ref={assistantInputRef}
            aria-label="Ask AI assistant"
            value={assistantSearch}
            onChange={(event) => setAssistantSearch(event.target.value)}
            onFocus={() => setAssistantFocused(true)}
            placeholder="Ask AI assistant..."
          />
          {assistantSearch && (
            <button
              type="button"
              className="ai-search-clear"
              onClick={() => setAssistantSearch('')}
              aria-label="Clear AI prompt"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" aria-label="Ask AI assistant">
            <Search size={16} />
          </button>
          {assistantFocused && (
            <div className="ai-suggestions">
              <span>Try asking</span>
              {assistantSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setAssistantSearch(suggestion);
                    assistantInputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </form>
        <nav className="primary-nav" aria-label="Primary navigation">
          {primaryLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              end={to === '/'}
              className={({ isActive }) =>
                isActive ? 'primary-nav-link active' : 'primary-nav-link'
              }
              to={to}
              key={to}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            className={({ isActive }) =>
              isActive
                ? 'primary-nav-link notification-nav active'
                : 'primary-nav-link notification-nav'
            }
            to="/notifications"
          >
            <Bell size={19} />
            <span>Notifications</span>
            {unread > 0 && <i>{unread}</i>}
          </NavLink>
          <div className="account-menu-wrap" ref={accountRef}>
            <button
              className={
                accountOpen
                  ? 'primary-nav-link me-nav active'
                  : 'primary-nav-link me-nav'
              }
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
            >
              <Avatar name={user?.name?.charAt(0) || ''} size="small" />
              <span>Me⌄</span>
            </button>
            {accountOpen && (
              <div className="account-menu" role="menu">
                <div className="account-menu-user">
                  <Avatar name={user?.name?.charAt(0) || ''} size="medium" />
                  <div>
                    <strong>{user?.name || 'Your account'}</strong>
                    <small>{user?.email || 'Signed in account'}</small>
                  </div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate('/profile');
                  }}
                >
                  Me profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="account-signout"
                  onClick={() =>
                    dispatch(logout()).finally(() => navigate('/login'))
                  }
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
        <div className="business-nav">
          <button className="business-button">
            <Grid3X3 size={18} />
            <span>For Business</span>
          </button>
          <button className="premium-button">Try Premium</button>
        </div>
      </div>
    </header>
  );
}
