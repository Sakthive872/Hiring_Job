// File: src/features/jobs/components/JobFilterBar.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setFilters } from '../slice/jobFilterSlice';

export default function JobFilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.jobFilters);
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    dispatch(
      setFilters({
        keyword: searchParams.get('keyword') || '',
        location: searchParams.get('location') || '',
        workplaceType: searchParams.get('workplaceType') || '',
        employmentType: searchParams.get('employmentType') || '',
        experienceLevel: searchParams.get('experienceLevel') || '',
      }),
    );
  }, [dispatch, searchParams]);
  const update = (key) => (event) => {
    const next = { ...filters, [key]: event.target.value, page: 1 };
    dispatch(setFilters(next));
    const params = new URLSearchParams();
    Object.entries(next).forEach(([name, value]) => {
      if (value) params.set(name, value);
    });
    setSearchParams(params);
  };
  return (
    <div className="job-filter-bar">
      <select
        aria-label="Location"
        value={filters.location}
        onChange={update('location')}
      >
        <option value="">Any location</option>
        <option value="remote">Remote</option>
      </select>
      <select
        aria-label="Workplace type"
        value={filters.workplaceType}
        onChange={update('workplaceType')}
      >
        <option value="">Any workplace</option>
        <option value="remote">Remote</option>
        <option value="hybrid">Hybrid</option>
        <option value="onsite">On-site</option>
      </select>
      <select
        aria-label="Employment type"
        value={filters.employmentType}
        onChange={update('employmentType')}
      >
        <option value="">Any employment</option>
        <option value="full-time">Full time</option>
        <option value="part-time">Part time</option>
        <option value="contract">Contract</option>
      </select>
    </div>
  );
}
