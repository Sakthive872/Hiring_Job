// File: src/features/jobs/components/JobSearchBar.jsx
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDebounce from '../../../hooks/useDebounce';
import { fetchJobs } from '../jobsSlice';
import { setFilter } from '../slice/jobFilterSlice';

export default function JobSearchBar() {
  const dispatch = useDispatch();
  const keyword = useSelector((state) => state.jobFilters.keyword);
  const [value, setValue] = useState(keyword);
  const debouncedValue = useDebounce(value, 350);
  useEffect(() => {
    dispatch(setFilter({ key: 'keyword', value: debouncedValue }));
    dispatch(fetchJobs({ q: debouncedValue }));
  }, [debouncedValue, dispatch]);
  return (
    <form className="job-search" onSubmit={(event) => event.preventDefault()}>
      <Search size={18} aria-hidden="true" />
      <input
        aria-label="Search jobs"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search by title, skill, or company"
      />
    </form>
  );
}
