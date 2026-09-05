// File: src/features/profile/components/ProfileHero.jsx
import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Pencil,
} from 'lucide-react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import Avatar from '../../../components/ui/Avatar';
import StateView from '../../../components/ui/StateView';

export default function ProfileHero({
  userId,
  profileData,
  profileStatus,
  profileError,
  onEdit,
}) {
  const [state, setState] = useState({
    status: userId ? 'loading' : 'idle',
    data: null,
    error: null,
  });
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    axiosClient
      .get(endpoints.users.byId(userId))
      .then(
        ({ data }) =>
          active && setState({ status: 'succeeded', data, error: null }),
      )
      .catch(
        (error) =>
          active &&
          setState({
            status: 'failed',
            data: null,
            error:
              error.response?.data?.message || 'Profile could not be loaded',
          }),
      );
    return () => {
      active = false;
    };
  }, [userId]);
  const profile = profileData ?? state.data;
  const viewStatus = profileStatus ?? state.status;
  const viewError = profileError ?? state.error;
  return (
    <section className="profile-hero">
      <div className="profile-hero-banner">
        <button
          className="profile-edit-button"
          title="Edit profile banner"
          onClick={() => onEdit?.('profile')}
        >
          <Pencil size={16} />
        </button>
      </div>
      <div className="profile-hero-content">
        <Avatar
          src={profile?.avatarUrl}
          name={profile?.name}
          size="large"
          onlineStatus={profile?.isOnline}
        />
        <div className="profile-identity">
          <StateView
            status={viewStatus}
            error={viewError}
            isEmpty={viewStatus === 'succeeded' && !profile}
            emptyLabel="Complete your profile"
          >
            {profile && (
              <>
                <div className="identity-title">
                  <h2>{profile.name}</h2>
                  <BadgeCheck size={17} />
                </div>
                <p>{profile.headline}</p>
                <span>
                  <MapPin size={13} /> {profile.location}
                </span>
                <div className="profile-links">
                  <span>
                    <BriefcaseBusiness size={13} />{' '}
                    {profile.company?.name || profile.companyName}
                  </span>
                  <span>
                    <GraduationCap size={13} />{' '}
                    {profile.education?.name || profile.educationName}
                  </span>
                </div>
                <strong className="profile-connections">
                  {profile.connectionsCount ?? '—'} connections
                </strong>
              </>
            )}
          </StateView>
        </div>
        <button
          className="profile-edit-button"
          title="Edit profile"
          onClick={() => onEdit?.('profile')}
        >
          <Pencil size={16} />
        </button>
      </div>
      <div className="profile-actions">
        <button className="primary-button">Open to</button>
        <button className="secondary-button">Add section</button>
        <button className="secondary-button">Enhance profile</button>
        <button className="outline-button">Resources</button>
      </div>
      <div className="open-to-panel">
        <strong>Open to work</strong>
        <span>Choose the opportunities and locations you want to share.</span>
        <button
          className="profile-edit-button"
          title="Edit open to work"
          onClick={() => onEdit?.('openTo')}
        >
          <Pencil size={15} />
        </button>
      </div>
    </section>
  );
}
