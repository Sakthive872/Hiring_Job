// File: src/components/ui/StateView.jsx
import Skeleton from './Skeleton';

export default function StateView({
  status = 'idle',
  error,
  isEmpty = true,
  emptyLabel = 'Nothing here yet',
  children,
}) {
  if (status === 'loading')
    return (
      <div className="state-panel">
        <Skeleton height="12px" width="78%" />
        <Skeleton height="12px" width="56%" />
        <Skeleton height="56px" width="82%" />
      </div>
    );
  if (status === 'failed')
    return (
      <div className="state-panel state-error">
        <span className="state-icon">!</span>
        <strong>{error || 'Something went wrong'}</strong>
        <span>Check your connection and try again.</span>
      </div>
    );
  if (isEmpty)
    return (
      <div className="state-panel">
        <div className="empty-graphic">
          <span>◌</span>
        </div>
        <strong>{emptyLabel}</strong>
        <span>New activity will appear here when it arrives.</span>
      </div>
    );
  return children;
}
