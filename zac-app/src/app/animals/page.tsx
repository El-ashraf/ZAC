'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import AnimalCard from '@/components/AnimalCard';
import { Search, SlidersHorizontal, Info } from 'lucide-react';

type Animal = Record<string, any>;

const STATUS_OPTIONS = [
  'Critically Endangered', 'Endangered', 'Vulnerable',
  'Near Threatened', 'Least Concern', 'Extinct', 'Not Evaluated',
];
const CATEGORY_OPTIONS = ['Mammal', 'Bird', 'Reptile', 'Amphibian', 'Fish', 'Invertebrate'];

const DEFAULT_QUERIES = ['lion', 'eagle', 'shark', 'wolf', 'bear', 'dolphin'];

export default function Animals() {
  const [results, setResults] = useState<Animal[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAnimals = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const q = query.trim().length >= 2 ? query : DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
      const res = await fetch(`/api/search-inat?q=${encodeURIComponent(q)}&limit=18`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnimals(''); }, [fetchAnimals]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAnimals(search), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, fetchAnimals]);

  const filtered = results.filter((a) => {
    const matchStatus = !statusFilter || a.conservationStatus === statusFilter;
    const matchCat = !categoryFilter || a.category === categoryFilter;
    return matchStatus && matchCat;
  });

  return (
    <main className="section" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Redesigned Minimalist Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '0.2rem' }}>
          🐾 Animal Database
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Query taxonomy maps and conservation details live from <strong>iNaturalist</strong>.
        </p>
      </div>

      {/* Modern Thin Search Panel */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.01)',
        border: '1px solid rgba(255, 255, 255, 0.04)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Minimalist Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.88rem', top: '50%', transform: 'translateY(-50%)', color: '#86efac', opacity: 0.6 }} />
            <input
              id="animal-search-input"
              type="text"
              placeholder="Search species worldwide..."
              className="form-input"
              style={{
                paddingLeft: '2.25rem',
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.9rem'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button 
                onClick={() => { setSearch(''); fetchAnimals(''); }}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#999' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Status filter select */}
          <select 
            id="status-filter" 
            className="form-input" 
            style={{ width: 'auto', minWidth: '160px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem', padding: '0.6rem 0.88rem' }}
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Category filter select */}
          <select 
            id="category-filter" 
            className="form-input" 
            style={{ width: 'auto', minWidth: '140px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.85rem', padding: '0.6rem 0.88rem' }}
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Clear action */}
          {(search || statusFilter || categoryFilter) && (
            <button 
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); fetchAnimals(''); }}
              style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '20px', padding: '0.4rem 0.88rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
            >
              ✕ Clear
            </button>
          )}

        </div>

        {/* Minimal Info Bar */}
        <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {loading ? (
            <span>⏳ Fetching iNaturalist database...</span>
          ) : total !== null ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Info size={12} />
              Found <strong>{total.toLocaleString()}</strong> taxonomic entries — displaying {filtered.length} matching criteria
            </span>
          ) : null}
        </div>

      </div>

      {/* Skeletons */}
      {loading && (
        <div className="grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.01)', minHeight: 300, border: '1px solid rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: 160, background: 'rgba(255,255,255,0.02)' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ height: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                <div style={{ height: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 4, width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results grid */}
      {!loading && (
        <>
          {filtered.length > 0 ? (
            <div className="grid">
              {filtered.map((a) => <AnimalCard key={a._id} animal={a} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>No matching species found for &ldquo;{search}&rdquo;.</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Try refining spelling or search by scientific genus.</p>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </main>
  );
}
