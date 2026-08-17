'use client';
import { useEffect, useState } from 'react';
import AnimalCard from '@/components/AnimalCard';
import { BookOpen } from 'lucide-react';

export default function Extinct() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'extinct');
    fetch('/api/inat/extinct?limit=12')
      .then((r) => r.json())
      .then((d) => { setAnimals(d); setLoading(false); })
      .catch(() => setLoading(false));
    return () => document.documentElement.removeAttribute('data-theme');
  }, []);

  return (
    <main style={{ minHeight: '100vh' }}>

      {/* Redesigned minimal Hero */}
      <div style={{ position: 'relative', padding: '4rem 2rem 3rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, rgba(148,163,184,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="live-badge" style={{ background: 'rgba(148,163,184,0.06)', borderColor: 'rgba(148,163,184,0.2)', color: '#94a3b8', fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>
              Taxonomic Loss Records
            </span>
            <span className="daily-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>Rotates Daily · {today}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', fontWeight: 650, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            ☠️ Extinct Animals Archive
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
            A historical registry of species lost to environmental shifts, industrial expansion, and habitat depletion.
          </p>
        </div>
      </div>

      {/* Redesigned flat stats strip */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem',
        }}>
          {[
            { stat: '1 species', label: 'Lost every 20 minutes', color: '#f87171' },
            { stat: '1 million+', label: 'Species under threat', color: '#fb923c' },
            { stat: '68%', label: 'Wildlife decline since 1970', color: '#facc15' },
            { stat: '150,000+', label: 'Species assessed by IUCN', color: '#86efac' },
          ].map((s) => (
            <div key={s.label} style={{ borderBottom: `2px solid ${s.color}`, padding: '0.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{s.stat}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Redesigned clean quote panel */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: '12px', borderLeft: '3px solid #94a3b8', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <BookOpen size={28} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.2rem' }}>
              &ldquo;The loss of biodiversity is one of the greatest threats to human well-being on this planet. We are eroding the very foundations of our ecosystems worldwide.&rdquo;
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>— IPBES Global Assessment Report</p>
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
