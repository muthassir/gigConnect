
import React, { useEffect, useState } from 'react';
import { fetchGigs } from '../services/api';
import GigCard from '../components/GigCard';
import debounce from 'lodash.debounce';
import Alert from '../components/Alert';

export default function GigFeed() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

 
  const load = async (opts = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGigs({
        search: opts.search ?? search,
        category: opts.category ?? category,
        minPrice: opts.minPrice ?? minPrice,
        maxPrice: opts.maxPrice ?? maxPrice,
        page: opts.page ?? page,
        limit: 10,
      });
    
      setGigs(res.data.gigs || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };


  const debouncedLoad = React.useRef(
    debounce((params) => load(params), 500)
  ).current;

  useEffect(() => {
    debouncedLoad({ page: 1 });
    
    return () => debouncedLoad.cancel();
  }, [search, category, minPrice, maxPrice]);

  useEffect(() => {
    load({ page });
  }, [page]);

  const onSearchChange = (e) => setSearch(e.target.value);

  const onFilterReset = () => {
    setSearch('');
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="h-screen p-8 flex flex-col items-center gap-6">
      <h2 className="text-2xl mt-22">Main Gig Feed</h2>

      <div className="mt-8 flex gap-3">
        <input
          value={search}
          onChange={onSearchChange}
          placeholder="Search gigs..."
          className="border p-2 rounded flex-1"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded">
          <option value="all">All Categories</option>
          <option value="design">Design</option>
          <option value="dev">Development</option>
          <option value="writing">Writing</option>
        </select>
        <input value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} placeholder="Min price" className="border p-2 rounded w-24" />
        <input value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} placeholder="Max price" className="border p-2 rounded w-24" />
        <button onClick={onFilterReset} className="border p-2 rounded">Reset</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <Alert alert={error} />}

      {!loading && gigs.length === 0 && <p className='mt-4'>No gigs found</p>}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {gigs.map(g => <GigCard key={g._id} gig={g} />)}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-2 border rounded">Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-2 border rounded">Next</button>
      </div>
    </div>
  );
}
