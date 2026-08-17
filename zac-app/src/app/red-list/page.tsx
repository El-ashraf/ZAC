'use client';
import { useEffect, useState } from 'react';
import AnimalCard from '@/components/AnimalCard';
import { ShieldCheck, Info } from 'lucide-react';

export default function RedList() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    fetch('/api/inat/endangered?limit=12')
      .then((r) => r.json())
      .then((d) => { setAnimals(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const counts = animals.reduce<Record<string, number>>((acc, a) => {
    acc[a.conservationStatus] = (acc[a.conservationStatus] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ minHeight: '100vh' }}>
      
      {/* Redesigned Minimal Page Hero */}
      <div style={{ position: 'relative', padding: '4rem 2rem 3rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="live-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>iNaturalist Live Feed</span>
            <span className="daily-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>Rotates Daily · {today}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', fontWeight: 650, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            🔴 IUCN Red List Species
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
            The global index of species requiring protection. Monitored live to highlight changing biodiversity statuses.
          </p>
        </div>
      </div>

      {/* Redesigned flat stats bar */}
      {!loading && animals.length > 0 && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(counts).map(([status, n]) => {
              const cols: Record<string, string> = {
                'Critically Endangered': '#f87171',
                'Endangered':            '#fb923c',
                'Vulnerable':            '#facc15',
                'Threatened':            '#fb923c',
              };
              const color = cols[status] || '#4ade80';
              return (
                <div key={status} style={{ borderBottom: `2px solid ${color}`, padding: '0.5rem 1rem', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{n}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redesigned About panel */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: '12px', borderLeft: '3px solid #ef4444', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ShieldCheck size={28} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.98rem', marginBottom: '0.2rem' }}>IUCN Conservation Mapping</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.85rem' }}>
              The IUCN Red List of Threatened Species provides taxonomic ratings reflecting extinction risk. Information below is fetched directly from naturalists worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {loading ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid">
            {animals.map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </div>
      
    </main>
  );
}
