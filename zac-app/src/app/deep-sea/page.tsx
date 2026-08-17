'use client';
import { useEffect, useState } from 'react';
import AnimalCard from '@/components/AnimalCard';
import { Compass, Info } from 'lucide-react';

const DEEP_SEA_FACTS = [
  'The deep sea covers over 65% of the Earth\'s surface.',
  'Sunlight doesn\'t reach below 1,000 metres — the deep sea is in total darkness.',
  'Water pressure at 10,000m is over 1,000 atmospheres — equivalent to 50 jumbo jets on your shoulders.',
  'Many deep-sea creatures produce their own light — a phenomenon called bioluminescence.',
  'The deep sea is the largest habitat on Earth, yet remains largely unexplored.',
];

export default function DeepSea() {
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [factIdx, setFactIdx] = useState(0);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'deep-sea');
    fetch('/api/inat/deep-sea?limit=12')
      .then((r) => r.json())
      .then((d) => { setAnimals(d); setLoading(false); })
      .catch(() => setLoading(false));

    const iv = setInterval(() => setFactIdx((p) => (p + 1) % DEEP_SEA_FACTS.length), 5000);
    return () => {
      document.documentElement.removeAttribute('data-theme');
      clearInterval(iv);
    };
  }, []);

  return (
    <main style={{ minHeight: '100vh' }}>

      {/* Redesigned minimal Hero */}
      <div style={{ position: 'relative', padding: '4rem 2rem 3rem', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 65%)
          `,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="live-badge" style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)', color: '#22d3ee', fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>Benthic Record Feed</span>
            <span className="daily-badge" style={{ fontSize: '0.68rem', padding: '0.2rem 0.65rem' }}>Changes Daily · {today}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5.5vw, 3.6rem)', fontWeight: 650, letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            🌊 Deep-Sea Creatures
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 580, margin: '0 auto' }}>
            Explore bioluminescent wildlife adapted to the extreme pressure and total darkness of marine depths.
          </p>
        </div>
      </div>

      {/* Redesigned clean ocean fact panel */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid rgba(6,182,212,0.12)',
          borderRadius: 16, padding: '1.5rem 2rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justify: 'center', gap: '0.3rem' }}>
            <Compass size={12} /> Ocean Fact
          </p>
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 400, lineHeight: 1.6, minHeight: '2.2rem' }}>
            {DEEP_SEA_FACTS[factIdx]}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem', marginTop: '0.75rem' }}>
            {DEEP_SEA_FACTS.map((_, i) => (
              <button key={i} onClick={() => setFactIdx(i)} style={{ width: 6, height: 6, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, background: i === factIdx ? 'var(--primary)' : 'rgba(255,255,255,0.15)', transition: 'background 0.3s', transform: i === factIdx ? 'scale(1.3)' : 'scale(1)' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Redesigned depth stats strip */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { num: '10,935m', label: 'Challenger Deep depth', color: '#22d3ee' },
            { num: '95%', label: 'Sea depths unexplored', color: '#818cf8' },
            { num: '−2°C', label: 'Average deep temperature', color: '#67e8f9' },
            { num: '1,000+', label: 'Atmospheres of pressure', color: '#a5b4fc' },
          ].map((s) => (
            <div key={s.label} style={{ borderBottom: `2px solid ${s.color}`, padding: '0.5rem 1rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>{s.num}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
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
