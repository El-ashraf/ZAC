'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import AnimalCard from '@/components/AnimalCard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

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

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  'Critically Endangered': { bg: 'rgba(239, 68, 68, 0.10)',  color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  'Endangered':            { bg: 'rgba(249, 115, 22, 0.10)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  'Vulnerable':            { bg: 'rgba(234, 179, 8, 0.10)',  color: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
  'Near Threatened':       { bg: 'rgba(16, 185, 129, 0.10)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
  'Least Concern':         { bg: 'rgba(34, 197, 94, 0.10)',  color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
  'Extinct':               { bg: 'rgba(148, 163, 184, 0.10)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
  'Threatened':            { bg: 'rgba(249, 115, 22, 0.10)', color: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
};

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { bg: 'rgba(34,197,94,0.10)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' };
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: '0.3rem 0.75rem',
      borderRadius: '5px',
      fontWeight: 700,
      fontSize: '0.66rem',
      border: `1px solid ${s.border}`,
      letterSpacing: '0.8px',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontFamily: 'var(--font-display)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
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

  let cleaned = description.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\[\d+\]/g, '');

  const nameParts = scientificName.split(' ');
  const regexPattern = new RegExp(`\\(\\s*${nameParts[0]}\\s*${nameParts[1] || ''}[^)]*\\)`, 'gi');
  cleaned = cleaned.replace(regexPattern, '');
  cleaned = cleaned.replace(/\(\s*also\s+known\s+as[^)]*\)/gi, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

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

  // Facts Carousel States
  const [factIndex, setFactIndex] = useState(0);
  const [isFactPaused, setIsFactPaused] = useState(false);
  const [factProgress, setFactProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Facts Timer Loop (with Pause on Hover)
  useEffect(() => {
    if (isFactPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const duration = 6000; // 6 seconds
    const intervalTime = 100; // 100ms ticks
    const steps = duration / intervalTime;
    let currentStep = (factProgress / 100) * steps;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const nextProgress = (currentStep / steps) * 100;

      if (nextProgress >= 100) {
        setFactProgress(0);
        setFactIndex((p) => (p + 1) % FACTS.length);
      } else {
        setFactProgress(nextProgress);
      }
    }, intervalTime);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isFactPaused, factProgress]);

  const handleNextFact = () => {
    setFactProgress(0);
    setFactIndex((p) => (p + 1) % FACTS.length);
  };

  const handlePrevFact = () => {
    setFactProgress(0);
    setFactIndex((p) => (p - 1 + FACTS.length) % FACTS.length);
  };

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

  const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
    flex: 1,
    minWidth: 240,
  };

  return (
    <main
      style={{ position: 'relative', overflowX: 'hidden', ['--font-display' as string]: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* Background Image & Overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        backgroundImage: `url('https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&q=80&w=1920')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'var(--bg-gradient)',
      }} />

      {/* ── Hero ── */}
      <section className="hero" style={{ minHeight: '82vh', padding: '4rem 1.25rem 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mono-panel"
          style={{ maxWidth: '780px', width: '100%', margin: '0 auto', padding: '3rem 2.5rem', textAlign: 'left' }}
        >
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.6rem', alignItems: 'center' }}>
            <span className="mono-eyebrow" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.22)', padding: '0.32rem 0.85rem', borderRadius: '5px' }}>
              <span className="live-badge" style={{ padding: 0, border: 'none', background: 'none', color: 'var(--primary)' }} />
              Live Conservation Network
            </span>

            {user ? (
              <Link href="/profile" className="mono-label" style={{
                padding: '0.32rem 0.85rem', borderRadius: '5px', fontSize: '0.66rem', letterSpacing: '1px',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', color: '#fff',
              }}>
                {user.email.split('@')[0]}
              </Link>
            ) : (
              <Link href="/login" className="mono-label" style={{
                padding: '0.32rem 0.85rem', borderRadius: '5px', fontSize: '0.66rem', letterSpacing: '1px',
                background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--accent)',
              }}>
                Log In / Sign Up
              </Link>
            )}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', letterSpacing: '-2px', fontWeight: 700,
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', lineHeight: 1.05, marginBottom: '1.1rem',
          }}>
            Nature in <span style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 60%, #16a34a 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Focus</span>
          </h1>

          <p style={{
            fontSize: 'clamp(0.98rem, 2vw, 1.12rem)', color: 'var(--text-secondary)', fontWeight: 400,
            lineHeight: 1.65, marginBottom: '2.2rem', maxWidth: '560px',
          }}>
            Track global biodiversity in real time — species distributions, conservation status, and live observations from iNaturalist.
          </p>

          <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard" className="btn-mono" style={{ padding: '0.8rem 1.8rem', fontSize: '0.82rem' }}>
              Enter Dashboard <ArrowRight size={15} />
            </Link>
            <Link href="/animals" className="btn-mono-outline" style={{ padding: '0.8rem 1.8rem', fontSize: '0.82rem' }}>
              Database Search
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Stats Strip ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem 3.5rem' }}>
        <div className="mono-stat-strip">
          {[
            { num: '900K+', label: 'Active Naturalists' },
            { num: '50M+', label: 'Logged Observations' },
            { num: '150K+', label: 'Species Cataloged' },
            { num: 'iNaturalist', label: 'Live Data Source' },
          ].map((s) => (
            <div className="mono-stat" key={s.label}>
              <span className="mono-stat-num">{s.num}</span>
              <span className="mono-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Animal of the Week ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.25rem' }}>
        <div style={sectionHeaderStyle}>
          <div>
            <span className="mono-eyebrow" style={{ marginBottom: '0.6rem', display: 'inline-flex' }}>Weekly Species Spotlight</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              Animal of the Week
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            {aotWObs !== null && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
                  {aotWObs.toLocaleString()}
                </div>
                <div className="mono-label" style={{ color: 'var(--text-secondary)', fontSize: '0.62rem' }}>Total Sightings</div>
              </>
            )}
          </div>
        </div>
        <div className="mono-rule" style={{ marginBottom: '2rem' }} />

        {loadingFeatured ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="skeleton" style={{ height: 280, borderRadius: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <div className="skeleton" style={{ height: 26, width: '40%' }} />
              <div className="skeleton" style={{ height: 15, width: '90%' }} />
              <div className="skeleton" style={{ height: 15, width: '80%' }} />
              <div className="skeleton" style={{ height: 15, width: '70%' }} />
            </div>
          </div>
        ) : featured ? (
          <div className="mono-panel" style={{ display: 'flex', gap: 0, flexWrap: 'wrap', overflow: 'hidden', padding: 0 }}>
            <div style={{ position: 'relative', overflow: 'hidden', width: '100%', maxWidth: '420px', height: '300px', flexShrink: 0 }}>
              <img
                src={featured.images[0]}
                alt={featured.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/420x300/050806/22c55e?text=${encodeURIComponent(featured.name)}`; }}
              />
              <div style={{ position: 'absolute', top: 14, left: 14 }}>
                <StatusPill status={featured.conservationStatus} />
              </div>
            </div>

            <div style={{ flex: '1 1 320px', padding: '2.2rem 2.4rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                {featured.name}
              </h3>
              <p style={{ fontStyle: 'italic', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '1.2rem', marginTop: '0.2rem' }}>
                {featured.scientificName}
              </p>

              <p style={{ fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '1.4rem', fontWeight: 400 }}>
                {rewriteDescription(featured.description, featured.name, featured.scientificName, featured.category)}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.4rem' }}>
                <span className="mono-label" style={{ background: 'rgba(168,85,247,0.06)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.22)', padding: '0.3rem 0.75rem', borderRadius: '5px', fontSize: '0.64rem' }}>
                  {featured.category}
                </span>
                {featured.wikipediaUrl && (
                  <a href={featured.wikipediaUrl} target="_blank" rel="noopener noreferrer" className="mono-label" style={{
                    background: 'rgba(34,197,94,0.04)', color: 'var(--primary)', border: '1px solid var(--border)',
                    padding: '0.3rem 0.75rem', borderRadius: '5px', fontSize: '0.64rem', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    Wikipedia <ArrowRight size={11} />
                  </a>
                )}
              </div>

              {sightings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="mono-label" style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>Live iNaturalist Sightings</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {sightings.slice(0, 3).map((s) => (
                      <a key={s.id} href={s.uri} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.38rem 0.75rem',
                        border: '1px solid var(--border)', background: 'rgba(34,197,94,0.03)', borderRadius: '5px',
                        fontSize: '0.78rem', color: 'var(--text-primary)', textDecoration: 'none', transition: 'border-color 0.2s',
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <MapPin size={12} style={{ color: 'var(--primary)' }} />
                        {s.place.length > 25 ? s.place.slice(0, 23) + '...' : s.place}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Did You Know? Facts ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.25rem 3rem' }}>
        <div
          className="mono-panel"
          onMouseEnter={() => setIsFactPaused(true)}
          onMouseLeave={() => setIsFactPaused(false)}
          style={{ padding: '1.8rem 2rem', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ marginBottom: '0.7rem' }}>
            <span className="mono-eyebrow">Wildlife Fact Archive</span>
          </div>

          <div style={{ minHeight: '3.2rem', display: 'flex', alignItems: 'center', margin: '0.4rem 0 0.9rem' }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: '1.08rem', color: '#fff', lineHeight: 1.6, maxWidth: '680px', fontWeight: 400 }}
              >
                {FACTS[factIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1.1rem' }}>
            <button
              onClick={handlePrevFact}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '30px', height: '30px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <ChevronLeft size={15} />
            </button>
            <span className="mono-label" style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              {factIndex + 1} / {FACTS.length}{isFactPaused ? ' · Paused' : ''}
            </span>
            <button
              onClick={handleNextFact}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', width: '30px', height: '30px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ height: '100%', width: `${factProgress}%`, background: 'var(--primary)', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      </section>

      {/* ── Red List Highlights ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.25rem' }}>
        <div style={sectionHeaderStyle}>
          <div>
            <span className="mono-eyebrow" style={{ marginBottom: '0.6rem', display: 'inline-flex' }}>Endangered Species</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              Red List Highlights
            </h2>
          </div>
          <Link href="/red-list" className="mono-label" style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
            View Full Archive <ChevronRight size={15} />
          </Link>
        </div>
        <div className="mono-rule" style={{ marginBottom: '2rem' }} />

        {loadingRed ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 10 }} />)}
          </div>
        ) : (
          <div className="grid">
            {redList.map((a) => <AnimalCard key={a._id} animal={a} />)}
          </div>
        )}
      </section>

      {/* ── Conservation Spotlight ── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.25rem 5rem' }}>
        <div style={sectionHeaderStyle}>
          <div>
            <span className="mono-eyebrow" style={{ marginBottom: '0.6rem', display: 'inline-flex', color: 'var(--accent)' }}>Habitat Protection</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.1rem)', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
              Conservation Spotlight
            </h2>
          </div>
        </div>
        <div className="mono-rule" style={{ marginBottom: '2rem' }} />

        {loadingSpotlight ? (
          <div className="grid">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ minHeight: 300, borderRadius: 10 }} />)}
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
