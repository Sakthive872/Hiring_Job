// File: src/features/recruiter/components/CandidateCard.jsx
import { Mail, MapPin, MoreHorizontal } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

export default function CandidateCard({ candidate, onStageChange }) {
  const fullName =
    candidate.name ||
    [candidate.firstName, candidate.lastName].filter(Boolean).join(' ') ||
    'Candidate';
  return (
    <article
      className="candidate-card"
      draggable
      onDragStart={(event) =>
        event.dataTransfer.setData('candidateId', candidate.id)
      }
    >
      <div className="candidate-card-head">
        <Avatar
          src={candidate.avatarUrl}
          name={fullName}
          size="medium"
          isOnline={candidate.isOnline}
        />
        <button className="icon-button" title="Candidate actions">
          <MoreHorizontal size={17} />
        </button>
      </div>
      <h3>{fullName}</h3>
      <p>{candidate.headline || 'Professional profile'}</p>
      <span className="candidate-meta">
        <MapPin size={13} /> {candidate.location || 'Location pending'}
      </span>
      {candidate.matchScore !== undefined && (
        <span className="match-badge">{candidate.matchScore}% match</span>
      )}
      <div className="candidate-actions">
        <button className="icon-button" title="Email candidate">
          <Mail size={15} />
        </button>
        <select
          aria-label={`Move ${fullName} to stage`}
          value={candidate.stage || ''}
          onChange={(event) =>
            onStageChange?.(candidate.id, event.target.value)
          }
        >
          <option value="">Move to stage</option>
          <option value="Applied">Applied</option>
          <option value="Screening">Screening</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </article>
  );
}
