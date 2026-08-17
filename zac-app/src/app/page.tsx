'use client';
import { useEffect, useState, useCallback } from 'react';
import AnimalCard from '@/components/AnimalCard';
import Link from 'next/link';
import { Compass, Calendar, ArrowRight, BookOpen, Globe } from 'lucide-react';

type Animal = Record<string, any>;
type Sighting = { id: number; observedOn: string; place: string; userName: string; photoUrl: string | null; uri: string };

const FACTS = [
  'A group of flamingos is called a flamboyance.',
  'Octopuses have three hearts and blue blood.',
  'Sloths can hold their breath longer than dolphins — up to 40 minutes!',
  'The mantis shrimp can punch with the force of a bullet — 1,500 Newtons.',
  'Butterflies taste food with their feet.',
  "A tiger's stripes extend to the skin — each pattern is unique like a fingerprint.",
  'Elephants are the only animals that cannot jump.',
  'A group of jellyfish is called a smack.',
  'Sharks are older than trees — they have existed for over 450 million years.',
  'Crows can recognise and remember human faces.',
  'Wombat droppings are cube-shaped — the only animal to produce cube-shaped scat.',
  'Pistol shrimp can snap their claws fast enough to create a shockwave that stuns prey.',
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  'Critically Endangered': { bg: 'rgba(239,68,68,0.06)',   color: '#f87171' },
  'Endangered':            { bg: 'rgba(249,115,22,0.06)',  color: '#fb923c' },
  'Vulnerable':            { bg: 'rgba(234,179,8,0.06)',   color: '#facc15' },
  'Near Threatened':       { bg: 'rgba(16,185,129,0.06)',  color: '#34d399' },
  'Least Concern':         { bg: 'rgba(34,197,94,0.06)',   color: '#4ade80' },
  'Extinct':               { bg: 'rgba(148,163,184,0.05)', color: '#94a3b8' },
  'Threatened':            { bg: 'rgba(249,115,22,0.06)',  color: '#fb923c' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { bg: 'rgba(99,102,241,0.06)', color: '#a5b4fc' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '0.3rem 0.85rem', borderRadius: 40, fontWeight: 600, fontSize: '0.78rem', border: `1px solid ${s.color}25` }}>
      {status}
    </span>
  );
}

function getFallbackDescription(name: string, category: string): string {
  if (category === 'Mammal') {
    return `The ${name} is a highly adapted mammal representing a vital link in its ecosystem's trophic structure. Like other species of its class, it possesses distinct anatomical and behavioral traits shaped by its environment, playing a crucial role in maintaining biological balance in its native habitat.`;
  }
  if (category === 'Bird') {
    return `The ${name} is an avian species featuring specialized adaptations for flight, foraging, and nesting. As an indicator species, its population levels and behavioral patterns provide critical insights into the overall ecological health and stability of its geographic range.`;
  }
  if (category === 'Reptile') {
    return `The ${name} is an ectothermic reptilian species uniquely suited to its climate and terrain. Its physiological adaptations allow it to thrive in specific ecological niches, where it operates as an essential predator or prey within the local food chain.`;
  }
  if (category === 'Amphibian') {
    return `The ${name} is an amphibian species characterized by its biphasic life cycle and highly permeable skin. Because of its sensitivity to environmental shifts, it serves as a crucial bioindicator for wetland and forest ecosystem health.`;
  }
  if (category === 'Fish') {
    return `The ${name} is an aquatic species adapted for survival in marine or freshwater environments. Its specialized sensory systems, swimming biomechanics, and feeding behaviors are key to the energy dynamics of its aquatic community.`;
  }
  return `The ${name} is a unique animal species playing an essential role in its native habitat's biodiversity. Its presence contributes to the complex ecological relationships and evolutionary heritage that define its region's natural environment.`;
}

