// File: src/features/search/components/SearchResultsLayout.jsx
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Building2, UserRound } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StateView from '../../../components/ui/StateView';
import { searchAll, searchMessage } from '../api/searchApi';

const tabs = [
  { key: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { key: 'candidates', label: 'Candidates', icon: UserRound },
  { key: 'companies', label: 'Companies', icon: Building2 },
];
export default function SearchResultsLayout() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const activeTab = tabs.some((tab) => tab.key === params.get('type'))
    ? params.get('type')
    : 'jobs';
  const [state, setState] = useState({
    query: '',
    status: 'idle',
    data: null,
    error: null,
  });
  useEffect(() => {
    if (!query) return undefined;
    const controller = new AbortController();
    searchAll({ q: query }, controller.signal)
      .then((data) =>
        setState({ query, status: 'succeeded', data, error: null }),
      )
      .catch((error) => {
        if (error.name !== 'CanceledError' && error.name !== 'AbortError')
          setState({
            query,
            status: 'failed',
            data: null,
            error: searchMessage(error),
          });
      });
    return () => controller.abort();
  }, [query]);
  const viewState =
    state.query === query
      ? state
      : { status: query ? 'loading' : 'idle', data: null, error: null };
  const setTab = (type) => {
    const next = new URLSearchParams(params);
    next.set('type', type);
    setParams(next);
  };
  const items = viewState.data?.[activeTab] || [];
  return (
    <section className="content-section search-results">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Universal search</span>
          <h2>{query ? `Results for “${query}”` : 'Search your workspace'}</h2>
        </div>
      </div>
      <div className="search-tabs" role="tablist">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            role="tab"
            aria-selected={activeTab === key}
            className={activeTab === key ? 'search-tab active' : 'search-tab'}
            onClick={() => setTab(key)}
            key={key}
          >
            <Icon size={15} />
            {label}
            {viewState.data && <span>{viewState.data[key].length}</span>}
          </button>
        ))}
      </div>
      <StateView
        status={viewState.status}
        error={viewState.error}
        isEmpty={
          viewState.status === 'idle' ||
          (viewState.status === 'succeeded' && items.length === 0)
        }
        emptyLabel={query ? `No ${activeTab} found` : 'Enter a search term'}
      >
        {items.length > 0 && (
          <div className="result-list">
            {items.map((item) => (
              <article
                className="result-row"
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/${activeTab}/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/${activeTab}/${item.id}`);
                  }
                }}
              >
                <strong>{item.title || item.name}</strong>
                <span>
                  {item.company?.name ||
                    item.headline ||
                    item.industry ||
                    'Details available in profile'}
                </span>
              </article>
            ))}
          </div>
        )}
      </StateView>
    </section>
  );
}
