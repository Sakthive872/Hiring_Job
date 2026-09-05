// File: src/components/ui/Skeleton.jsx
export default function Skeleton({
  width = '100%',
  height = '1rem',
  radius = '4px',
  className = '',
  count = 1,
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`ui-skeleton ${className}`}
          style={{ width, height, borderRadius: radius }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}