function rewriteDescription(description: string, name: string, scientificName: string, category: string): string {
  if (!description || description.trim() === '' || description.includes('is a threatened species tracked by')) {
    return getFallbackDescription(name, category);
  }
  
  // 1. Remove HTML tags
  let cleaned = description.replace(/<[^>]*>/g, '');
  
  // 2. Remove Wikipedia reference citations like [1], [2], etc.
  cleaned = cleaned.replace(/\[\d+\]/g, '');
  
  // 3. Remove parentheses containing the scientific name
  const nameParts = scientificName.split(' ');
  const regexPattern = new RegExp(`\\(\\s*${nameParts[0]}\\s*${nameParts[1] || ''}[^)]*\\)`, 'gi');
  cleaned = cleaned.replace(regexPattern, '');
  cleaned = cleaned.replace(/\(\s*also\s+known\s+as[^)]*\)/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 4. Limit length
  if (cleaned.length > 250) {
    cleaned = cleaned.slice(0, 245).trim() + '...';
  }

  return cleaned;
}

export default function Home() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [featured, setFeatured] = useState<Animal | null>(null);
  const [aotWObs, setAotwObs] = useState<number | null>(null);
  const [weekNumber, setWeekNumber] = useState<number | null>(null);
  const [redList, setRedList] = useState<Animal[]>([]);
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  const [factIndex, setFactIndex] = useState(0);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [sightingsTotal, setSightingsTotal] = useState<number | null>(null);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRed, setLoadingRed] = useState(true);
  const [loadingSpotlight, setLoadingSpotlight] = useState(true);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await fetch('/api/inat/featured');
      const data = await res.json();
      setFeatured(data.animal);
      setAotwObs(data.observationCount);
      setWeekNumber(data.weekNumber);
      if (data.animal?.scientificName) {
        const sRes = await fetch(`/api/live-sightings?taxon=${encodeURIComponent(data.animal.scientificName)}&limit=4`);
        const sData = await sRes.json();
        setSightings(sData.sightings || []);
        setSightingsTotal(sData.totalResults);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingFeatured(false); }
  }, []);

  useEffect(() => {
    fetchFeatured();

    fetch('/api/inat/endangered?limit=3')
      .then((r) => r.json())
      .then((d) => { setRedList(d); setLoadingRed(false); })
      .catch(() => setLoadingRed(false));

    fetch('/api/inat/endangered?limit=9')
      .then((r) => r.json())
      .then((d) => { setRecentAnimals(d); setLoadingSpotlight(false); })
      .catch(() => setLoadingSpotlight(false));
  }, [fetchFeatured]);

  useEffect(() => {
    const iv = setInterval(() => setFactIndex((p) => (p + 1) % FACTS.length), 6000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const checkHomeAuth = () => {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((d) => {
          if (d.authenticated) setUser({ email: d.email });
          else setUser(null);
        })
        .catch(() => setUser(null));
    };
    checkHomeAuth();
    window.addEventListener('auth-change', checkHomeAuth);
    return () => window.removeEventListener('auth-change', checkHomeAuth);
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main style={{ position: 'relative' }}>
      
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'rgba(8, 12, 10, 0.82)',
      }} />

      {/* Hero Section */}
      <section className="hero" style={{ minHeight: '82vh' }}>
        <div className="hero-content" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div className="hero-eyebrow" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', marginBottom: 0 }}>
              <span style={{ width: '5px', height: '5px', background: 'var(--primary)', borderRadius: '50%', display: 'inline-block' }} />
              LIVE WILDLIFE CONSERVATION DATABASE
            </div>
            <Link href={user ? "/profile" : "/login"} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              padding: '0.4rem 1rem', 
              borderRadius: '20px', 
              background: user ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)', 
              border: `1px solid ${user ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
              color: user ? 'var(--primary)' : 'var(--accent)',
              transition: 'all 0.2s ease',
            }}>
              <span>{user ? `👤 ${user.email.split('@')[0]}` : '🔑 Log In / Sign Up'}</span>
            </Link>
          </div>
          <h1 style={{ letterSpacing: '-1.5px', fontWeight: 650, fontSize: 'clamp(2.5rem, 6.5vw, 4.8rem)' }}>
            Nature in <span className="highlight" style={{ fontWeight: 700 }}>Focus</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(240, 253, 244, 0.8)', fontWeight: 300, lineHeight: 1.65, marginBottom: '2.5rem' }}>
            Real-time biodiversity cataloging powered by iNaturalist. Access distribution stats, species red-lists, and track wild sightings instantly.
          </p>
          <div className="hero-cta">
            <Link href="/dashboard" className="btn-hero" style={{ padding: '0.75rem 2rem' }}>
              Enter Dashboard <ArrowRight size={16} />
            </Link>
            <Link href="/animals" className="btn-hero-outline" style={{ padding: '0.75rem 2rem' }}>
              Database Search
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Stats Strip */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', padding: '2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-around', gap: '2rem', flexWrap: 'wrap', textAlign: 'center' }}>
          {[
            { num: '900K+', label: 'Naturalists' },
            { num: '50M+', label: 'Observations' },
            { num: '150K+', label: 'Species Logged' },
            { num: 'API v1', label: 'iNaturalist Core' }
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 750, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>{s.num}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Animal of the Week */}
      <section className="section" style={{ padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 40, padding: '0.25rem 0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>
                ⭐ WEEKLY SPOTLIGHT
              </span>
            </div>
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 0 }}>Animal of the Week</h2>
          </div>
          {aotWObs !== null && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{aotWObs.toLocaleString()}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>iNaturalist Sightings</div>
            </div>
          )}
        </div>

        {loadingFeatured ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="skeleton" style={{ height: 300, borderRadius: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', justifyContent: 'center' }}>
              <div className="skeleton" style={{ height: 24, width: '40%' }} />
              <div className="skeleton" style={{ height: 16, width: '70%' }} />
              <div className="skeleton" style={{ height: 16, width: '60%' }} />
            </div>
          </div>
        ) : featured ? (
          <div className="glass" style={{ padding: '2rem', borderRadius: 16, display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, width: '380px', height: '260px' }}>
              <img
                src={featured.images[0]}
                alt={featured.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/420x300/101712/22c55e?text=${encodeURIComponent(featured.name)}`; }}
              />
              <div style={{ position: 'absolute', top: 12, left: 12 }}>
                <StatusPill status={featured.conservationStatus} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#fff' }}>{featured.name}</h3>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1rem' }}>
                {featured.scientificName}
              </p>

              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(240, 253, 244, 0.7)', marginBottom: '1.25rem' }}>
                {rewriteDescription(featured.description, featured.name, featured.scientificName, featured.category)}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ background: 'rgba(168,85,247,0.06)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.15)', padding: '0.25rem 0.75rem', borderRadius: 40, fontSize: '0.78rem', fontWeight: 500 }}>
                  {featured.category}
                </span>
                {featured.wikipediaUrl && (
                  <a href={featured.wikipediaUrl} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#fbbf24', border: '1px solid rgba(255,255,255,0.08)', padding: '0.25rem 0.75rem', borderRadius: 40, fontSize: '0.78rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    Wikipedia <ArrowRight size={12} />
                  </a>
                )}
              </div>

              {/* Sighting markers */}
              {sightings.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sightings.slice(0, 2).map((s) => (
                    <a key={s.id} href={s.uri} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                      📍 {s.place}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* Did You Know? */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)', borderRadius: 16, padding: '2rem', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '1px', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            🧠 DID YOU KNOW?
          </p>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto', minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            &ldquo;{FACTS[factIndex]}&rdquo;
          </p>
        </div>
      </section>

      {/* Red List Highlights */}
      <section className="section" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 0 }}>Red List Highlights</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Threatened species registered in iNaturalist</p>
          </div>
          <Link href="/red-list" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            View Archive →
          </Link>
        </div>

        {loadingRed ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid">
            {redList.map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </section>

      {/* Threatened Spotlight */}
      <section className="section" style={{ padding: '3rem 2rem 5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 0 }}>Conservation Spotlight</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Species requiring urgent habitat observation and listing</p>
        </div>

        {loadingSpotlight ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 16 }} />)}
          </div>
        ) : (
          <div className="grid">
            {recentAnimals.slice(3, 9).map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </section>

    </main>
  );
}
