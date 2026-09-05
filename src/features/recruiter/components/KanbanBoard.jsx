// File: src/features/recruiter/components/KanbanBoard.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CandidateCard from './CandidateCard';
import StateView from '../../../components/ui/StateView';
import { fetchPipeline, updateCandidateStage } from '../api/recruiterApi';

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
export default function KanbanBoard({ jobId }) {
  const dispatch = useDispatch();
  const { pipeline, status, error } = useSelector((state) => state.recruiter);
  const candidatesInPipeline = Array.isArray(pipeline) ? pipeline : [];
  const [actionError, setActionError] = useState(null);
  useEffect(() => {
    dispatch(fetchPipeline(jobId ? { jobId } : {}));
  }, [dispatch, jobId]);
  const moveCandidate = async (candidateId, stage) => {
    setActionError(null);
    const result = await dispatch(updateCandidateStage({ candidateId, stage }));
    if (updateCandidateStage.rejected.match(result))
      setActionError(result.payload);
    else dispatch(fetchPipeline(jobId ? { jobId } : {}));
  };
  const dropCandidate = (event, stage) => {
    event.preventDefault();
    const candidateId = event.dataTransfer.getData('candidateId');
    if (candidateId) moveCandidate(candidateId, stage);
  };
  return (
    <section className="kanban-board" aria-label="Candidate pipeline">
      {actionError && (
        <div className="state-error pipeline-error" role="alert">
          {actionError}
        </div>
      )}
      {stages.map((stage) => {
        const candidates = candidatesInPipeline.filter(
          (candidate) => candidate.stage === stage,
        );
        return (
          <div
            className="kanban-column"
            key={stage}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropCandidate(event, stage)}
          >
            <header>
              <h3>{stage}</h3>
              <span>{candidates.length}</span>
            </header>
            {status === 'loading' && <StateView status="loading" />}
            {status === 'failed' && <StateView status="failed" error={error} />}
            {status !== 'loading' &&
              status !== 'failed' &&
              candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onStageChange={moveCandidate}
                />
              ))}
            {status === 'succeeded' && candidates.length === 0 && (
              <StateView emptyLabel="No candidates" />
            )}
          </div>
        );
      })}
    </section>
  );
}
