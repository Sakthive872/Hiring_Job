// File: src/features/jobs/components/JobDetailPane.jsx
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, MapPin, X } from 'lucide-react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import StateView from '../../../components/ui/StateView';
import Button from '../../../components/ui/Button';
import { formatSalary } from '../../../utils/formatters';

export default function JobDetailPane({ jobId, onClose, onApply }) {
  const [state, setState] = useState({
    jobId: null,
    status: 'idle',
    data: null,
    error: null,
  });
  useEffect(() => {
    if (!jobId) return undefined;
    let active = true;
    axiosClient
      .get(endpoints.jobs.byId(jobId))
      .then(
        ({ data }) =>
          active && setState({ jobId, status: 'succeeded', data, error: null }),
      )
      .catch(
        (error) =>
          active &&
          setState({
            jobId,
            status: 'failed',
            data: null,
            error:
              error.response?.data?.message ||
              'Job details could not be loaded',
          }),
      );
    return () => {
      active = false;
    };
  }, [jobId]);
  if (!jobId) return null;
  const viewState =
    state.jobId === jobId
      ? state
      : { status: 'loading', data: null, error: null };
  const job = viewState.data;
  return (
    <aside className="job-detail-pane">
      <button
        className="icon-button"
        onClick={onClose}
        title="Close job details"
      >
        <X size={18} />
      </button>
      <StateView
        status={viewState.status}
        error={viewState.error}
        isEmpty={viewState.status === 'succeeded' && !job}
        emptyLabel="Job not found"
      >
        {job && (
          <>
            <div className="empty-graphic">
              <BriefcaseBusiness size={23} />
            </div>
            <h2>{job.title}</h2>
            <p>{job.company?.name}</p>
            <span className="job-meta">
              <MapPin size={13} /> {job.location}
            </span>
            <strong className="salary">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </strong>
            <div className="detail-copy">{job.description}</div>
            <Button onClick={() => onApply?.(job)}>Easy Apply</Button>
          </>
        )}
      </StateView>
    </aside>
  );
}
