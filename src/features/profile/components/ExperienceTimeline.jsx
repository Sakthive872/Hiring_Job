// File: src/features/profile/components/ExperienceTimeline.jsx
import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import StateView from '../../../components/ui/StateView';
import { formatShortDate } from '../../../utils/dateUtils';

export default function ExperienceTimeline({
  userId,
  items: externalItems,
  externalStatus,
  externalError,
  onEdit,
}) {
  const [state, setState] = useState({
    status: userId ? 'loading' : 'idle',
    items: [],
    error: null,
  });
  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    axiosClient
      .get(`${endpoints.users.byId(userId)}/experience`)
      .then(
        ({ data }) =>
          active &&
          setState({
            status: 'succeeded',
            items: data?.items || data || [],
            error: null,
          }),
      )
      .catch(
        (error) =>
          active &&
          setState({
            status: 'failed',
            items: [],
            error:
              error.response?.data?.message || 'Experience could not be loaded',
          }),
      );
    return () => {
      active = false;
    };
  }, [userId]);
  const items = externalItems ?? state.items;
  const status = externalStatus ?? state.status;
  const error = externalError ?? state.error;
  return (
    <section className="experience-timeline content-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Professional story</span>
          <h2>Experience</h2>
        </div>
      </div>
      <StateView
        status={status}
        error={error}
        isEmpty={status === 'succeeded' && items.length === 0}
        emptyLabel="No experience added"
      >
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <span className="timeline-dot" />
              <div>
                <div className="timeline-title">
                  <h3>{item.title}</h3>
                  <button
                    className="icon-button"
                    title="Edit experience"
                    onClick={() => onEdit?.(item)}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <strong>{item.company?.name || item.companyName}</strong>
                <p>
                  {formatShortDate(item.startDate)} -{' '}
                  {item.endDate ? formatShortDate(item.endDate) : 'Present'}
                </p>
                <span>{item.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </StateView>
    </section>
  );
}
