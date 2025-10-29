import React, { useEffect, useState } from 'react';
import { fetchGigs, searchGigs } from '../services/api';
import GigCard from '../components/gigs/GigCard';
import debounce from 'lodash.debounce';
import Alert from '../components/Alert';

export default function GigFeed() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null)

 const loadGigs = async (opts = {}) => {
  setLoading(true);
  setError(null);
  try {
    const params = {
      search: opts.search ?? search,
      category: opts.category ?? category !== 'all' ? category : undefined,
      minBudget: opts.minBudget ?? minBudget,
      maxBudget: opts.maxBudget ?? maxBudget,
      location: opts.location ?? location,
      skills: opts.skills ?? skills,
      page: opts.page ?? page,
      limit: 12,
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    //  search for filtered searches
    let res;
    if (Object.keys(params).length > 2) { 
      res = await searchGigs(params);
    } else {
      res = await fetchGigs(params);
    }
    
    setGigs(res.data || []);
    setPage(res.pagination?.current || 1);
    setTotalPages(res.pagination?.pages || 1);
  } catch (err) {
    console.error(err);
    setError('Failed to load gigs');
  } finally {
    setLoading(false);
  }
};

  const debouncedLoad = React.useRef(
    debounce((params) => loadGigs(params), 500)
  ).current;

  useEffect(() => {
    debouncedLoad({ page: 1 });
    
    return () => debouncedLoad.cancel();
  }, [search, category, minBudget, maxBudget, location, skills]);

  useEffect(() => {
    loadGigs({ page });
  }, [page]);

  const onSearchChange = (e) => setSearch(e.target.value);
  const onLocationChange = (e) => setLocation(e.target.value);
  const onSkillsChange = (e) => setSkills(e.target.value);

  const onFilterReset = () => {
    setSearch('');
    setCategory('all');
    setMinBudget('');
    setMaxBudget('');
    setLocation('');
    setSkills('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-success mb-4">Find Your Next Gig</h1>
          <p className="text-lg text-gray-600">Discover amazing opportunities from clients worldwide</p>
        </div>

        {/* search, filters */}
        <div className="card bg-base-100 shadow-lg mb-8">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <input
                value={search}
                onChange={onSearchChange}
                placeholder="Search gigs..."
                className="input input-bordered"
              />
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="select select-bordered"
              >
                <option value="all">All Categories</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="writing">Writing</option>
                <option value="marketing">Marketing</option>
                <option value="consulting">Consulting</option>
              </select>
              <input 
                value={location} 
                onChange={onLocationChange}
                placeholder="Location" 
                className="input input-bordered" 
              />
              <input 
                value={skills} 
                onChange={onSkillsChange}
                placeholder="Skills (comma separated)" 
                className="input input-bordered" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input 
                value={minBudget} 
                onChange={(e) => setMinBudget(e.target.value)} 
                placeholder="Min budget" 
                className="input input-bordered" 
                type="number"
              />
              <input 
                value={maxBudget} 
                onChange={(e) => setMaxBudget(e.target.value)} 
                placeholder="Max budget" 
                className="input input-bordered" 
                type="number"
              />
              <button onClick={onFilterReset} className="btn btn-outline">Reset Filters</button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center my-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && <Alert alert={error} />}

        {!loading && gigs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-2xl text-gray-500 mb-4">No gigs found</div>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gigs.map(gig => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="text-lg">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}