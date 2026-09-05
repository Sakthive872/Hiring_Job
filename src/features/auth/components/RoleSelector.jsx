// File: src/features/auth/components/RoleSelector.jsx
export default function RoleSelector({ value, onChange, error }) {
  return (
    <fieldset className="role-selector" aria-invalid={Boolean(error)}>
      <legend>How will you use Workline?</legend>
      <div className="role-options">
        <label
          className={
            value === 'candidate' ? 'role-option selected' : 'role-option'
          }
        >
          <input
            type="radio"
            name="role"
            value="candidate"
            checked={value === 'candidate'}
            onChange={(event) => onChange(event.target.value)}
          />{' '}
          <span>
            <strong>Find opportunities</strong>
            <small>Build your profile and discover your next role.</small>
          </span>
        </label>
        <label
          className={
            value === 'recruiter' ? 'role-option selected' : 'role-option'
          }
        >
          <input
            type="radio"
            name="role"
            value="recruiter"
            checked={value === 'recruiter'}
            onChange={(event) => onChange(event.target.value)}
          />{' '}
          <span>
            <strong>Hire great people</strong>
            <small>Source candidates and build your hiring pipeline.</small>
          </span>
        </label>
      </div>
      {error && (
        <span className="ui-field-error" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
}
