// File: src/components/layout/SidebarRight.jsx
import {
  BriefcaseBusiness,
  Globe2,
  Megaphone,
  Pencil,
  UsersRound,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import StateView from '../ui/StateView';

export default function SidebarRight() {
  const jobs = useSelector((state) => state.jobs);
  const jobItems = Array.isArray(jobs.items) ? jobs.items : [];
  return (
    <aside className="linkedin-right-rail">
      <section className="right-widget ad-widget">
        <div className="ad-brand">
          <Megaphone size={16} /> Workline for Business
        </div>
        <h3>Promoted</h3>
      </section>
      <section className="right-widget">
        <header>
          <h3>People also viewed</h3>
          <button title="More options">•••</button>
        </header>
        <StateView
          status="idle"
          emptyLabel="Viewer recommendations are loading"
        />
      </section>
      <section className="right-widget">
        <header>
          <h3>Profile language</h3>
          <Pencil size={14} />
        </header>
        <p className="widget-value">
          <Globe2 size={14} />
        </p>
        <hr />
        <header>
          <h3>Public profile & URL</h3>
          <Pencil size={14} />
        </header>
        <p className="widget-link">Public profile URL</p>
      </section>
      <section className="right-widget">
        <header>
          <h3>Recommended roles</h3>
          <BriefcaseBusiness size={15} />
        </header>
        <StateView
          status={jobs.status}
          error={jobs.error}
          isEmpty={jobs.status === 'succeeded' && jobItems.length === 0}
          emptyLabel="No roles available"
        />
      </section>
      <div className="right-footer">
        <UsersRound size={14} /> Workline respects your privacy
      </div>
    </aside>
  );
}
