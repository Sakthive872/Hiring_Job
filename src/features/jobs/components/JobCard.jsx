// File: src/features/jobs/components/JobCard.jsx
import { Bookmark, MapPin } from 'lucide-react';
import { useState } from 'react';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import { formatSalary } from '../../../utils/formatters';

export default function JobCard({ job, onSelect }) {
  const [saved, setSaved] = useState(Boolean(job.isSaved));
  const [saving, setSaving] = useState(false);
  const toggleBookmark = async (event) => {
    event.stopPropagation();
    setSaving(true);
    try {
      await axiosClient.post(endpoints.jobs.saved, {
        jobId: job.id,
        saved: !saved,
      });
      setSaved(!saved);
    } finally {
      setSaving(false);
    }
  };
  return (
    <article
      className="job-card"
      onClick={() => onSelect?.(job.id)}
      tabIndex="0"
      onKeyDown={(event) => event.key === 'Enter' && onSelect?.(job.id)}
    >
      <div className="job-card-head">
        <div className="company-logo">
          {job.company?.logoUrl ? (
            <img src={job.company.logoUrl} alt="" />
          ) : (
            '?'
          )}
        </div>
        <button
          className={saved ? 'bookmark saved' : 'bookmark'}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
          disabled={saving}
          onClick={toggleBookmark}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h3>{job.title}</h3>
      <p className="job-company">{job.company?.name || 'Company pending'}</p>
      <span className="job-meta">
        <MapPin size={13} /> {job.location || 'Location pending'}
      </span>
      <div className="job-badges">
        <span>{job.workplaceType || 'Workplace pending'}</span>
        {job.easyApply && <span className="status-badge">Easy Apply</span>}
      </div>
      <strong className="salary">
        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
      </strong>
    </article>
  );
}
