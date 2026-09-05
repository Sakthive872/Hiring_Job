// File: src/components/ui/Avatar.jsx
import { useState } from 'react';

export default function Avatar({
  src,
  name = '',
  size = 'medium',
  isOnline = false,
  onlineStatus,
  alt,
  className = '',
}) {
  const [failedSource, setFailedSource] = useState(null);
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const online = onlineStatus ?? isOnline;
  return (
    <span
      className={`ui-avatar ui-avatar-${size} ${className}`}
      aria-label={alt || name || 'User avatar'}
    >
      {src && failedSource !== src ? (
        <img src={src} alt={alt || name} onError={() => setFailedSource(src)} />
      ) : (
        <span aria-hidden="true">{initials || '?'}</span>
      )}
      {online && (
        <i className="ui-avatar-online" title="Online" aria-label="Online" />
      )}
    </span>
  );
}
