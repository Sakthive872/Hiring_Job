// File: src/features/profile/components/ProfilePage.jsx
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Globe2,
  Pencil,
  Plus,
  Sparkles,
} from 'lucide-react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import StateView from '../../../components/ui/StateView';
import ProfileHero from './ProfileHero';
import ExperienceTimeline from './ExperienceTimeline';
import ProfileEditModal from './ProfileEditModal';
import CreatePostModal from '../../feed/components/CreatePostModal';
import {
  getPreference,
  setPreference,
} from '../../../services/storage/localStorage';

function normalize(data, keys = []) {
  if (Array.isArray(data)) return data;
  for (const key of keys) if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
export default function ProfilePage({ userId, accountUser }) {
  const [state, setState] = useState(() => {
    const demoProfile = getPreference('demoProfile', null);
    const demoExperience = getPreference('demoExperience', []);
    return {
      status: userId ? 'loading' : demoProfile ? 'succeeded' : 'idle',
      profile: demoProfile || accountUser || null,
      experience: Array.isArray(demoExperience) ? demoExperience : [],
      error: null,
    };
  });
  const [editTarget, setEditTarget] = useState(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    Promise.all([
      axiosClient.get(endpoints.users.byId(userId)),
      axiosClient.get(`${endpoints.users.byId(userId)}/experience`),
    ])
      .then(([profileResponse, experienceResponse]) => {
        if (active)
          setState({
            status: 'succeeded',
            profile: profileResponse.data,
            experience: normalize(experienceResponse.data, [
              'items',
              'experience',
              'content',
            ]),
            error: null,
          });
      })
      .catch(
        (error) =>
          active &&
          setState({
            status: 'failed',
            profile: null,
            experience: [],
            error:
              error.response?.data?.message || 'Profile could not be loaded',
          }),
      );
    return () => {
      active = false;
    };
  }, [userId]);
  const profile = state.profile;
  const skills = normalize(profile?.skills, ['items', 'skills']);
  const languages = normalize(profile?.languages, ['items', 'languages']);
  const interests = normalize(profile?.interests, ['items', 'interests']);
  const apps = normalize(profile?.connectedApps, ['items', 'apps']);
  return (
    <section className="profile-page module-page">
      <ProfileHero
        userId={userId}
        profileData={profile}
        profileStatus={state.status}
        profileError={state.error}
        onEdit={(section) => setEditTarget({ section })}
      />
      <section className="profile-section content-section">
        <SectionHeading
          title="About"
          onEdit={() => setEditTarget({ section: 'about' })}
        />
        <StateView
          status={state.status}
          error={state.error}
          isEmpty={state.status === 'succeeded' && !profile?.about}
          emptyLabel="No About information added"
        >
          <p>{profile?.about}</p>
        </StateView>
      </section>
      <section className="profile-section content-section">
        <SectionHeading
          title="Activity"
          action="Create a post"
          onAction={() => setCreatePostOpen(true)}
        />
        <div className="profile-activity">
          <BarChart3 size={26} />
          <div>
            <strong>{profile?.followersCount ?? '—'} followers</strong>
            <p>Recent activity and posts will appear here.</p>
          </div>
        </div>
        <StateView
          status={state.status}
          error={state.error}
          isEmpty={state.status === 'succeeded' && !profile?.activities?.length}
          emptyLabel="No recent activity"
        />
      </section>
      <ExperienceTimeline
        userId={userId}
        items={state.experience}
        externalStatus={state.status}
        externalError={state.error}
        onEdit={(item) => setEditTarget({ section: 'experience', value: item })}
      />
      <section className="profile-section content-section">
        <SectionHeading
          title="Education"
          onEdit={() => setEditTarget({ section: 'education' })}
        />
        <StateView
          status={state.status}
          error={state.error}
          isEmpty={state.status === 'succeeded' && !profile?.education?.length}
          emptyLabel="No education added"
        >
          <div className="profile-items">
            {normalize(profile?.education, ['items', 'education']).map(
              (item) => (
                <div className="profile-item" key={item.id}>
                  <div className="item-icon">
                    <Globe2 size={20} />
                  </div>
                  <div>
                    <h3>{item.name || item.school}</h3>
                    <strong>{item.degree}</strong>
                    <p>
                      {item.startDate} - {item.endDate || 'Present'}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </StateView>
      </section>
      <ProfileCollection
        title="Skills"
        onEdit={() => setEditTarget({ section: 'skills' })}
        icon={Sparkles}
        items={skills}
        status={state.status}
        error={state.error}
        emptyLabel="No skills added"
      />
      <ProfileCollection
        title="Languages"
        onEdit={() => setEditTarget({ section: 'languages' })}
        icon={Globe2}
        items={languages}
        status={state.status}
        error={state.error}
        emptyLabel="No languages added"
      />
      <ProfileCollection
        title="Interests"
        onEdit={() => setEditTarget({ section: 'interests' })}
        icon={BriefcaseBusiness}
        items={interests}
        status={state.status}
        error={state.error}
        emptyLabel="No interests added"
      />
      <section className="profile-section content-section">
        <SectionHeading
          title="Connected apps"
          onEdit={() => setEditTarget({ section: 'connectedApps' })}
        />
        <StateView
          status={state.status}
          error={state.error}
          isEmpty={state.status === 'succeeded' && apps.length === 0}
          emptyLabel="No connected apps"
        >
          <div className="collection-grid">
            {apps.map((app) => (
              <div className="collection-chip" key={app.id}>
                {app.name || app.title}
              </div>
            ))}
          </div>
        </StateView>
      </section>
      {editTarget && (
        <ProfileEditModal
          open={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          section={editTarget.section}
          value={editTarget.value}
          profile={profile}
          userId={userId}
          onSaved={(data, section) => {
            setState((current) => {
              const next =
                section === 'experience'
                  ? {
                      ...current,
                      experience: current.experience.map((item) =>
                        item.id === editTarget.value?.id ? data : item,
                      ),
                    }
                  : {
                      ...current,
                      profile: { ...current.profile, ...(data || {}) },
                    };
              if (!userId) {
                setPreference('demoProfile', next.profile);
                setPreference('demoExperience', next.experience);
              }
              return next;
            });
            setEditTarget(null);
          }}
        />
      )}
      <CreatePostModal
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
      />
    </section>
  );
}
function SectionHeading({ title, action, onEdit, onAction }) {
  return (
    <header className="section-heading">
      <div>
        <span className="eyebrow">Profile</span>
        <h2>{title}</h2>
      </div>
      {action ? (
        <button className="outline-button" type="button" onClick={onAction}>
          <Plus size={14} /> {action}
        </button>
      ) : (
        <button
          className="icon-button"
          title={`Edit ${title}`}
          onClick={onEdit}
        >
          <Pencil size={17} />
        </button>
      )}
    </header>
  );
}
function ProfileCollection({
  title,
  icon: Icon,
  items,
  status,
  error,
  emptyLabel,
  onEdit,
}) {
  return (
    <section className="profile-section content-section">
      <SectionHeading title={title} onEdit={onEdit} />
      <StateView
        status={status}
        error={error}
        isEmpty={status === 'succeeded' && items.length === 0}
        emptyLabel={emptyLabel}
      >
        <div className="collection-grid">
          {items.map((item) => (
            <div className="collection-chip" key={item.id || item.name}>
              <Icon size={15} />
              {item.name || item.title || item.label}
            </div>
          ))}
        </div>
      </StateView>
    </section>
  );
}
